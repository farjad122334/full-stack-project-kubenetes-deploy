using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDepartureCoordinates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DepartureLatitude",
                table: "Tours",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DepartureLongitude",
                table: "Tours",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartureLatitude",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "DepartureLongitude",
                table: "Tours");
        }
    }
}
