namespace backend.Models.DTOs;

public class DashboardStatsDto
{
    public int TotalTours { get; set; }
    public int TotalDrivers { get; set; }
    public int TotalPartners { get; set; }
    public int PendingVerifications { get; set; }
}
