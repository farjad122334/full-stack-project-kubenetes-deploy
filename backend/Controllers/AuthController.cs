using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using backend.Models.DTOs;
using backend.Services;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/signup/tourist
    [HttpPost("signup/tourist")]
    public async Task<IActionResult> SignupTourist([FromForm] TouristSignupDto request)
    {
        try
        {
            await _authService.SignupTouristAsync(request);
            return Ok(new { message = "Registration successful. Please verify OTP sent to your email.", email = request.Email });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/verify-otp
    [HttpPost("verify-otp")]
    public async Task<ActionResult<AuthResponse>> VerifyOtp([FromBody] VerifyOtpDto request)
    {
        try
        {
            var response = await _authService.VerifyOtpAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/resend-otp
    // POST: api/auth/resend-otp
    [HttpPost("resend-otp")]
    public async Task<IActionResult> ResendOtp([FromBody] ResendOtpDto request)
    {
        try
        {
            // Reusing VerifyOtpDto just for Email field
            await _authService.ResendOtpAsync(request.Email);
            return Ok(new { message = "OTP sent successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/initiate-driver-signup
    [HttpPost("initiate-driver-signup")]
    public async Task<IActionResult> InitiateDriverSignup([FromBody] InitiateDriverSignupDto request)
    {
        try
        {
            await _authService.InitiateDriverSignupAsync(request);
             return Ok(new { message = "Registration initiated. Please verify OTP sent to your email.", email = request.Email });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/initiate-restaurant-signup
    [HttpPost("initiate-restaurant-signup")]
    public async Task<IActionResult> InitiateRestaurantSignup([FromBody] InitiateRestaurantSignupDto request)
    {
        try
        {
            await _authService.InitiateRestaurantSignupAsync(request);
             return Ok(new { message = "Registration initiated. Please verify OTP sent to your email.", email = request.Email });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/signup/driver
    [HttpPost("signup/driver")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<ActionResult<AuthResponse>> SignupDriver([FromForm] DriverSignupDto request)
    {
        try
        {
            var response = await _authService.SignupDriverAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/signup/restaurant
    [HttpPost("signup/restaurant")]
    [DisableRequestSizeLimit]
    [RequestFormLimits(MultipartBodyLengthLimit = int.MaxValue, ValueLengthLimit = int.MaxValue)]
    public async Task<ActionResult<AuthResponse>> SignupRestaurant([FromForm] RestaurantSignupDto request)
    {
        try
        {
            var response = await _authService.SignupRestaurantAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            var message = ex.InnerException?.Message ?? ex.Message;
            return BadRequest(new { message });
        }
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    // GET: api/auth/me
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(user);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // PUT: api/auth/update-password
    [Authorize]
    [HttpPut("update-password")]
    public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            await _authService.UpdatePasswordAsync(userId, request);
            return Ok(new { message = "Password updated successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/forgot-password
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto request)
    {
        try
        {
            await _authService.ForgotPasswordAsync(request.Email);
            return Ok(new { message = "If this email is registered, an OTP will be sent." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/verify-password-reset-otp
    [HttpPost("verify-password-reset-otp")]
    public async Task<IActionResult> VerifyPasswordResetOtp([FromBody] VerifyOtpDto request)
    {
        try
        {
            await _authService.VerifyPasswordResetOtpAsync(request);
            return Ok(new { message = "OTP verified successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    // POST: api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto request)
    {
        try
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(new { message = "Password reset successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize]
    [HttpPut("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto request)
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                return Unauthorized(new { message = "Invalid token" });
            }

            var response = await _authService.UpdateProfileAsync(userId, request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("debug-users")]
    public async Task<IActionResult> DebugUsers([FromServices] ApplicationDbContext context)
    {
        var users = await context.Users
            .Select(u => new { u.Id, u.Name, u.Email, u.ProfilePicture, u.Role })
            .ToListAsync();
        return Ok(users);
    }
}
