using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ZoombiAPI.Migrations
{
    /// <inheritdoc />
    public partial class NovosModelos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Anotacoes_Usuarios_UsuarioId1",
                table: "Anotacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Materias_Usuarios_UsuarioId1",
                table: "Materias");

            migrationBuilder.DropForeignKey(
                name: "FK_Professores_Usuarios_UsuarioId1",
                table: "Professores");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Professores",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Materias",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Anotacoes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Anotacoes_Usuarios_UsuarioId1",
                table: "Anotacoes",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Materias_Usuarios_UsuarioId1",
                table: "Materias",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Professores_Usuarios_UsuarioId1",
                table: "Professores",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Anotacoes_Usuarios_UsuarioId1",
                table: "Anotacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_Materias_Usuarios_UsuarioId1",
                table: "Materias");

            migrationBuilder.DropForeignKey(
                name: "FK_Professores_Usuarios_UsuarioId1",
                table: "Professores");

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Professores",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Materias",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UsuarioId1",
                table: "Anotacoes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Anotacoes_Usuarios_UsuarioId1",
                table: "Anotacoes",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Materias_Usuarios_UsuarioId1",
                table: "Materias",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Professores_Usuarios_UsuarioId1",
                table: "Professores",
                column: "UsuarioId1",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
