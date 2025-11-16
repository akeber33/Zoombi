using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ZoombiAPI.Data;
using ZoombiAPI.DTOs;
using ZoombiAPI.Models;

namespace ZoombiAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;
        
        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public IActionResult Register(RegisterDTO dto)
        {
            try
            {
                Console.WriteLine($"[AUTH] Tentativa de registro - Email: {dto.Email}");

                if (string.IsNullOrWhiteSpace(dto.NomeCompleto))
                {
                    Console.WriteLine("[AUTH] Erro: Nome completo não informado");
                    return BadRequest(new { message = "Nome completo é obrigatório" });
                }

                if (string.IsNullOrWhiteSpace(dto.Email))
                {
                    Console.WriteLine("[AUTH] Erro: Email não informado");
                    return BadRequest(new { message = "Email é obrigatório" });
                }

                if (string.IsNullOrWhiteSpace(dto.Password))
                {
                    Console.WriteLine("[AUTH] Erro: Senha não informada");
                    return BadRequest(new { message = "Senha é obrigatória" });
                }

                if (_context.Usuarios.Any(u => u.Email == dto.Email))
                {
                    Console.WriteLine($"[AUTH] Erro: Email já cadastrado - {dto.Email}");
                    return BadRequest(new { message = "Email já cadastrado" });
                }

                var usuario = new Usuario
                {
                    Nome = dto.NomeCompleto,
                    Email = dto.Email,
                    SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
                };

                _context.Usuarios.Add(usuario);
                _context.SaveChanges();

                Console.WriteLine($"[AUTH] Usuário criado com sucesso - ID: {usuario.Id}");

                var token = GenerateJwtToken(usuario);

                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("[AUTH] Erro: Falha ao gerar token JWT");
                    return StatusCode(500, new { message = "Erro ao gerar token de autenticação" });
                }

                Console.WriteLine($"[AUTH] Token gerado com sucesso para usuário ID: {usuario.Id}");

                var response = new AuthResponseDTO
                {
                    Token = token,
                    Email = usuario.Email,
                    NomeCompleto = usuario.Nome,
                    UserId = usuario.Id
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Exceção durante registro: {ex.Message}");
                Console.WriteLine($"[AUTH] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Erro interno do servidor", detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login(LoginDTO dto)
        {
            try
            {
                Console.WriteLine($"[AUTH] Tentativa de login - Email: {dto.Email}");

                if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                {
                    Console.WriteLine("[AUTH] Erro: Email ou senha não informados");
                    return BadRequest(new { message = "Email e senha são obrigatórios" });
                }

                var usuario = _context.Usuarios.FirstOrDefault(u => u.Email == dto.Email);

                if (usuario == null)
                {
                    Console.WriteLine($"[AUTH] Erro: Usuário não encontrado - {dto.Email}");
                    return Unauthorized(new { message = "Email ou senha inválidos" });
                }

                if (!BCrypt.Net.BCrypt.Verify(dto.Password, usuario.SenhaHash))
                {
                    Console.WriteLine($"[AUTH] Erro: Senha incorreta para - {dto.Email}");
                    return Unauthorized(new { message = "Email ou senha inválidos" });
                }

                var token = GenerateJwtToken(usuario);

                if (string.IsNullOrEmpty(token))
                {
                    Console.WriteLine("[AUTH] Erro: Falha ao gerar token JWT");
                    return StatusCode(500, new { message = "Erro ao gerar token de autenticação" });
                }

                Console.WriteLine($"[AUTH] Login bem-sucedido - Usuário ID: {usuario.Id}");

                return Ok(new AuthResponseDTO
                {
                    Token = token,
                    Email = usuario.Email,
                    NomeCompleto = usuario.Nome,
                    UserId = usuario.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Exceção durante login: {ex.Message}");
                Console.WriteLine($"[AUTH] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Erro interno do servidor", detail = ex.Message });
            }
        }

        private string GenerateJwtToken(Usuario usuario)
        {
            try
            {
                var jwtKey = _config["Jwt:Key"];
                if (string.IsNullOrEmpty(jwtKey))
                {
                    Console.WriteLine("[AUTH] ERRO CRÍTICO: Jwt:Key não configurada no appsettings.json");
                    return string.Empty;
                }

                var key = Encoding.ASCII.GetBytes(jwtKey);
                var tokenHandler = new JwtSecurityTokenHandler();

                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
                    new Claim(ClaimTypes.Email, usuario.Email),
                    new Claim(ClaimTypes.Name, usuario.Nome)
                };

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddDays(7),
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature
                    ),
                    Issuer = _config["Jwt:Issuer"],
                    Audience = _config["Jwt:Audience"]
                };

                var token = tokenHandler.CreateToken(tokenDescriptor);
                var tokenString = tokenHandler.WriteToken(token);

                Console.WriteLine($"[AUTH] Token gerado: {tokenString.Substring(0, Math.Min(20, tokenString.Length))}...");

                return tokenString;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AUTH] Erro ao gerar token JWT: {ex.Message}");
                return string.Empty;
            }
        }
    }
}