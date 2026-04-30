using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class ResendOtpDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}
