using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.TourManagement;
using backend.Models.Enums;
using backend.Models.DTOs;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToursController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IPaymentService _paymentService;
    private readonly IImageService _imageService;

    public ToursController(ApplicationDbContext context, INotificationService notificationService, IPaymentService paymentService, IImageService imageService)
    {
        _context = context;
        _notificationService = notificationService;
        _paymentService = paymentService;
        _imageService = imageService;
    }

    // GET: api/tours
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Tour>>> GetTours()
    {
        return await _context.Tours
            .Include(t => t.ServiceRequirements)
            .Include(t => t.DriverOffers)
                .ThenInclude(offer => offer.Vehicle)
            .Include(t => t.DriverOffers)
                .ThenInclude(offer => offer.Driver)
                    .ThenInclude(driver => driver.User)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(req => req.Assignment)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(req => req.RestaurantOffers)
                    .ThenInclude(offer => offer.Restaurant)
                        .ThenInclude(r => r.User)
            .Include(t => t.Bookings)
                .ThenInclude(b => b.Tourist)
                    .ThenInclude(tr => tr.User)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // GET: api/tours/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Tour>> GetTour(int id)
    {
        var tour = await _context.Tours
            .Include(t => t.DriverOffers)
                .ThenInclude(offer => offer.Vehicle)
            .Include(t => t.DriverOffers)
                .ThenInclude(offer => offer.Driver)
                    .ThenInclude(driver => driver.User)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(req => req.Assignment)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(req => req.RestaurantOffers)
                    .ThenInclude(offer => offer.Restaurant)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(req => req.RestaurantOffers)
                    .ThenInclude(offer => offer.OfferMenuItems)
            .FirstOrDefaultAsync(t => t.TourId == id);

        if (tour == null)
        {
            return NotFound();
        }

        return tour;
    }

    // POST: api/tours
    [HttpPost]
    public async Task<ActionResult<Tour>> CreateTour([FromForm] CreateTourDto tourDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Create the tour entity
        var tour = new Tour
        {
            Title = tourDto.Title,
            Description = tourDto.Description,
            DepartureCity = tourDto.DepartureCity,
            DepartureLocation = tourDto.DepartureLocation,
            DepartureLatitude = tourDto.DepartureLatitude,
            DepartureLongitude = tourDto.DepartureLongitude,
            Destination = tourDto.Destination,
            DurationDays = (int)(tourDto.EndDate.Date - tourDto.StartDate.Date).TotalDays + 1,  // Updated to use Date component
            StartDate = tourDto.StartDate,
            EndDate = tourDto.EndDate,
            MaxCapacity = tourDto.MaxCapacity,
            PricePerHead = tourDto.PricePerHead,
            Status = TourStatus.Draft,
            CoupleDiscountPercentage = tourDto.CoupleDiscountPercentage,
            BulkDiscountPercentage = tourDto.BulkDiscountPercentage,
            BulkBookingMinPersons = tourDto.BulkBookingMinPersons,
            CreatedAt = DateTime.UtcNow
        };

        // Handle Image Upload
        if (tourDto.Image != null)
        {
            var imageUrl = await _imageService.SaveImageAsync(tourDto.Image, "tours");
            tour.ImageUrl = imageUrl;
        }

        // Add tour to context
        _context.Tours.Add(tour);
        await _context.SaveChangesAsync(); // Save to get TourId

        // Create service requirements if provided
        if (tourDto.ServiceRequirements != null && tourDto.ServiceRequirements.Any())
        {
            foreach (var reqDto in tourDto.ServiceRequirements)
            {
                var requirement = new ServiceRequirement
                {
                    TourId = tour.TourId,
                    Type = reqDto.Type,
                    Location = reqDto.Location,
                    DateNeeded = reqDto.DateNeeded,
                    Time = reqDto.Time,
                    StayDurationDays = reqDto.StayDurationDays,
                    EstimatedPeople = reqDto.EstimatedPeople,
                    EstimatedBudget = reqDto.EstimatedBudget,
                    Status = "Open",
                    CreatedAt = DateTime.UtcNow
                };

                _context.ServiceRequirements.Add(requirement);
            }

            await _context.SaveChangesAsync();
        }

        // Reload tour with requirements
        var createdTour = await _context.Tours
            .Include(t => t.ServiceRequirements)
            .FirstOrDefaultAsync(t => t.TourId == tour.TourId);

        return CreatedAtAction(nameof(GetTour), new { id = tour.TourId }, createdTour);
    }

    // POST: api/tours/{id}/finalize
    [HttpPost("{id}/finalize")]
    public async Task<IActionResult> FinalizeTour(int id)
    {
        var tour = await _context.Tours
            .Include(t => t.DriverOffers)
                .ThenInclude(o => o.Vehicle)
            .Include(t => t.DriverOffers)
                .ThenInclude(o => o.Driver)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(r => r.RestaurantOffers)
                    .ThenInclude(o => o.Restaurant)
            .FirstOrDefaultAsync(t => t.TourId == id);

        if (tour == null)
        {
            return NotFound("Tour not found");
        }

        if (tour.Status == TourStatus.Finalized)
        {
            return BadRequest("Tour is already finalized");
        }

        // Validation 1: Check transport capacity
        var totalCapacity = tour.MaxCapacity;
        var approvedDriverCapacity = tour.DriverOffers
            .Where(o => o.Status == OfferStatus.Accepted)
            .Sum(o => o.Vehicle.Capacity);

        if (approvedDriverCapacity < totalCapacity)
        {
            return BadRequest(new
            {
                message = "Insufficient transport capacity",
                required = totalCapacity,
                approved = approvedDriverCapacity,
                remaining = totalCapacity - approvedDriverCapacity
            });
        }

        // Validation 2: Check all service requirements are fulfilled
        var unfulfilledRequirements = new List<string>();

        foreach (var requirement in tour.ServiceRequirements)
        {
            var hasAcceptedOffer = requirement.RestaurantOffers
                .Any(o => o.Status == OfferStatus.Accepted);

            if (!hasAcceptedOffer)
            {
                unfulfilledRequirements.Add($"{requirement.Type} at {requirement.Location} on {requirement.DateNeeded:yyyy-MM-dd}");
                continue;
            }

            // Validation 3: Check if accepted offer has an order created
            var acceptedOffer = requirement.RestaurantOffers
                .First(o => o.Status == OfferStatus.Accepted);

            var assignment = await _context.RestaurantAssignments
                .FirstOrDefaultAsync(a => a.RestaurantOfferId == acceptedOffer.OfferId);

            if (assignment == null || !assignment.OrderId.HasValue)
            {
                unfulfilledRequirements.Add($"{requirement.Type} at {requirement.Location} - offer accepted but order/assignment data is incomplete. Please Unapprove and Re-Accept to fix.");
            }
        }

        if (unfulfilledRequirements.Any())
        {
            return BadRequest(new
            {
                message = "Some requirements are not fulfilled",
                unfulfilledRequirements
            });
        }

        // All validations passed - finalize the tour
        tour.Status = TourStatus.Finalized;
        tour.FinalizedAt = DateTime.UtcNow;

        // Update all accepted offers to Confirmed
        foreach (var driverOffer in tour.DriverOffers.Where(o => o.Status == OfferStatus.Accepted))
        {
            driverOffer.Status = OfferStatus.Confirmed;
            driverOffer.RespondedAt = DateTime.UtcNow;
        }

        foreach (var requirement in tour.ServiceRequirements)
        {
            var acceptedOffer = requirement.RestaurantOffers
                .FirstOrDefault(o => o.Status == OfferStatus.Accepted);

            if (acceptedOffer != null)
            {
                acceptedOffer.Status = OfferStatus.Confirmed;
                requirement.Status = "Fulfilled";
            }
        }

        await _context.SaveChangesAsync();

        // Send Notifications to Drivers
        foreach (var driverOffer in tour.DriverOffers.Where(o => o.Status == OfferStatus.Confirmed))
        {
            await _notificationService.CreateNotificationAsync(
                driverOffer.Driver.UserId,
                "Tour Finalized! 🗺️",
                $"The tour '{tour.Title}' has been finalized. Your transport services are confirmed.",
                "TourFinalized",
                $"/driver/requests"
            );
        }

        // Send Notifications to Restaurants/Hotels
        foreach (var requirement in tour.ServiceRequirements)
        {
            var confirmedOffer = requirement.RestaurantOffers
                .FirstOrDefault(o => o.Status == OfferStatus.Confirmed);

            if (confirmedOffer != null)
            {
                await _notificationService.CreateNotificationAsync(
                    confirmedOffer.Restaurant.UserId,
                    "Tour Finalized! 🏨",
                    $"The tour '{tour.Title}' has been finalized. Your service for {requirement.Type} is confirmed.",
                    "TourFinalized",
                    $"/restaurant/requests"
                );
            }
        }

        return Ok(new
        {
            message = "Tour finalized successfully",
            tourId = tour.TourId,
            finalizedAt = tour.FinalizedAt,
            transportCapacity = new { total = totalCapacity, approved = approvedDriverCapacity },
            requirementsFulfilled = tour.ServiceRequirements.Count
        });
    }

    // POST: api/tours/{id}/mark-ready
    [HttpPost("{id}/mark-ready")]
    public async Task<IActionResult> MarkTourAsReady(int id)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
        {
            return NotFound("Tour not found");
        }

        if (tour.Status != TourStatus.Finalized)
        {
            return BadRequest("Only finalized tours can be marked as ready");
        }

        tour.Status = TourStatus.Ready;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tour is now ready for departure", status = tour.Status.ToString() });
    }

    // POST: api/tours/{id}/start
    [HttpPost("{id}/start")]
    public async Task<IActionResult> StartTour(int id)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
        {
            return NotFound("Tour not found");
        }

        if (tour.Status != TourStatus.Ready && tour.Status != TourStatus.Finalized)
        {
            return BadRequest("Only ready or finalized tours can be started");
        }

        tour.Status = TourStatus.InProgress;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tour successfully started", status = tour.Status.ToString() });
    }

    // POST: api/tours/{id}/complete
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteTour(int id)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
        {
            return NotFound("Tour not found");
        }

        if (tour.Status != TourStatus.InProgress)
        {
            return BadRequest("Only tours in progress can be completed");
        }

        tour.Status = TourStatus.Completed;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tour successfully completed. Please proceed to driver payouts.", status = tour.Status.ToString() });
    }

    // POST: api/tours/{id}/publish
    [HttpPost("{id}/publish")]
    public async Task<IActionResult> PublishTour(int id)
    {
        var tour = await _context.Tours.FindAsync(id);

        if (tour == null)
        {
            return NotFound("Tour not found");
        }

        if (tour.Status != TourStatus.Draft)
        {
            return BadRequest("Only draft tours can be published");
        }

        tour.Status = TourStatus.Published;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Tour published successfully", status = tour.Status.ToString() });
    }

    // Test endpoint to verify database connection
    [HttpGet("test-connection")]
    public async Task<ActionResult<object>> TestConnection()
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync();
            if (canConnect)
            {
                return Ok(new { 
                    success = true, 
                    message = "✅ Database connection successful!",
                    databaseName = _context.Database.GetDbConnection().Database,
                    serverName = _context.Database.GetDbConnection().DataSource
                });
            }
            return StatusCode(500, new { 
                success = false, 
                message = "❌ Cannot connect to database",
                hint = "Database might not exist. Try calling POST /api/tours/create-database"
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { 
                success = false, 
                message = $"❌ Error: {ex.Message}",
                innerException = ex.InnerException?.Message,
                stackTrace = ex.StackTrace?.Split('\n').Take(5)
            });
        }
    }

    // Test endpoint to create database
    [HttpPost("create-database")]
    public async Task<ActionResult<string>> CreateDatabase()
    {
        try
        {
            await _context.Database.EnsureCreatedAsync();
            return Ok("✅ Database created successfully!");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"❌ Error: {ex.Message}");
        }
    }
}
