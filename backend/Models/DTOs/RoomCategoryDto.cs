using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs;

public class RoomCategoryDto
{
    public int? RoomCategoryId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    [Required]
    public decimal PricePerNight { get; set; }
    
    [Required]
    public int MaxGuests { get; set; }
    
    [Required]
    public int TotalRooms { get; set; }
    
    public string? Amenities { get; set; } // JSON string: ["AC", "WiFi", "TV"]
}

public class CreateRoomCategoryDto : RoomCategoryDto
{
    public List<IFormFile>? Images { get; set; }
}
