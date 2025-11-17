using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoombiAPI.Migrations
{
    /// <inheritdoc />
    public partial class AdicionandoNotaProva : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "NotaProva",
                table: "Materias",
                type: "double",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NotaProva",
                table: "Materias");
        }
    }
}
