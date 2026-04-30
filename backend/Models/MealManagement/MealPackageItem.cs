using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.RestaurantMenu;

namespace backend.Models.MealManagement;

public class MealPackageItem
{
    [Key]
    public int MealPackageItemId { get; set; }

    [Required]
    [ForeignKey("MealPackage")]
    public int MealPackageId { get; set; }

    [Required]
    [ForeignKey("MenuItem")]
    public int MenuItemId { get; set; }

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerUnit { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    // Navigation Properties
    public virtual MealPackage MealPackage { get; set; } = null!;
    public virtual MenuItem MenuItem { get; set; } = null!;
}
