using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPaidAndPaidAtColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "RestaurantAssignments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "RestaurantAssignments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Offers",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Offers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPaid",
                table: "Accommodations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsServed",
                table: "Accommodations",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "PaidAt",
                table: "Accommodations",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Accommodations",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ServedAt",
                table: "Accommodations",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "IsPaid",
                table: "Accommodations");

            migrationBuilder.DropColumn(
                name: "IsServed",
                table: "Accommodations");

            migrationBuilder.DropColumn(
                name: "PaidAt",
                table: "Accommodations");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Accommodations");

            migrationBuilder.DropColumn(
                name: "ServedAt",
                table: "Accommodations");
        }
    }
}
