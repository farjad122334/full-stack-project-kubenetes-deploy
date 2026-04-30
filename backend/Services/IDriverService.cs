using backend.Models.UserManagement;

namespace backend.Services;

public interface IDriverService
{
    Task<IEnumerable<object>> GetAllDriversAsync();
    Task<object?> GetDriverByIdAsync(int driverId);
    Task<bool> UpdateDriverStatusAsync(int driverId, string status);
    Task<object?> GetDashboardStatsAsync(int driverId);
    Task<string> GetStripeOnboardingLinkAsync(int driverId, string returnUrl, string refreshUrl);
    Task<string> GetStripeDashboardLinkAsync(int driverId);
    Task<bool> VerifyStripeStatusAsync(int driverId);
    Task<IEnumerable<object>> GetEarningsAsync(int driverId);
}
