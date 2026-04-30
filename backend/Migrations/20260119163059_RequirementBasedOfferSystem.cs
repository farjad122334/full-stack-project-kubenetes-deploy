using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RequirementBasedOfferSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Drivers_DriverId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Restaurants_RestaurantId",
                table: "Offers");

            migrationBuilder.DropIndex(
                name: "IX_Offers_DriverId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "DriverId",
                table: "Offers");

            migrationBuilder.RenameColumn(
                name: "RestaurantId",
                table: "Offers",
                newName: "RequirementId");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_RestaurantId",
                table: "Offers",
                newName: "IX_Offers_RequirementId");

            migrationBuilder.AddColumn<DateTime>(
                name: "FinalizedAt",
                table: "Tours",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "OrderId",
                table: "RestaurantAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RequirementId",
                table: "RestaurantAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MealScheduleId",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "MealPackageId",
                table: "Orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "RequirementId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "TourId",
                table: "Offers",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "ServiceRequirements",
                columns: table => new
                {
                    RequirementId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TourId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    DateNeeded = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Details = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    EstimatedPeople = table.Column<int>(type: "int", nullable: false),
                    EstimatedBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceRequirements", x => x.RequirementId);
                    table.ForeignKey(
                        name: "FK_ServiceRequirements_Tours_TourId",
                        column: x => x.TourId,
                        principalTable: "Tours",
                        principalColumn: "TourId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAssignments_OrderId",
                table: "RestaurantAssignments",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_RequirementId",
                table: "Orders",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Offers_ProviderId",
                table: "Offers",
                column: "ProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceRequirements_TourId",
                table: "ServiceRequirements",
                column: "TourId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_ServiceRequirements_RequirementId",
                table: "Offers",
                column: "RequirementId",
                principalTable: "ServiceRequirements",
                principalColumn: "RequirementId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_ServiceRequirements_RequirementId",
                table: "Orders",
                column: "RequirementId",
                principalTable: "ServiceRequirements",
                principalColumn: "RequirementId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RestaurantAssignments_Orders_OrderId",
                table: "RestaurantAssignments",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "OrderId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RestaurantAssignments_ServiceRequirements_RequirementId",
                table: "RestaurantAssignments",
                column: "RequirementId",
                principalTable: "ServiceRequirements",
                principalColumn: "RequirementId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Drivers_ProviderId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Restaurants_ProviderId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Offers_ServiceRequirements_RequirementId",
                table: "Offers");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_ServiceRequirements_RequirementId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_RestaurantAssignments_Orders_OrderId",
                table: "RestaurantAssignments");

            migrationBuilder.DropForeignKey(
                name: "FK_RestaurantAssignments_ServiceRequirements_RequirementId",
                table: "RestaurantAssignments");

            migrationBuilder.DropTable(
                name: "ServiceRequirements");

            migrationBuilder.DropIndex(
                name: "IX_RestaurantAssignments_OrderId",
                table: "RestaurantAssignments");

            migrationBuilder.DropIndex(
                name: "IX_RestaurantAssignments_RequirementId",
                table: "RestaurantAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Orders_RequirementId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Offers_ProviderId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "FinalizedAt",
                table: "Tours");

            migrationBuilder.DropColumn(
                name: "OrderId",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "RequirementId",
                table: "RestaurantAssignments");

            migrationBuilder.DropColumn(
                name: "RequirementId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "RequirementId",
                table: "Offers",
                newName: "RestaurantId");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_RequirementId",
                table: "Offers",
                newName: "IX_Offers_RestaurantId");

            migrationBuilder.AlterColumn<int>(
                name: "MealScheduleId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MealPackageId",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TourId",
                table: "Offers",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DriverId",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Offers_DriverId",
                table: "Offers",
                column: "DriverId");

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
    }
}
