using Microsoft.EntityFrameworkCore;
using ZoombiAPI.Models;

namespace ZoombiAPI.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Materia> Materias { get; set; }
        public DbSet<Professor> Professores { get; set; }
        public DbSet<Aula> Aulas { get; set; }
        public DbSet<Trabalho> Trabalhos { get; set; }
        public DbSet<Anotacao> Anotacoes { get; set; }
    }
}
