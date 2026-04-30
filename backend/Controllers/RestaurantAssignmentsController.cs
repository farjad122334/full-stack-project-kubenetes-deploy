using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.Supporting;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using backend.Services;

namespace backend.Controllers;

[Authorize(Roles = "Restaurant,Admin")]
[ApiController]
[Route("api/[controller]")]
public class RestaurantAssignmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IPaymentService _paymentService;

    public RestaurantAssignmentsController(ApplicationDbContext context, IPaymentService paymentService)
    {
        _context = context;
        _paymentService = paymentService;
    }

    // GET: api/restaurantassignments
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RestaurantAssignment>>> GetAssignments([FromQuery] int? restaurantId)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        var query = _context.RestaurantAssignments
            .Include(a => a.Tour)
            .Include(a => a.ServiceRequirement)
            .Include(a => a.RestaurantOffer!)
                .ThenInclude(o => o.OfferMenuItems)
                    .ThenInclude(om => om.MenuItem)
            .AsQueryable();

        if (userRole == "Restaurant")
        {
            var myRestaurantId = GetRestaurantId();
            query = query.Where(a => a.RestaurantId == myRestaurantId);
        }
        else if (userRole == "Admin" && restaurantId.HasValue)
        {
            query = query.Where(a => a.RestaurantId == restaurantId.Value);
        }

        var assignments = await query
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        return Ok(assignments);
    }

    private int GetRestaurantId()
    {
        var claim = User.FindFirst("RoleSpecificId");
        if (claim != null && int.TryParse(claim.Value, out int id))
        {
            return id;
        }
        return 0; // Return 0 or handle as needed, but avoid throwing if we can check role first
    }

    // PUT: api/restaurantassignments/{id}/serve
    [HttpPut("{id}/serve")]
    public async Task<IActionResult> MarkAsServed(int id, [FromBody] MarkServedDto dto)
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        RestaurantAssignment? assignment;

        if (userRole == "Admin")
        {
            assignment = await _context.RestaurantAssignments
                .FirstOrDefaultAsync(a => a.AssignmentId == id);
        }
        else
        {
            var restaurantId = GetRestaurantId();
            assignment = await _context.RestaurantAssignments
                .FirstOrDefaultAsync(a => a.AssignmentId == id && a.RestaurantId == restaurantId);
        }

        if (assignment == null)
        {
            return NotFound("Order not found or unauthorized.");
        }

        if (dto.IsServed)
        {
            if (assignment.PaymentMethod == "Online" && !assignment.IsPaid)
            {
                return BadRequest("Payout must be initiated and confirmed before marking as served for online payments.");
            }
            
            assignment.IsServed = true;
            assignment.ServedAt = DateTime.UtcNow;
        }
        else
        {
            assignment.IsServed = false;
            assignment.ServedAt = null;
        }

        assignment.PaymentMethod = dto.PaymentMethod;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Order status updated successfully." });
    }
}
