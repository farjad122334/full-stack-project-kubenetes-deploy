using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceFlagsToRestaurant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ProvidesMeal",
                table: "Restaurants",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ProvidesRoom",
                table: "Restaurants",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "RoomCategoryId",
                table: "Offers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RoomCategories",
                columns: table => new
                {
                    RoomCategoryId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RestaurantId = table.Column<int>(type: "int", nullable: false),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PricePerNight = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MaxGuests = table.Column<int>(type: "int", nullable: false),
                    TotalRooms = table.Column<int>(type: "int", nullable: false),
                    AvailableRooms = table.Column<int>(type: "int", nullable: false),
                    Amenities = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomCategories", x => x.RoomCategoryId);
                    table.ForeignKey(
                        name: "FK_RoomCategories_Restaurants_RestaurantId",
                        column: x => x.RestaurantId,
                        principalTable: "Restaurants",
                        principalColumn: "RestaurantId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RoomImages",
                columns: table => new
                {
                    RoomImageId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoomCategoryId = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoomImages", x => x.RoomImageId);
                    table.ForeignKey(
                        name: "FK_RoomImages_RoomCategories_RoomCategoryId",
                        column: x => x.RoomCategoryId,
                        principalTable: "RoomCategories",
                        principalColumn: "RoomCategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Offers_RoomCategoryId",
                table: "Offers",
                column: "RoomCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_RoomCategories_RestaurantId",
                table: "RoomCategories",
                column: "RestaurantId");

            migrationBuilder.CreateIndex(
                name: "IX_RoomImages_RoomCategoryId",
                table: "RoomImages",
                column: "RoomCategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_RoomCategories_RoomCategoryId",
                table: "Offers",
                column: "RoomCategoryId",
                principalTable: "RoomCategories",
                principalColumn: "RoomCategoryId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_RoomCategories_RoomCategoryId",
                table: "Offers");

            migrationBuilder.DropTable(
                name: "RoomImages");

            migrationBuilder.DropTable(
                name: "RoomCategories");

            migrationBuilder.DropIndex(
                name: "IX_Offers_RoomCategoryId",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "ProvidesMeal",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "ProvidesRoom",
                table: "Restaurants");

            migrationBuilder.DropColumn(
                name: "RoomCategoryId",
                table: "Offers");
        }
    }
}
