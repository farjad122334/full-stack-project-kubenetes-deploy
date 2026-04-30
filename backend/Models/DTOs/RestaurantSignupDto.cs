using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using backend.Models.Enums;

namespace backend.Models.DTOs;

public class RestaurantSignupDto
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

    // Restaurant Specifics
    [MaxLength(200)]
    [FromForm(Name = "restaurantName")]
    public string? RestaurantName { get; set; }

    [MaxLength(100)]
    [FromForm(Name = "ownerName")]
    public string? OwnerName { get; set; }

    [MaxLength(100)]
    [FromForm(Name = "businessType")]
    public string? BusinessType { get; set; }

    [MaxLength(100)]
    public string? BusinessLicense { get; set; }

    [MaxLength(300)]
    [FromForm(Name = "address")]
    public string? Address { get; set; }

    [MaxLength(20)]
    [FromForm(Name = "postalCode")]
    public string? PostalCode { get; set; }

    [FromForm(Name = "profilePicture")]
    public IFormFile? ProfilePicture { get; set; }
    [FromForm(Name = "licenseDocument")]
    public IFormFile? LicenseDocument { get; set; }
    
    [FromForm(Name = "restaurantImages")]
    public List<IFormFile>? RestaurantImages { get; set; }
}
