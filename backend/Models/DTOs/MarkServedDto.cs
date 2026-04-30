using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class MarkServedDto
{
    /// <summary>
    /// Indicates whether the service was served (true).
    /// </summary>
    [Required]
    public bool IsServed { get; set; } = true;

    /// <summary>
    /// Payment method used for immediate payout to the restaurant. "Cash" or "Online".
    /// </summary>
    [MaxLength(20)]
    public string? PaymentMethod { get; set; }
}
