using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;
using backend.Models.Supporting;

namespace backend.Models.UserManagement;

public class User
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    public UserRole Role { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsVerified { get; set; } = false;
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiry { get; set; }
    
    // Track registration progress: 1=Personal Info, 2=OTP Pending, 3=Details Pending, 4=Complete
    public int RegistrationStep { get; set; } = 1;

    [MaxLength(500)]
    public string? ProfilePicture { get; set; }

    // Navigation Properties
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
