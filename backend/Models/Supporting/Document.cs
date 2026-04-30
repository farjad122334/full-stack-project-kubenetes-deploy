using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.UserManagement;

namespace backend.Models.Supporting;

public class Document
{
    [Key]
    public int DocumentId { get; set; }

    [ForeignKey("Driver")]
    public int? DriverId { get; set; }

    [ForeignKey("Restaurant")]
    public int? RestaurantId { get; set; }

    [Required]
    [MaxLength(50)]
    public string DocumentType { get; set; } = string.Empty; // "CNIC", "License", "Certificate", etc.

    [Required]
    [MaxLength(500)]
    public string DocumentUrl { get; set; } = string.Empty;

    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(20)]
    public string VerificationStatus { get; set; } = "Pending"; // "Pending", "Verified", "Rejected"

    // Navigation Properties
    // Navigation Properties
    public virtual Driver? Driver { get; set; }
    public virtual Restaurant? Restaurant { get; set; }
}
