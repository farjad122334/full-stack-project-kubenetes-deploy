using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;

namespace backend.Models.RestaurantMenu;

public class Menu
{
    [Key]
    public int MenuId { get; set; }

    [Required]
    [ForeignKey("Restaurant")]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(200)]
    public string MenuName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Properties
    public virtual Restaurant Restaurant { get; set; } = null!;
    public virtual ICollection<MenuItem> MenuItems { get; set; } = new List<MenuItem>();
}
