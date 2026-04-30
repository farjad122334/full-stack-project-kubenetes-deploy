using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.Enums;
using backend.Models.BookingPayment;
using backend.Models.OfferSystem;
using backend.Models.Supporting;

namespace backend.Models.TourManagement;

public class Tour
{
    [Key]
    public int TourId { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(200)]
    public string DepartureCity { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string DepartureLocation { get; set; } = string.Empty;

    public double? DepartureLatitude { get; set; }
    public double? DepartureLongitude { get; set; }

    [Required]
    [MaxLength(200)]
    public string Destination { get; set; } = string.Empty;

    [Required]
    public int DurationDays { get; set; }

    [Required]
    public int MaxCapacity { get; set; }

    public int CurrentBookings { get; set; } = 0;

    [Required]
    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerHead { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CoupleDiscountPercentage { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BulkDiscountPercentage { get; set; }

    public int? BulkBookingMinPersons { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    public TourStatus Status { get; set; } = TourStatus.Draft;

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? FinalizedAt { get; set; }

    // Navigation Properties
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public virtual ICollection<TourImage> TourImages { get; set; } = new List<TourImage>();
    public virtual ICollection<TourAssignment> TourAssignments { get; set; } = new List<TourAssignment>();
    public virtual ICollection<RestaurantAssignment> RestaurantAssignments { get; set; } = new List<RestaurantAssignment>();
    public virtual ICollection<Accommodation> Accommodations { get; set; } = new List<Accommodation>();
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    public virtual ICollection<DriverOffer> DriverOffers { get; set; } = new List<DriverOffer>();
    public virtual ICollection<ServiceRequirement> ServiceRequirements { get; set; } = new List<ServiceRequirement>();
}
