using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using backend.Models.BookingPayment;
using backend.Models.Supporting;
using backend.Models.UserManagement;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Services;

public class StripeService : IStripeService
{
    private readonly IConfiguration _config;
    private readonly ApplicationDbContext _context;

    public StripeService(IConfiguration config, ApplicationDbContext context)
    {
        _config = config;
        _context = context;
        StripeConfiguration.ApiKey = _config["STRIPE_SECRET_KEY"] ?? _config["Stripe:SecretKey"];
    }

    public async Task<Session> CreateCheckoutSessionAsync(int bookingId, decimal amount, string tourTitle)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(amount * 100), // Stripe expects amount in cents
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = tourTitle,
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = $"{_config["FrontendUrl"]}/tourist/booking-success?session_id={{CHECKOUT_SESSION_ID}}&booking_id={bookingId}",
            CancelUrl = $"{_config["FrontendUrl"]}/tourist/tour-details/{(await _context.Bookings.FindAsync(bookingId))?.TourId}",
            ClientReferenceId = bookingId.ToString(),
        };

        var service = new SessionService();
        return await service.CreateAsync(options);
    }

    public async Task<Session> CreateBookingCheckoutSessionAsync(backend.Models.DTOs.BookingDto bookingData, string tourTitle)
    {
        var options = new SessionCreateOptions
        {
            PaymentMethodTypes = new List<string> { "card" },
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        UnitAmount = (long)(bookingData.TotalAmount * 100),
                        Currency = "usd",
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = tourTitle,
                            Description = $"Booking for {bookingData.NumberOfPeople} person(s) - {bookingData.BookingType}"
                        },
                    },
                    Quantity = 1,
                },
            },
            Mode = "payment",
            SuccessUrl = $"{_config["FrontendUrl"]}/tourist/booking-success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{_config["FrontendUrl"]}/tourist/tour-details/{bookingData.TourId}",
            Metadata = new Dictionary<string, string>
            {
                { "TourId", bookingData.TourId.ToString() },
                { "TouristId", bookingData.TouristId.ToString() },
                { "NumberOfPeople", bookingData.NumberOfPeople.ToString() },
                { "TotalAmount", bookingData.TotalAmount.ToString() },
                { "BookingType", bookingData.BookingType.ToString() },
                { "IsNewBooking", "true" }
            }
        };

        var service = new SessionService();
        return await service.CreateAsync(options);
    }

    public async Task<string> CreateConnectedAccountAsync(string email, string businessName, string type)
    {
        var nameParts = businessName?.Split(' ', 2) ?? new[] { businessName, "" };
        var firstName = nameParts[0] ?? businessName;
        var lastName = nameParts.Length > 1 ? nameParts[1] : "User";

        var options = new AccountCreateOptions
        {
            Type = "express",
            Email = email,
            Country = "US",
            Capabilities = new AccountCapabilitiesOptions
            {
                CardPayments = new AccountCapabilitiesCardPaymentsOptions { Requested = true },
                Transfers = new AccountCapabilitiesTransfersOptions { Requested = true },
            },
            BusinessType = "individual",
            Individual = new AccountIndividualOptions
            {
                FirstName = firstName,
                LastName = lastName,
                Email = email,
            },
            BusinessProfile = new AccountBusinessProfileOptions
            {
                Name = businessName,
                ProductDescription = $"Travel service provider on Safarnama ({type})",
                Mcc = "7011", // Hotels and lodging / travel related MCC
                Url = "https://safarnama.com",
            },
            TosAcceptance = new AccountTosAcceptanceOptions
            {
                ServiceAgreement = "recipient",
            },
            Settings = new AccountSettingsOptions
            {
                Payouts = new AccountSettingsPayoutsOptions
                {
                    Schedule = new AccountSettingsPayoutsScheduleOptions
                    {
                        Interval = "manual",
                    },
                },
            },
        };

        var service = new AccountService();
        var account = await service.CreateAsync(options);
        return account.Id;
    }

    public async Task<string> CreateOnboardingLinkAsync(string stripeAccountId, string returnUrl, string refreshUrl)
    {
        var options = new AccountLinkCreateOptions
        {
            Account = stripeAccountId,
            RefreshUrl = refreshUrl,
            ReturnUrl = returnUrl,
            Type = "account_onboarding",
        };

        var service = new AccountLinkService();
        var accountLink = await service.CreateAsync(options);
        return accountLink.Url;
    }

    public async Task<string> CreateLoginLinkAsync(string stripeAccountId)
    {
        var service = new AccountLoginLinkService();
        var loginLink = await service.CreateAsync(stripeAccountId);
        return loginLink.Url;
    }

    public async Task<bool> IsAccountOnboardedAsync(string stripeAccountId)
    {
        try
        {
            var service = new AccountService();
            var account = await service.GetAsync(stripeAccountId);
            return account.DetailsSubmitted && account.PayoutsEnabled;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Stripe] Error checking account status for {stripeAccountId}: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> TransferToConnectedAccountAsync(string destinationAccountId, decimal amount, string description)
    {
        try
        {
            var options = new TransferCreateOptions
            {
                Amount = (long)(amount * 100),
                Currency = "usd",
                Destination = destinationAccountId,
                Description = description,
            };

            var service = new TransferService();
            await service.CreateAsync(options);
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Stripe Transfer Error: {ex.Message}");
            return false;
        }
    }

    public async Task UpdateConnectedAccountAsync(string stripeAccountId, string email, string businessName)
    {
        try
        {
            var nameParts = businessName?.Split(' ', 2) ?? new[] { businessName, "" };
            var firstName = nameParts[0] ?? businessName;
            var lastName = nameParts.Length > 1 ? nameParts[1] : "User";

            var options = new AccountUpdateOptions
            {
                BusinessType = "individual",
                Individual = new AccountIndividualOptions
                {
                    FirstName = firstName,
                    LastName = lastName,
                    Email = email,
                },
                BusinessProfile = new AccountBusinessProfileOptions
                {
                    Name = businessName,
                    Url = "https://safarnama.com",
                    Mcc = "7011",
                },
                TosAcceptance = new AccountTosAcceptanceOptions
                {
                    ServiceAgreement = "recipient",
                },
            };
            var service = new AccountService();
            await service.UpdateAsync(stripeAccountId, options);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Stripe] Could not update account {stripeAccountId}: {ex.Message}");
        }
    }
}
