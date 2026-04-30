using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.Supporting;
using backend.Models.RestaurantMenu;

namespace backend.Models.MealManagement;

public class MealPackage
{
    [Key]
    public int MealPackageId { get; set; }

    [Required]
    [ForeignKey("RestaurantAssignment")]
    public int RestaurantAssignmentId { get; set; }

    [Required]
    [ForeignKey("MealSchedule")]
    public int MealScheduleId { get; set; }

    [Required]
    public MealType MealType { get; set; }

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalPerHead { get; set; }

    [MaxLength(200)]
    public string? PackageName { get; set; }

    // Navigation Properties
    public virtual RestaurantAssignment RestaurantAssignment { get; set; } = null!;
    public virtual MealSchedule MealSchedule { get; set; } = null!;
    public virtual ICollection<MealPackageItem> MealPackageItems { get; set; } = new List<MealPackageItem>();
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
