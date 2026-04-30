using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using backend.Models.BookingPayment;
using backend.Models.Supporting;
using System.Text.Json.Serialization;

namespace backend.Models.UserManagement;

public class Tourist
{
    [Key]
    public int TouristId { get; set; }

    [Required]
    [ForeignKey("User")]
    public int UserId { get; set; }


    // Navigation Properties
    public virtual User User { get; set; } = null!;
    [JsonIgnore]
    public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    [JsonIgnore]
    public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
}
