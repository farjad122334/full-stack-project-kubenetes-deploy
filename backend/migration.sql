IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Tours] (
        [TourId] int NOT NULL IDENTITY,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(2000) NULL,
        [DepartureLocation] nvarchar(200) NOT NULL,
        [Destination] nvarchar(200) NOT NULL,
        [DurationDays] int NOT NULL,
        [MaxCapacity] int NOT NULL,
        [CurrentBookings] int NOT NULL,
        [PricePerHead] decimal(18,2) NOT NULL,
        [PriceForCouple] decimal(18,2) NULL,
        [StartDate] datetime2 NOT NULL,
        [EndDate] datetime2 NOT NULL,
        [Status] int NOT NULL,
        [ImageUrl] nvarchar(500) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Tours] PRIMARY KEY ([TourId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(100) NOT NULL,
        [Email] nvarchar(100) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [PhoneNumber] nvarchar(20) NULL,
        [Role] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ProfilePicture] nvarchar(500) NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Accommodations] (
        [AccommodationId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [HotelName] nvarchar(200) NOT NULL,
        [Location] nvarchar(200) NULL,
        [RoomType] nvarchar(100) NULL,
        [NumberOfRooms] int NOT NULL,
        [CostPerNight] decimal(18,2) NOT NULL,
        [NumberOfNights] int NOT NULL,
        [TotalCost] decimal(18,2) NOT NULL,
        [CheckInDate] datetime2 NULL,
        [CheckOutDate] datetime2 NULL,
        CONSTRAINT [PK_Accommodations] PRIMARY KEY ([AccommodationId]),
        CONSTRAINT [FK_Accommodations_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Itineraries] (
        [ItineraryId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [DayNumber] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(1000) NULL,
        [Location] nvarchar(200) NULL,
        [StartTime] time NULL,
        [EndTime] time NULL,
        [Activities] nvarchar(500) NULL,
        CONSTRAINT [PK_Itineraries] PRIMARY KEY ([ItineraryId]),
        CONSTRAINT [FK_Itineraries_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [TourImages] (
        [ImageId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [Caption] nvarchar(200) NULL,
        [IsPrimary] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_TourImages] PRIMARY KEY ([ImageId]),
        CONSTRAINT [FK_TourImages_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Addresses] (
        [AddressId] int NOT NULL IDENTITY,
        [UserId] int NULL,
        [Street] nvarchar(200) NULL,
        [City] nvarchar(100) NOT NULL,
        [State] nvarchar(100) NULL,
        [Country] nvarchar(100) NOT NULL,
        [PostalCode] nvarchar(20) NULL,
        [Latitude] decimal(10,8) NULL,
        [Longitude] decimal(11,8) NULL,
        CONSTRAINT [PK_Addresses] PRIMARY KEY ([AddressId]),
        CONSTRAINT [FK_Addresses_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Documents] (
        [DocumentId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [DocumentType] nvarchar(50) NOT NULL,
        [DocumentUrl] nvarchar(500) NOT NULL,
        [UploadedAt] datetime2 NOT NULL,
        [ExpiryDate] datetime2 NULL,
        [VerificationStatus] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_Documents] PRIMARY KEY ([DocumentId]),
        CONSTRAINT [FK_Documents_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Drivers] (
        [DriverId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [DateOfBirth] datetime2 NULL,
        [CNIC] nvarchar(15) NULL,
        [Licence] nvarchar(50) NULL,
        [LicenceExpiryDate] datetime2 NULL,
        [CurrentLocation] nvarchar(200) NULL,
        [AccountStatus] nvarchar(20) NOT NULL,
        [TotalEarnings] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_Drivers] PRIMARY KEY ([DriverId]),
        CONSTRAINT [FK_Drivers_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Earnings] (
        [EarningId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [TourId] int NULL,
        [Amount] decimal(18,2) NOT NULL,
        [Type] nvarchar(50) NOT NULL,
        [EarnedAt] datetime2 NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_Earnings] PRIMARY KEY ([EarningId]),
        CONSTRAINT [FK_Earnings_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Earnings_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [NotificationId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(1000) NOT NULL,
        [Type] nvarchar(50) NOT NULL,
        [IsRead] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ReadAt] datetime2 NULL,
        [ActionUrl] nvarchar(500) NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationId]),
        CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Restaurants] (
        [RestaurantId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [RestaurantName] nvarchar(200) NOT NULL,
        [BusinessType] nvarchar(100) NULL,
        [Rating] decimal(3,2) NOT NULL,
        [Location] nvarchar(300) NULL,
        [BusinessLicense] nvarchar(100) NULL,
        CONSTRAINT [PK_Restaurants] PRIMARY KEY ([RestaurantId]),
        CONSTRAINT [FK_Restaurants_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Tourists] (
        [TouristId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [DateOfBirth] datetime2 NULL,
        [CNIC] nvarchar(15) NULL,
        [Nationality] nvarchar(50) NULL,
        CONSTRAINT [PK_Tourists] PRIMARY KEY ([TouristId]),
        CONSTRAINT [FK_Tourists_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Vehicles] (
        [VehicleId] int NOT NULL IDENTITY,
        [DriverId] int NOT NULL,
        [RegistrationNumber] nvarchar(50) NOT NULL,
        [VehicleType] nvarchar(50) NOT NULL,
        [Model] nvarchar(50) NULL,
        [Capacity] int NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_Vehicles] PRIMARY KEY ([VehicleId]),
        CONSTRAINT [FK_Vehicles_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Menus] (
        [MenuId] int NOT NULL IDENTITY,
        [RestaurantId] int NOT NULL,
        [MenuName] nvarchar(200) NOT NULL,
        [Description] nvarchar(500) NULL,
        [Category] nvarchar(100) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Menus] PRIMARY KEY ([MenuId]),
        CONSTRAINT [FK_Menus_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Bookings] (
        [BookingId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [TouristId] int NOT NULL,
        [BookingDate] datetime2 NOT NULL,
        [NumberOfPeople] int NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [CancelledAt] datetime2 NULL,
        [CancellationReason] nvarchar(500) NULL,
        CONSTRAINT [PK_Bookings] PRIMARY KEY ([BookingId]),
        CONSTRAINT [FK_Bookings_Tourists_TouristId] FOREIGN KEY ([TouristId]) REFERENCES [Tourists] ([TouristId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Bookings_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Reviews] (
        [ReviewId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [UserId] int NOT NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [IsVerified] bit NOT NULL,
        [HelpfulCount] int NOT NULL,
        [TouristId] int NULL,
        CONSTRAINT [PK_Reviews] PRIMARY KEY ([ReviewId]),
        CONSTRAINT [FK_Reviews_Tourists_TouristId] FOREIGN KEY ([TouristId]) REFERENCES [Tourists] ([TouristId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Reviews_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Reviews_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Offers] (
        [OfferId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [ProviderId] int NOT NULL,
        [OfferType] nvarchar(50) NOT NULL,
        [OfferedAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RespondedAt] datetime2 NULL,
        [Notes] nvarchar(1000) NULL,
        [VehicleId] int NULL,
        [TransportationFare] decimal(18,2) NULL,
        [RouteDetails] nvarchar(500) NULL,
        [IncludesFuel] bit NULL,
        [DriverId] int NULL,
        [PricePerHead] decimal(18,2) NULL,
        [MinimumPeople] int NULL,
        [MaximumPeople] int NULL,
        [MealType] nvarchar(100) NULL,
        [IncludesBeverages] bit NULL,
        [RestaurantId] int NULL,
        CONSTRAINT [PK_Offers] PRIMARY KEY ([OfferId]),
        CONSTRAINT [FK_Offers_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Offers_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Offers_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Offers_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([VehicleId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [MenuItems] (
        [ItemId] int NOT NULL IDENTITY,
        [MenuId] int NOT NULL,
        [ItemName] nvarchar(200) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [Description] nvarchar(500) NULL,
        [Image] nvarchar(500) NULL,
        [IsAvailable] bit NOT NULL,
        CONSTRAINT [PK_MenuItems] PRIMARY KEY ([ItemId]),
        CONSTRAINT [FK_MenuItems_Menus_MenuId] FOREIGN KEY ([MenuId]) REFERENCES [Menus] ([MenuId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Payments] (
        [PaymentId] int NOT NULL IDENTITY,
        [BookingId] int NOT NULL,
        [Amount] decimal(18,2) NOT NULL,
        [PaymentMethod] nvarchar(50) NOT NULL,
        [PaymentDate] datetime2 NOT NULL,
        [Currency] nvarchar(10) NOT NULL,
        [TransactionId] nvarchar(100) NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([PaymentId]),
        CONSTRAINT [FK_Payments_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [RestaurantAssignments] (
        [AssignmentId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [RestaurantId] int NOT NULL,
        [RestaurantOfferId] int NULL,
        [Status] int NOT NULL,
        [AssignedAt] datetime2 NOT NULL,
        [AcceptedAt] datetime2 NULL,
        [PricePerHead] decimal(18,2) NOT NULL,
        [ExpectedPeople] int NOT NULL,
        [FinalPrice] decimal(18,2) NOT NULL,
        [MealScheduleText] nvarchar(500) NULL,
        CONSTRAINT [PK_RestaurantAssignments] PRIMARY KEY ([AssignmentId]),
        CONSTRAINT [FK_RestaurantAssignments_Offers_RestaurantOfferId] FOREIGN KEY ([RestaurantOfferId]) REFERENCES [Offers] ([OfferId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RestaurantAssignments_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_RestaurantAssignments_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [TourAssignments] (
        [AssignmentId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [DriverId] int NOT NULL,
        [VehicleId] int NOT NULL,
        [DriverOfferId] int NULL,
        [Status] int NOT NULL,
        [AssignedAt] datetime2 NOT NULL,
        [AcceptedAt] datetime2 NULL,
        [FinalPrice] decimal(18,2) NOT NULL,
        [Notes] nvarchar(500) NULL,
        CONSTRAINT [PK_TourAssignments] PRIMARY KEY ([AssignmentId]),
        CONSTRAINT [FK_TourAssignments_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TourAssignments_Offers_DriverOfferId] FOREIGN KEY ([DriverOfferId]) REFERENCES [Offers] ([OfferId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TourAssignments_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TourAssignments_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([VehicleId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [OfferMenuItems] (
        [OfferMenuItemId] int NOT NULL IDENTITY,
        [RestaurantOfferId] int NOT NULL,
        [MenuItemId] int NOT NULL,
        [MealType] int NOT NULL,
        [Quantity] int NOT NULL,
        [PriceAtOffer] decimal(18,2) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_OfferMenuItems] PRIMARY KEY ([OfferMenuItemId]),
        CONSTRAINT [FK_OfferMenuItems_MenuItems_MenuItemId] FOREIGN KEY ([MenuItemId]) REFERENCES [MenuItems] ([ItemId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_OfferMenuItems_Offers_RestaurantOfferId] FOREIGN KEY ([RestaurantOfferId]) REFERENCES [Offers] ([OfferId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Refunds] (
        [RefundId] int NOT NULL IDENTITY,
        [PaymentId] int NOT NULL,
        [BookingId] int NOT NULL,
        [RefundAmount] decimal(18,2) NOT NULL,
        [Reason] nvarchar(500) NOT NULL,
        [Status] int NOT NULL,
        [RequestedAt] datetime2 NOT NULL,
        [ProcessedAt] datetime2 NULL,
        CONSTRAINT [PK_Refunds] PRIMARY KEY ([RefundId]),
        CONSTRAINT [FK_Refunds_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Refunds_Payments_PaymentId] FOREIGN KEY ([PaymentId]) REFERENCES [Payments] ([PaymentId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [MealSchedules] (
        [MealScheduleId] int NOT NULL IDENTITY,
        [RestaurantAssignmentId] int NOT NULL,
        [DayNumber] int NOT NULL,
        [MealType] int NOT NULL,
        [ScheduledTime] time NOT NULL,
        [Location] nvarchar(200) NULL,
        [IsIncluded] bit NOT NULL,
        [SpecialInstructions] nvarchar(500) NULL,
        CONSTRAINT [PK_MealSchedules] PRIMARY KEY ([MealScheduleId]),
        CONSTRAINT [FK_MealSchedules_RestaurantAssignments_RestaurantAssignmentId] FOREIGN KEY ([RestaurantAssignmentId]) REFERENCES [RestaurantAssignments] ([AssignmentId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPackages] (
        [MealPackageId] int NOT NULL IDENTITY,
        [RestaurantAssignmentId] int NOT NULL,
        [MealScheduleId] int NOT NULL,
        [MealType] int NOT NULL,
        [TotalPerHead] decimal(18,2) NOT NULL,
        [PackageName] nvarchar(200) NULL,
        CONSTRAINT [PK_MealPackages] PRIMARY KEY ([MealPackageId]),
        CONSTRAINT [FK_MealPackages_MealSchedules_MealScheduleId] FOREIGN KEY ([MealScheduleId]) REFERENCES [MealSchedules] ([MealScheduleId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MealPackages_RestaurantAssignments_RestaurantAssignmentId] FOREIGN KEY ([RestaurantAssignmentId]) REFERENCES [RestaurantAssignments] ([AssignmentId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [MealPackageItems] (
        [MealPackageItemId] int NOT NULL IDENTITY,
        [MealPackageId] int NOT NULL,
        [MenuItemId] int NOT NULL,
        [Quantity] int NOT NULL,
        [PricePerUnit] decimal(18,2) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_MealPackageItems] PRIMARY KEY ([MealPackageItemId]),
        CONSTRAINT [FK_MealPackageItems_MealPackages_MealPackageId] FOREIGN KEY ([MealPackageId]) REFERENCES [MealPackages] ([MealPackageId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_MealPackageItems_MenuItems_MenuItemId] FOREIGN KEY ([MenuItemId]) REFERENCES [MenuItems] ([ItemId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [OrderId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [RestaurantAssignmentId] int NOT NULL,
        [MealScheduleId] int NOT NULL,
        [MealPackageId] int NOT NULL,
        [BookingId] int NULL,
        [OrderDate] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [Status] int NOT NULL,
        [NumberOfPeople] int NOT NULL,
        [SpecialRequests] nvarchar(500) NULL,
        [ScheduledTime] datetime2 NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([OrderId]),
        CONSTRAINT [FK_Orders_Bookings_BookingId] FOREIGN KEY ([BookingId]) REFERENCES [Bookings] ([BookingId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_MealPackages_MealPackageId] FOREIGN KEY ([MealPackageId]) REFERENCES [MealPackages] ([MealPackageId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_MealSchedules_MealScheduleId] FOREIGN KEY ([MealScheduleId]) REFERENCES [MealSchedules] ([MealScheduleId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_RestaurantAssignments_RestaurantAssignmentId] FOREIGN KEY ([RestaurantAssignmentId]) REFERENCES [RestaurantAssignments] ([AssignmentId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Orders_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [OrderItemId] int NOT NULL IDENTITY,
        [OrderId] int NOT NULL,
        [MenuItemId] int NOT NULL,
        [Quantity] int NOT NULL,
        [PricePerUnit] decimal(18,2) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([OrderItemId]),
        CONSTRAINT [FK_OrderItems_MenuItems_MenuItemId] FOREIGN KEY ([MenuItemId]) REFERENCES [MenuItems] ([ItemId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Accommodations_TourId] ON [Accommodations] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Addresses_UserId] ON [Addresses] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Bookings_BookingDate] ON [Bookings] ([BookingDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Bookings_TourId] ON [Bookings] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Bookings_TouristId] ON [Bookings] ([TouristId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Documents_UserId] ON [Documents] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Drivers_UserId] ON [Drivers] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Earnings_TourId] ON [Earnings] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Earnings_UserId] ON [Earnings] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Itineraries_TourId] ON [Itineraries] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPackageItems_MealPackageId] ON [MealPackageItems] ([MealPackageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPackageItems_MenuItemId] ON [MealPackageItems] ([MenuItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_MealPackages_MealScheduleId] ON [MealPackages] ([MealScheduleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealPackages_RestaurantAssignmentId] ON [MealPackages] ([RestaurantAssignmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MealSchedules_RestaurantAssignmentId] ON [MealSchedules] ([RestaurantAssignmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_MenuItems_MenuId] ON [MenuItems] ([MenuId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Menus_RestaurantId] ON [Menus] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OfferMenuItems_MenuItemId] ON [OfferMenuItems] ([MenuItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OfferMenuItems_RestaurantOfferId] ON [OfferMenuItems] ([RestaurantOfferId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Offers_DriverId] ON [Offers] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Offers_RestaurantId] ON [Offers] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Offers_TourId] ON [Offers] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Offers_VehicleId] ON [Offers] ([VehicleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_MenuItemId] ON [OrderItems] ([MenuItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_BookingId] ON [Orders] ([BookingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_MealPackageId] ON [Orders] ([MealPackageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_MealScheduleId] ON [Orders] ([MealScheduleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_OrderDate] ON [Orders] ([OrderDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_RestaurantAssignmentId] ON [Orders] ([RestaurantAssignmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_TourId] ON [Orders] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Payments_BookingId] ON [Payments] ([BookingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Refunds_BookingId] ON [Refunds] ([BookingId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Refunds_PaymentId] ON [Refunds] ([PaymentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RestaurantAssignments_RestaurantId] ON [RestaurantAssignments] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_RestaurantAssignments_RestaurantOfferId] ON [RestaurantAssignments] ([RestaurantOfferId]) WHERE [RestaurantOfferId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_RestaurantAssignments_TourId] ON [RestaurantAssignments] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Restaurants_UserId] ON [Restaurants] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reviews_TourId] ON [Reviews] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reviews_TouristId] ON [Reviews] ([TouristId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Reviews_UserId] ON [Reviews] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TourAssignments_DriverId] ON [TourAssignments] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_TourAssignments_DriverOfferId] ON [TourAssignments] ([DriverOfferId]) WHERE [DriverOfferId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TourAssignments_TourId] ON [TourAssignments] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TourAssignments_VehicleId] ON [TourAssignments] ([VehicleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_TourImages_TourId] ON [TourImages] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tourists_UserId] ON [Tourists] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tours_StartDate] ON [Tours] ([StartDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Vehicles_DriverId] ON [Vehicles] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260111163833_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260111163833_InitialCreate', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Documents] DROP CONSTRAINT [FK_Documents_Users_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Earnings] DROP CONSTRAINT [FK_Earnings_Users_UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DROP TABLE [Addresses];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DROP INDEX [IX_Earnings_UserId] ON [Earnings];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DROP INDEX [IX_Documents_UserId] ON [Documents];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DECLARE @var0 sysname;
    SELECT @var0 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tourists]') AND [c].[name] = N'CNIC');
    IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [Tourists] DROP CONSTRAINT [' + @var0 + '];');
    ALTER TABLE [Tourists] DROP COLUMN [CNIC];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DECLARE @var1 sysname;
    SELECT @var1 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tourists]') AND [c].[name] = N'DateOfBirth');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [Tourists] DROP CONSTRAINT [' + @var1 + '];');
    ALTER TABLE [Tourists] DROP COLUMN [DateOfBirth];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DECLARE @var2 sysname;
    SELECT @var2 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Tourists]') AND [c].[name] = N'Nationality');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [Tourists] DROP CONSTRAINT [' + @var2 + '];');
    ALTER TABLE [Tourists] DROP COLUMN [Nationality];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DECLARE @var3 sysname;
    SELECT @var3 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Earnings]') AND [c].[name] = N'UserId');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [Earnings] DROP CONSTRAINT [' + @var3 + '];');
    ALTER TABLE [Earnings] DROP COLUMN [UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    DECLARE @var4 sysname;
    SELECT @var4 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Documents]') AND [c].[name] = N'UserId');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [Documents] DROP CONSTRAINT [' + @var4 + '];');
    ALTER TABLE [Documents] DROP COLUMN [UserId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Users] ADD [IsVerified] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Users] ADD [OtpCode] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Users] ADD [OtpExpiry] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [City] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [Country] nvarchar(100) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [Latitude] decimal(10,8) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [Longitude] decimal(11,8) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [PostalCode] nvarchar(20) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [State] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [Street] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Earnings] ADD [DriverId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Earnings] ADD [RestaurantId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Documents] ADD [DriverId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Documents] ADD [RestaurantId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    CREATE INDEX [IX_Earnings_DriverId] ON [Earnings] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    CREATE INDEX [IX_Earnings_RestaurantId] ON [Earnings] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    CREATE INDEX [IX_Documents_DriverId] ON [Documents] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    CREATE INDEX [IX_Documents_RestaurantId] ON [Documents] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Documents] ADD CONSTRAINT [FK_Documents_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Documents] ADD CONSTRAINT [FK_Documents_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Earnings] ADD CONSTRAINT [FK_Earnings_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    ALTER TABLE [Earnings] ADD CONSTRAINT [FK_Earnings_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112094239_UpdateSchemaAndAddOtp'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260112094239_UpdateSchemaAndAddOtp', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112130401_RemoveDriverDobAndLocation'
)
BEGIN
    DECLARE @var5 sysname;
    SELECT @var5 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Drivers]') AND [c].[name] = N'CurrentLocation');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [Drivers] DROP CONSTRAINT [' + @var5 + '];');
    ALTER TABLE [Drivers] DROP COLUMN [CurrentLocation];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112130401_RemoveDriverDobAndLocation'
)
BEGIN
    DECLARE @var6 sysname;
    SELECT @var6 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Drivers]') AND [c].[name] = N'DateOfBirth');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Drivers] DROP CONSTRAINT [' + @var6 + '];');
    ALTER TABLE [Drivers] DROP COLUMN [DateOfBirth];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260112130401_RemoveDriverDobAndLocation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260112130401_RemoveDriverDobAndLocation', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var7 sysname;
    SELECT @var7 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'City');
    IF @var7 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var7 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [City];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var8 sysname;
    SELECT @var8 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'Country');
    IF @var8 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var8 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [Country];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var9 sysname;
    SELECT @var9 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'Latitude');
    IF @var9 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var9 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [Latitude];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var10 sysname;
    SELECT @var10 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'Location');
    IF @var10 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var10 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [Location];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var11 sysname;
    SELECT @var11 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'Longitude');
    IF @var11 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var11 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [Longitude];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    DECLARE @var12 sysname;
    SELECT @var12 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Restaurants]') AND [c].[name] = N'Street');
    IF @var12 IS NOT NULL EXEC(N'ALTER TABLE [Restaurants] DROP CONSTRAINT [' + @var12 + '];');
    ALTER TABLE [Restaurants] DROP COLUMN [Street];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    EXEC sp_rename N'[Restaurants].[State]', N'OwnerName', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [Address] nvarchar(300) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    ALTER TABLE [Drivers] ADD [CnicBack] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    ALTER TABLE [Drivers] ADD [CnicFront] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    ALTER TABLE [Drivers] ADD [LicenceImage] nvarchar(200) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113070659_UpdateDriverAndRestaurantSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260113070659_UpdateDriverAndRestaurantSchema', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260113085740_MoveExpiryToLicence'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260113085740_MoveExpiryToLicence', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114122700_AddRestaurantApplicationStatus'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [ApplicationStatus] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260114122700_AddRestaurantApplicationStatus'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260114122700_AddRestaurantApplicationStatus', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260116032903_AddTourDiscountsAndBookingUpdate'
)
BEGIN
    EXEC sp_rename N'[Tours].[PriceForCouple]', N'CoupleDiscountPercentage', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260116032903_AddTourDiscountsAndBookingUpdate'
)
BEGIN
    ALTER TABLE [Tours] ADD [BulkBookingMinPersons] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260116032903_AddTourDiscountsAndBookingUpdate'
)
BEGIN
    ALTER TABLE [Tours] ADD [BulkDiscountPercentage] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260116032903_AddTourDiscountsAndBookingUpdate'
)
BEGIN
    ALTER TABLE [Bookings] ADD [BookingType] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260116032903_AddTourDiscountsAndBookingUpdate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260116032903_AddTourDiscountsAndBookingUpdate', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Offers] DROP CONSTRAINT [FK_Offers_Drivers_DriverId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Offers] DROP CONSTRAINT [FK_Offers_Restaurants_RestaurantId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    DROP INDEX [IX_Offers_DriverId] ON [Offers];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    DECLARE @var13 sysname;
    SELECT @var13 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Offers]') AND [c].[name] = N'DriverId');
    IF @var13 IS NOT NULL EXEC(N'ALTER TABLE [Offers] DROP CONSTRAINT [' + @var13 + '];');
    ALTER TABLE [Offers] DROP COLUMN [DriverId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    EXEC sp_rename N'[Offers].[RestaurantId]', N'RequirementId', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    EXEC sp_rename N'[Offers].[IX_Offers_RestaurantId]', N'IX_Offers_RequirementId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Tours] ADD [FinalizedAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [RestaurantAssignments] ADD [OrderId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [RestaurantAssignments] ADD [RequirementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    DECLARE @var14 sysname;
    SELECT @var14 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Orders]') AND [c].[name] = N'MealScheduleId');
    IF @var14 IS NOT NULL EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @var14 + '];');
    ALTER TABLE [Orders] ALTER COLUMN [MealScheduleId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    DECLARE @var15 sysname;
    SELECT @var15 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Orders]') AND [c].[name] = N'MealPackageId');
    IF @var15 IS NOT NULL EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT [' + @var15 + '];');
    ALTER TABLE [Orders] ALTER COLUMN [MealPackageId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Orders] ADD [RequirementId] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    DECLARE @var16 sysname;
    SELECT @var16 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Offers]') AND [c].[name] = N'TourId');
    IF @var16 IS NOT NULL EXEC(N'ALTER TABLE [Offers] DROP CONSTRAINT [' + @var16 + '];');
    ALTER TABLE [Offers] ALTER COLUMN [TourId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE TABLE [ServiceRequirements] (
        [RequirementId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [Type] nvarchar(50) NOT NULL,
        [Location] nvarchar(200) NULL,
        [DateNeeded] datetime2 NOT NULL,
        [Details] nvarchar(2000) NULL,
        [EstimatedPeople] int NOT NULL,
        [EstimatedBudget] decimal(18,2) NULL,
        [Status] nvarchar(50) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ServiceRequirements] PRIMARY KEY ([RequirementId]),
        CONSTRAINT [FK_ServiceRequirements_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE INDEX [IX_RestaurantAssignments_OrderId] ON [RestaurantAssignments] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE INDEX [IX_RestaurantAssignments_RequirementId] ON [RestaurantAssignments] ([RequirementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE INDEX [IX_Orders_RequirementId] ON [Orders] ([RequirementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE INDEX [IX_Offers_ProviderId] ON [Offers] ([ProviderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    CREATE INDEX [IX_ServiceRequirements_TourId] ON [ServiceRequirements] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_Drivers_ProviderId] FOREIGN KEY ([ProviderId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_Restaurants_ProviderId] FOREIGN KEY ([ProviderId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_ServiceRequirements_RequirementId] FOREIGN KEY ([RequirementId]) REFERENCES [ServiceRequirements] ([RequirementId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [Orders] ADD CONSTRAINT [FK_Orders_ServiceRequirements_RequirementId] FOREIGN KEY ([RequirementId]) REFERENCES [ServiceRequirements] ([RequirementId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [RestaurantAssignments] ADD CONSTRAINT [FK_RestaurantAssignments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([OrderId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    ALTER TABLE [RestaurantAssignments] ADD CONSTRAINT [FK_RestaurantAssignments_ServiceRequirements_RequirementId] FOREIGN KEY ([RequirementId]) REFERENCES [ServiceRequirements] ([RequirementId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119163059_RequirementBasedOfferSystem'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119163059_RequirementBasedOfferSystem', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119180151_RemoveItineraryTable'
)
BEGIN
    DROP TABLE [Itineraries];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260119180151_RemoveItineraryTable'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260119180151_RemoveItineraryTable', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120163725_AddTimeToServiceRequirement'
)
BEGIN
    DECLARE @var17 sysname;
    SELECT @var17 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ServiceRequirements]') AND [c].[name] = N'Details');
    IF @var17 IS NOT NULL EXEC(N'ALTER TABLE [ServiceRequirements] DROP CONSTRAINT [' + @var17 + '];');
    ALTER TABLE [ServiceRequirements] DROP COLUMN [Details];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120163725_AddTimeToServiceRequirement'
)
BEGIN
    ALTER TABLE [ServiceRequirements] ADD [StayDurationDays] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120163725_AddTimeToServiceRequirement'
)
BEGIN
    ALTER TABLE [ServiceRequirements] ADD [Time] nvarchar(10) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260120163725_AddTimeToServiceRequirement'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260120163725_AddTimeToServiceRequirement', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    ALTER TABLE [Offers] ADD [PerRoomCapacity] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    ALTER TABLE [Offers] ADD [RentPerNight] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    ALTER TABLE [Offers] ADD [StayDurationDays] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    ALTER TABLE [Offers] ADD [TotalRent] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    ALTER TABLE [Offers] ADD [TotalRooms] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260122162027_AddAccommodationFieldsToRestaurantOffer'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260122162027_AddAccommodationFieldsToRestaurantOffer', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260203133133_AddVehicleAndRestaurantImages'
)
BEGIN
    CREATE TABLE [RestaurantImages] (
        [ImageId] int NOT NULL IDENTITY,
        [RestaurantId] int NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [Caption] nvarchar(200) NULL,
        [IsPrimary] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_RestaurantImages] PRIMARY KEY ([ImageId]),
        CONSTRAINT [FK_RestaurantImages_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260203133133_AddVehicleAndRestaurantImages'
)
BEGIN
    CREATE TABLE [VehicleImages] (
        [ImageId] int NOT NULL IDENTITY,
        [VehicleId] int NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [Caption] nvarchar(200) NULL,
        [IsPrimary] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_VehicleImages] PRIMARY KEY ([ImageId]),
        CONSTRAINT [FK_VehicleImages_Vehicles_VehicleId] FOREIGN KEY ([VehicleId]) REFERENCES [Vehicles] ([VehicleId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260203133133_AddVehicleAndRestaurantImages'
)
BEGIN
    CREATE INDEX [IX_RestaurantImages_RestaurantId] ON [RestaurantImages] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260203133133_AddVehicleAndRestaurantImages'
)
BEGIN
    CREATE INDEX [IX_VehicleImages_VehicleId] ON [VehicleImages] ([VehicleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260203133133_AddVehicleAndRestaurantImages'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260203133133_AddVehicleAndRestaurantImages', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260204162106_Phase2_CompleteImplementation'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260204162106_Phase2_CompleteImplementation', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [ProvidesMeal] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [ProvidesRoom] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    ALTER TABLE [Offers] ADD [RoomCategoryId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    CREATE TABLE [RoomCategories] (
        [RoomCategoryId] int NOT NULL IDENTITY,
        [RestaurantId] int NOT NULL,
        [CategoryName] nvarchar(100) NOT NULL,
        [Description] nvarchar(500) NULL,
        [PricePerNight] decimal(18,2) NOT NULL,
        [MaxGuests] int NOT NULL,
        [TotalRooms] int NOT NULL,
        [AvailableRooms] int NOT NULL,
        [Amenities] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_RoomCategories] PRIMARY KEY ([RoomCategoryId]),
        CONSTRAINT [FK_RoomCategories_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    CREATE TABLE [RoomImages] (
        [RoomImageId] int NOT NULL IDENTITY,
        [RoomCategoryId] int NOT NULL,
        [ImageUrl] nvarchar(500) NOT NULL,
        [IsPrimary] bit NOT NULL,
        [DisplayOrder] int NOT NULL,
        CONSTRAINT [PK_RoomImages] PRIMARY KEY ([RoomImageId]),
        CONSTRAINT [FK_RoomImages_RoomCategories_RoomCategoryId] FOREIGN KEY ([RoomCategoryId]) REFERENCES [RoomCategories] ([RoomCategoryId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    CREATE INDEX [IX_Offers_RoomCategoryId] ON [Offers] ([RoomCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    CREATE INDEX [IX_RoomCategories_RestaurantId] ON [RoomCategories] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    CREATE INDEX [IX_RoomImages_RoomCategoryId] ON [RoomImages] ([RoomCategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_RoomCategories_RoomCategoryId] FOREIGN KEY ([RoomCategoryId]) REFERENCES [RoomCategories] ([RoomCategoryId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260205062856_AddServiceFlagsToRestaurant'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260205062856_AddServiceFlagsToRestaurant', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260206140432_AddRegistrationStepToUser'
)
BEGIN
    ALTER TABLE [Users] ADD [RegistrationStep] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260206140432_AddRegistrationStepToUser'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260206140432_AddRegistrationStepToUser', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] DROP CONSTRAINT [FK_Offers_Drivers_ProviderId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] DROP CONSTRAINT [FK_Offers_Restaurants_ProviderId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    DROP INDEX [IX_Offers_ProviderId] ON [Offers];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] ADD [DriverId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] ADD [RestaurantId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    UPDATE Offers SET DriverId = ProviderId WHERE OfferType = 'Driver'
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    UPDATE Offers SET RestaurantId = ProviderId WHERE OfferType = 'Restaurant'
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    DECLARE @var18 sysname;
    SELECT @var18 = [d].[name]
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Offers]') AND [c].[name] = N'ProviderId');
    IF @var18 IS NOT NULL EXEC(N'ALTER TABLE [Offers] DROP CONSTRAINT [' + @var18 + '];');
    ALTER TABLE [Offers] DROP COLUMN [ProviderId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    CREATE INDEX [IX_Offers_DriverId] ON [Offers] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    CREATE INDEX [IX_Offers_RestaurantId] ON [Offers] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    ALTER TABLE [Offers] ADD CONSTRAINT [FK_Offers_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260210113115_SplitOfferProviderIds'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260210113115_SplitOfferProviderIds', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    CREATE TABLE [Ratings] (
        [RatingId] int NOT NULL IDENTITY,
        [TourId] int NOT NULL,
        [TouristId] int NOT NULL,
        [Stars] int NOT NULL,
        [Comment] nvarchar(1000) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RatingType] nvarchar(13) NOT NULL,
        [DriverId] int NULL,
        [VehicleConditionStars] int NULL,
        [ComfortStars] int NULL,
        [DriverBehaviourStars] int NULL,
        [RestaurantId] int NULL,
        [AccommodationStars] int NULL,
        [ServiceStars] int NULL,
        [StaffStars] int NULL,
        [ManagementStars] int NULL,
        [PricingStars] int NULL,
        CONSTRAINT [PK_Ratings] PRIMARY KEY ([RatingId]),
        CONSTRAINT [FK_Ratings_Drivers_DriverId] FOREIGN KEY ([DriverId]) REFERENCES [Drivers] ([DriverId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Ratings_Restaurants_RestaurantId] FOREIGN KEY ([RestaurantId]) REFERENCES [Restaurants] ([RestaurantId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Ratings_Tourists_TouristId] FOREIGN KEY ([TouristId]) REFERENCES [Tourists] ([TouristId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Ratings_Tours_TourId] FOREIGN KEY ([TourId]) REFERENCES [Tours] ([TourId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    CREATE INDEX [IX_Ratings_DriverId] ON [Ratings] ([DriverId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    CREATE INDEX [IX_Ratings_RestaurantId] ON [Ratings] ([RestaurantId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    CREATE INDEX [IX_Ratings_TourId] ON [Ratings] ([TourId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    CREATE INDEX [IX_Ratings_TouristId] ON [Ratings] ([TouristId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260222064925_AddPolymorphicRatings'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260222064925_AddPolymorphicRatings', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260223112118_AddIsServedToRestaurantAssignment'
)
BEGIN
    ALTER TABLE [RestaurantAssignments] ADD [IsServed] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260223112118_AddIsServedToRestaurantAssignment'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260223112118_AddIsServedToRestaurantAssignment', N'9.0.0');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260227103901_AddStripeFields'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [PayoutsEnabled] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260227103901_AddStripeFields'
)
BEGIN
    ALTER TABLE [Restaurants] ADD [StripeAccountId] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260227103901_AddStripeFields'
)
BEGIN
    ALTER TABLE [Drivers] ADD [PayoutsEnabled] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260227103901_AddStripeFields'
)
BEGIN
    ALTER TABLE [Drivers] ADD [StripeAccountId] nvarchar(100) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260227103901_AddStripeFields'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260227103901_AddStripeFields', N'9.0.0');
END;

COMMIT;
GO

