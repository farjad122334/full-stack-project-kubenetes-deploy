using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.OfferSystem;
using backend.Models.RestaurantMenu;

namespace backend.Models.MealManagement;

public class OfferMenuItem
{
    [Key]
    public int OfferMenuItemId { get; set; }

    [Required]
    [ForeignKey("RestaurantOffer")]
    public int RestaurantOfferId { get; set; }

    [Required]
    [ForeignKey("MenuItem")]
    public int MenuItemId { get; set; }

    [Required]
    public MealType MealType { get; set; }

    [Required]
    public int Quantity { get; set; } = 1;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PriceAtOffer { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    // Navigation Properties
    public virtual RestaurantOffer RestaurantOffer { get; set; } = null!;
    public virtual MenuItem MenuItem { get; set; } = null!;
}
