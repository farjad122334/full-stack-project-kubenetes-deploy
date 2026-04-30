using backend.Models.Enums;

namespace backend.Models.DTOs;

public class RestaurantDto
{
    public int RestaurantId { get; set; }
    public string RestaurantName { get; set; } = string.Empty;
    public string? OwnerName { get; set; }
    public string? BusinessType { get; set; }
    public decimal Rating { get; set; }
    public string ApplicationStatus { get; set; } = string.Empty;
    public string? BusinessLicense { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    
    // User Information
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string? ProfilePicture { get; set; }
    
    public DateTime CreatedAt { get; set; }
}

public class RestaurantStatsDto
{
    public int TotalRestaurants { get; set; }
    public int TotalHotels { get; set; }
    public int PendingVerification { get; set; }
    public int RestaurantGrowthThisMonth { get; set; }
    public int HotelGrowthThisMonth { get; set; }
}
