using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;

namespace backend.Controllers;

[ApiController]
[Route("api/restaurants/{restaurantId}/setup")]
public class RestaurantSetupController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public RestaurantSetupController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/restaurants/5/setup/status
    [HttpGet("status")]
    [Authorize(Roles = "Restaurant")]
    public async Task<ActionResult> GetSetupStatus(int restaurantId)
    {
        var restaurant = await _context.Restaurants
            .Include(r => r.Menus)
            .Include(r => r.RoomCategories)
            .FirstOrDefaultAsync(r => r.RestaurantId == restaurantId);
        
        if (restaurant == null) return NotFound();
        
        bool hasMenu = restaurant.Menus.Any();
        bool hasRoomCategories = restaurant.RoomCategories.Any();
        
        bool isSetupComplete = true;
        if (restaurant.ProvidesMeal && !hasMenu) isSetupComplete = false;
        if (restaurant.ProvidesRoom && !hasRoomCategories) isSetupComplete = false;
        
        return Ok(new {
            hasMenu,
            hasRoomCategories,
            isSetupComplete,
            providesMeal = restaurant.ProvidesMeal,
            providesRoom = restaurant.ProvidesRoom,
            businessType = restaurant.BusinessType
        });
    }
}
