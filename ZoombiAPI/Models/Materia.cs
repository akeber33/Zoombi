using System.Text.Json.Serialization;
namespace ZoombiAPI.Models
{
    public class Materia
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cor { get; set; } = "#3B82F6";
        public int ProfessorId { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        public double NotaProva { get; set; } = 0; 
        
        [JsonIgnore]
        public virtual Professor? Professor { get; set; }
        
        [JsonIgnore]
        public virtual Usuario? Usuario { get; set; }
        
        [JsonIgnore]
        public virtual ICollection<Aula> Aulas { get; set; } = new List<Aula>();
        
        [JsonIgnore]
        public virtual ICollection<Trabalho> Trabalhos { get; set; } = new List<Trabalho>();
    }
}