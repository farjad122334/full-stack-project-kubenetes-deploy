using Microsoft.AspNetCore.Mvc;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using backend.Models.DTOs;

namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DriversController : ControllerBase
{
    private readonly IDriverService _driverService;

    public DriversController(IDriverService driverService)
    {
        _driverService = driverService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllDrivers()
    {
        var drivers = await _driverService.GetAllDriversAsync();
        return Ok(drivers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetDriverById(int id)
    {
        var driver = await _driverService.GetDriverByIdAsync(id);
        if (driver == null) return NotFound(new { message = "Driver not found" });
        return Ok(driver);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto request)
    {
        var success = await _driverService.UpdateDriverStatusAsync(id, request.Status);
        if (!success) return NotFound(new { message = "Driver not found" });
        return Ok(new { message = $"Driver status updated to {request.Status}" });
    }

    [HttpGet("{id}/dashboard-stats")]
    public async Task<IActionResult> GetDashboardStats(int id)
    {
        var stats = await _driverService.GetDashboardStatsAsync(id);
        if (stats == null) return NotFound(new { message = "Driver not found" });
        return Ok(stats);
    }

    [HttpPost("{id}/onboarding-link")]
    [Authorize]
    public async Task<IActionResult> GetOnboardingLink(int id, [FromBody] OnboardingRequestDto request)
    {
        try
        {
            var url = await _driverService.GetStripeOnboardingLinkAsync(id, request.ReturnUrl, request.RefreshUrl);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/dashboard-link")]
    public async Task<IActionResult> GetDashboardLink(int id)
    {
        try
        {
            var url = await _driverService.GetStripeDashboardLinkAsync(id);
            return Ok(new { url });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{id}/verify-stripe")]
    public async Task<IActionResult> VerifyStripeStatus(int id)
    {
        var isComplete = await _driverService.VerifyStripeStatusAsync(id);
        return Ok(new { payoutsEnabled = isComplete });
    }

    [HttpGet("{id}/earnings")]
    public async Task<IActionResult> GetEarnings(int id)
    {
        var earnings = await _driverService.GetEarningsAsync(id);
        return Ok(earnings);
    }
}
