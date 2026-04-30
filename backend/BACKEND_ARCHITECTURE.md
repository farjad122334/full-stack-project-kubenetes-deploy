# Safarnama Backend: Deep Architecture Guide

This document provides a comprehensive deep dive into the backend architecture, database schema, and core C# classes for the Safarnama Tourism Platform.

## 1. Technological Foundation
*   **Framework**: ASP.NET Core 9.0 (Web API)
*   **Database**: Microsoft SQL Server
*   **ORM**: Entity Framework Core (Code First)
*   **Authentication**: JWT (JSON Web Tokens) with Role-Based Access Control (RBAC)

---

## 2. Database Schema & Models
The database is structured into several domains, managed via `ApplicationDbContext.cs`.

### A. User Management Domain
We use a **Split-Identity Pattern** where the `User` class holds credentials, and specific role classes hold profile data.

*   **`User`**: (The Parent) Stores `Email`, `PasswordHash`, `Role` (Enum: Tourist, Driver, Restaurant, Admin).
*   **`Tourist`**: Personal profile for customers. Linked to `Bookings`.
*   **`Driver`**: Profile for transport providers. Linked to `Vehicles` and `DriverOffers`.
*   **`Restaurant`**: Profile for food/accommodation providers. Also used for Hotels.

### B. Tour & Requirement Domain
A Tour is not just a single record; it's a hierarchy of expectations.

*   **`Tour`**: The main package (Title, Description, StartDate, PricePerHead).
*   **`ServiceRequirement`**: Each tour defines "needs" (e.g., "Need Lunch at Location X"). This allows Restaurants to bid on specific parts of a tour rather than the whole thing.
*   **`TourImage`**: Handles multiple gallery images for a tour.

### C. The Offer System (TPH Pattern)
We use **Table Per Hierarchy (TPH)** for offers. This means `DriverOffer` and `RestaurantOffer` share the same `Offers` table in the database.

*   **`Offer` (Abstract Base)**: Contains common fields like `OfferedAmount`, `Status`, and `ProviderId`.
*   **`DriverOffer`**: Adds transport-specific fields like `VehicleId` and `TransportationFare`.
*   **`RestaurantOffer`**: Links to a `ServiceRequirement` instead of a `Tour`. Adds fields like `PricePerHead` and `MealType`.

### D. Booking & Order Domain
Handles the financial and logistical completion of a trip.

*   **`Booking`**: A tourist's reservation for a tour.
*   **`Payment`**: Tracks the transaction status (Pending, Completed).
*   **`Order`**: When a Restaurant Offer is accepted, an "Order" is generated to track the specific service delivery.

---

## 3. The Core Workflow (How they work)

### Phase 1: Planning
The Admin creates a `Tour`. While doing so, they also create `ServiceRequirements`.
> **Logic**: The API saves the `Tour` first, then the `ServiceRequirements` linked by `TourId`.

### Phase 2: Bidding
Drivers see the `Tour` and submit a `DriverOffer`. Restaurants see the `ServiceRequirements` and submit a `RestaurantOffer`.
> **Logic**: Offers are saved with a `Pending` status. The Admin is notified via the `INotificationService`.

### Phase 3: Assignment
Admin reviews offers and clicks "Accept".
> **Logic**: 
> 1. The Offer status changes to `Approved`.
> 2. A `TourAssignment` or `RestaurantAssignment` is created.
> 3. This "locks" the provider to the tour.

### Phase 4: Customer Booking
Tourists view the "Published" tours.
> **Logic**: When they book, a `Booking` record is created. If payment is successful, the `Tour` capacity decreases.

---

## 4. Technical Implementation Detail

### Inheritance & Polymorphism
We use C# inheritance to share code. For example, `DriverOffer` inherits from `Offer`.
```csharp
public class DriverOffer : Offer {
    public int VehicleId { get; set; } // Specific to drivers
}
```
In the database, EF Core adds a **`Discriminator`** column. This column will say "Driver" or "Restaurant", so the backend knows which class to reconstruct when reading from the database.

### Dependency Injection
We use **Interfaces** for high-level logic:
*   **`IEmailService`**: Handles all outgoing mail.
*   **`INotificationService`**: Handles in-app alerts.
*   **`IAuthService`**: Handles token generation and password hashing.

### Serialization Control
To prevent infinite loops (e.g., a Tour has an Offer, which has a Tour, which has an Offer...), we use `[JsonIgnore]` on "back-references". This keeps our JSON responses clean and fast.

---

## 5. Folder Structure Summary
*   `Controllers/`: Defines the API endpoints (The entry points).
*   `Models/`: Defines the Data types and DB schema (The objects).
*   `Services/`: Contains business logic and external integrations (The workers).
*   `Data/`: The `ApplicationDbContext` and Migrations (The database glue).
*   `DTOs/`: "Data Transfer Objects" - simplified versions of models sent to the frontend to hide sensitive data like passwords.
