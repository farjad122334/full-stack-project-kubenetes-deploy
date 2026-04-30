using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.MealManagement;

namespace backend.Models.RestaurantMenu;

public class MenuItem
{
    [Key]
    public int ItemId { get; set; }

    [Required]
    [ForeignKey("Menu")]
    public int MenuId { get; set; }

    [Required]
    [MaxLength(200)]
    public string ItemName { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal Price { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? Image { get; set; }

    public bool IsAvailable { get; set; } = true;

    // Navigation Properties
    public virtual Menu Menu { get; set; } = null!;
    public virtual ICollection<OfferMenuItem> OfferMenuItems { get; set; } = new List<OfferMenuItem>();
    public virtual ICollection<MealPackageItem> MealPackageItems { get; set; } = new List<MealPackageItem>();
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
