using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;

namespace backend.Models.Supporting;

public class Notification
{
    [Key]
    public int NotificationId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // "BookingConfirmed", "PaymentReceived", etc.

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ReadAt { get; set; }

    [MaxLength(500)]
    public string? ActionUrl { get; set; }

    // Navigation Properties
    public virtual User User { get; set; } = null!;
}
