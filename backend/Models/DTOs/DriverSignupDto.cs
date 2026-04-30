using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using backend.Models.Enums;

namespace backend.Models.DTOs;

public class DriverSignupDto
{
    [MaxLength(100)]
    [FromForm(Name = "name")]
    public string? Name { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(100)]
    [FromForm(Name = "email")]
    public string Email { get; set; } = string.Empty;

    [MinLength(8)]
    [FromForm(Name = "password")]
    public string? Password { get; set; }

    [Phone]
    [MaxLength(20)]
    [FromForm(Name = "phoneNumber")]
    public string? PhoneNumber { get; set; }

    [MaxLength(15)]
    [FromForm(Name = "cnic")]
    public string? CNIC { get; set; }

    [MaxLength(50)]
    [FromForm(Name = "licence")]
    public string? Licence { get; set; }

    [FromForm(Name = "licenceExpiryDate")]
    public DateTime? LicenceExpiryDate { get; set; }

    [FromForm(Name = "profilePicture")]
    public IFormFile? ProfilePicture { get; set; }

    [FromForm(Name = "cnicFront")]
    public IFormFile? CnicFront { get; set; }

    [FromForm(Name = "cnicBack")]
    public IFormFile? CnicBack { get; set; }

    [FromForm(Name = "licenceImage")]
    public IFormFile? LicenceImage { get; set; }

    // Vehicle Info
    [MaxLength(50)]
    [FromForm(Name = "vehicleRegNumber")]
    public string? VehicleRegNumber { get; set; }

    [MaxLength(50)]
    [FromForm(Name = "vehicleType")]
    public string? VehicleType { get; set; }

    [MaxLength(50)]
    [FromForm(Name = "vehicleModel")]
    public string? VehicleModel { get; set; }

    [FromForm(Name = "vehicleCapacity")]
    public int? VehicleCapacity { get; set; }

    [FromForm(Name = "vehicleImages")]
    public List<IFormFile>? VehicleImages { get; set; }
}
