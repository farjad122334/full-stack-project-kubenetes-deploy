using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Enums;
using backend.Models.DTOs;
using backend.Models.BookingPayment;
using backend.Services;
using backend.Models.UserManagement;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;
    private readonly IStripeService _stripeService;
    private readonly IConfiguration _config;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(ApplicationDbContext context, INotificationService notificationService, IStripeService stripeService, IConfiguration config, ILogger<BookingsController> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _stripeService = stripeService;
        _config = config;
        _logger = logger;
    }

    // POST: api/bookings/{id}/checkout
    [HttpPost("{id}/checkout")]
    public async Task<IActionResult> CreateCheckoutSession(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Tour)
            .FirstOrDefaultAsync(b => b.BookingId == id);

        if (booking == null) return NotFound();

        var session = await _stripeService.CreateCheckoutSessionAsync(
            booking.BookingId, 
            booking.TotalAmount, 
            booking.Tour.Title);

        booking.StripeSessionId = session.Id;
        await _context.SaveChangesAsync();

        return Ok(new { sessionId = session.Id, url = session.Url });
    }

    [HttpPost("webhook")]
    [IgnoreAntiforgeryToken] // For external Stripe calls
    public async Task<IActionResult> StripeWebhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        _logger.LogInformation("Stripe Webhook Received: {Json}", json);
        Console.WriteLine(">>> STRIPE WEBHOOK HIT! <<<");

        try
        {
            var stripeEvent = Stripe.EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _config["Stripe:WebhookSecret"]
            );

            _logger.LogInformation("Stripe Event Type: {Type}", stripeEvent.Type);
            Console.WriteLine($"Stripe Event Type: {stripeEvent.Type}");

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
                
                // Check if this is a new booking flow
                if (session?.Metadata != null && session.Metadata.ContainsKey("IsNewBooking"))
                {
                    var tourId = int.Parse(session.Metadata["TourId"]);
                    var touristId = int.Parse(session.Metadata["TouristId"]);
                    var numPeople = int.Parse(session.Metadata["NumberOfPeople"]);
                    var amount = decimal.Parse(session.Metadata["TotalAmount"]);
                    var type = session.Metadata["BookingType"];

                    // Create Booking record NOW
                    _logger.LogInformation("Creating new booking from metadata for Tour {TourId}", tourId);
                    Console.WriteLine($"Processing new booking: Tour {tourId}, Tourist {touristId}, People {numPeople}");

                    var tour = await _context.Tours.FindAsync(tourId);
                    if (tour != null)
                    {
                        // Check if booking already exists for this session to avoid duplicates
                        var exists = await _context.Bookings.AnyAsync(b => b.StripeSessionId == session.Id);
                        if (exists) 
                        {
                             Console.WriteLine("Booking already exists for this session. Skipping.");
                             return Ok();
                        }

                        if (tour.CurrentBookings + numPeople <= tour.MaxCapacity)
                        {
                            var booking = new Booking
                            {
                                TourId = tourId,
                                TouristId = touristId,
                                NumberOfPeople = numPeople,
                                TotalAmount = amount,
                                BookingType = Enum.Parse<BookingType>(type),
                                BookingDate = DateTime.UtcNow,
                                Status = BookingStatus.Confirmed,
                                StripeSessionId = session.Id,
                                PaymentIntentId = session.PaymentIntentId
                            };

                            tour.CurrentBookings += numPeople;
                            _context.Bookings.Add(booking);
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✅ SUCCESS: Booking {booking.BookingId} created via Webhook.");

                            // Notify Tourist
                            var tourist = await _context.Tourists.FindAsync(touristId);
                            if (tourist != null)
                            {
                                await _notificationService.CreateNotificationAsync(
                                    tourist.UserId,
                                    "Booking Confirmed! 🎫",
                                    $"Your payment for the tour '{tour.Title}' was successful and your booking is confirmed.",
                                    "BookingSuccess",
                                    "/tourist/my-bookings"
                                );
                            }
                        }
                        else 
                        {
                             Console.WriteLine("❌ ERROR: Tour is full. Webhook could not create booking.");
                        }
                    }
                }
                else
                {
                    // Existing booking payment flow (legacy support)
                    var bookingId = int.Parse(session?.ClientReferenceId ?? "0");
                    var booking = await _context.Bookings.Include(b => b.Tour).FirstOrDefaultAsync(b => b.BookingId == bookingId);
                    if (booking != null)
                    {
                        booking.Status = BookingStatus.Confirmed;
                        booking.PaymentIntentId = session?.PaymentIntentId;
                        await _context.SaveChangesAsync();

                        // Notify Tourist
                        var tourist = await _context.Tourists.FindAsync(booking.TouristId);
                        if (tourist != null)
                        {
                            await _notificationService.CreateNotificationAsync(
                                tourist.UserId,
                                "Payment Confirmed! ✅",
                                $"Your payment for the tour '{booking.Tour?.Title}' has been received and your booking is now confirmed.",
                                "PaymentSuccess",
                                "/tourist/my-bookings"
                            );
                        }
                }
            }
        }
        else if (stripeEvent.Type == "account.updated")
            {
                var account = stripeEvent.Data.Object as Stripe.Account;
                if (account != null)
                {
                    _logger.LogInformation("Account Updated: {AccountId}, PayoutsEnabled: {Enabled}", account.Id, account.PayoutsEnabled);
                    
                    // Update Driver
                    var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.StripeAccountId == account.Id);
                    if (driver != null)
                    {
                        driver.PayoutsEnabled = account.PayoutsEnabled;
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Updated Driver {DriverId} PayoutsEnabled: {Enabled}", driver.DriverId, driver.PayoutsEnabled);
                    }

                    // Update Restaurant
                    var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.StripeAccountId == account.Id);
                    if (restaurant != null)
                    {
                        restaurant.PayoutsEnabled = account.PayoutsEnabled;
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Updated Restaurant {RestaurantId} PayoutsEnabled: {Enabled}", restaurant.RestaurantId, restaurant.PayoutsEnabled);
                    }
                }
            }

            return Ok();
        }
        catch (Stripe.StripeException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/bookings/create-session
    [HttpPost("initiate-booking")]
    public async Task<IActionResult> CreateBookingSession(BookingDto bookingDto)
    {
        _logger.LogInformation("Initiating booking session for Tour {TourId}, People {People}", bookingDto.TourId, bookingDto.NumberOfPeople);
        Console.WriteLine($">>> INITIATE BOOKING: Tour {bookingDto.TourId}, People {bookingDto.NumberOfPeople} <<<");

        var tour = await _context.Tours.FindAsync(bookingDto.TourId);
        if (tour == null) return NotFound(new { message = "Tour not found" });

        // Validate Capacity
        if (tour.CurrentBookings + bookingDto.NumberOfPeople > tour.MaxCapacity)
        {
            return BadRequest(new { message = "Not enough seats available" });
        }

        var session = await _stripeService.CreateBookingCheckoutSessionAsync(bookingDto, tour.Title);
        return Ok(new { sessionId = session.Id, url = session.Url });
    }

    // GET: api/bookings/verify-session/{sessionId}
    [HttpGet("verify-session")]
    public async Task<IActionResult> VerifySession([FromQuery] string sessionId)
    {
        Console.WriteLine($">>> VERIFY SESSION HIT: {sessionId} <<<");
        _logger.LogInformation("Verifying session: {SessionId}", sessionId);

        if (string.IsNullOrEmpty(sessionId)) return BadRequest("Session ID is required");
        var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.StripeSessionId == sessionId);
        if (booking != null)
        {
            return Ok(new { success = true, bookingId = booking.BookingId, status = booking.Status.ToString() });
        }

        // 2. If not, fetch session from Stripe to see if it's paid
        var service = new Stripe.Checkout.SessionService();
        var session = await service.GetAsync(sessionId);

        if (session != null && session.PaymentStatus == "paid" && session.Metadata.ContainsKey("IsNewBooking"))
        {
            // Trigger the same creation logic as Webhook (Redundancy/Fallback)
            var tourId = int.Parse(session.Metadata["TourId"]);
            var touristId = int.Parse(session.Metadata["TouristId"]);
            var numPeople = int.Parse(session.Metadata["NumberOfPeople"]);
            var amount = decimal.Parse(session.Metadata["TotalAmount"]);
            var type = session.Metadata["BookingType"];

            var tour = await _context.Tours.FindAsync(tourId);
            if (tour != null && tour.CurrentBookings + numPeople <= tour.MaxCapacity)
            {
                booking = new Booking
                {
                    TourId = tourId,
                    TouristId = touristId,
                    NumberOfPeople = numPeople,
                    TotalAmount = amount,
                    BookingType = Enum.Parse<BookingType>(type),
                    BookingDate = DateTime.UtcNow,
                    Status = BookingStatus.Confirmed,
                    StripeSessionId = session.Id,
                    PaymentIntentId = session.PaymentIntentId
                };

                tour.CurrentBookings += numPeople;
                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();

                return Ok(new { success = true, bookingId = booking.BookingId, status = booking.Status.ToString() });
            }
        }

        return BadRequest(new { success = false, message = "Payment not verified or tour full." });
    }

    // POST: api/bookings
    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking(BookingDto bookingDto)
    {
        // 1. Validate Tour exists
        var tour = await _context.Tours.FindAsync(bookingDto.TourId);
        if (tour == null)
        {
            return BadRequest(new { message = "Tour not found" });
        }

        // 2. Validate Tourist exists
        var tourist = await _context.Tourists.FindAsync(bookingDto.TouristId);
        if (tourist == null)
        {
            return BadRequest(new { message = "Tourist profile not found. Please ensure you are logged in correctly." });
        }

        // 3. Prevent duplicate bookings
        var existingBooking = await _context.Bookings
            .AnyAsync(b => b.TourId == bookingDto.TourId && b.TouristId == bookingDto.TouristId && b.Status != BookingStatus.Cancelled);
        if (existingBooking)
        {
            return BadRequest(new { message = "You have already booked this tour." });
        }

        // 4. Validate Capacity
        if (tour.CurrentBookings + bookingDto.NumberOfPeople > tour.MaxCapacity)
        {
            return BadRequest(new { message = "Not enough seats available" });
        }

        // 4. Create Booking Entity
        var booking = new Booking
        {
            TourId = bookingDto.TourId,
            TouristId = bookingDto.TouristId,
            NumberOfPeople = bookingDto.NumberOfPeople,
            TotalAmount = bookingDto.TotalAmount,
            BookingType = bookingDto.BookingType,
            BookingDate = DateTime.UtcNow,
            Status = BookingStatus.Pending
        };

        // 5. Update Tour Bookings count
        tour.CurrentBookings += bookingDto.NumberOfPeople;
        _context.Entry(tour).State = EntityState.Modified;

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Send Notification to Tourist
        await _notificationService.CreateNotificationAsync(
            tourist.UserId,
            "Booking Success! 🎫",
            $"You have successfully booked the tour: {tour.Title}. Your booking is currently pending payment verification.",
            "BookingSuccess",
            $"/tourist/my-bookings"
        );

        return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingId }, booking);
    }

    // GET: api/bookings/tourist/{touristId}
    [HttpGet("tourist/{touristId}")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetTouristBookings(int touristId)
    {
        return await _context.Bookings
            .Include(b => b.Tour)
            .Where(b => b.TouristId == touristId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();
    }

    // DELETE: api/bookings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var booking = await _context.Bookings.Include(b => b.Tour).FirstOrDefaultAsync(b => b.BookingId == id);
        if (booking == null)
        {
            return NotFound();
        }

        // Update Tour Bookings count
        if (booking.Tour != null)
        {
            booking.Tour.CurrentBookings -= booking.NumberOfPeople;
            _context.Entry(booking.Tour).State = EntityState.Modified;
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/bookings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound();
        }

        return booking;
    }
}
