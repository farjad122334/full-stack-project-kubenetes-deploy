using backend.Models.Supporting;

namespace backend.Services;

public interface INotificationService
{
    Task<Notification> CreateNotificationAsync(int userId, string title, string message, string type, string? actionUrl = null);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int notificationId);
    Task MarkAllAsReadAsync(int userId);
    Task<int> GetUnreadCountAsync(int userId);
}
