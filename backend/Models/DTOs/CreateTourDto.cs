using backend.Models.TourManagement;

using Microsoft.AspNetCore.Http;

namespace backend.Models.DTOs;

public class CreateTourDto
{
    public IFormFile? Image { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string DepartureCity { get; set; } = string.Empty;
    public string DepartureLocation { get; set; } = string.Empty;
    public double? DepartureLatitude { get; set; }
    public double? DepartureLongitude { get; set; }
    public string Destination { get; set; } = string.Empty;       // NEW
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int MaxCapacity { get; set; }
    public decimal PricePerHead { get; set; }
    public string? Status { get; set; }
    public decimal? CoupleDiscountPercentage { get; set; }
    public decimal? BulkDiscountPercentage { get; set; }
    public int? BulkBookingMinPersons { get; set; }

    // Requirements to be created with the tour
    public List<ServiceRequirementDto>? ServiceRequirements { get; set; }
}

public class ServiceRequirementDto
{
    public string Type { get; set; } = string.Empty; // "Meal" or "Accommodation"
    public string? Location { get; set; }
    public DateTime DateNeeded { get; set; }
    public string? Time { get; set; }
    public int? StayDurationDays { get; set; }
    public int EstimatedPeople { get; set; }
    public decimal? EstimatedBudget { get; set; }
}
