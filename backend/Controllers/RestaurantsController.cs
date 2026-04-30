using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.UserManagement;
using backend.Models.Supporting;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models.DTOs;
using backend.Models.Enums;


namespace backend.Controllers;
 
public class RestaurantDashboardStatsDto
{
    public int TotalOffersSent { get; set; }
    public int PendingRequests { get; set; }
    public int ConfirmedOrders { get; set; }
    public int ActiveMenuItems { get; set; }
    public List<DashboardActivityDto> RecentActivities { get; set; } = [];
}

public class DashboardActivityDto
{
    public string TourName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string BadgeStatus { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class RestaurantsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IImageService _imageService;
    private readonly IStripeService _stripeService;

    public RestaurantsController(ApplicationDbContext context, IImageService imageService, IStripeService stripeService)
    {
        _context = context;
        _imageService = imageService;
        _stripeService = stripeService;
    }

    [HttpPost("{id}/onboarding-link")]
    [Authorize]
    public async Task<IActionResult> GetOnboardingLink(int id, [FromBody] OnboardingRequestDto request)
    {
        var restaurant = await _context.Restaurants.Include(r => r.User).FirstOrDefaultAsync(r => r.RestaurantId == id);
        if (restaurant == null) return NotFound("Restaurant not found");

        try
        {
            if (string.IsNullOrEmpty(restaurant.StripeAccountId))
            {
                var accountId = await _stripeService.CreateConnectedAccountAsync(
                    restaurant.User.Email, 
                    restaurant.RestaurantName, 
                    "Restaurant");
                restaurant.StripeAccountId = accountId;
                await _context.SaveChangesAsync();
            }

            var url = await _stripeService.CreateOnboardingLinkAsync(restaurant.StripeAccountId, request.ReturnUrl, request.RefreshUrl);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET: api/restaurants/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Restaurant>> GetRestaurant(int id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.RestaurantImages)
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.RestaurantId == id);

        if (restaurant == null)
        {
            return NotFound();
        }

        return Ok(restaurant);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> UpdateRestaurant(int id, [FromBody] UpdateRestaurantProfileDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null) return NotFound("Restaurant not found");

        // Update fields
        restaurant.RestaurantName = dto.RestaurantName;
        restaurant.BusinessType = dto.BusinessType;
        restaurant.OwnerName = dto.OwnerName;
        restaurant.Address = dto.Address;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Profile updated successfully", restaurant });
    }

    [HttpPost("{id}/images")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> UploadRestaurantImages(int id, [FromForm] List<IFormFile> images)
    {
        var restaurant = await _context.Restaurants.FindAsync(id);
        if (restaurant == null) return NotFound("Restaurant not found");

        if (images == null || images.Count == 0) return BadRequest("No images provided");

        var savedPaths = await _imageService.SaveImagesAsync(images, "restaurants");
        
        foreach (var path in savedPaths)
        {
            _context.RestaurantImages.Add(new RestaurantImage
            {
                RestaurantId = id,
                ImageUrl = path,
                IsPrimary = !_context.RestaurantImages.Any(ri => ri.RestaurantId == id)
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Images uploaded successfully", count = savedPaths.Count });
    }

    // DELETE: api/restaurants/images/{imageId}
    [HttpDelete("images/{imageId}")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> DeleteRestaurantImage(int imageId)
    {
        var image = await _context.RestaurantImages.FindAsync(imageId);
        if (image == null) return NotFound();

        _imageService.DeleteImage(image.ImageUrl);
        _context.RestaurantImages.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/restaurants/{id}/dashboard-stats
    [HttpGet("{id}/dashboard-stats")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<ActionResult<RestaurantDashboardStatsDto>> GetDashboardStats(int id)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.RestaurantId == id);

        if (restaurant == null) return NotFound("Restaurant not found");

        var stats = new RestaurantDashboardStatsDto();

        // 1. Total Offers Sent
        stats.TotalOffersSent = await _context.RestaurantOffers
            .CountAsync(ro => ro.RestaurantId == id);

        // 2. Pending Requests (Open requirements matching restaurant capabilities)
        var requirementTypes = new List<string>();
        if (restaurant.ProvidesMeal) requirementTypes.Add("Meal");
        if (restaurant.ProvidesRoom) requirementTypes.Add("Accommodation");

        stats.PendingRequests = await _context.ServiceRequirements
            .CountAsync(sr => sr.Status == "Open" && requirementTypes.Contains(sr.Type));

        // 3. Confirmed Orders
        stats.ConfirmedOrders = await _context.RestaurantAssignments
            .CountAsync(ra => ra.RestaurantId == id && (ra.Status == AssignmentStatus.Accepted || ra.Status == AssignmentStatus.Completed));

        // 4. Active Menu Items
        stats.ActiveMenuItems = await _context.MenuItems
            .CountAsync(mi => mi.Menu.RestaurantId == id);

        // 5. Recent Activities (Latest 5 Offers)
        var recentOffers = await _context.RestaurantOffers
            .Include(ro => ro.ServiceRequirement)
                .ThenInclude(sr => sr.Tour)
            .Where(ro => ro.RestaurantId == id)
            .OrderByDescending(ro => ro.CreatedAt)
            .Take(5)
            .Select(ro => new DashboardActivityDto
            {
                TourName = ro.ServiceRequirement.Tour.Title,
                Status = "Offer Sent",
                Time = ro.CreatedAt.ToString("MMM dd, HH:mm"),
                Price = ro.PricePerHead,
                BadgeStatus = "Pending"
            })
            .ToListAsync();

        stats.RecentActivities = recentOffers;

        return Ok(stats);
    }
}
