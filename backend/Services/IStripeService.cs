using Stripe.Checkout;

namespace backend.Services;

public interface IStripeService
{
    // For Tourists
    Task<Session> CreateCheckoutSessionAsync(int bookingId, decimal amount, string tourTitle);
    Task<Session> CreateBookingCheckoutSessionAsync(backend.Models.DTOs.BookingDto bookingData, string tourTitle);
    
    // For Service Providers (Drivers/Restaurants)
    Task<string> CreateOnboardingLinkAsync(string stripeAccountId, string returnUrl, string refreshUrl);
    Task<string> CreateConnectedAccountAsync(string email, string businessName, string type);
    Task<string> CreateLoginLinkAsync(string stripeAccountId);
    Task<bool> IsAccountOnboardedAsync(string stripeAccountId);
    
    // For Payouts
    Task<bool> TransferToConnectedAccountAsync(string destinationAccountId, decimal amount, string description);
    Task UpdateConnectedAccountAsync(string stripeAccountId, string email, string businessName);
}
