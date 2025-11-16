using System.Text.Json.Serialization;

namespace ZoombiAPI.Models
{
    public class Anotacao
    {
        public int Id { get; set; }
        public string Titulo { get; set; } = string.Empty;
        public string Conteudo { get; set; } = string.Empty;
        public int? MateriaId { get; set; }
        public string UsuarioId { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
        public DateTime DataAtualizacao { get; set; } = DateTime.UtcNow;
        
        [JsonIgnore]
        public virtual Materia? Materia { get; set; }
        
        [JsonIgnore]
        public virtual Usuario? Usuario { get; set; }
    }
}