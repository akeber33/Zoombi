using System.Text.Json.Serialization;

namespace ZoombiAPI.Models
{
    public class Professor
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Disciplina { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        
        [JsonIgnore]
        public virtual Usuario? Usuario { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Materia> Materias { get; set; } = new List<Materia>();
    }
}