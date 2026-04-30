using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs;

public class UpdateProfileDto
{
    public string? Name { get; set; }
    public string? PhoneNumber { get; set; }
    public IFormFile? ProfilePicture { get; set; }
}
