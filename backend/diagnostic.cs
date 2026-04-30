using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using Microsoft.Extensions.Configuration;
using backend.Models.TourManagement;
using backend.Models.Enums;
using System.Collections.Generic;

namespace Diagnostic
{
    class DiagnosticTool
    {
        public static void Run(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(System.IO.Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            optionsBuilder.UseSqlServer(config.GetConnectionString("DefaultConnection"));

            using (var context = new ApplicationDbContext(optionsBuilder.Options))
            {
                Console.WriteLine("--- Detailed Database Report ---");
                
                var restaurants = context.Restaurants.Select(r => new { r.RestaurantId, r.RestaurantName, r.BusinessType }).ToList();
                Console.WriteLine("\nRestaurants:");
                foreach (var r in restaurants)
                {
                    Console.WriteLine($"  - [{r.RestaurantId}] {r.RestaurantName} (Type: '{r.BusinessType}')");
                }

                var tours = context.Tours.Include(t => t.ServiceRequirements).ToList();
                Console.WriteLine($"\nTotal Tours: {tours.Count}");
                
                foreach (var tour in tours)
                {
                    Console.WriteLine($"\nTour: {tour.Title} (ID: {tour.TourId})");
                    Console.WriteLine($"  Status: {tour.Status}");
                    Console.WriteLine($"  Requirements ({tour.ServiceRequirements.Count}):");
                    foreach (var req in tour.ServiceRequirements)
                    {
                        Console.WriteLine($"    - [{req.RequirementId}] {req.Type} at {req.Location} (Status: {req.Status})");
                    }
                }
            }
        }
    }
}
