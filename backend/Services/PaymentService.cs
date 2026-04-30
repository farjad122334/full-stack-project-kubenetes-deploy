using backend.Data;
using backend.Models.Enums;
using backend.Models.Supporting;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class PaymentService : IPaymentService
{
    private readonly ApplicationDbContext _context;
    private readonly IStripeService _stripeService;

    public PaymentService(ApplicationDbContext context, IStripeService stripeService)
    {
        _context = context;
        _stripeService = stripeService;
    }

    public async Task<bool> ProcessTourEarningsAsync(int tourId)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            // 1. Process Driver Earnings
            var driverOffers = await _context.DriverOffers
                .Where(o => o.TourId == tourId && o.Status == OfferStatus.Confirmed)
                .Include(o => o.Driver)
                .ToListAsync();

            foreach (var offer in driverOffers)
            {
                // Check if earning already exists to prevent duplicates
                var existingEarning = await _context.Earnings
                    .AnyAsync(e => e.TourId == tourId && e.DriverId == offer.Driver.DriverId);

                if (!existingEarning)
                {
                    var earning = new Earning
                    {
                        TourId = tourId,
                        DriverId = offer.Driver.DriverId,
                        Amount = offer.OfferedAmount,
                        Type = "TourPayment",
                        Status = "Pending",
                        EarnedAt = DateTime.UtcNow
                    };

                    _context.Earnings.Add(earning);
                    
                    // Update Driver Total Earnings
                    offer.Driver.TotalEarnings += offer.OfferedAmount;
                    _context.Entry(offer.Driver).State = EntityState.Modified;
                }
            }

            // 2. Process Restaurant Earnings
            // We use RestaurantAssignments because they contain the FinalPrice and are created upon confirmation
            var restaurantAssignments = await _context.RestaurantAssignments
                .Where(a => a.TourId == tourId)
                .Include(a => a.Restaurant)
                .ToListAsync();

            foreach (var assignment in restaurantAssignments)
            {
                // Check if earning already exists
                var existingEarning = await _context.Earnings
                    .AnyAsync(e => e.TourId == tourId && e.RestaurantId == assignment.RestaurantId && e.Type == "TourPayment");

                if (!existingEarning)
                {
                    var earning = new Earning
                    {
                        TourId = tourId,
                        RestaurantId = assignment.RestaurantId,
                        Amount = assignment.FinalPrice,
                        Type = "TourPayment",
                        Status = "Pending",
                        EarnedAt = DateTime.UtcNow
                    };

                    _context.Earnings.Add(earning);
                    
                    // Note: Restaurant model currently doesn't have TotalEarnings property exposed or used broadly, 
                    // skipping update to that property for now to match model definition.
                }
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
            return true;
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<bool> ProcessRestaurantPayoutAsync(int assignmentId, string? paymentMethod)
    {
        var assignment = await _context.RestaurantAssignments
            .Include(a => a.Restaurant)
            .Include(a => a.Tour)
            .FirstOrDefaultAsync(a => a.AssignmentId == assignmentId);

        if (assignment == null)
            return false;

        // If online payment and no stripe account, return false
        if (paymentMethod == "Online" && string.IsNullOrEmpty(assignment.Restaurant.StripeAccountId))
            return false;

        // Create Earning record
        var earning = new Earning
        {
            TourId = assignment.TourId,
            RestaurantId = assignment.RestaurantId,
            Amount = assignment.FinalPrice,
            Type = "RestaurantPayout",
            Status = paymentMethod == "Cash" ? "Paid" : "Processing",
            PaymentMethod = paymentMethod,
            EarnedAt = DateTime.UtcNow
        };
        _context.Earnings.Add(earning);
        await _context.SaveChangesAsync();

        if (paymentMethod == "Cash")
        {
            return true;
        }

        // Trigger Stripe Transfer for Online payments
        if (string.IsNullOrEmpty(assignment.Restaurant?.StripeAccountId))
        {
            return false; // Cannot payout if restaurant has no stripe account
        }

        var success = await _stripeService.TransferToConnectedAccountAsync(
            assignment.Restaurant.StripeAccountId,
            assignment.FinalPrice,
            $"Payout for Tour: {assignment.Tour?.Title ?? "Unknown"} - Order Served");

        if (success)
        {
            earning.Status = "Paid";
            await _context.SaveChangesAsync();
        }

        return success;
    }

    public async Task<bool> ProcessDriverPayoutsAsync(int tourId)
    {
        var tour = await _context.Tours
            .Include(t => t.DriverOffers)
                .ThenInclude(o => o.Driver)
            .FirstOrDefaultAsync(t => t.TourId == tourId);

        if (tour == null) return false;

        bool allSuccess = true;
        foreach (var offer in tour.DriverOffers.Where(o => o.Status == OfferStatus.Confirmed))
        {
            if (string.IsNullOrEmpty(offer.Driver.StripeAccountId))
            {
                allSuccess = false;
                continue;
            }

            // Create Earning record
            var earning = new Earning
            {
                TourId = tourId,
                DriverId = offer.DriverId,
                Amount = offer.OfferedAmount,
                Type = "DriverPayout",
                Status = "Processing",
                EarnedAt = DateTime.UtcNow
            };
            _context.Earnings.Add(earning);
            await _context.SaveChangesAsync();

            // Trigger Stripe Transfer
            var success = await _stripeService.TransferToConnectedAccountAsync(
                offer.Driver.StripeAccountId!,
                offer.OfferedAmount,
                $"Payout for Tour: {tour.Title} - Tour Completed");

            if (success)
            {
                earning.Status = "Paid";
                offer.Driver.TotalEarnings += offer.OfferedAmount;
            }
            else
            {
                allSuccess = false;
            }
        }

        await _context.SaveChangesAsync();
        return allSuccess;
    }

    public async Task<bool> ProcessSingleDriverPayoutAsync(int offerId)
    {
        var offer = await _context.DriverOffers
            .Include(o => o.Driver)
            .Include(o => o.Tour)
            .FirstOrDefaultAsync(o => o.OfferId == offerId);

        if (offer == null || string.IsNullOrEmpty(offer.Driver.StripeAccountId))
            return false;

        // Create Earning record
        var earning = new Earning
        {
            TourId = offer.TourId ?? 0,
            DriverId = offer.DriverId,
            Amount = offer.OfferedAmount,
            Type = "DriverPayout",
            Status = "Processing",
            EarnedAt = DateTime.UtcNow
        };
        _context.Earnings.Add(earning);
        await _context.SaveChangesAsync();

        // Trigger Stripe Transfer
        var success = await _stripeService.TransferToConnectedAccountAsync(
            offer.Driver.StripeAccountId,
            offer.OfferedAmount,
            $"Payout for Tour: {offer.Tour?.Title} - Individual Driver Payout");

        if (success)
        {
            earning.Status = "Paid";
            offer.Driver.TotalEarnings += offer.OfferedAmount;
            await _context.SaveChangesAsync();
        }

        return success;
    }
}
