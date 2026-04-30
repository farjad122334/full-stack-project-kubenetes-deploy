using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDriverAndRestaurantSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
                name: "Location",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "Street",
                table: "Restaurants");

            migrationBuilder.RenameColumn(
                name: "State",
                table: "Restaurants",
                newName: "OwnerName");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Restaurants",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CnicBack",
                table: "Drivers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CnicFront",
                table: "Drivers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicenceImage",
                table: "Drivers",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "CnicBack",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "CnicFront",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "LicenceImage",
                table: "Drivers");

            migrationBuilder.RenameColumn(
                name: "OwnerName",
                table: "Restaurants",
                newName: "State");

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

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "Restaurants",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Longitude",
                table: "Restaurants",
                type: "decimal(11,8)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Street",
                table: "Restaurants",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }
    }
}
