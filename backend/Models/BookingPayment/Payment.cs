using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;

namespace backend.Models.BookingPayment;

public class Payment
{
    [Key]
    public int PaymentId { get; set; }

    [Required]
    [ForeignKey("Booking")]
    public int BookingId { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [Required]
    [MaxLength(50)]
    public string PaymentMethod { get; set; } = string.Empty; // "Credit Card", "JazzCash", "EasyPaisa", etc.

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    [MaxLength(10)]
    public string Currency { get; set; } = "PKR";

    [MaxLength(100)]
    public string? TransactionId { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    // Navigation Properties
    public virtual Booking Booking { get; set; } = null!;
    public virtual Refund? Refund { get; set; }
}
