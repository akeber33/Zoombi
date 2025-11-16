using System.Text.Json.Serialization;

namespace ZoombiAPI.DTOs
{
    public class LoginDTO
    {
        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("password")]
        public string Password { get; set; } = string.Empty;
    }
}
