using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaAndAddOtp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Users_UserId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Earnings_Users_UserId",
                table: "Earnings");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Earnings_UserId",
                table: "Earnings");

            migrationBuilder.DropIndex(
                name: "IX_Documents_UserId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "CNIC",
                table: "Tourists");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Tourists");

            migrationBuilder.DropColumn(
                name: "Nationality",
                table: "Tourists");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Earnings");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Documents");

            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OtpCode",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OtpExpiry",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Restaurants",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Restaurants",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "Latitude",
                table: "Restaurants",
                type: "decimal(10,8)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Restaurants",
                type: "decimal(11,8)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Restaurants",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Restaurants",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Restaurants",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "Earnings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Earnings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RestaurantId",
                table: "Documents",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Earnings_DriverId",
                table: "Earnings",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Earnings_RestaurantId",
                table: "Earnings",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_DriverId",
                table: "Documents",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_RestaurantId",
                table: "Documents",
                column: "RestaurantId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Drivers_DriverId",
                table: "Documents",
                column: "DriverId",
                principalTable: "Drivers",
                principalColumn: "DriverId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Restaurants_RestaurantId",
                table: "Documents",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "RestaurantId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Earnings_Drivers_DriverId",
                table: "Earnings",
                column: "DriverId",
                principalTable: "Drivers",
                principalColumn: "DriverId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Earnings_Restaurants_RestaurantId",
                table: "Earnings",
                column: "RestaurantId",
                principalTable: "Restaurants",
                principalColumn: "RestaurantId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Drivers_DriverId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Restaurants_RestaurantId",
                table: "Documents");

            migrationBuilder.DropForeignKey(
                name: "FK_Earnings_Drivers_DriverId",
                table: "Earnings");

            migrationBuilder.DropForeignKey(
                name: "FK_Earnings_Restaurants_RestaurantId",
                table: "Earnings");

            migrationBuilder.DropIndex(
                name: "IX_Earnings_DriverId",
                table: "Earnings");

            migrationBuilder.DropIndex(
                name: "IX_Earnings_RestaurantId",
                table: "Earnings");

            migrationBuilder.DropIndex(
                name: "IX_Documents_DriverId",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_RestaurantId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OtpCode",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OtpExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "Earnings");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Earnings");

            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "RestaurantId",
                table: "Documents");

            migrationBuilder.AddColumn<string>(
                name: "CNIC",
                table: "Tourists",
                type: "nvarchar(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Tourists",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Nationality",
                table: "Tourists",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Earnings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Documents",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    AddressId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Latitude = table.Column<decimal>(type: "decimal(10,8)", nullable: true),
                    Longitude = table.Column<decimal>(type: "decimal(11,8)", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    State = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Street = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.AddressId);
                    table.ForeignKey(
                        name: "FK_Addresses_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Earnings_UserId",
                table: "Earnings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Documents_UserId",
                table: "Documents",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UserId",
                table: "Addresses",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Users_UserId",
                table: "Documents",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Earnings_Users_UserId",
                table: "Earnings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
