using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.MealManagement;
using backend.Models.Supporting;
using backend.Models.Enums;
using backend.Models.TourManagement;
using backend.Models.UserManagement;
using System.Text.Json.Serialization;

namespace backend.Models.OfferSystem;

public class RestaurantOffer : Offer
{
    [Required]
    public int RestaurantId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerHead { get; set; }

    public int MinimumPeople { get; set; } = 1;

    public int MaximumPeople { get; set; } = 100;

    [MaxLength(100)]
    public string? MealType { get; set; } // "Breakfast", "Lunch & Dinner", etc.

    public bool IncludesBeverages { get; set; } = false;

    // Accommodation-specific fields (nullable for backward compatibility with meal offers)
    [Column(TypeName = "decimal(18,2)")]
    public decimal? RentPerNight { get; set; }

    public int? PerRoomCapacity { get; set; }

    public int? TotalRooms { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? TotalRent { get; set; }

    public int? StayDurationDays { get; set; }

    // Room Category Selection (Phase 2)
    [ForeignKey("RoomCategory")]
    public int? RoomCategoryId { get; set; }

    [Required]
    [ForeignKey("ServiceRequirement")]
    public int RequirementId { get; set; } // KEY CHANGE: Link to requirement, not tour

    // Navigation Properties
    public virtual ServiceRequirement ServiceRequirement { get; set; } = null!;
    [ForeignKey("RestaurantId")]
    public virtual Restaurant Restaurant { get; set; } = null!;
    public virtual RoomCategory? RoomCategory { get; set; }
    public virtual ICollection<OfferMenuItem> OfferMenuItems { get; set; } = new List<OfferMenuItem>();
    public virtual RestaurantAssignment? RestaurantAssignment { get; set; }
}
