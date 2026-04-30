using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;
using System.Text.Json.Serialization;

namespace backend.Models.DTOs;

public class BookingDto
{
    [Required]
    [JsonPropertyName("tourId")]
    public int TourId { get; set; }

    [Required]
    [JsonPropertyName("touristId")]
    public int TouristId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    [JsonPropertyName("numberOfPeople")]
    public int NumberOfPeople { get; set; }

    [Required]
    [Range(0.01, double.MaxValue)]
    [JsonPropertyName("totalAmount")]
    public decimal TotalAmount { get; set; }

    [Required]
    [JsonPropertyName("bookingType")]
    public BookingType BookingType { get; set; }
}
