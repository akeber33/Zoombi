using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ZoombiAPI.Data;
using ZoombiAPI.Models;

namespace ZoombiAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AnotacoesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        
        public AnotacoesController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Anotacao>>> GetAnotacoes()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[ANOTACOES] Buscando anotações para usuário: {userId}");
                
                var anotacoes = await _context.Anotacoes
                    .Include(a => a.Materia)
                    .Where(a => a.UsuarioId == userId)
                    .ToListAsync();
                    
                Console.WriteLine($"[ANOTACOES] Encontradas {anotacoes.Count} anotações");
                return anotacoes;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ANOTACOES] Erro ao buscar: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<Anotacao>> GetAnotacao(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var anotacao = await _context.Anotacoes
                    .Include(a => a.Materia)
                    .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == userId);
                    
                if (anotacao == null) return NotFound();
                
                return anotacao;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ANOTACOES] Erro ao buscar anotação {id}: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpPost]
        public async Task<ActionResult<Anotacao>> CreateAnotacao([FromBody] Anotacao anotacao)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[ANOTACOES] Criando anotação - UserId: {userId}");
                Console.WriteLine($"[ANOTACOES] Dados recebidos: Titulo={anotacao.Titulo}, MateriaId={anotacao.MateriaId}");
                
                anotacao.UsuarioId = userId!;
                anotacao.DataCriacao = DateTime.UtcNow;
                anotacao.DataAtualizacao = DateTime.UtcNow;
                
                _context.Anotacoes.Add(anotacao);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ANOTACOES] Anotação criada com sucesso - ID: {anotacao.Id}");
                return CreatedAtAction(nameof(GetAnotacao), new { id = anotacao.Id }, anotacao);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ANOTACOES] Erro ao criar: {ex.Message}");
                Console.WriteLine($"[ANOTACOES] StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = ex.Message, detail = ex.StackTrace });
            }
        }
        
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAnotacao(int id, [FromBody] Anotacao anotacao)
        {
            try
            {
                if (id != anotacao.Id)
                {
                    Console.WriteLine($"[ANOTACOES] ID mismatch: URL={id}, Body={anotacao.Id}");
                    return BadRequest(new { message = "ID não corresponde" });
                }
                
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existente = await _context.Anotacoes.FindAsync(id);
                
                if (existente == null || existente.UsuarioId != userId)
                {
                    Console.WriteLine($"[ANOTACOES] Anotação não encontrada ou sem permissão - ID: {id}");
                    return NotFound();
                }
                
                existente.Titulo = anotacao.Titulo;
                existente.Conteudo = anotacao.Conteudo;
                existente.MateriaId = anotacao.MateriaId;
                existente.DataAtualizacao = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ANOTACOES] Anotação atualizada - ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ANOTACOES] Erro ao atualizar {id}: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnotacao(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var anotacao = await _context.Anotacoes
                    .FirstOrDefaultAsync(a => a.Id == id && a.UsuarioId == userId);
                    
                if (anotacao == null)
                {
                    Console.WriteLine($"[ANOTACOES] Anotação não encontrada para deletar - ID: {id}");
                    return NotFound();
                }
                
                _context.Anotacoes.Remove(anotacao);
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"[ANOTACOES] Anotação deletada - ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ANOTACOES] Erro ao deletar {id}: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}