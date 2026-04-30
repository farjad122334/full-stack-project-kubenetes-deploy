using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class SubmitRatingsPayloadDto
{
    [Required]
    public int TourId { get; set; }

    [Required]
    public int TouristId { get; set; }

    public TourRatingDto TourRating { get; set; } = null!;
    public List<DriverRatingDto> DriverRatings { get; set; } = new List<DriverRatingDto>();
    public List<RestaurantRatingDto> RestaurantRatings { get; set; } = new List<RestaurantRatingDto>();
}

public class TourRatingDto
{
    [Required, Range(1, 5)] public int ManagementStars { get; set; }
    [Required, Range(1, 5)] public int PricingStars { get; set; }
    [Required, Range(1, 5)] public int OverallStars { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
}

public class DriverRatingDto
{
    [Required] public int DriverUserId { get; set; }
    [Required, Range(1, 5)] public int VehicleConditionStars { get; set; }
    [Required, Range(1, 5)] public int ComfortStars { get; set; }
    [Required, Range(1, 5)] public int DriverBehaviourStars { get; set; }
    [Required, Range(1, 5)] public int OverallStars { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
}

public class RestaurantRatingDto
{
    [Required] public int RestaurantUserId { get; set; }
    [Required, Range(1, 5)] public int AccommodationStars { get; set; }
    [Required, Range(1, 5)] public int ServiceStars { get; set; }
    [Required, Range(1, 5)] public int StaffStars { get; set; }
    [Required, Range(1, 5)] public int OverallStars { get; set; }
    [MaxLength(1000)] public string? Comment { get; set; }
}
