using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Supporting;
using backend.Models.OfferSystem;
using backend.Models.TourManagement;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class PayoutsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly INotificationService _notificationService;

    public PayoutsController(ApplicationDbContext context, IPaymentService paymentService, INotificationService notificationService)
    {
        _context = context;
        _paymentService = paymentService;
        _notificationService = notificationService;
    }

    // --- Restaurant Payouts ---

    [HttpPost("restaurant/{assignmentId}/initiate")]
    public async Task<IActionResult> InitiateRestaurantPayout(int assignmentId)
    {
        var assignment = await _context.RestaurantAssignments
            .Include(a => a.Restaurant)
            .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

        if (assignment == null) return NotFound("Assignment not found");

        // The actual payout logic (e.g. Stripe) is triggered here
        // For now, we'll just return success as the "payout process" is initiated
        // In a real scenario, this might call _paymentService.ProcessRestaurantPayoutAsync
        
        // Let's use the existing service but modify it to not mark as paid immediately if we want manual confirmation
        // But the requirement says "trigger the payout process... then allow marking as served"
        
        var result = await _paymentService.ProcessRestaurantPayoutAsync(assignmentId, "Online");
        
        if (!result) return BadRequest("Failed to initiate payout. Check Stripe connection.");

        return Ok(new { message = "Payout initiated successfully. Please confirm completion." });
    }

    [HttpPost("restaurant/{assignmentId}/confirm")]
    public async Task<IActionResult> ConfirmRestaurantPayout(int assignmentId)
    {
        var assignment = await _context.RestaurantAssignments
            .Include(a => a.Restaurant)
            .Include(a => a.Tour)
            .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);
            
        if (assignment == null) return NotFound("Assignment not found");

        assignment.IsPaid = true;
        assignment.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Notify Restaurant
        await _notificationService.CreateNotificationAsync(
            assignment.Restaurant.UserId,
            "Payout Received! 💰",
            $"Your payout of {assignment.FinalPrice:N0} PKR for the tour '{assignment.Tour.Title}' has been completed.",
            "PayoutReceived",
            "/restaurant/earnings"
        );

        return Ok(new { message = "Payout marked as completed." });
    }

    // --- Accommodation Payouts ---

    [HttpPost("accommodation/{accommodationId}/initiate")]
    public async Task<IActionResult> InitiateAccommodationPayout(int accommodationId)
    {
        var accommodation = await _context.Accommodations.FindAsync(accommodationId);
        if (accommodation == null) return NotFound("Accommodation not found");

        // Similar logic for accommodation payout
        accommodation.PaymentMethod = "Online";
        // Assuming we add a method to IPaymentService for Accommodation payouts if needed
        // For now, manual payout simulation
        
        return Ok(new { message = "Accommodation payout initiated." });
    }

    [HttpPost("accommodation/{accommodationId}/confirm")]
    public async Task<IActionResult> ConfirmAccommodationPayout(int accommodationId)
    {
        var accommodation = await _context.Accommodations
            .Include(a => a.Tour)
            .FirstOrDefaultAsync(a => a.AccommodationId == accommodationId);
            
        if (accommodation == null) return NotFound("Accommodation not found");

        accommodation.IsPaid = true;
        accommodation.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Note: Accommodations might need their own notification logic if they have a dedicated user account
        // For now, we'll assume they are part of the tour requirements

        return Ok(new { message = "Accommodation payout marked as completed." });
    }

    [HttpPost("accommodation/{accommodationId}/serve")]
    public async Task<IActionResult> MarkAccommodationAsServed(int accommodationId)
    {
        var accommodation = await _context.Accommodations.FindAsync(accommodationId);
        if (accommodation == null) return NotFound("Accommodation not found");

        if (accommodation.PaymentMethod == "Online" && !accommodation.IsPaid)
        {
            return BadRequest("Payout must be completed before marking as served.");
        }

        accommodation.IsServed = true;
        accommodation.ServedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Accommodation marked as served." });
    }

    // --- Driver Payouts ---

    [HttpGet("drivers/{tourId}")]
    public async Task<ActionResult> GetDriversForPayout(int tourId)
    {
        var driverOffers = await _context.DriverOffers
            .Where(o => o.TourId == tourId && o.Status == backend.Models.Enums.OfferStatus.Confirmed)
            .Include(o => o.Driver)
                .ThenInclude(d => d.User)
            .Include(o => o.Vehicle)
            .Select(o => new {
                o.OfferId,
                o.TransportationFare,
                o.IsPaid,
                o.PaidAt,
                DriverName = o.Driver.User.Name,
                DriverPhone = o.Driver.User.PhoneNumber,
                VehicleModel = o.Vehicle.Model,
                VehicleCapacity = o.Vehicle.Capacity
            })
            .ToListAsync();

        return Ok(driverOffers);
    }

    [HttpPost("driver/{offerId}/pay")]
    public async Task<IActionResult> PayDriver(int offerId)
    {
        var result = await _paymentService.ProcessSingleDriverPayoutAsync(offerId);
        
        if (!result) return BadRequest("Failed to initiate payout. Check Stripe connection.");

        return Ok(new { message = "Driver payout initiated successfully. Please confirm completion." });
    }

    [HttpPost("driver/{offerId}/confirm")]
    public async Task<IActionResult> ConfirmDriverPayout(int offerId)
    {
        var offer = await _context.DriverOffers
            .Include(o => o.Driver)
            .Include(o => o.Tour)
            .FirstOrDefaultAsync(o => o.OfferId == offerId);
            
        if (offer == null) return NotFound("Driver offer not found");

        offer.IsPaid = true;
        offer.PaidAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        // Notify Driver
        await _notificationService.CreateNotificationAsync(
            offer.Driver.UserId,
            "Payout Received! 💸",
            $"Your payout of {offer.TransportationFare:N0} PKR for the tour '{offer.Tour?.Title}' has been completed.",
            "PayoutReceived",
            "/driver/earnings"
        );

        return Ok(new { message = "Driver payout marked as completed." });
    }
}
