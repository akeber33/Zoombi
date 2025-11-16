using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ZoombiAPI.Data;
using ZoombiAPI.Models;

namespace ZoombiAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public UsuariosController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet("perfil")]
        public async Task<ActionResult<Usuario>> GetPerfil()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[USUARIOS] Buscando perfil para usuário: {userId}");
                
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Id.ToString() == userId);
                    
                if (usuario == null)
                {
                    Console.WriteLine($"[USUARIOS] Usuário não encontrado - ID: {userId}");
                    return NotFound(new { message = "Usuário não encontrado" });
                }
                
                // Não retornar a senha
                usuario.SenhaHash = string.Empty;
                
                return usuario;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[USUARIOS] Erro ao buscar perfil: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpPut("perfil")]
        public async Task<IActionResult> UpdatePerfil([FromBody] UpdatePerfilDTO dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[USUARIOS] ========== ATUALIZAR PERFIL ==========");
                Console.WriteLine($"[USUARIOS] UserId: {userId}");
                Console.WriteLine($"[USUARIOS] Nome: {dto.Nome}");
                Console.WriteLine($"[USUARIOS] Telefone: {dto.Telefone}");
                
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Id.ToString() == userId);
                    
                if (usuario == null)
                {
                    Console.WriteLine($"[USUARIOS] Usuário não encontrado - ID: {userId}");
                    return NotFound(new { message = "Usuário não encontrado" });
                }
                
                if (!string.IsNullOrWhiteSpace(dto.Nome))
                {
                    usuario.Nome = dto.Nome;
                }
                
                if (dto.Telefone != null)
                {
                    usuario.Telefone = dto.Telefone;
                }
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[USUARIOS] ✅ Perfil atualizado com sucesso");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[USUARIOS] ❌ Erro ao atualizar perfil: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
    
    public class UpdatePerfilDTO
    {
        public string Nome { get; set; } = string.Empty;
        public string? Telefone { get; set; }
    }
}