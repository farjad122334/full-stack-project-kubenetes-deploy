using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.TourManagement;
using backend.Models.UserManagement;

namespace backend.Models.Supporting;

public class Review
{
    [Key]
    public int ReviewId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [Required]
    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public bool IsVerified { get; set; } = false;

    public int HelpfulCount { get; set; } = 0;

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual User User { get; set; } = null!;
}
