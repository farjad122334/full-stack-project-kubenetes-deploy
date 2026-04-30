using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Supporting;
using backend.Models.DTOs;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/restaurants/{restaurantId}/room-categories")]
public class RoomCategoryController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IImageService _imageService;

    public RoomCategoryController(ApplicationDbContext context, IImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    // GET: api/restaurants/5/room-categories
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomCategory>>> GetRoomCategories(int restaurantId)
    {
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        if (restaurant == null) return NotFound("Restaurant not found");

        var categories = await _context.RoomCategories
            .Include(rc => rc.RoomImages)
            .Where(rc => rc.RestaurantId == restaurantId)
            .OrderBy(rc => rc.CategoryName)
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/restaurants/5/room-categories/3
    [HttpGet("{id}")]
    public async Task<ActionResult<RoomCategory>> GetRoomCategory(int restaurantId, int id)
    {
        var category = await _context.RoomCategories
            .Include(rc => rc.RoomImages)
            .FirstOrDefaultAsync(rc => rc.RoomCategoryId == id && rc.RestaurantId == restaurantId);

        if (category == null) return NotFound();

        return Ok(category);
    }

    // POST: api/restaurants/5/room-categories
    [HttpPost]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<ActionResult<RoomCategory>> CreateRoomCategory(int restaurantId, [FromForm] CreateRoomCategoryDto dto)
    {
        var restaurant = await _context.Restaurants.FindAsync(restaurantId);
        if (restaurant == null) return NotFound("Restaurant not found");

        if (!restaurant.ProvidesRoom)
        {
            return BadRequest("This business does not provide room services");
        }

        var category = new RoomCategory
        {
            RestaurantId = restaurantId,
            CategoryName = dto.CategoryName,
            Description = dto.Description,
            PricePerNight = dto.PricePerNight,
            MaxGuests = dto.MaxGuests,
            TotalRooms = dto.TotalRooms,
            AvailableRooms = dto.TotalRooms, // Initially all rooms available
            Amenities = dto.Amenities
        };

        _context.RoomCategories.Add(category);
        await _context.SaveChangesAsync();

        // Handle images if provided
        if (dto.Images != null && dto.Images.Count > 0)
        {
            var savedPaths = await _imageService.SaveImagesAsync(dto.Images, "room_categories");
            foreach (var (path, index) in savedPaths.Select((p, i) => (p, i)))
            {
                _context.RoomImages.Add(new RoomImage
                {
                    RoomCategoryId = category.RoomCategoryId,
                    ImageUrl = path,
                    IsPrimary = index == 0,
                    DisplayOrder = index
                });
            }
            await _context.SaveChangesAsync();
        }

        return CreatedAtAction(nameof(GetRoomCategory), new { restaurantId, id = category.RoomCategoryId }, category);
    }

    // PUT: api/restaurants/5/room-categories/3
    [HttpPut("{id}")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> UpdateRoomCategory(int restaurantId, int id, [FromBody] RoomCategoryDto dto)
    {
        var category = await _context.RoomCategories
            .FirstOrDefaultAsync(rc => rc.RoomCategoryId == id && rc.RestaurantId == restaurantId);

        if (category == null) return NotFound();

        category.CategoryName = dto.CategoryName;
        category.Description = dto.Description;
        category.PricePerNight = dto.PricePerNight;
        category.MaxGuests = dto.MaxGuests;
        
        // Update total rooms and adjust available rooms proportionally
        int roomDifference = dto.TotalRooms - category.TotalRooms;
        category.TotalRooms = dto.TotalRooms;
        category.AvailableRooms += roomDifference;
        
        category.Amenities = dto.Amenities;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/restaurants/5/room-categories/3
    [HttpDelete("{id}")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> DeleteRoomCategory(int restaurantId, int id)
    {
        var category = await _context.RoomCategories
            .Include(rc => rc.RoomImages)
            .Include(rc => rc.Offers)
            .FirstOrDefaultAsync(rc => rc.RoomCategoryId == id && rc.RestaurantId == restaurantId);

        if (category == null) return NotFound();

        // Check if category has active offers
        if (category.Offers.Any(o => o.Status == Models.Enums.OfferStatus.Pending || o.Status == Models.Enums.OfferStatus.Accepted))
        {
            return BadRequest("Cannot delete room category with active offers");
        }

        // Delete associated images
        foreach (var image in category.RoomImages)
        {
            _imageService.DeleteImage(image.ImageUrl);
        }
        _context.RoomImages.RemoveRange(category.RoomImages);

        _context.RoomCategories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/restaurants/5/room-categories/3/images
    [HttpPost("{id}/images")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> UploadRoomImages(int restaurantId, int id, [FromForm] List<IFormFile> images)
    {
        var category = await _context.RoomCategories
            .FirstOrDefaultAsync(rc => rc.RoomCategoryId == id && rc.RestaurantId == restaurantId);

        if (category == null) return NotFound();

        if (images == null || images.Count == 0) return BadRequest("No images provided");

        var savedPaths = await _imageService.SaveImagesAsync(images, "room_categories");
        
        var existingCount = await _context.RoomImages.CountAsync(ri => ri.RoomCategoryId == id);
        
        foreach (var (path, index) in savedPaths.Select((p, i) => (p, i)))
        {
            _context.RoomImages.Add(new RoomImage
            {
                RoomCategoryId = id,
                ImageUrl = path,
                IsPrimary = existingCount == 0 && index == 0,
                DisplayOrder = existingCount + index
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Images uploaded successfully", count = savedPaths.Count });
    }

    // DELETE: api/restaurants/5/room-categories/images/7
    [HttpDelete("images/{imageId}")]
    [Authorize(Roles = "Restaurant,Admin")]
    public async Task<IActionResult> DeleteRoomImage(int restaurantId, int imageId)
    {
        var image = await _context.RoomImages
            .Include(ri => ri.RoomCategory)
            .FirstOrDefaultAsync(ri => ri.RoomImageId == imageId && ri.RoomCategory.RestaurantId == restaurantId);

        if (image == null) return NotFound();

        _imageService.DeleteImage(image.ImageUrl);
        _context.RoomImages.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
