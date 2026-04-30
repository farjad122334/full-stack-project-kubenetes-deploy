using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRequirementAssignmentRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments");

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "RestaurantAssignments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ServedAt",
                table: "RestaurantAssignments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Earnings",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments",
                column: "RequirementId",
                unique: true,
                filter: "[RequirementId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "ServedAt",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Earnings");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments",
                column: "RequirementId");
        }
    }
}
