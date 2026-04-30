using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;
using backend.Models.TourManagement;

namespace backend.Models.Supporting;

public class Earning
{
    [Key]
    public int EarningId { get; set; }

    [ForeignKey("Driver")]
    public int? DriverId { get; set; }

    [ForeignKey("Restaurant")]
    public int? RestaurantId { get; set; }

    [ForeignKey("Tour")]
    public int? TourId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string Type { get; set; } = string.Empty; // "TourPayment", "OfferAccepted", etc.

    public DateTime EarnedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(20)]
    public string Status { get; set; } = "Pending"; // "Pending", "Paid", "Cancelled"

    [MaxLength(20)]
    public string? PaymentMethod { get; set; } // "Cash" or "Online"

    // Navigation Properties
    public virtual Driver? Driver { get; set; }
    public virtual Restaurant? Restaurant { get; set; }
    public virtual Tour? Tour { get; set; }
}
