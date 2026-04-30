using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.TourManagement;
using backend.Models.UserManagement;
using backend.Models.RestaurantMenu;
using System.Text.Json.Serialization;

namespace backend.Models.BookingPayment;

public class Booking
{
    [Key]
    public int BookingId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("Tourist")]
    public int TouristId { get; set; }

    public DateTime BookingDate { get; set; } = DateTime.UtcNow;

    [Required]
    public int NumberOfPeople { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }


    public BookingType BookingType { get; set; } = BookingType.Individual;

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime? CancelledAt { get; set; }

    [MaxLength(500)]
    public string? CancellationReason { get; set; }

    [MaxLength(200)]
    public string? StripeSessionId { get; set; }

    [MaxLength(200)]
    public string? PaymentIntentId { get; set; }

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual Tourist Tourist { get; set; } = null!;
    public virtual Payment? Payment { get; set; }
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
