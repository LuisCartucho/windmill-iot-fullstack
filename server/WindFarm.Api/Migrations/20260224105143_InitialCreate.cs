using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WindFarm.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alerts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TurbineId = table.Column<string>(type: "text", nullable: false),
                    FarmId = table.Column<string>(type: "text", nullable: false),
                    Ts = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Severity = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alerts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OperatorActions",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ts = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    OperatorId = table.Column<string>(type: "text", nullable: false),
                    TurbineId = table.Column<string>(type: "text", nullable: false),
                    FarmId = table.Column<string>(type: "text", nullable: false),
                    CommandType = table.Column<string>(type: "text", nullable: false),
                    PayloadJson = table.Column<string>(type: "text", nullable: false),
                    Result = table.Column<int>(type: "integer", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperatorActions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Telemetry",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TurbineId = table.Column<string>(type: "text", nullable: false),
                    FarmId = table.Column<string>(type: "text", nullable: false),
                    Ts = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    WindSpeed = table.Column<double>(type: "double precision", nullable: false),
                    WindDirection = table.Column<double>(type: "double precision", nullable: false),
                    AmbientTemperature = table.Column<double>(type: "double precision", nullable: false),
                    RotorSpeed = table.Column<double>(type: "double precision", nullable: false),
                    PowerOutput = table.Column<double>(type: "double precision", nullable: false),
                    NacelleDirection = table.Column<double>(type: "double precision", nullable: false),
                    BladePitch = table.Column<double>(type: "double precision", nullable: false),
                    RawJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Telemetry", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Turbines",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    FarmId = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turbines", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_Status_Severity_Ts",
                table: "Alerts",
                columns: new[] { "Status", "Severity", "Ts" });

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_TurbineId_Ts",
                table: "Alerts",
                columns: new[] { "TurbineId", "Ts" });

            migrationBuilder.CreateIndex(
                name: "IX_OperatorActions_TurbineId_Ts",
                table: "OperatorActions",
                columns: new[] { "TurbineId", "Ts" });

            migrationBuilder.CreateIndex(
                name: "IX_Telemetry_TurbineId_Ts",
                table: "Telemetry",
                columns: new[] { "TurbineId", "Ts" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Alerts");

            migrationBuilder.DropTable(
                name: "OperatorActions");

            migrationBuilder.DropTable(
                name: "Telemetry");

            migrationBuilder.DropTable(
                name: "Turbines");
        }
    }
}
