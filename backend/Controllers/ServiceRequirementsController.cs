using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.TourManagement;
using backend.Models.Enums;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServiceRequirementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServiceRequirementsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/servicerequirements
    // GET: api/servicerequirements?tourId=1
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ServiceRequirement>>> GetServiceRequirements([FromQuery] int? tourId, [FromQuery] string? status)
    {
        var query = _context.ServiceRequirements
            .Include(r => r.Tour)
            .Include(r => r.RestaurantOffers)
                .ThenInclude(o => o.Restaurant)
            .AsQueryable();

        if (tourId.HasValue)
        {
            query = query.Where(r => r.TourId == tourId.Value);
        }

        if (!string.IsNullOrEmpty(status))
        {
            if (status == "Open")
            {
                query = query.Where(r => r.Status == "Open" || r.Status == "AwaitingOffers");
            }
            else
            {
                query = query.Where(r => r.Status == status);
            }
        }

        var requirements = await query.OrderBy(r => r.DateNeeded).ToListAsync();
        return Ok(requirements);
    }

    // GET: api/servicerequirements/5
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceRequirement>> GetServiceRequirement(int id)
    {
        var requirement = await _context.ServiceRequirements
            .Include(r => r.Tour)
            .Include(r => r.RestaurantOffers)
                .ThenInclude(o => o.Restaurant)
            .Include(r => r.RestaurantOffers)
                .ThenInclude(o => o.OfferMenuItems)
            .FirstOrDefaultAsync(r => r.RequirementId == id);

        if (requirement == null)
        {
            return NotFound();
        }

        return Ok(requirement);
    }

    // POST: api/servicerequirements
    [HttpPost]
    public async Task<ActionResult<ServiceRequirement>> CreateServiceRequirement(ServiceRequirement requirement)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Validate that the tour exists
        var tourExists = await _context.Tours.AnyAsync(t => t.TourId == requirement.TourId);
        if (!tourExists)
        {
            return BadRequest("Tour not found");
        }

        requirement.CreatedAt = DateTime.UtcNow;
        requirement.Status = "Open";

        _context.ServiceRequirements.Add(requirement);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetServiceRequirement), new { id = requirement.RequirementId }, requirement);
    }

    // PUT: api/servicerequirements/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateServiceRequirement(int id, ServiceRequirement requirement)
    {
        if (id != requirement.RequirementId)
        {
            return BadRequest("ID mismatch");
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingRequirement = await _context.ServiceRequirements.FindAsync(id);
        if (existingRequirement == null)
        {
            return NotFound();
        }

        // Update fields
        existingRequirement.Type = requirement.Type;
        existingRequirement.Location = requirement.Location;
        existingRequirement.DateNeeded = requirement.DateNeeded;
        existingRequirement.Time = requirement.Time;
        existingRequirement.StayDurationDays = requirement.StayDurationDays;
        existingRequirement.EstimatedPeople = requirement.EstimatedPeople;
        existingRequirement.EstimatedBudget = requirement.EstimatedBudget;
        existingRequirement.Status = requirement.Status;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await ServiceRequirementExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/servicerequirements/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteServiceRequirement(int id)
    {
        var requirement = await _context.ServiceRequirements
            .Include(r => r.RestaurantOffers)
            .FirstOrDefaultAsync(r => r.RequirementId == id);

        if (requirement == null)
        {
            return NotFound();
        }

        // Prevent deletion if there are accepted offers
        if (requirement.RestaurantOffers.Any(o => o.Status == OfferStatus.Accepted || o.Status == OfferStatus.Confirmed))
        {
            return BadRequest("Cannot delete requirement with accepted offers");
        }

        _context.ServiceRequirements.Remove(requirement);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<bool> ServiceRequirementExists(int id)
    {
        return await _context.ServiceRequirements.AnyAsync(e => e.RequirementId == id);
    }
}
