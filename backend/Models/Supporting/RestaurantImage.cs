using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;
using System.Text.Json.Serialization;

namespace backend.Models.Supporting;

public class RestaurantImage
{
    [Key]
    public int ImageId { get; set; }

    [Required]
    [ForeignKey("Restaurant")]
    public int RestaurantId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public bool IsPrimary { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    // Navigation Properties
    [JsonIgnore]
    public virtual Restaurant Restaurant { get; set; } = null!;
}
