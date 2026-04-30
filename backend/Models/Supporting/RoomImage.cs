using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models.Supporting;

public class RoomImage
{
    [Key]
    public int RoomImageId { get; set; }

    [Required]
    [ForeignKey("RoomCategory")]
    public int RoomCategoryId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsPrimary { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    // Navigation Properties
    [JsonIgnore]
    public virtual RoomCategory RoomCategory { get; set; } = null!;
}
