using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;
using backend.Models.OfferSystem;
using System.Text.Json.Serialization;

namespace backend.Models.Supporting;

public class RoomCategory
{
    [Key]
    public int RoomCategoryId { get; set; }

    [Required]
    [ForeignKey("Restaurant")]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(100)]
    public string CategoryName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerNight { get; set; }

    [Required]
    public int MaxGuests { get; set; }

    [Required]
    public int TotalRooms { get; set; }

    [Required]
    public int AvailableRooms { get; set; }

    [MaxLength(1000)]
    public string? Amenities { get; set; } // JSON array: ["AC", "WiFi", "TV"]

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    [JsonIgnore]
    public virtual Restaurant Restaurant { get; set; } = null!;
    public virtual ICollection<RoomImage> RoomImages { get; set; } = new List<RoomImage>();
    [JsonIgnore]
    public virtual ICollection<RestaurantOffer> Offers { get; set; } = new List<RestaurantOffer>();
}
