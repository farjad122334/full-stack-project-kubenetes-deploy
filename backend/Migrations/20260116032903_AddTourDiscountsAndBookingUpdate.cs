using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTourDiscountsAndBookingUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PriceForCouple",
                table: "Tours",
                newName: "CoupleDiscountPercentage");

            migrationBuilder.AddColumn<int>(
                name: "BulkBookingMinPersons",
                table: "Tours",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "BulkDiscountPercentage",
                table: "Tours",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BookingType",
                table: "Bookings",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BulkBookingMinPersons",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "BulkDiscountPercentage",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "BookingType",
                table: "Bookings");

            migrationBuilder.RenameColumn(
                name: "CoupleDiscountPercentage",
                table: "Tours",
                newName: "PriceForCouple");
        }
    }
}
