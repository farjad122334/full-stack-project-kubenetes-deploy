using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.OfferSystem;
using backend.Models.Supporting;
using System.Text.Json.Serialization;

namespace backend.Models.TourManagement;

public class ServiceRequirement
{
    [Key]
    public int RequirementId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // "Meal" or "Accommodation"

    [MaxLength(200)]
    public string? Location { get; set; }

    [Required]
    public DateTime DateNeeded { get; set; }

    // For Meal: Time of meal (e.g., "13:00"). For Accommodation: Null
    [MaxLength(10)]
    public string? Time { get; set; }

    // For Accommodation: Number of nights/days. For Meal: Null
    public int? StayDurationDays { get; set; }

    public int EstimatedPeople { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? EstimatedBudget { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "Open"; // Open, Fulfilled, Cancelled

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual ICollection<RestaurantOffer> RestaurantOffers { get; set; } = new List<RestaurantOffer>();
    public virtual RestaurantAssignment? Assignment { get; set; }
}
