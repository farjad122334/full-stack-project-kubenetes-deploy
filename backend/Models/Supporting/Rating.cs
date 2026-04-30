using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.TourManagement;
using backend.Models.UserManagement;
using System.Text.Json.Serialization;

namespace backend.Models.Supporting;

// Base Class
public abstract class Rating
{
    [Key]
    public int RatingId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("Tourist")]
    public int TouristId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Stars { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // The discriminator column will be handled by EF Core (e.g., "RatingType")

    [JsonIgnore]
    public virtual Tour Tour { get; set; } = null!;
    
    [JsonIgnore]
    public virtual Tourist Tourist { get; set; } = null!;
}

// Child Class: Tour Rating
public class TourRating : Rating
{
    [Required]
    [Range(1, 5)]
    public int ManagementStars { get; set; }

    [Required]
    [Range(1, 5)]
    public int PricingStars { get; set; }
}

// Child Class: Driver Rating
public class DriverRating : Rating
{
    [Required]
    [ForeignKey("Driver")]
    public int DriverId { get; set; }

    [Required]
    [Range(1, 5)]
    public int VehicleConditionStars { get; set; }

    [Required]
    [Range(1, 5)]
    public int ComfortStars { get; set; }

    [Required]
    [Range(1, 5)]
    public int DriverBehaviourStars { get; set; }

    [JsonIgnore]
    public virtual Driver Driver { get; set; } = null!;
}

// Child Class: Restaurant Rating
public class RestaurantRating : Rating
{
    [Required]
    [ForeignKey("Restaurant")]
    public int RestaurantId { get; set; }

    [Required]
    [Range(1, 5)]
    public int AccommodationStars { get; set; }

    [Required]
    [Range(1, 5)]
    public int ServiceStars { get; set; }

    [Required]
    [Range(1, 5)]
    public int StaffStars { get; set; }

    [JsonIgnore]
    public virtual Restaurant Restaurant { get; set; } = null!;
}
