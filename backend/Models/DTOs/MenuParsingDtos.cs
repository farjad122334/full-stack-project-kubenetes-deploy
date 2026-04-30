namespace backend.Models.DTOs;

public class MenuCategoryDto
{
    public int Id { get; set; } // Frontend ID, ignore/unused
    public string Title { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public List<MenuItemDto> Items { get; set; } = new List<MenuItemDto>();
}

public class MenuItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? Image { get; set; } // Base64
    public bool IsAvailable { get; set; }
}
