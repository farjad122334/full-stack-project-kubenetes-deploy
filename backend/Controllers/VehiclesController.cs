using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Supporting;
using Microsoft.AspNetCore.Http;
using backend.Services;
using backend.Models.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IImageService _imageService;

    public VehiclesController(ApplicationDbContext context, IImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    [HttpGet("driver/{driverId}")]
    public async Task<ActionResult<IEnumerable<Vehicle>>> GetDriverVehicles(int driverId)
    {
        var vehicles = await _context.Vehicles
            .Where(v => v.DriverId == driverId && v.Status != "Inactive")
            .ToListAsync();

        return Ok(vehicles);
    }

    // GET: api/vehicles/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Vehicle>> GetVehicle(int id)
    {
        var vehicle = await _context.Vehicles
            .Include(v => v.VehicleImages)
            .FirstOrDefaultAsync(v => v.VehicleId == id);

        if (vehicle == null)
        {
            return NotFound();
        }

        return Ok(vehicle);
    }

    [HttpPost]
    public async Task<ActionResult<Vehicle>> CreateVehicle(Vehicle vehicle)
    {
        // Basic validation
        if (vehicle.DriverId <= 0) return BadRequest("Invalid DriverId");
        
        // Clear navigation properties to avoid issues
        vehicle.Driver = null!;
        vehicle.DriverOffers = new List<backend.Models.OfferSystem.DriverOffer>();
        vehicle.Status = "Pending"; // New vehicles are pending by default

        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetVehicle), new { id = vehicle.VehicleId }, vehicle);
    }

    // PUT: api/vehicles/5/status
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateVehicleStatus(int id, [FromBody] StatusUpdateDto request)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound();

        vehicle.Status = request.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Vehicle status updated to {request.Status}" });
    }

    // DELETE: api/vehicles/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVehicle(int id)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null)
        {
            return NotFound();
        }

        // Check if there are active offers? 
        // For now, simple deletion (or maybe deactivate instead)
        vehicle.Status = "Inactive"; 
        // Or actually delete:
        // _context.Vehicles.Remove(vehicle);
        
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id}/images")]
    public async Task<IActionResult> UploadVehicleImages(int id, [FromForm] List<IFormFile> images)
    {
        var vehicle = await _context.Vehicles.FindAsync(id);
        if (vehicle == null) return NotFound("Vehicle not found");

        if (images == null || images.Count == 0) return BadRequest("No images provided");

        var savedPaths = await _imageService.SaveImagesAsync(images, "vehicles");
        
        foreach (var path in savedPaths)
        {
            _context.VehicleImages.Add(new VehicleImage
            {
                VehicleId = id,
                ImageUrl = path,
                IsPrimary = !_context.VehicleImages.Any(vi => vi.VehicleId == id) // Set first image as primary
            });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Images uploaded successfully", count = savedPaths.Count });
    }

    // DELETE: api/vehicles/images/{imageId}
    [HttpDelete("images/{imageId}")]
    public async Task<IActionResult> DeleteVehicleImage(int imageId)
    {
        var image = await _context.VehicleImages.FindAsync(imageId);
        if (image == null) return NotFound();

        _imageService.DeleteImage(image.ImageUrl);
        _context.VehicleImages.Remove(image);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
