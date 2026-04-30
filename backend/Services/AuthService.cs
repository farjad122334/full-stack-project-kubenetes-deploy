using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models.DTOs;
using backend.Models.UserManagement;
using backend.Models.Supporting;
using backend.Models.RestaurantMenu;
using backend.Models.Enums;
using BCrypt.Net;
using System.Text.Json;

namespace backend.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly IEmailService _emailService;
    private readonly IImageService _imageService;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IWebHostEnvironment environment, IEmailService emailService, IImageService imageService)
    {
        _context = context;
        _configuration = configuration;
        _environment = environment;
        _emailService = emailService;
        _imageService = imageService;
    }

    public async Task SignupTouristAsync(TouristSignupDto request)
    {
        Console.WriteLine($"[SignupTourist] Starting signup for {request.Email}. Name: {request.Name}, ProfilePic: {(request.ProfilePicture != null ? request.ProfilePicture.FileName : "NULL")}");
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new Exception("Email already registered");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        string? profilePicturePath = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");

        // Generate 6 digit OTP
        var otp = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Tourist,
            ProfilePicture = profilePicturePath,
            CreatedAt = DateTime.UtcNow,
            IsVerified = false,
            OtpCode = otp,
            OtpExpiry = DateTime.UtcNow.AddMinutes(10),
            RegistrationStep = 2 // OTP Pending
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var tourist = new Tourist { UserId = user.Id };
        _context.Tourists.Add(tourist);
        await _context.SaveChangesAsync();

        // Send OTP Email
        await _emailService.SendEmailAsync(user.Email, "Verify your account", $"Your OTP code is: <b>{otp}</b>. It expires in 10 minutes.");
    }

    public async Task<AuthResponse> VerifyOtpAsync(VerifyOtpDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) throw new Exception("User not found");

        if (user.IsVerified) throw new Exception("User already verified");

        if (user.OtpCode != request.OtpCode) throw new Exception("Invalid OTP");

        if (user.OtpExpiry < DateTime.UtcNow) throw new Exception("OTP expired");

        // Verify User
        user.IsVerified = true;
        user.OtpCode = null;
        user.OtpExpiry = null;
        
        // Set RegistrationStep = 3 (Details Pending) for Driver/Restaurant
        if (user.Role == UserRole.Driver || user.Role == UserRole.Restaurant)
        {
            user.RegistrationStep = 3;
        }
        else
        {
            user.RegistrationStep = 4; // Tourist is complete after OTP
        }
        
        await _context.SaveChangesAsync();

        // Login the user (return token)
        int roleSpecificId = 0;
        var tourist = await _context.Tourists.FirstOrDefaultAsync(t => t.UserId == user.Id);
        roleSpecificId = tourist?.TouristId ?? 0;

        return await GenerateAuthResponseAsync(user, roleSpecificId);
    }

    public async Task InitiateDriverSignupAsync(InitiateDriverSignupDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new Exception("Email already registered");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        string? profilePicturePath = null; // Profile picture handling could be here but usually file upload needs FormData

        // Generate 6 digit OTP
        var otp = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Driver,
            ProfilePicture = profilePicturePath,
            CreatedAt = DateTime.UtcNow,
            IsVerified = false,
            OtpCode = otp,
            OtpExpiry = DateTime.UtcNow.AddMinutes(10),
            RegistrationStep = 2 // OTP Pending
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // New Logic: Create a Draft Driver and Vehicle record immediately
        var driver = new Driver
        {
            UserId = user.Id,
            AccountStatus = "Pending",
            CNIC = "", // Placeholder
            Licence = "" // Placeholder
        };
        _context.Drivers.Add(driver);
        await _context.SaveChangesAsync();

        var vehicle = new Vehicle
        {
            DriverId = driver.DriverId,
            RegistrationNumber = "Pending",
            VehicleType = "Pending",
            Capacity = 0,
            Status = "Pending"
        };
        _context.Vehicles.Add(vehicle);
        await _context.SaveChangesAsync();

        // Send OTP Email
        await _emailService.SendEmailAsync(user.Email, "Verify your account", $"Your OTP code is: <b>{otp}</b>. It expires in 10 minutes.");
    }

    public async Task<AuthResponse> SignupDriverAsync(DriverSignupDto request)
    {
        Console.WriteLine($"[SignupDriver] Starting signup for {request.Email}. Name: {request.Name}, Phone: {request.PhoneNumber}, ProfilePic: {(request.ProfilePicture != null ? request.ProfilePicture.FileName : "NULL")}");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null)
        {
            // Fallback for direct signup without initiation (if allowed) or Error
            // For now, let's create it if missing, effectively behaving like old logic but without OTP
             if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email already registered");

            Console.WriteLine("[SignupDriver] Creating new User entity");
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            string? profilePicPath = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");

            user = new User
            {
                Name = request.Name ?? "",
                Email = request.Email,
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                Role = UserRole.Driver,
                ProfilePicture = profilePicPath,
                CreatedAt = DateTime.UtcNow,
                IsVerified = true // Assuming direct signup skips verification or handled elsewhere? 
                                  // Ideally, we enforce Initiate->Verify->Signup flow.
                                  // Let's set it to true here as legacy fallback support
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            Console.WriteLine($"[SignupDriver] User created with ID: {user.Id}");
        }
        else
        {
            // User Exists
            if (string.IsNullOrEmpty(request.Password) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Invalid email or password");

            if (!user.IsVerified) throw new Exception("Please verify your email first.");
            
            // Update personal data (in case it was changed during the wizard)
            if (!string.IsNullOrEmpty(request.Name))
            {
                user.Name = request.Name;
            }
            if (!string.IsNullOrEmpty(request.PhoneNumber))
            {
                 user.PhoneNumber = request.PhoneNumber;
            }

            // Update profile picture if provided
            try {
                if (request.ProfilePicture != null)
                {
                    user.ProfilePicture = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");
                    Console.WriteLine($"[SignupDriver] Profile picture successfully updated to: {user.ProfilePicture}");
                }
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[SignupDriver] User {user.Email} updated successfully in DB.");
            } catch (Exception ex) {
                Console.WriteLine($"[SignupDriver] CRITICAL ERROR updating user: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"[SignupDriver] Inner Exception: {ex.InnerException.Message}");
                throw;
            }
             // Check if driver profile exists
             var driver = await _context.Drivers.Include(d => d.Vehicles).FirstOrDefaultAsync(d => d.UserId == user.Id);
             if (driver != null && driver.AccountStatus == "Approved")
                throw new Exception("Driver profile already exists and is approved for this user.");
            
            Console.WriteLine($"[SignupDriver] Using existing User ID: {user.Id}");
        }

        var driverEntry = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == user.Id);
        if (driverEntry == null)
        {
            driverEntry = new Driver
            {
                UserId = user.Id,
                CNIC = request.CNIC,
                Licence = request.Licence,
                LicenceExpiryDate = request.LicenceExpiryDate,
                AccountStatus = "Pending"
            };
            _context.Drivers.Add(driverEntry);
        }
        else
        {
            if (!string.IsNullOrEmpty(request.CNIC)) driverEntry.CNIC = request.CNIC;
            if (!string.IsNullOrEmpty(request.Licence)) driverEntry.Licence = request.Licence;
            if (request.LicenceExpiryDate != null) driverEntry.LicenceExpiryDate = request.LicenceExpiryDate;
            driverEntry.AccountStatus = "Pending";
            _context.Drivers.Update(driverEntry);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[SignupDriver] Error saving driver: {ex.Message}");
            throw;
        }
        Console.WriteLine($"[SignupDriver] Driver created/updated with ID: {driverEntry.DriverId}");
        
        // Mark registration as complete
        user.RegistrationStep = 4;
        await _context.SaveChangesAsync();

        // Handle Documents
        string? cnicFrontPath = await _imageService.SaveImageAsync(request.CnicFront, "documents");
        string? cnicBackPath = await _imageService.SaveImageAsync(request.CnicBack, "documents");
        string? licencePath = await _imageService.SaveImageAsync(request.LicenceImage, "documents");

        if (cnicFrontPath != null) _context.Documents.Add(new Document { DriverId = driverEntry.DriverId, DocumentType = "CNIC Front", DocumentUrl = cnicFrontPath, UploadedAt = DateTime.UtcNow });
        if (cnicBackPath != null) _context.Documents.Add(new Document { DriverId = driverEntry.DriverId, DocumentType = "CNIC Back", DocumentUrl = cnicBackPath, UploadedAt = DateTime.UtcNow });
        if (licencePath != null) _context.Documents.Add(new Document { DriverId = driverEntry.DriverId, DocumentType = "Licence", DocumentUrl = licencePath, UploadedAt = DateTime.UtcNow });

        // Update Driver entity with document paths
        if (licencePath != null) driverEntry.LicenceImage = licencePath;
        if (cnicFrontPath != null) driverEntry.CnicFront = cnicFrontPath;
        if (cnicBackPath != null) driverEntry.CnicBack = cnicBackPath;
        
        // Handle Vehicle
        Console.WriteLine("[SignupDriver] Processing Vehicle...");
        var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.DriverId == driverEntry.DriverId);
        
        if (vehicle == null)
        {
            vehicle = new Vehicle
            {
                DriverId = driverEntry.DriverId,
                RegistrationNumber = request.VehicleRegNumber ?? "Unknown",
                VehicleType = request.VehicleType ?? "Unknown",
                Model = request.VehicleModel,
                Capacity = request.VehicleCapacity ?? 0,
                Status = "Pending"
            };
            _context.Vehicles.Add(vehicle);
        }
        else
        {
            if (!string.IsNullOrEmpty(request.VehicleRegNumber)) vehicle.RegistrationNumber = request.VehicleRegNumber;
            if (!string.IsNullOrEmpty(request.VehicleType)) vehicle.VehicleType = request.VehicleType;
            if (!string.IsNullOrEmpty(request.VehicleModel)) vehicle.Model = request.VehicleModel;
            if (request.VehicleCapacity != null) vehicle.Capacity = request.VehicleCapacity.Value;
            vehicle.Status = "Pending";
            _context.Vehicles.Update(vehicle);
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
             Console.WriteLine($"[SignupDriver] Error saving vehicle: {ex.Message}");
            throw;
        }
        Console.WriteLine($"[SignupDriver] Vehicle created/updated with ID: {vehicle.VehicleId}");

        // Handle Vehicle Images
        if (request.VehicleImages != null && request.VehicleImages.Count > 0)
        {
            Console.WriteLine($"[SignupDriver] Processing {request.VehicleImages.Count} vehicle images...");
            var savedVehiclePaths = await _imageService.SaveImagesAsync(request.VehicleImages, "vehicles");
            Console.WriteLine($"[SignupDriver] Saved {savedVehiclePaths.Count} images to disk.");
            
            foreach (var path in savedVehiclePaths)
            {
                // Fix Logic: Check database for primary instead of local context context.VehicleImages could be empty locally
                // Actually for a new vehicle, the first one we add should be primary.
                bool isPrimary = !_context.VehicleImages.Local.Any(vi => vi.VehicleId == vehicle.VehicleId);
                
                _context.VehicleImages.Add(new VehicleImage
                {
                    VehicleId = vehicle.VehicleId,
                    ImageUrl = path,
                    IsPrimary = isPrimary
                });
            }
            await _context.SaveChangesAsync();
            Console.WriteLine("[SignupDriver] Vehicle images saved to DB.");
        }

        Console.WriteLine("[SignupDriver] Signup completed successfully.");
        return await GenerateAuthResponseAsync(user, driverEntry.DriverId);
    }

    public async Task InitiateRestaurantSignupAsync(InitiateRestaurantSignupDto request)
    {
        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            throw new Exception("Email already registered");

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        string? profilePicturePath = null;

        // Generate 6 digit OTP
        var otp = new Random().Next(100000, 999999).ToString();

        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = passwordHash,
            PhoneNumber = request.PhoneNumber,
            Role = UserRole.Restaurant,
            ProfilePicture = profilePicturePath,
            CreatedAt = DateTime.UtcNow,
            IsVerified = false,
            OtpCode = otp,
            OtpExpiry = DateTime.UtcNow.AddMinutes(10),
            RegistrationStep = 2 // OTP Pending
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // New Logic: Create a Draft Restaurant record immediately
        var restaurant = new Restaurant
        {
            UserId = user.Id,
            RestaurantName = "Unknown Restaurant", // Will be updated in Step 3
            BusinessType = "Restaurant", // Default, will be updated in Step 3
            ApplicationStatus = ApplicationStatus.Draft,
            Address = "Pending Registration", // Placeholder until Step 3
            ProvidesMeal = true,
            ProvidesRoom = false
        };
        _context.Restaurants.Add(restaurant);
        await _context.SaveChangesAsync();

        // Send OTP Email
        await _emailService.SendEmailAsync(user.Email, "Verify your account", $"Your OTP code is: <b>{otp}</b>. It expires in 10 minutes.");
    }

    public async Task<AuthResponse> SignupRestaurantAsync(RestaurantSignupDto request)
    {
        Console.WriteLine($"[SignupRestaurant] Starting signup for {request.Email}. Name: {request.Name}, RestaurantName: {request.RestaurantName}, ProfilePic: {(request.ProfilePicture != null ? request.ProfilePicture.FileName : "NULL")}");
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null)
        {
             // Fallback for direct signup (if enabled)
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                throw new Exception("Email already registered");

            if (string.IsNullOrEmpty(request.Password)) throw new Exception("Password is required for new users");
            if (string.IsNullOrEmpty(request.Name)) throw new Exception("Name is required for new users");

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            string? profilePicPath = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");

            user = new User
            {
                Name = request.Name,
                Email = request.Email,
                PasswordHash = passwordHash,
                PhoneNumber = request.PhoneNumber,
                Role = UserRole.Restaurant,
                ProfilePicture = profilePicPath,
                CreatedAt = DateTime.UtcNow,
                IsVerified = true // Assume verified if direct signup
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
             // User Exists
            if (string.IsNullOrEmpty(request.Password) || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                throw new Exception("Invalid email or password");

            if (!user.IsVerified) throw new Exception("Please verify your email first.");
            
            // Update personal data
            user.Name = request.Name ?? "";
            user.PhoneNumber = request.PhoneNumber;

            Console.WriteLine($"[SignupRestaurant] User found: {user.Email}, Id: {user.Id}");

            try {
                if (request.ProfilePicture != null)
                {
                    user.ProfilePicture = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");
                    Console.WriteLine($"[SignupRestaurant] Profile picture successfully updated to: {user.ProfilePicture}");
                }
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[SignupRestaurant] User {user.Email} updated successfully in DB.");
            } catch (Exception ex) {
                Console.WriteLine($"[SignupRestaurant] CRITICAL ERROR updating user: {ex.Message}");
                if (ex.InnerException != null) Console.WriteLine($"[SignupRestaurant] Inner Exception: {ex.InnerException.Message}");
                throw;
            }
        }

        var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.UserId == user.Id);
        Console.WriteLine($"[SignupRestaurant] Restaurant lookup for UserId {user.Id}: {(restaurant != null ? $"Found ID {restaurant.RestaurantId}, CurrentName: {restaurant.RestaurantName}" : "NOT FOUND")}");
        Console.WriteLine($"[SignupRestaurant] Request.RestaurantName: '{request.RestaurantName}'");
        
        if (restaurant == null)
        {
            Console.WriteLine("[SignupRestaurant] Creating NEW restaurant record because lookup failed.");
            restaurant = new Restaurant
            {
                UserId = user.Id,
                RestaurantName = !string.IsNullOrWhiteSpace(request.RestaurantName) ? request.RestaurantName : "Unknown Restaurant",
                OwnerName = !string.IsNullOrWhiteSpace(request.OwnerName) ? request.OwnerName : user.Name,
                BusinessType = !string.IsNullOrWhiteSpace(request.BusinessType) ? request.BusinessType : "Restaurant",
                BusinessLicense = "Uploaded",
                Address = request.Address ?? "",
                PostalCode = request.PostalCode,
                ProvidesMeal = request.BusinessType == "Restaurant" || request.BusinessType == "Hotel",
                ProvidesRoom = request.BusinessType == "Hotel" || request.BusinessType == "GuestHouse",
                ApplicationStatus = ApplicationStatus.Submitted
            };
            _context.Restaurants.Add(restaurant);
        }
        else
        {
            Console.WriteLine($"[SignupRestaurant] Updating EXISTING restaurant record. Old Name: {restaurant.RestaurantName}");
            // Update existing draft
            if (!string.IsNullOrWhiteSpace(request.RestaurantName)) 
            {
                Console.WriteLine($"[SignupRestaurant] Overwriting name with: {request.RestaurantName}");
                restaurant.RestaurantName = request.RestaurantName;
            }
            else 
            {
                Console.WriteLine("[SignupRestaurant] Keeping existing name because request.RestaurantName is null/empty.");
            }

            if (!string.IsNullOrWhiteSpace(request.OwnerName)) restaurant.OwnerName = request.OwnerName;
            if (!string.IsNullOrWhiteSpace(request.BusinessType)) restaurant.BusinessType = request.BusinessType;
            if (!string.IsNullOrWhiteSpace(request.Address)) restaurant.Address = request.Address;
            if (!string.IsNullOrWhiteSpace(request.PostalCode)) restaurant.PostalCode = request.PostalCode;
            
            // Recalculate flags if business type changed
            if (!string.IsNullOrWhiteSpace(request.BusinessType))
            {
                restaurant.ProvidesMeal = request.BusinessType == "Restaurant" || request.BusinessType == "Hotel";
                restaurant.ProvidesRoom = request.BusinessType == "Hotel" || request.BusinessType == "GuestHouse";
            }

            restaurant.ApplicationStatus = ApplicationStatus.Submitted;
            _context.Restaurants.Update(restaurant);
        }

        await _context.SaveChangesAsync();
        
        // Mark registration as complete
        user.RegistrationStep = 4;
        await _context.SaveChangesAsync();

        if (request.LicenseDocument != null)
        {
            string? licensePath = await _imageService.SaveImageAsync(request.LicenseDocument, "documents");
            if (licensePath != null)
            {
                _context.Documents.Add(new Document 
                { 
                    RestaurantId = restaurant.RestaurantId, 
                    DocumentType = "Business License", 
                    DocumentUrl = licensePath, 
                    UploadedAt = DateTime.UtcNow 
                });
                await _context.SaveChangesAsync();
                
                restaurant.BusinessLicense = licensePath; 
                await _context.SaveChangesAsync();
            }
        }

        // Handle Restaurant Images
        if (request.RestaurantImages != null && request.RestaurantImages.Count > 0)
        {
            var savedRestaurantPaths = await _imageService.SaveImagesAsync(request.RestaurantImages, "restaurants");
            foreach (var path in savedRestaurantPaths)
            {
                _context.RestaurantImages.Add(new RestaurantImage
                {
                    RestaurantId = restaurant.RestaurantId,
                    ImageUrl = path,
                    IsPrimary = !_context.RestaurantImages.Any(ri => ri.RestaurantId == restaurant.RestaurantId)
                });
            }
            await _context.SaveChangesAsync();
        }

        return await GenerateAuthResponseAsync(user, restaurant.RestaurantId);
    }

    // Private helper methods for file saving removed in favor of ImageService

    private async Task<AuthResponse> GenerateAuthResponseAsync(User user, int roleSpecificId)
    {
        string? businessType = null;
        
        // Fetch businessType for restaurant users
        if (user.Role == UserRole.Restaurant)
        {
            var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.RestaurantId == roleSpecificId);
            businessType = restaurant?.BusinessType;
        }
        
        var token = GenerateJwtToken(user, roleSpecificId, businessType);
        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                RoleSpecificId = roleSpecificId,
                ProfilePicture = user.ProfilePicture
            }
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null)
        {
            throw new Exception("Invalid email or password");
        }

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Invalid email or password");
        }

        if (user.Role == UserRole.Tourist && !user.IsVerified)
        {
            throw new Exception("Account not verified. Please verify your OTP.");
        }

        // Get role-specific ID and Status
        int roleSpecificId = 0;
        string status = "Approved"; // Default
        string? businessName = null;
        string? businessType = null;

        // Check for incomplete registration (Driver/Restaurant only - Admin is exempt)
        if ((user.Role == UserRole.Driver || user.Role == UserRole.Restaurant) && user.RegistrationStep < 4)
        {
            status = "Incomplete";
        }

        switch (user.Role)
        {
            case UserRole.Tourist:
                var tourist = await _context.Tourists.FirstOrDefaultAsync(t => t.UserId == user.Id);
                roleSpecificId = tourist?.TouristId ?? 0;
                break;
            case UserRole.Driver:
                var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == user.Id);
                if (driver != null)
                {
                    roleSpecificId = driver.DriverId;
                    if (status != "Incomplete") status = driver.AccountStatus;
                    businessName = user.Name; // Drivers don't have separate business name usually
                }
                break;
            case UserRole.Restaurant:
                var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.UserId == user.Id);
                if (restaurant != null)
                {
                    roleSpecificId = restaurant.RestaurantId;
                    if (status != "Incomplete") status = restaurant.ApplicationStatus.ToString();
                    businessName = restaurant.RestaurantName;
                    businessType = restaurant.BusinessType;
                }
                break;
        }

        // Generate JWT token
        var token = GenerateJwtToken(user, roleSpecificId, businessType);

        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role,
                RoleSpecificId = roleSpecificId,
                ProfilePicture = user.ProfilePicture,
                Status = status,
                BusinessName = businessName,
                BusinessType = businessType,
                RegistrationStep = user.RegistrationStep
            }
        };
    }

    public async Task<UserDto?> GetUserByIdAsync(int userId)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return null;

        int roleSpecificId = 0;
        switch (user.Role)
        {
            case UserRole.Tourist:
                var tourist = await _context.Tourists.FirstOrDefaultAsync(t => t.UserId == user.Id);
                roleSpecificId = tourist?.TouristId ?? 0;
                break;
            case UserRole.Driver:
                var driver = await _context.Drivers.FirstOrDefaultAsync(d => d.UserId == user.Id);
                roleSpecificId = driver?.DriverId ?? 0;
                break;
            case UserRole.Restaurant:
                var restaurant = await _context.Restaurants.FirstOrDefaultAsync(r => r.UserId == user.Id);
                roleSpecificId = restaurant?.RestaurantId ?? 0;
                break;
        }

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            RoleSpecificId = roleSpecificId,
            ProfilePicture = user.ProfilePicture
        };
    }

    private string GenerateJwtToken(User user, int roleSpecificId, string? businessType = null)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TourismManagementSystem";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "TourismManagementSystemUsers";
        var jwtExpiryHours = int.Parse(_configuration["Jwt:ExpiryInHours"] ?? "24");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("RoleSpecificId", roleSpecificId.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        // Add businessType claim for restaurant users
        if (!string.IsNullOrEmpty(businessType))
        {
            claims.Add(new Claim("BusinessType", businessType));
        }

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(jwtExpiryHours),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    public async Task ResendOtpAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
        {
            throw new Exception("User not found");
        }

        if (user.IsVerified)
        {
            throw new Exception("User already verified");
        }

        // Generate new OTP
        var otp = new Random().Next(100000, 999999).ToString();
        user.OtpCode = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
        
        await _context.SaveChangesAsync();

        // Send OTP Email
        await _emailService.SendEmailAsync(user.Email, "Verify your account", $"Your new OTP code is: <b>{otp}</b>. It expires in 10 minutes.");
    }

    public async Task UpdatePasswordAsync(int userId, UpdatePasswordDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            throw new Exception("User not found");

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            throw new Exception("Incorrect current password.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        await _context.SaveChangesAsync();
    }

    public async Task ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null)
            throw new Exception("User not found"); 

        // Generate 6 digit OTP
        var otp = new Random().Next(100000, 999999).ToString();

        user.OtpCode = otp;
        user.OtpExpiry = DateTime.UtcNow.AddMinutes(10);
        
        await _context.SaveChangesAsync();

        // Send OTP Email
        await _emailService.SendEmailAsync(user.Email, "Reset Your Password", $"Your OTP code for password reset is: <b>{otp}</b>. It expires in 10 minutes.");
    }

    public async Task<bool> VerifyPasswordResetOtpAsync(VerifyOtpDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) throw new Exception("User not found");

        if (user.OtpCode != request.OtpCode) throw new Exception("Invalid OTP");

        if (user.OtpExpiry < DateTime.UtcNow) throw new Exception("OTP expired");

        return true;
    }

    public async Task ResetPasswordAsync(ResetPasswordDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null) throw new Exception("User not found");

        if (user.OtpCode != request.OtpCode) throw new Exception("Invalid OTP");

        if (user.OtpExpiry < DateTime.UtcNow) throw new Exception("OTP expired");

        // Hash new password
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        
        // Clear OTP
        user.OtpCode = null;
        user.OtpExpiry = null;
        
        await _context.SaveChangesAsync();
    }

    public async Task<UserDto> UpdateProfileAsync(int userId, UpdateProfileDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) throw new Exception("User not found");

        if (!string.IsNullOrEmpty(request.Name)) user.Name = request.Name;
        if (!string.IsNullOrEmpty(request.PhoneNumber)) user.PhoneNumber = request.PhoneNumber;

        if (request.ProfilePicture != null)
        {
            user.ProfilePicture = await _imageService.SaveImageAsync(request.ProfilePicture, "profiles");
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            Role = user.Role,
            ProfilePicture = user.ProfilePicture
        };
    }
}
