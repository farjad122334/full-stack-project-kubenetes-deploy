using Microsoft.EntityFrameworkCore;
using backend.Models.UserManagement;
using backend.Models.TourManagement;
using backend.Models.OfferSystem;
using backend.Models.MealManagement;
using backend.Models.RestaurantMenu;
using backend.Models.BookingPayment;
using backend.Models.Supporting;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    // User Management
    public DbSet<User> Users { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<Restaurant> Restaurants { get; set; }
    public DbSet<Tourist> Tourists { get; set; }

    // Tour Management
    public DbSet<Tour> Tours { get; set; }
    public DbSet<TourImage> TourImages { get; set; }
    public DbSet<TourAssignment> TourAssignments { get; set; }
    public DbSet<ServiceRequirement> ServiceRequirements { get; set; }

    // Offer System
    public DbSet<Offer> Offers { get; set; }
    public DbSet<DriverOffer> DriverOffers { get; set; }
    public DbSet<RestaurantOffer> RestaurantOffers { get; set; }

    // Meal Management
    public DbSet<OfferMenuItem> OfferMenuItems { get; set; }
    public DbSet<MealSchedule> MealSchedules { get; set; }
    public DbSet<MealPackage> MealPackages { get; set; }
    public DbSet<MealPackageItem> MealPackageItems { get; set; }

    // Restaurant & Menu
    public DbSet<Menu> Menus { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }

    // Booking & Payment
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<Refund> Refunds { get; set; }

    // Supporting
    public DbSet<RestaurantAssignment> RestaurantAssignments { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Accommodation> Accommodations { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Rating> Ratings { get; set; } // Added Ratings DbSet
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Document> Documents { get; set; }
    public virtual DbSet<Earning> Earnings { get; set; }
    public DbSet<VehicleImage> VehicleImages { get; set; }
    public DbSet<RestaurantImage> RestaurantImages { get; set; }
    public DbSet<RoomCategory> RoomCategories { get; set; }
    public DbSet<RoomImage> RoomImages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Table Per Hierarchy (TPH) for Offer inheritance
        modelBuilder.Entity<Offer>()
            .HasDiscriminator<string>("OfferType")
            .HasValue<DriverOffer>("Driver")
            .HasValue<RestaurantOffer>("Restaurant");

        // Configure Table Per Hierarchy (TPH) for Rating inheritance
        modelBuilder.Entity<Rating>()
            .HasDiscriminator<string>("RatingType")
            .HasValue<TourRating>("Tour")
            .HasValue<DriverRating>("Driver")
            .HasValue<RestaurantRating>("Restaurant");

        // Set all foreign key relationships to Restrict to avoid cascade delete conflicts
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }

        // Configure indexes for performance
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Booking>()
            .HasIndex(b => b.BookingDate);

        modelBuilder.Entity<Tour>()
            .HasIndex(t => t.StartDate);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.OrderDate);

        // Configure decimal precision
        modelBuilder.Entity<Tour>()
            .Property(t => t.PricePerHead)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Tour>()
            .Property(t => t.CoupleDiscountPercentage)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Tour>()
            .Property(t => t.BulkDiscountPercentage)
            .HasPrecision(18, 2);

        // Configure Order-RestaurantAssignment relationship
        // RestaurantAssignment has a collection of Orders (historical/legacy)
        // But also has ONE specific Order linked via OrderId (the confirmed order from offer acceptance)
        modelBuilder.Entity<RestaurantAssignment>()
            .HasOne(ra => ra.Order)
            .WithMany() // Order does NOT have a back-reference to this specific relationship
            .HasForeignKey(ra => ra.OrderId)
            .OnDelete(DeleteBehavior.Restrict);

        // The main relationship: Order belongs to RestaurantAssignment
        modelBuilder.Entity<Order>()
            .HasOne(o => o.RestaurantAssignment)
            .WithMany(ra => ra.Orders) // The collection of all orders
            .HasForeignKey(o => o.RestaurantAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure ServiceRequirement <-> RestaurantAssignment (one-to-one via RequirementId FK on RestaurantAssignment)
        modelBuilder.Entity<RestaurantAssignment>()
            .HasOne(ra => ra.ServiceRequirement)
            .WithOne(sr => sr.Assignment)
            .HasForeignKey<RestaurantAssignment>(ra => ra.RequirementId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
