using System;
using Infrastructure.Persistence.Contexts;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    [DbContext(typeof(VagtplanDbContext))]
    [Migration("20260504120000_add_shiftteam_and_employment_admin_fields")]
    public partial class add_shiftteam_and_employment_admin_fields : Migration
    {
        private static readonly Guid ForvagtId = new("11111111-1111-1111-1111-111111111111");
        private static readonly Guid MellemvagtId = new("22222222-2222-2222-2222-222222222222");
        private static readonly Guid BagvagtId = new("33333333-3333-3333-3333-333333333333");

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DepartmentId",
                table: "EmploymentPeriods",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DoctorTypeId",
                table: "EmploymentPeriods",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HoursPerWeek",
                table: "EmploymentPeriods",
                type: "int",
                nullable: false,
                defaultValue: 37);

            migrationBuilder.AddColumn<Guid>(
                name: "ShiftTeamId",
                table: "EmploymentPeriods",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShiftTeams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftTeams", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "ShiftTeams",
                columns: new[] { "Id", "Name", "CreatedAt" },
                values: new object[,]
                {
                    { ForvagtId, "Forvagt", new DateTime(2026, 5, 4, 12, 0, 0, DateTimeKind.Utc) },
                    { MellemvagtId, "Mellemvagt", new DateTime(2026, 5, 4, 12, 0, 0, DateTimeKind.Utc) },
                    { BagvagtId, "Bagvagt", new DateTime(2026, 5, 4, 12, 0, 0, DateTimeKind.Utc) },
                });

            migrationBuilder.Sql($@"
                UPDATE ep
                SET
                    ep.DepartmentId = u.DepartmentId,
                    ep.DoctorTypeId = u.DoctorTypeId,
                    ep.ShiftTeamId = '{ForvagtId}'
                FROM EmploymentPeriods ep
                INNER JOIN AspNetUsers u ON u.Id = ep.UserId
            ");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentPeriods_DepartmentId",
                table: "EmploymentPeriods",
                column: "DepartmentId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentPeriods_DoctorTypeId",
                table: "EmploymentPeriods",
                column: "DoctorTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentPeriods_ShiftTeamId",
                table: "EmploymentPeriods",
                column: "ShiftTeamId");

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentPeriods_Departments_DepartmentId",
                table: "EmploymentPeriods",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentPeriods_DoctorTypes_DoctorTypeId",
                table: "EmploymentPeriods",
                column: "DoctorTypeId",
                principalTable: "DoctorTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentPeriods_ShiftTeams_ShiftTeamId",
                table: "EmploymentPeriods",
                column: "ShiftTeamId",
                principalTable: "ShiftTeams",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentPeriods_Departments_DepartmentId",
                table: "EmploymentPeriods");

            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentPeriods_DoctorTypes_DoctorTypeId",
                table: "EmploymentPeriods");

            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentPeriods_ShiftTeams_ShiftTeamId",
                table: "EmploymentPeriods");

            migrationBuilder.DropTable(
                name: "ShiftTeams");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentPeriods_DepartmentId",
                table: "EmploymentPeriods");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentPeriods_DoctorTypeId",
                table: "EmploymentPeriods");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentPeriods_ShiftTeamId",
                table: "EmploymentPeriods");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "EmploymentPeriods");

            migrationBuilder.DropColumn(
                name: "DoctorTypeId",
                table: "EmploymentPeriods");

            migrationBuilder.DropColumn(
                name: "HoursPerWeek",
                table: "EmploymentPeriods");

            migrationBuilder.DropColumn(
                name: "ShiftTeamId",
                table: "EmploymentPeriods");
        }
    }
}
