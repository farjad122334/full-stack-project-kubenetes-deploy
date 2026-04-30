using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.TourManagement;
using System.Text.Json.Serialization;

namespace backend.Models.OfferSystem;

public abstract class Offer
{
    [Key]
    public int OfferId { get; set; }

    [ForeignKey("Tour")]
    public int? TourId { get; set; } // Made nullable for RestaurantOffers (they use RequirementId)

    // [Required]
    // public int ProviderId { get; set; } // MOVED TO SUBCLASSES

    [Required]
    [MaxLength(50)]
    public string OfferType { get; set; } = string.Empty; // "Driver" or "Restaurant"

    [Column(TypeName = "decimal(18,2)")]
    public decimal OfferedAmount { get; set; }

    public OfferStatus Status { get; set; } = OfferStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? RespondedAt { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    // Navigation Properties
    [JsonIgnore]
    public virtual Tour? Tour { get; set; }
}
