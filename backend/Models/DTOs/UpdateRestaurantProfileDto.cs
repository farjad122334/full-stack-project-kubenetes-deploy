namespace backend.Models.DTOs;

public class UpdateRestaurantProfileDto
{
    public string RestaurantName { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
}
