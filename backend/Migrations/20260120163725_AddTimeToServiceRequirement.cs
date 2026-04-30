using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeToServiceRequirement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Details",
                table: "ServiceRequirements");

            migrationBuilder.AddColumn<int>(
                name: "StayDurationDays",
                table: "ServiceRequirements",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Time",
                table: "ServiceRequirements",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StayDurationDays",
                table: "ServiceRequirements");

            migrationBuilder.DropColumn(
                name: "Time",
                table: "ServiceRequirements");

            migrationBuilder.AddColumn<string>(
                name: "Details",
                table: "ServiceRequirements",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }
    }
}
