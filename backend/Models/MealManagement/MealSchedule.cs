using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.Supporting;
using backend.Models.RestaurantMenu;

namespace backend.Models.MealManagement;

public class MealSchedule
{
    [Key]
    public int MealScheduleId { get; set; }

    [Required]
    [ForeignKey("RestaurantAssignment")]
    public int RestaurantAssignmentId { get; set; }

    [Required]
    public int DayNumber { get; set; }

    [Required]
    public MealType MealType { get; set; }

    [Required]
    public TimeSpan ScheduledTime { get; set; }

    [MaxLength(200)]
    public string? Location { get; set; }

    public bool IsIncluded { get; set; } = true;

    [MaxLength(500)]
    public string? SpecialInstructions { get; set; }

    // Navigation Properties
    public virtual RestaurantAssignment RestaurantAssignment { get; set; } = null!;
    public virtual MealPackage? MealPackage { get; set; }
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
