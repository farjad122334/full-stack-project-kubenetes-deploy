using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.TourManagement;

public class TourImage
{
    [Key]
    public int ImageId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? Caption { get; set; }

    public bool IsPrimary { get; set; } = false;

    public int DisplayOrder { get; set; } = 0;

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
}
