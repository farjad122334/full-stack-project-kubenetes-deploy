using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.Models.DTOs;

public class SignupRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Phone]
    [MaxLength(20)]
    public string? PhoneNumber { get; set; }

    [Required]
    public UserRole Role { get; set; }

    // Tourist specific
    // (None currently)

    // Driver specific
    public DateTime? DateOfBirth { get; set; }

    [MaxLength(15)]
    public string? CNIC { get; set; }
    [MaxLength(50)]
    public string? Licence { get; set; }

    public DateTime? LicenceExpiryDate { get; set; }

    // Restaurant specific
    [MaxLength(200)]
    public string? RestaurantName { get; set; }

    [MaxLength(100)]
    public string? BusinessType { get; set; }

    [MaxLength(300)]
    public string? Location { get; set; }
}
