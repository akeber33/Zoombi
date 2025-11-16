using System.Text.Json.Serialization;

namespace ZoombiAPI.DTOs
{
    public class AuthResponseDTO
    {
        [JsonPropertyName("token")]
        public string Token { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("nomeCompleto")]
        public string NomeCompleto { get; set; } = string.Empty;

        [JsonPropertyName("userId")]
        public int UserId { get; set; }
    }
}
