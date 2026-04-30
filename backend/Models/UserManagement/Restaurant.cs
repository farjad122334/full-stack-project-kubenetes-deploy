using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.OfferSystem;
using backend.Models.RestaurantMenu;
using backend.Models.Supporting;
using System.Text.Json.Serialization;

namespace backend.Models.UserManagement;

public class Restaurant
{
    [Key]
    public int RestaurantId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string RestaurantName { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? OwnerName { get; set; }

    [MaxLength(100)]
    public string? BusinessType { get; set; }

    // Service Type Flags (Phase 2)
    public bool ProvidesMeal { get; set; } = true; // Default for backward compatibility
    public bool ProvidesRoom { get; set; } = false;

    [Column(TypeName = "decimal(3,2)")]
    public decimal Rating { get; set; } = 0;

    public ApplicationStatus ApplicationStatus { get; set; } = ApplicationStatus.Draft;

    [MaxLength(500)]
    public string? BusinessLicense { get; set; }

    [Required]
    [MaxLength(300)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? PostalCode { get; set; }

    [MaxLength(100)]
    public string? StripeAccountId { get; set; }

    public bool PayoutsEnabled { get; set; } = false;

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Menu> Menus { get; set; } = new List<Menu>();
    [JsonIgnore]
    public virtual ICollection<RestaurantAssignment> RestaurantAssignments { get; set; } = new List<RestaurantAssignment>();
    [JsonIgnore]
    public virtual ICollection<RestaurantOffer> RestaurantOffers { get; set; } = new List<RestaurantOffer>();
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    public virtual ICollection<Earning> Earnings { get; set; } = new List<Earning>();
    public virtual ICollection<RestaurantImage> RestaurantImages { get; set; } = new List<RestaurantImage>();
    public virtual ICollection<RoomCategory> RoomCategories { get; set; } = new List<RoomCategory>();
}
