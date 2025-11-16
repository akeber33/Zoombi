using System.Text.Json.Serialization;

namespace ZoombiAPI.Models
{
    public class Aula
    {
        public int Id { get; set; }
        public int MateriaId { get; set; }
        public DateTime DataAula { get; set; }
        public bool Presente { get; set; } = false;
        public string? Observacoes { get; set; }
        
        [JsonIgnore]
        public virtual Materia? Materia { get; set; }
    }
}