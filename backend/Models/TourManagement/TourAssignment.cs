using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.UserManagement;
using backend.Models.Supporting;
using backend.Models.OfferSystem;

namespace backend.Models.TourManagement;

public class TourAssignment
{
    [Key]
    public int AssignmentId { get; set; }

    [Required]
    [ForeignKey("Tour")]
    public int TourId { get; set; }

    [Required]
    [ForeignKey("Driver")]
    public int DriverId { get; set; }

    [Required]
    [ForeignKey("Vehicle")]
    public int VehicleId { get; set; }

    [ForeignKey("DriverOffer")]
    public int? DriverOfferId { get; set; }

    public AssignmentStatus Status { get; set; } = AssignmentStatus.Assigned;

    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;

    public DateTime? AcceptedAt { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal FinalPrice { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    // Navigation Properties
    public virtual Tour Tour { get; set; } = null!;
    public virtual Driver Driver { get; set; } = null!;
    public virtual Vehicle Vehicle { get; set; } = null!;
    public virtual DriverOffer? DriverOffer { get; set; }
}
