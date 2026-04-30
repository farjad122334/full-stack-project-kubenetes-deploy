using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.TourManagement;
using backend.Models.UserManagement;
using backend.Models.OfferSystem;
using backend.Models.MealManagement;
using backend.Models.RestaurantMenu;

namespace backend.Models.Supporting;

public class RestaurantAssignment
{
    [Key]
    public int AssignmentId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("Restaurant")]
    public int RestaurantId { get; set; }

    [ForeignKey("RestaurantOffer")]
    public int? RestaurantOfferId { get; set; }

    [ForeignKey("ServiceRequirement")]
    public int? RequirementId { get; set; } // NEW: Which requirement this fulfills

    [ForeignKey("Order")]
    public int? OrderId { get; set; } // NEW: Link to the confirmed order

    public AssignmentStatus Status { get; set; } = AssignmentStatus.Assigned;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerHead { get; set; }

    public int ExpectedPeople { get; set; }

    public bool IsServed { get; set; } = false; // NEW: Indicates if the order has been served

    public DateTime? ServedAt { get; set; }

    [MaxLength(20)]
    public string? PaymentMethod { get; set; } // "Cash" or "Online"

    public bool IsPaid { get; set; } = false; // NEW: Indicates if the payout has been completed

    public DateTime? PaidAt { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalPrice { get; set; }

    [MaxLength(500)]
    public string? MealScheduleText { get; set; }

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual Restaurant Restaurant { get; set; } = null!;
    public virtual RestaurantOffer? RestaurantOffer { get; set; }
    public virtual ServiceRequirement? ServiceRequirement { get; set; } // NEW
    public virtual Order? Order { get; set; } // NEW
    public virtual ICollection<MealSchedule> MealSchedules { get; set; } = new List<MealSchedule>();
    public virtual ICollection<MealPackage> MealPackages { get; set; } = new List<MealPackage>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
