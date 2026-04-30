using System;

namespace backend.Models.DTOs;

public class DriverDto
{
    public int DriverId { get; set; }
    public string? CNIC { get; set; }
    public string? Licence { get; set; }
    public DateTime? LicenceExpiryDate { get; set; }
    public string AccountStatus { get; set; } = string.Empty;
    public decimal TotalEarnings { get; set; }
    
    // User Information
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfilePicture { get; set; }
    public DateTime CreatedAt { get; set; }

    // Documents
    public string? LicenceImage { get; set; }
    public string? CnicFront { get; set; }
    public string? CnicBack { get; set; }
}
