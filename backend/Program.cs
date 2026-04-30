using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using backend.Services;
using backend.Models.UserManagement;
using backend.Models.Enums;
using BCrypt.Net;
using dotenv.net;

DotEnv.Load();
var builder = WebApplication.CreateBuilder(args);

// Ensure Environment Variables are loaded into Configuration
builder.Configuration.AddEnvironmentVariables();

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .Select(e => new { Field = e.Key, Message = e.Value?.Errors.First().ErrorMessage })
                .ToList();

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { message = "Validation Failed", errors });
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext with SQL Server
var connectionString = builder.Configuration["DB_CONNECTION"] ?? builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Register services
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDriverService, DriverService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IPaymentService, PaymentService>(); // Registering PaymentService explicitly
builder.Services.AddScoped<IStripeService, StripeService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["JWT_KEY"] ?? builder.Configuration["Jwt:Key"] ?? throw new Exception("JWT Key not configured");
var jwtIssuer = builder.Configuration["JWT_ISSUER"] ?? builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["JWT_AUDIENCE"] ?? builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    };
});

// Configure CORS for Angular frontend
var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:4200";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(frontendUrl) // Angular dev server
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Increase Max Request Body Size for File Uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(x =>
{
    x.ValueLengthLimit = int.MaxValue;
    x.MultipartBodyLengthLimit = int.MaxValue; // 2 GB limit
    x.MemoryBufferThreshold = 10 * 1024 * 1024; // 10 MB buffer before writing to disk (prevents RAM spikes)
});
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = int.MaxValue; // Unlimited Kestrel body size
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(10);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(10);
});

var app = builder.Build();

// Apply Migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try 
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Apply pending migrations without destroying existing data
        // To reset the database during development, uncomment the line below:
        // context.Database.EnsureDeleted();
        context.Database.Migrate(); 
        Console.WriteLine("Database migrations applied successfully.");

        // Ensure Admin User Exists with Correct Password
        var defaultEmail = "admin@travel.com";
        var adminUser = context.Users.FirstOrDefault(u => u.Email == defaultEmail);
        
        if (adminUser == null)
        {
            Console.WriteLine($"Seeding Admin User: {defaultEmail}...");
            adminUser = new User
            {
                Name = "Administrator",
                Email = defaultEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                PhoneNumber = "0000000000",
                Role = UserRole.Admin,
                IsVerified = true,
                CreatedAt = DateTime.UtcNow,
                RegistrationStep = 4
            };
            context.Users.Add(adminUser);
            context.SaveChanges();
            Console.WriteLine("✅ Admin user seeded successfully.");
        }
        else 
        {
            // Ensure existing user has Admin role
            if (adminUser.Role != UserRole.Admin)
            {
                Console.WriteLine($"Updating user {defaultEmail} to Admin role...");
                adminUser.Role = UserRole.Admin;
                adminUser.IsVerified = true;
                adminUser.RegistrationStep = 4;
                context.SaveChanges();
                Console.WriteLine("✅ Admin role updated.");
            }
            else 
            {
                Console.WriteLine("ℹ️ Admin user already exists and is configured correctly.");
            }
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAngular");

// Enable Static Files
app.UseStaticFiles();

// Enable Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();