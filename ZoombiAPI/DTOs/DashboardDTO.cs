using System.Text.Json.Serialization;
using ZoombiAPI.Models;

namespace ZoombiAPI.DTOs
{
    public class DashboardDTO
    {
        [JsonPropertyName("metricasProgresso")]
        public MetricasProgressoDTO MetricasProgresso { get; set; } = new();

        [JsonPropertyName("materiasResumidas")]
        public List<MateriaResumoDTO> MateriasResumidas { get; set; } = new();

        [JsonPropertyName("professores")]
        public List<ProfessorDTO> Professores { get; set; } = new();
    }

    public class MetricasProgressoDTO
    {
        [JsonPropertyName("frequenciaGeral")]
        public double FrequenciaGeral { get; set; }

        [JsonPropertyName("aulasPresentes")]
        public int AulasPresentes { get; set; }

        [JsonPropertyName("totalAulas")]
        public int TotalAulas { get; set; }

        [JsonPropertyName("percentualTrabalhos")]
        public double PercentualTrabalhos { get; set; }

        [JsonPropertyName("trabalhosConcluidos")]
        public int TrabalhosConcluidos { get; set; }

        [JsonPropertyName("totalTrabalhos")]
        public int TotalTrabalhos { get; set; }

        [JsonPropertyName("pontuacaoGeral")]
        public double PontuacaoGeral { get; set; }
    }

    public class MateriaResumoDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nome")]
        public string Nome { get; set; } = string.Empty;

        [JsonPropertyName("cor")]
        public string Cor { get; set; } = string.Empty;

        [JsonPropertyName("nomeProfessor")]
        public string NomeProfessor { get; set; } = string.Empty;

        [JsonPropertyName("nota")]
        public double Nota { get; set; }

        [JsonPropertyName("frequenciaPresente")]
        public int FrequenciaPresente { get; set; }

        [JsonPropertyName("frequenciaTotal")]
        public int FrequenciaTotal { get; set; }

        [JsonPropertyName("trabalhosConcluidos")]
        public int TrabalhosConcluidos { get; set; }

        [JsonPropertyName("trabalhosTotal")]
        public int TrabalhosTotal { get; set; }
    }

    public class ProfessorDTO
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("nome")]
        public string Nome { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("disciplina")]
        public string Disciplina { get; set; } = string.Empty;
    }
}
