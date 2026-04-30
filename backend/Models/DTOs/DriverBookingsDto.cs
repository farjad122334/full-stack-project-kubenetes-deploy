using backend.Models.Enums;

namespace backend.Models.DTOs;

public class BookedToursResultDto
{
    public List<BookedTourDto> ConfirmedTours { get; set; } = new();
    public List<BookedTourDto> PendingTours { get; set; } = new();
    public List<BookedTourDto> ReadyTours { get; set; } = new();
}

public class BookedTourDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Route { get; set; } = string.Empty;
    public string Date { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string RequirementsStatus { get; set; } = string.Empty;
    public string RequirementsStatusClass { get; set; } = string.Empty;
    public int Participants { get; set; }
    public string Price { get; set; } = string.Empty;
}
