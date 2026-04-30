using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models.Supporting;

public class VehicleImage
{
    [Key]
    public int ImageId { get; set; }

    [Required]
    [ForeignKey("Vehicle")]
    public int VehicleId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public bool IsPrimary { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    // Navigation Properties
    [JsonIgnore]
    public virtual Vehicle Vehicle { get; set; } = null!;
}
