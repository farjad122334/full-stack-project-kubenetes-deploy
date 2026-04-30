using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddStripeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentIntentId",
                table: "Bookings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StripeSessionId",
                table: "Bookings",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PayoutsEnabled",
                table: "Drivers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StripeAccountId",
                table: "Drivers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PayoutsEnabled",
                table: "Restaurants",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "StripeAccountId",
                table: "Restaurants",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentIntentId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "StripeSessionId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PayoutsEnabled",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "StripeAccountId",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "PayoutsEnabled",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "StripeAccountId",
                table: "Restaurants");
        }
    }
}
