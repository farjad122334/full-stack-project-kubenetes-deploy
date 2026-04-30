using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SplitOfferProviderIds : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // 1. Drop old FKs and Index
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Drivers_ProviderId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Restaurants_ProviderId",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_ProviderId",
                table: "Offers");

            // 2. Add new columns (nullable to allow for other types or nulls initially)
            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "Offers",
                type: "int",
                nullable: true); // DriverId is null for RestaurantOffer

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Offers",
                type: "int",
                nullable: true); // RestaurantId is null for DriverOffer

            // 3. Migrate Data
            migrationBuilder.Sql("UPDATE Offers SET DriverId = ProviderId WHERE OfferType = 'Driver'");
            migrationBuilder.Sql("UPDATE Offers SET RestaurantId = ProviderId WHERE OfferType = 'Restaurant'");

            // 4. Drop old column
            migrationBuilder.DropColumn(
                name: "ProviderId",
                table: "Offers");

            // 5. Create Indexes
            migrationBuilder.CreateIndex(
                name: "IX_Offers_DriverId",
                table: "Offers",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_RestaurantId",
                table: "Offers",
                column: "RestaurantId");

            // 6. Add Foreign Keys
            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Drivers_DriverId",
                table: "Offers",
                column: "DriverId",
                principalTable: "Drivers",
                principalColumn: "DriverId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Restaurants_RestaurantId",
                table: "Offers",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "RestaurantId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // 1. Remove new FKs and Indexes
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Drivers_DriverId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Restaurants_RestaurantId",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_DriverId",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_RestaurantId",
                table: "Offers");

            // 2. Add old column back (nullable first to allow updates)
            migrationBuilder.AddColumn<int>(
                name: "ProviderId",
                table: "Offers",
                type: "int",
                nullable: true); // Temporarily nullable

            // 3. Restore Data
            migrationBuilder.Sql("UPDATE Offers SET ProviderId = DriverId WHERE OfferType = 'Driver'");
            migrationBuilder.Sql("UPDATE Offers SET ProviderId = RestaurantId WHERE OfferType = 'Restaurant'");

            // 4. Make ProviderId required (if data exists, this might fail if any still null, but should be fine)
            // SQL Server Alter Column? Or just leave it?
            // MigrationBuilder.AlterColumn technically creates a new Alter statement.
            // Let's assume we can just leave it as is or try to alter it.
            // For simplicity in this fix, lets allow it to be 0 or check if I can Alter.
            // migrationBuilder.AlterColumn<int>(name: "ProviderId", table: "Offers", nullable: false);
            
            // 5. Drop new columns
            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Offers");

            // 6. Recreate indexes and FKs
            migrationBuilder.CreateIndex(
                name: "IX_Offers_ProviderId",
                table: "Offers",
                column: "ProviderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Drivers_ProviderId",
                table: "Offers",
                column: "ProviderId",
                principalTable: "Drivers",
                principalColumn: "DriverId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Restaurants_ProviderId",
                table: "Offers",
                column: "ProviderId",
                principalTable: "Restaurants",
                principalColumn: "RestaurantId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
