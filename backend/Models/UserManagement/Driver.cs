using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.OfferSystem;
using backend.Models.TourManagement;
using backend.Models.Supporting;
using System.Text.Json.Serialization;

namespace backend.Models.UserManagement;

public class Driver
{
    [Key]
    public int DriverId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }

    [MaxLength(15)]
    public string? CNIC { get; set; }

    [MaxLength(50)]
    public string? Licence { get; set; }

    public DateTime? LicenceExpiryDate { get; set; }

    [MaxLength(500)]
    public string? LicenceImage { get; set; }

    [MaxLength(500)]
    public string? CnicFront { get; set; }

    [MaxLength(500)]
    public string? CnicBack { get; set; }

    [MaxLength(20)]
    public string AccountStatus { get; set; } = "Pending";

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalEarnings { get; set; } = 0;

    [MaxLength(100)]
    public string? StripeAccountId { get; set; }

    public bool PayoutsEnabled { get; set; } = false;

    // Navigation Properties
    public virtual User User { get; set; } = null!;
    [JsonIgnore]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    [JsonIgnore]
    public virtual ICollection<TourAssignment> TourAssignments { get; set; } = new List<TourAssignment>();
    [JsonIgnore]
    public virtual ICollection<DriverOffer> DriverOffers { get; set; } = new List<DriverOffer>();
    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();
    public virtual ICollection<Earning> Earnings { get; set; } = new List<Earning>();
}
