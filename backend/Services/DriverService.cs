using backend.Models.Enums;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.UserManagement;

namespace backend.Services;

public class DriverService : IDriverService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IStripeService _stripeService;

    public DriverService(ApplicationDbContext context, IEmailService emailService, IStripeService stripeService)
    {
        _context = context;
        _emailService = emailService;
        _stripeService = stripeService;
    }
    public async Task<IEnumerable<object>> GetAllDriversAsync()
    {
        return await _context.Drivers
            .Include(d => d.User)
            .Include(d => d.Vehicles)
            .Select(d => new
            {
                d.DriverId,
                d.UserId,
                Name = d.User.Name,
                Contact = d.User.PhoneNumber,
                Email = d.User.Email, // Needed for email notification
                CNIC = d.CNIC,
                License = d.Licence,
                Vehicle = d.Vehicles.FirstOrDefault() != null 
                    ? $"{d.Vehicles.FirstOrDefault()!.Model} ({d.Vehicles.FirstOrDefault()!.RegistrationNumber})" 
                    : "No Vehicle",
                d.AccountStatus,
                Rating = 0.0, // Placeholder, calculate if you have ratings
                TotalTrips = d.TourAssignments.Count(t => t.Status == AssignmentStatus.Completed),
                Avatar = d.User.ProfilePicture ?? "https://ui-avatars.com/api/?name=" + d.User.Name,
                Documents = new 
                {
                    CnicFront = d.CnicFront,
                    CnicBack = d.CnicBack,
                    License = d.LicenceImage
                }
            })
            .ToListAsync();
    }

    public async Task<object?> GetDriverByIdAsync(int driverId)
    {
        return await _context.Drivers
            .Include(d => d.User)
            .Include(d => d.Vehicles)
            .Where(d => d.DriverId == driverId)
            .Select(d => new
            {
                d.DriverId,
                d.UserId,
                Name = d.User.Name,
                Contact = d.User.PhoneNumber,
                Email = d.User.Email,
                CNIC = d.CNIC,
                License = d.Licence,
                d.AccountStatus,
                Rating = 0.0,
                TotalTrips = d.TourAssignments.Count(t => t.Status == AssignmentStatus.Completed),
                Avatar = d.User.ProfilePicture ?? "https://ui-avatars.com/api/?name=" + d.User.Name,
                Documents = new
                {
                    CnicFront = d.CnicFront,
                    CnicBack = d.CnicBack,
                    License = d.LicenceImage
                },
                Vehicles = d.Vehicles.Select(v => new
                {
                    v.VehicleId,
                    v.RegistrationNumber,
                    v.VehicleType,
                    v.Model,
                    v.Capacity,
                    v.Status
                }),
                d.StripeAccountId,
                d.PayoutsEnabled
            })
            .FirstOrDefaultAsync();
    }

    public async Task<bool> UpdateDriverStatusAsync(int driverId, string status)
    {
        var driver = await _context.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.DriverId == driverId);
        if (driver == null) return false;

        driver.AccountStatus = status;
        await _context.SaveChangesAsync();

        // Send Email Notification
        if (driver.User != null)
        {
            string subject = $"Driver Account {status}";
            string message = $"Dear {driver.User.Name},<br><br>Your driver application has been <b>{status}</b>.";
            
            if (status == "Verified")
            {
                message += "<br>You can now log in and start accepting tours.";
            }
            else if (status == "Rejected")
            {
                message += "<br>Please contact support for more information.";
            }

            try 
            {
                await _emailService.SendEmailAsync(driver.User.Email, subject, message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex.Message}");
            }
        }

        return true;
    }

    public async Task<object?> GetDashboardStatsAsync(int driverId)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.DriverId == driverId);
        if (driver == null) return null;

        var assignments = await _context.TourAssignments
            .Include(a => a.Tour)
            .Where(a => a.DriverId == driverId)
            .ToListAsync();

        var completedTrips = assignments.Where(a => a.Status == AssignmentStatus.Completed).Count();
        
        // Calculate earnings from completed tours where driver got paid
        var totalEarnings = assignments
            .Where(a => a.Status == AssignmentStatus.Completed)
            .Sum(a => a.FinalPrice);

        // Active/Upcoming Tours (Finalized or Intermediate, future or current dates)
        var upcomingTours = assignments
            .Where(a => a.Status != AssignmentStatus.Completed && a.Status != AssignmentStatus.Cancelled && a.Status != AssignmentStatus.Rejected)
            .Select(a => new
            {
                a.Tour.TourId,
                a.Tour.Title,
                a.Tour.Destination,
                a.Tour.StartDate,
                a.Tour.EndDate,
                Price = a.FinalPrice,
                a.Status
            })
            .OrderBy(t => t.StartDate)
            .Take(5)
            .ToList();

        // Recent Booked/Completed
        var recentTours = assignments
            .Where(a => a.Status == AssignmentStatus.Completed)
            .Select(a => new
            {
                a.Tour.TourId,
                a.Tour.Title,
                a.Tour.Destination,
                a.Tour.StartDate,
                a.Tour.EndDate,
                Price = a.FinalPrice,
                a.Status
            })
            .OrderByDescending(t => t.EndDate)
            .Take(5)
            .ToList();

        return new
        {
            totalEarnings,
            completedTrips,
            activeTours = upcomingTours.Count(),
            upcomingTours,
            recentTours
        };
    }

    public async Task<string> GetStripeOnboardingLinkAsync(int driverId, string returnUrl, string refreshUrl)
    {
        var driver = await _context.Drivers.Include(d => d.User).FirstOrDefaultAsync(d => d.DriverId == driverId);
        if (driver == null) throw new Exception("Driver not found");

        if (string.IsNullOrEmpty(driver.StripeAccountId))
        {
            var accountId = await _stripeService.CreateConnectedAccountAsync(
                driver.User.Email, 
                driver.User.Name, 
                "Driver");
            driver.StripeAccountId = accountId;
            await _context.SaveChangesAsync();
        }

        return await _stripeService.CreateOnboardingLinkAsync(driver.StripeAccountId, returnUrl, refreshUrl);
    }

    public async Task<string> GetStripeDashboardLinkAsync(int driverId)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.DriverId == driverId);
        if (driver == null || string.IsNullOrEmpty(driver.StripeAccountId)) 
            throw new Exception("Stripe account not found for this driver.");

        return await _stripeService.CreateLoginLinkAsync(driver.StripeAccountId);
    }

    public async Task<bool> VerifyStripeStatusAsync(int driverId)
    {
        var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.DriverId == driverId);
        if (driver == null || string.IsNullOrEmpty(driver.StripeAccountId)) return false;

        var isComplete = await _stripeService.IsAccountOnboardedAsync(driver.StripeAccountId);
        
        if (isComplete != driver.PayoutsEnabled)
        {
            driver.PayoutsEnabled = isComplete;
            await _context.SaveChangesAsync();
        }

        return isComplete;
    }

    public async Task<IEnumerable<object>> GetEarningsAsync(int driverId)
    {
        return await _context.DriverOffers
            .Include(o => o.Tour)
            .Where(o => o.DriverId == driverId && (o.Status == OfferStatus.Confirmed || o.Status == OfferStatus.Accepted))
            .OrderByDescending(o => o.PaidAt ?? DateTime.MinValue)
            .ThenByDescending(o => o.OfferId)
            .Select(o => new
            {
                o.OfferId,
                TourTitle = o.Tour != null ? o.Tour.Title : "Custom Trip",
                Date = o.PaidAt ?? (o.Tour != null ? o.Tour.EndDate : DateTime.UtcNow),
                Amount = o.TransportationFare,
                Status = o.IsPaid ? "Paid" : "Pending",
                Method = o.IsPaid ? "Bank Transfer" : "N/A",
                TourId = o.TourId
            })
            .ToListAsync();
    }
}
