using System.Text.Json.Serialization;

namespace ZoombiAPI.Models
{
    public class Trabalho
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public DateTime DataEntrega { get; set; }
        public bool Concluido { get; set; } = false;
        public int MateriaId { get; set; }
        
        [JsonIgnore]
        public virtual Materia? Materia { get; set; }
    }
}