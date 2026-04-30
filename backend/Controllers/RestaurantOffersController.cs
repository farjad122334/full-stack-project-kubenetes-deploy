using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.OfferSystem;
using backend.Models.Supporting;
using backend.Models.RestaurantMenu;
using backend.Models.MealManagement;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RestaurantOffersController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly backend.Services.INotificationService _notificationService;

    public RestaurantOffersController(ApplicationDbContext context, backend.Services.INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    // GET: api/restaurantoffers
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RestaurantOffer>>> GetRestaurantOffers(
        [FromQuery] int? requirementId,
        [FromQuery] int? restaurantId,
        [FromQuery] string? status)
    {
        var query = _context.RestaurantOffers
            .Include(o => o.ServiceRequirement)
                .ThenInclude(r => r.Tour)
            .Include(o => o.Restaurant)
                .ThenInclude(r => r.User)
            .Include(o => o.OfferMenuItems)
                .ThenInclude(mi => mi.MenuItem)
            .AsQueryable();

        if (requirementId.HasValue)
        {
            query = query.Where(o => o.RequirementId == requirementId.Value);
        }

        if (restaurantId.HasValue)
        {
            query = query.Where(o => o.RestaurantId == restaurantId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(o => o.Status.ToString() == status);
        }

        var offers = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(offers);
    }

    // GET: api/restaurantoffers/5
    [HttpGet("{id}")]
    public async Task<ActionResult<RestaurantOffer>> GetRestaurantOffer(int id)
    {
        var offer = await _context.RestaurantOffers
            .Include(o => o.ServiceRequirement)
                .ThenInclude(r => r.Tour)
            .Include(o => o.Restaurant)
                .ThenInclude(r => r.User)
            .Include(o => o.OfferMenuItems)
                .ThenInclude(mi => mi.MenuItem)
            .FirstOrDefaultAsync(o => o.OfferId == id);

        if (offer == null)
        {
            return NotFound();
        }

        return Ok(offer);
    }

    // POST: api/restaurantoffers
    [HttpPost]
    public async Task<ActionResult<RestaurantOffer>> CreateRestaurantOffer([FromBody] CreateRestaurantOfferDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate that the requirement exists and is open
        var requirement = await _context.ServiceRequirements.FindAsync(dto.RequirementId);
        if (requirement == null)
        {
            return BadRequest("Service requirement not found");
        }

        if (requirement.Status != "Open")
        {
            return BadRequest("Cannot submit offers for closed requirements");
        }

        // Validate that the restaurant exists
        var restaurant = await _context.Restaurants
            .Include(r => r.User)
            .Include(r => r.Menus)
            .Include(r => r.RoomCategories)
            .FirstOrDefaultAsync(r => r.RestaurantId == dto.RestaurantId);
            
        if (restaurant == null)
        {
            return BadRequest("Restaurant not found");
        }

        // Check if restaurant already has a pending offer for this requirement
        var existingOffer = await _context.RestaurantOffers
            .AnyAsync(o => o.RequirementId == dto.RequirementId && 
                          o.RestaurantId == dto.RestaurantId && 
                          o.Status == Models.Enums.OfferStatus.Pending);

        if (existingOffer)
        {
            return BadRequest("Restaurant already has a pending offer for this requirement");
        }

        // Validate based on requirement type and setup completion (Phase 2)
        if (requirement.Type == "Meal")
        {
            // Check if restaurant provides meals
            if (!restaurant.ProvidesMeal)
            {
                return BadRequest("This business does not provide meal services");
            }
            
            // Check if menu is set up
            if (!restaurant.Menus.Any())
            {
                return BadRequest("Please set up your menu before making meal offers");
            }
            
            if (!dto.PricePerHead.HasValue || !dto.MinimumPeople.HasValue || !dto.MaximumPeople.HasValue)
            {
                return BadRequest("Meal offers require PricePerHead, MinimumPeople, and MaximumPeople");
            }
        }
        else if (requirement.Type == "Accommodation")
        {
            // Check if restaurant provides rooms
            if (!restaurant.ProvidesRoom)
            {
                return BadRequest("This business does not provide room services");
            }
            
            // Check if room categories are set up
            if (!restaurant.RoomCategories.Any())
            {
                return BadRequest("Please set up room categories before making accommodation offers");
            }
            
            // Note: Pricing fields (RentPerNight, PerRoomCapacity, TotalRooms, TotalRent) 
            // are now optional during offer submission.
            // They will be calculated and set when admin accepts the offer and selects a room category.
        }

        var offer = new RestaurantOffer
        {
            RequirementId = dto.RequirementId,
            RestaurantId = dto.RestaurantId,
            
            // Meal fields
            PricePerHead = dto.PricePerHead ?? 0,
            MinimumPeople = dto.MinimumPeople ?? 0,
            MaximumPeople = dto.MaximumPeople ?? 0,
            MealType = dto.MealType,
            IncludesBeverages = dto.IncludesBeverages,
            
            // Accommodation fields
            RentPerNight = dto.RentPerNight,
            PerRoomCapacity = dto.PerRoomCapacity,
            TotalRooms = dto.TotalRooms,
            TotalRent = dto.TotalRent,
            StayDurationDays = dto.StayDurationDays,
            
            // Room Category (Phase 2)
            RoomCategoryId = dto.RoomCategoryId,
            
            Notes = dto.Notes,
            OfferType = "Restaurant",
            CreatedAt = DateTime.UtcNow,
            Status = Models.Enums.OfferStatus.Pending,
            TourId = null
        };

        _context.RestaurantOffers.Add(offer);
        await _context.SaveChangesAsync();

        // Notify Admin
        var admin = await _context.Users.FirstOrDefaultAsync(u => u.Role == backend.Models.Enums.UserRole.Admin);
        if (admin != null)
        {
            var tour = await _context.Tours.FindAsync(requirement.TourId);
            await _notificationService.CreateNotificationAsync(
                admin.Id,
                "New Restaurant Offer! 🍔",
                $"Restaurant '{restaurant.RestaurantName}' submitted an offer for {requirement.Type} at {requirement.Location}",
                "NewOffer",
                "/admin/manage-tours"
            );
        }

        return CreatedAtAction(nameof(GetRestaurantOffer), new { id = offer.OfferId }, offer);
    }

    // Delete: api/RestaurantOffers/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRestaurantOffer(int id)
    {
        var offer = await _context.RestaurantOffers.FindAsync(id);
        if (offer == null)
        {
            return NotFound();
        }

        // Only allow deletion if still pending
        if (offer.Status != Models.Enums.OfferStatus.Pending)
        {
            return BadRequest("Cannot delete non-pending offers");
        }

        _context.RestaurantOffers.Remove(offer);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id}/reject")]
    public async Task<IActionResult> RejectRestaurantOffer(int id)
    {
        var offer = await _context.RestaurantOffers
            .Include(o => o.ServiceRequirement)
            .FirstOrDefaultAsync(o => o.OfferId == id); // Need to check if it was accepted
            
        if (offer == null) return NotFound();

        // If offer was previously accepted, we need to clean up the Order and Assignment
        if (offer.Status == Models.Enums.OfferStatus.Accepted || offer.Status == Models.Enums.OfferStatus.Confirmed)
        {
            var assignment = await _context.RestaurantAssignments
                .Include(a => a.Orders) // Include referencing orders
                .ThenInclude(o => o.OrderItems)
                .FirstOrDefaultAsync(a => a.RestaurantOfferId == id);

            if (assignment != null)
            {
                // Break circular dependency
                assignment.OrderId = null;
                await _context.SaveChangesAsync();

                // Delete Orders (referencing this assignment)
                if (assignment.Orders != null && assignment.Orders.Any())
                {
                    foreach (var order in assignment.Orders)
                    {
                        _context.OrderItems.RemoveRange(order.OrderItems);
                        _context.Orders.Remove(order);
                    }
                    await _context.SaveChangesAsync(); // Ensure Orders are deleted first
                }

                // Delete OfferMenuItems associated with this offer?
                // Yes, if we are rejecting, we should clear the selection.
                var offerMenuItems = await _context.OfferMenuItems.Where(om => om.RestaurantOfferId == id).ToListAsync();
                _context.OfferMenuItems.RemoveRange(offerMenuItems);

                _context.RestaurantAssignments.Remove(assignment);
            }
            
            // Should requirements status be reverted to Open?
            if (offer.ServiceRequirement != null)
            {
                offer.ServiceRequirement.Status = "Open";
            }
        }

        // Clear accommodation-specific fields that were set during acceptance
        offer.RoomCategoryId = null;
        offer.RentPerNight = null;
        offer.TotalRent = null;
        offer.TotalRooms = null;
        offer.PerRoomCapacity = null;
        offer.StayDurationDays = null;

        offer.Status = Models.Enums.OfferStatus.Rejected;
        offer.RespondedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Offer rejected" });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptRestaurantOffer(int id, [FromBody] AcceptRestaurantOfferDto dto)
    {
        var offer = await _context.RestaurantOffers
            .Include(o => o.ServiceRequirement)
            .Include(o => o.RoomCategory)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.OfferId == id);

        if (offer == null) return NotFound();

        // For accommodation offers, require room category selection and calculate pricing
        if (offer.ServiceRequirement.Type == "Accommodation")
        {
            if (!dto.RoomCategoryId.HasValue)
            {
                return BadRequest("Room category must be selected for accommodation offers");
            }

            var roomCategory = await _context.RoomCategories
                .FirstOrDefaultAsync(rc => rc.RoomCategoryId == dto.RoomCategoryId.Value && rc.RestaurantId == offer.RestaurantId);

            if (roomCategory == null)
            {
                return BadRequest("Invalid room category for this restaurant");
            }

            // Calculate pricing based on selected room category
            var estimatedPeople = offer.ServiceRequirement.EstimatedPeople;
            var stayDurationDays = offer.ServiceRequirement.StayDurationDays ?? 1;

            var totalRoomsNeeded = (int)Math.Ceiling((decimal)estimatedPeople / roomCategory.MaxGuests);
            var totalRent = totalRoomsNeeded * roomCategory.PricePerNight * stayDurationDays;

            // Check availability
            if (roomCategory.AvailableRooms < totalRoomsNeeded)
            {
                return BadRequest($"Insufficient rooms available. Only {roomCategory.AvailableRooms} rooms available in this category");
            }

            // Update offer with calculated values
            offer.RoomCategoryId = dto.RoomCategoryId.Value;
            offer.RentPerNight = roomCategory.PricePerNight;
            offer.PerRoomCapacity = roomCategory.MaxGuests;
            offer.TotalRooms = totalRoomsNeeded;
            offer.TotalRent = totalRent;
            offer.StayDurationDays = stayDurationDays;

            // Decrease room availability
            roomCategory.AvailableRooms -= totalRoomsNeeded;
        }

        // 1. Update Offer Status
        offer.Status = Models.Enums.OfferStatus.Accepted;
        offer.RespondedAt = DateTime.UtcNow;

        // Check if assignment already exists
        var existingAssignment = await _context.RestaurantAssignments
            .FirstOrDefaultAsync(a => a.RestaurantOfferId == offer.OfferId);

        if (existingAssignment != null)
        {
            return BadRequest("This offer has already been accepted and assigned.");
        }

        // 3. Create Assignment
        var assignment = new RestaurantAssignment
        {
            TourId = offer.ServiceRequirement.TourId,
            RestaurantId = offer.RestaurantId,
            RestaurantOfferId = offer.OfferId,
            RequirementId = offer.RequirementId,
            Status = Models.Enums.AssignmentStatus.Assigned,
            AssignedAt = DateTime.UtcNow,
            PricePerHead = offer.ServiceRequirement.Type == "Accommodation" ? 0 : offer.PricePerHead,
            ExpectedPeople = offer.ServiceRequirement.EstimatedPeople,
            FinalPrice = offer.ServiceRequirement.Type == "Accommodation" ? (offer.TotalRent ?? 0) : (offer.PricePerHead * offer.ServiceRequirement.EstimatedPeople),
            MealScheduleText = offer.ServiceRequirement.Type == "Accommodation" ? $"Stay at {offer.Restaurant.RestaurantName}" : $"{offer.MealType} at {offer.ServiceRequirement.Location}"
        };

        _context.RestaurantAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        // 3. Create Order (Linked to Assignment)
        var order = new Order
        {
            RestaurantAssignmentId = assignment.AssignmentId,
            TourId = assignment.TourId,
            RequirementId = (int)assignment.RequirementId,
            NumberOfPeople = assignment.ExpectedPeople,
            OrderDate = DateTime.UtcNow,
            TotalAmount = assignment.FinalPrice,
            Status = Models.Enums.OrderStatus.Confirmed
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        // Update Assignment with OrderId
        assignment.OrderId = order.OrderId;

        // 4. Create OrderItems & OfferMenuItems
        if (dto.SelectedMenuItems != null && dto.SelectedMenuItems.Any())
        {
            var itemIds = dto.SelectedMenuItems.Select(i => i.ItemId).ToList();
            var dbMenuItems = await _context.MenuItems.Where(m => itemIds.Contains(m.ItemId)).ToListAsync();

            Models.Enums.MealType mealType;
            if (!Enum.TryParse(offer.MealType, true, out mealType))
            {
                mealType = Models.Enums.MealType.Lunch; // Default fallback
            }

            foreach (var itemDto in dto.SelectedMenuItems)
            {
                var dbItem = dbMenuItems.FirstOrDefault(m => m.ItemId == itemDto.ItemId);
                if (dbItem != null)
                {
                    // Add to OrderItems
                    _context.OrderItems.Add(new OrderItem
                    {
                        OrderId = order.OrderId,
                        MenuItemId = dbItem.ItemId,
                        Quantity = itemDto.Quantity,
                        PricePerUnit = dbItem.Price,
                        Subtotal = dbItem.Price * itemDto.Quantity
                    });

                    // Add to OfferMenuItems
                    _context.OfferMenuItems.Add(new OfferMenuItem
                    {
                        RestaurantOfferId = offer.OfferId,
                        MenuItemId = dbItem.ItemId,
                        MealType = mealType,
                        Quantity = itemDto.Quantity,
                        PriceAtOffer = dbItem.Price,
                        Subtotal = dbItem.Price * itemDto.Quantity
                    });
                }
            }
        }
        
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Offer accepted and order created", assignmentId = assignment.AssignmentId });
    }

    private async Task<bool> RestaurantOfferExists(int id)
    {
        return await _context.RestaurantOffers.AnyAsync(e => e.OfferId == id);
    }
}

public class CreateRestaurantOfferDto
{
    public int RequirementId { get; set; }
    public int RestaurantId { get; set; }
    
    // Meal offer fields (nullable for accommodation offers)
    public decimal? PricePerHead { get; set; }
    public int? MinimumPeople { get; set; }
    public int? MaximumPeople { get; set; }
    public string? MealType { get; set; }
    public bool IncludesBeverages { get; set; }
    
    // Accommodation offer fields (nullable for meal offers)
    public decimal? RentPerNight { get; set; }
    public int? PerRoomCapacity { get; set; }
    public int? TotalRooms { get; set; }
    public decimal? TotalRent { get; set; }
    public int? StayDurationDays { get; set; }
    
    // Room Category Selection (Phase 2)
    public int? RoomCategoryId { get; set; }
    
    public string? Notes { get; set; }
}

public class AcceptRestaurantOfferDto
{
    public int? RoomCategoryId { get; set; } // For accommodation offers
    public List<SelectedMenuItemDto> SelectedMenuItems { get; set; } = new();
}

public class SelectedMenuItemDto
{
    public int ItemId { get; set; }
    public int Quantity { get; set; }
}
