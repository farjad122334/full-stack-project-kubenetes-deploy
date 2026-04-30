using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    // GET: api/notifications/user/5
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserNotifications(int userId)
    {
        var notifications = await _notificationService.GetUserNotificationsAsync(userId);
        return Ok(notifications);
    }

    // GET: api/notifications/unread-count/5
    [HttpGet("unread-count/{userId}")]
    public async Task<IActionResult> GetUnreadCount(int userId)
    {
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { count });
    }

    // PUT: api/notifications/mark-read/5
    [HttpPut("mark-read/{notificationId}")]
    public async Task<IActionResult> MarkAsRead(int notificationId)
    {
        var result = await _notificationService.MarkAsReadAsync(notificationId);
        if (!result) return NotFound();
        return Ok(new { message = "Notification marked as read" });
    }

    // PUT: api/notifications/mark-all-read/5
    [HttpPut("mark-all-read/{userId}")]
    public async Task<IActionResult> MarkAllAsRead(int userId)
    {
        await _notificationService.MarkAllAsReadAsync(userId);
        return Ok(new { message = "All notifications marked as read" });
    }
}
