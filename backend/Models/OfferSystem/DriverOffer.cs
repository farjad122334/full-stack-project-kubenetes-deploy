using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Supporting;
using backend.Models.TourManagement;
using backend.Models.UserManagement;

namespace backend.Models.OfferSystem;

public class DriverOffer : Offer
{
    [Required]
    [ForeignKey("Vehicle")]
    public int VehicleId { get; set; }

    [Required]
    public int DriverId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TransportationFare { get; set; }

    [MaxLength(500)]
    public string? RouteDetails { get; set; }

    public bool IncludesFuel { get; set; } = true;

    public bool IsPaid { get; set; } = false;

    public DateTime? PaidAt { get; set; }

    // Navigation Properties
    [ForeignKey("DriverId")]
    public virtual Driver Driver { get; set; } = null!;
    public virtual Vehicle Vehicle { get; set; } = null!;
    public virtual TourAssignment? TourAssignment { get; set; }
}
