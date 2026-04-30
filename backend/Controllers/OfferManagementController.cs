using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.OfferSystem;
using backend.Models.Supporting;
using backend.Models.RestaurantMenu;
using backend.Models.Enums;
using backend.Models.TourManagement;

namespace backend.Controllers;

[ApiController]
[Route("api/admin")]
public class OfferManagementController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public OfferManagementController(ApplicationDbContext context)
    {
        _context = context;
    }

    // DTO for menu selection during restaurant offer approval
    public class ApproveRestaurantOfferDto
    {
        public int OfferId { get; set; }
        public List<SelectedMenuItem> SelectedMenuItems { get; set; } = new();
    }

    public class SelectedMenuItem
    {
        public int MenuItemId { get; set; }
        public int Quantity { get; set; }
    }

    // POST: api/admin/offers/driver/{id}/approve
    [HttpPost("offers/driver/{id}/approve")]
    public async Task<IActionResult> ApproveDriverOffer(int id)
    {
        var offer = await _context.DriverOffers
            .Include(o => o.Vehicle)
            .Include(o => o.Driver)
            .FirstOrDefaultAsync(o => o.OfferId == id);

        if (offer == null)
        {
            return NotFound("Driver offer not found");
        }

        if (offer.Status != OfferStatus.Pending)
        {
            return BadRequest("Only pending offers can be approved");
        }

        // Update offer status
        offer.Status = OfferStatus.Accepted;
        offer.RespondedAt = DateTime.UtcNow;

        // Create TourAssignment
        var assignment = new TourAssignment
        {
            TourId = offer.TourId ?? 0,
            DriverId = offer.DriverId,
            VehicleId = offer.VehicleId,
            DriverOfferId = offer.OfferId,
            Status = AssignmentStatus.Assigned,
            AssignedAt = DateTime.UtcNow,
            FinalPrice = offer.TransportationFare
        };

        _context.TourAssignments.Add(assignment);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Driver offer approved successfully", assignmentId = assignment.AssignmentId });
    }

    // POST: api/admin/offers/restaurant/{id}/approve-with-menu
    [HttpPost("offers/restaurant/{id}/approve-with-menu")]
    public async Task<IActionResult> ApproveRestaurantOfferWithMenu(int id, [FromBody] ApproveRestaurantOfferDto dto)
    {
        var offer = await _context.RestaurantOffers
            .Include(o => o.ServiceRequirement)
                .ThenInclude(r => r.Tour)
            .Include(o => o.Restaurant)
            .FirstOrDefaultAsync(o => o.OfferId == id);

        if (offer == null)
        {
            return NotFound("Restaurant offer not found");
        }

        if (offer.Status != OfferStatus.Pending)
        {
            return BadRequest("Only pending offers can be approved");
        }

        if (dto.SelectedMenuItems == null || !dto.SelectedMenuItems.Any())
        {
            return BadRequest("Menu items must be selected");
        }

        // Validate menu items exist and belong to this restaurant
        var menuItemIds = dto.SelectedMenuItems.Select(mi => mi.MenuItemId).ToList();
        var menuItems = await _context.MenuItems
            .Where(mi => menuItemIds.Contains(mi.ItemId))
            .Include(mi => mi.Menu)
            .ToListAsync();

        if (menuItems.Count != menuItemIds.Count)
        {
            return BadRequest("One or more menu items not found");
        }

        if (menuItems.Any(mi => mi.Menu.RestaurantId != offer.RestaurantId))
        {
            return BadRequest("Menu items must belong to the offering restaurant");
        }

        // Calculate total amount
        var totalAmount = 0m;
        var numberOfPeople = offer.ServiceRequirement.EstimatedPeople;

        foreach (var selected in dto.SelectedMenuItems)
        {
            var menuItem = menuItems.First(mi => mi.ItemId == selected.MenuItemId);
            totalAmount += menuItem.Price * selected.Quantity;
        }

        // Validate total matches quoted price (±5% tolerance)
        var quotedTotal = offer.PricePerHead * numberOfPeople;
        var tolerance = quotedTotal * 0.05m;
        var difference = Math.Abs(totalAmount - quotedTotal);

        if (difference > tolerance)
        {
            return BadRequest(new
            {
                message = "Selected items total does not match quoted price",
                quotedTotal,
                selectedTotal = totalAmount,
                difference,
                allowedTolerance = tolerance
            });
        }

        // Create RestaurantAssignment
        var assignment = new RestaurantAssignment
        {
            TourId = offer.ServiceRequirement.TourId,
            RestaurantId = offer.RestaurantId,
            RequirementId = offer.RequirementId,
            RestaurantOfferId = offer.OfferId,
            Status = AssignmentStatus.Assigned,
            AssignedAt = DateTime.UtcNow,
            PricePerHead = offer.PricePerHead,
            ExpectedPeople = numberOfPeople,
            FinalPrice = totalAmount
        };

        _context.RestaurantAssignments.Add(assignment);
        await _context.SaveChangesAsync(); // Save to get AssignmentId

        // Create Order
        var order = new Order
        {
            TourId = offer.ServiceRequirement.TourId,
            RestaurantAssignmentId = assignment.AssignmentId,
            RequirementId = offer.RequirementId,
            OrderDate = DateTime.UtcNow,
            TotalAmount = totalAmount,
            Status = OrderStatus.Confirmed,
            NumberOfPeople = numberOfPeople,
            ScheduledTime = offer.ServiceRequirement.DateNeeded
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync(); // Save to get OrderId

        // Link Order to Assignment
        assignment.OrderId = order.OrderId;

        // Create OrderItems
        foreach (var selected in dto.SelectedMenuItems)
        {
            var menuItem = menuItems.First(mi => mi.ItemId == selected.MenuItemId);

            var orderItem = new OrderItem
            {
                OrderId = order.OrderId,
                MenuItemId = selected.MenuItemId,
                Quantity = selected.Quantity,
                PricePerUnit = menuItem.Price,
                Subtotal = menuItem.Price * selected.Quantity
            };

            _context.OrderItems.Add(orderItem);
        }

        // Update offer status
        offer.Status = OfferStatus.Accepted;
        offer.RespondedAt = DateTime.UtcNow;

        // Update requirement status
        offer.ServiceRequirement.Status = "Fulfilled";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Restaurant offer approved and order created successfully",
            assignmentId = assignment.AssignmentId,
            orderId = order.OrderId
        });
    }

    // POST: api/admin/offers/{id}/reject
    [HttpPost("offers/{id}/reject")]
    public async Task<IActionResult> RejectOffer(int id, [FromBody] string? reason)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Offer not found");
        }

        if (offer.Status != OfferStatus.Pending)
        {
            return BadRequest("Only pending offers can be rejected");
        }

        offer.Status = OfferStatus.Rejected;
        offer.RespondedAt = DateTime.UtcNow;
        offer.Notes = reason ?? offer.Notes;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Offer rejected successfully" });
    }

    // POST: api/admin/offers/{id}/un approve
    [HttpPost("offers/{id}/unapprove")]
    public async Task<IActionResult> UnapproveOffer(int id)
    {
        var offer = await _context.Offers.FindAsync(id);
        if (offer == null)
        {
            return NotFound("Offer not found");
        }

        if (offer.Status != OfferStatus.Accepted)
        {
            return BadRequest("Only accepted offers can be unapproved");
        }

        // Check if it's a driver offer
        if (offer.OfferType == "Driver")
        {
            var assignment = await _context.TourAssignments
                .FirstOrDefaultAsync(a => a.DriverOfferId == id);

            if (assignment != null)
            {
                _context.TourAssignments.Remove(assignment);
            }
        }
        // Check if it's a restaurant offer
        else if (offer.OfferType == "Restaurant")
        {
            var assignment = await _context.RestaurantAssignments
                .Include(a => a.ServiceRequirement)
                .FirstOrDefaultAsync(a => a.RestaurantOfferId == id);

            if (assignment != null)
            {
                // Remove associated order and order items
                if (assignment.OrderId.HasValue)
                {
                    var order = await _context.Orders
                        .Include(o => o.OrderItems)
                        .FirstOrDefaultAsync(o => o.OrderId == assignment.OrderId.Value);

                    if (order != null)
                    {
                        _context.OrderItems.RemoveRange(order.OrderItems);
                        _context.Orders.Remove(order);
                    }
                }

                // Reset requirement status
                if (assignment.ServiceRequirement != null)
                {
                    assignment.ServiceRequirement.Status = "Open";
                }

                _context.RestaurantAssignments.Remove(assignment);
            }
        }

        offer.Status = OfferStatus.Pending;
        offer.RespondedAt = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Offer unapproved successfully" });
    }
}
