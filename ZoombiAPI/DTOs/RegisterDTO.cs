using System.Text.Json.Serialization;

namespace ZoombiAPI.DTOs
{
    public class RegisterDTO
    {
        [JsonPropertyName("nomeCompleto")]
        public string NomeCompleto { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;
    }
}
