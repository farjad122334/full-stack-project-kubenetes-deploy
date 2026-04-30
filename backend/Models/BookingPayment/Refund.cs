using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models.BookingPayment;

public class Refund
{
    [Key]
    public int RefundId { get; set; }

    [Required]
    [ForeignKey("Payment")]
    public int PaymentId { get; set; }

    [Required]
    [ForeignKey("Booking")]
    public int BookingId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal RefundAmount { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ProcessedAt { get; set; }

    // Navigation Properties
    public virtual Payment Payment { get; set; } = null!;
    public virtual Booking Booking { get; set; } = null!;
}
