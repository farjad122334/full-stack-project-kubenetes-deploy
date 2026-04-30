using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Supporting;
using backend.Models.UserManagement;
using backend.Models.Enums;
using backend.Models.DTOs;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RatingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RatingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/ratings/tour/{tourId}/entities
    // Gets the drivers and restaurants associated with a completed tour to display on the rating form
    [HttpGet("tour/{tourId}/entities")]
    public async Task<IActionResult> GetRatableEntities(int tourId)
    {
        var tour = await _context.Tours
            .Include(t => t.DriverOffers)
                .ThenInclude(o => o.Driver)
                    .ThenInclude(d => d.User)
            .Include(t => t.ServiceRequirements)
                .ThenInclude(r => r.RestaurantOffers)
                    .ThenInclude(o => o.Restaurant)
                        .ThenInclude(r => r.User)
            .FirstOrDefaultAsync(t => t.TourId == tourId);

        if (tour == null)
            return NotFound(new { message = "Tour not found" });

        var drivers = tour.DriverOffers
            .Where(o => o.Status == OfferStatus.Confirmed || o.Status == OfferStatus.Accepted)
            .Select(o => new {
                driverId = o.Driver.UserId, // Using UserId since User table has the actual profile info
                name = o.Driver.User.Name
            })
            .DistinctBy(d => d.driverId)
            .ToList();

        var restaurants = tour.ServiceRequirements
            .SelectMany(r => r.RestaurantOffers)
            .Where(o => o.Status == OfferStatus.Confirmed || o.Status == OfferStatus.Accepted)
            .Select(o => new {
                restaurantId = o.Restaurant.UserId, // Using UserId
                name = o.Restaurant.RestaurantName ?? o.Restaurant.User.Name,
                type = o.ServiceRequirement.Type
            })
            .DistinctBy(r => r.restaurantId)
            .ToList();

        return Ok(new
        {
            tourId = tour.TourId,
            tourTitle = tour.Title,
            drivers = drivers,
            restaurants = restaurants
        });
    }

    // GET: api/ratings/tourist/{touristId}/rated-tours
    // Returns list of tourIds that the tourist has already submitted a TourRating for
    [HttpGet("tourist/{touristId}/rated-tours")]
    public async Task<IActionResult> GetRatedTours(int touristId)
    {
        var ratedTourIds = await _context.Ratings
            .OfType<TourRating>()
            .Where(r => r.TouristId == touristId)
            .Select(r => r.TourId)
            .Distinct()
            .ToListAsync();

        return Ok(ratedTourIds);
    }

    // POST: api/ratings/submit
    [HttpPost("submit")]
    public async Task<IActionResult> SubmitRatings([FromBody] SubmitRatingsPayloadDto payload)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Verify Tour exists
        var tourExists = await _context.Tours.AnyAsync(t => t.TourId == payload.TourId);
        if (!tourExists) return BadRequest(new { message = "Invalid TourId" });

        // Add Tour Rating
        if (payload.TourRating != null)
        {
            var tourRating = new TourRating
            {
                TourId = payload.TourId,
                TouristId = payload.TouristId,
                Stars = payload.TourRating.OverallStars,
                Comment = payload.TourRating.Comment,
                ManagementStars = payload.TourRating.ManagementStars,
                PricingStars = payload.TourRating.PricingStars,
                CreatedAt = DateTime.UtcNow
            };
            _context.Ratings.Add(tourRating);
        }

        // Add Driver Ratings
        if (payload.DriverRatings != null && payload.DriverRatings.Any())
        {
            foreach (var drDto in payload.DriverRatings)
            {
                var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == drDto.DriverUserId);
                if (driver != null)
                {
                    var driverRating = new DriverRating
                    {
                        TourId = payload.TourId,
                        TouristId = payload.TouristId,
                        DriverId = driver.DriverId,
                        Stars = drDto.OverallStars,
                        Comment = drDto.Comment,
                        VehicleConditionStars = drDto.VehicleConditionStars,
                        ComfortStars = drDto.ComfortStars,
                        DriverBehaviourStars = drDto.DriverBehaviourStars,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Ratings.Add(driverRating);
                }
            }
        }

        // Add Restaurant Ratings
        if (payload.RestaurantRatings != null && payload.RestaurantRatings.Any())
        {
            foreach (var rrDto in payload.RestaurantRatings)
            {
                var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.UserId == rrDto.RestaurantUserId);
                if (restaurant != null)
                {
                    var rr = new RestaurantRating
                    {
                        TourId = payload.TourId,
                        TouristId = payload.TouristId,
                        RestaurantId = restaurant.RestaurantId,
                        Stars = rrDto.OverallStars,
                        Comment = rrDto.Comment,
                        AccommodationStars = rrDto.AccommodationStars,
                        ServiceStars = rrDto.ServiceStars,
                        StaffStars = rrDto.StaffStars,
                        CreatedAt = DateTime.UtcNow
                    };
                    _context.Ratings.Add(rr);
                }
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Ratings submitted successfully!" });
    }

    // System Test endpoint to see all ratings (Dev only)
    [HttpGet]
    public async Task<IActionResult> GetAllRatings()
    {
        return Ok(await _context.Ratings.ToListAsync());
    }

    // GET: api/ratings/driver/{userId}
    [HttpGet("driver/{userId}")]
    public async Task<IActionResult> GetDriverRatings(int userId)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == userId);
        if (driver == null)
        {
            // Driver profile not fully set up yet — return empty ratings instead of 404
            return Ok(new
            {
                averageOverall = 0,
                averageVehicle = 0,
                averageComfort = 0,
                averageBehaviour = 0,
                totalReviews = 0,
                reviews = new List<object>()
            });
        }

        var ratings = await _context.Ratings
            .OfType<DriverRating>()
            .Include(r => r.Tourist)
                .ThenInclude(t => t.User)
            .Include(r => r.Tour)
            .Where(r => r.DriverId == driver.DriverId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        if (!ratings.Any())
        {
            return Ok(new
            {
                averageOverall = 0,
                averageVehicle = 0,
                averageComfort = 0,
                averageBehaviour = 0,
                totalReviews = 0,
                reviews = new List<object>()
            });
        }

        return Ok(new
        {
            averageOverall = ratings.Average(r => r.Stars),
            averageVehicle = ratings.Average(r => r.VehicleConditionStars),
            averageComfort = ratings.Average(r => r.ComfortStars),
            averageBehaviour = ratings.Average(r => r.DriverBehaviourStars),
            totalReviews = ratings.Count,
            reviews = ratings.Select(r => new
            {
                ratingId = r.RatingId,
                tourName = r.Tour.Title,
                touristName = r.Tourist.User.Name,
                date = r.CreatedAt,
                overallStars = r.Stars,
                vehicleStars = r.VehicleConditionStars,
                comfortStars = r.ComfortStars,
                behaviourStars = r.DriverBehaviourStars,
                comment = r.Comment
            })
        });
    }

    // GET: api/ratings/restaurant/{userId}
    [HttpGet("restaurant/{userId}")]
    public async Task<IActionResult> GetRestaurantRatings(int userId)
    {
        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.UserId == userId);
        if (restaurant == null)
        {
            // Restaurant profile not fully set up yet — return empty ratings
            return Ok(new
            {
                averageOverall = 0,
                averageAccommodation = 0,
                averageService = 0,
                averageStaff = 0,
                totalReviews = 0,
                reviews = new List<object>()
            });
        }

        var ratings = await _context.Ratings
            .OfType<RestaurantRating>()
            .Include(r => r.Tourist)
                .ThenInclude(t => t.User)
            .Include(r => r.Tour)
            .Where(r => r.RestaurantId == restaurant.RestaurantId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        if (!ratings.Any())
        {
            return Ok(new
            {
                averageOverall = 0,
                averageAccommodation = 0,
                averageService = 0,
                averageStaff = 0,
                totalReviews = 0,
                reviews = new List<object>()
            });
        }

        return Ok(new
        {
            averageOverall = ratings.Average(r => r.Stars),
            averageAccommodation = ratings.Average(r => r.AccommodationStars),
            averageService = ratings.Average(r => r.ServiceStars),
            averageStaff = ratings.Average(r => r.StaffStars),
            totalReviews = ratings.Count,
            reviews = ratings.Select(r => new
            {
                ratingId = r.RatingId,
                tourName = r.Tour.Title,
                touristName = r.Tourist.User.Name,
                date = r.CreatedAt,
                overallStars = r.Stars,
                accommodationStars = r.AccommodationStars,
                serviceStars = r.ServiceStars,
                staffStars = r.StaffStars,
                comment = r.Comment
            })
        });
    }
}
