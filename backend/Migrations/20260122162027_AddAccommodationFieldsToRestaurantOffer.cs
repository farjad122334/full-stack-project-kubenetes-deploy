using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAccommodationFieldsToRestaurantOffer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PerRoomCapacity",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RentPerNight",
                table: "Offers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StayDurationDays",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalRent",
                table: "Offers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalRooms",
                table: "Offers",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PerRoomCapacity",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "RentPerNight",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "StayDurationDays",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TotalRent",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "TotalRooms",
                table: "Offers");
        }
    }
}
