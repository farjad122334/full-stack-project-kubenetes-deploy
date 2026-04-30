using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.TourManagement;
using backend.Models.Supporting;
using backend.Models.MealManagement;
using backend.Models.BookingPayment;

namespace backend.Models.RestaurantMenu;

public class Order
{
    [Key]
    public int OrderId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("RestaurantAssignment")]
    public int RestaurantAssignmentId { get; set; }

    [Required]
    [ForeignKey("ServiceRequirement")]
    public int RequirementId { get; set; } // NEW: Which requirement this order fulfills

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    [Required]
    public int NumberOfPeople { get; set; }

    [MaxLength(500)]
    public string? SpecialRequests { get; set; }

    public DateTime? ScheduledTime { get; set; }

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual RestaurantAssignment RestaurantAssignment { get; set; } = null!;
    public virtual ServiceRequirement ServiceRequirement { get; set; } = null!; // NEW
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
