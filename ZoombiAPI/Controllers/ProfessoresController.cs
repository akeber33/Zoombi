using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ZoombiAPI.Data;
using ZoombiAPI.Models;

namespace Zoombi.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfessoresController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfessoresController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Professor>>> GetProfessores()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Professores
                .Where(p => p.UsuarioId == userId)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Professor>> GetProfessor(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var professor = await _context.Professores
                .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

            if (professor == null) return NotFound();

            return professor;
        }

        [HttpPost]
        public async Task<ActionResult<Professor>> CreateProfessor([FromBody] CreateProfessorRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[PROFESSORES] ========== CRIAR PROFESSOR ==========");
                Console.WriteLine($"[PROFESSORES] UserId: {userId}");
                Console.WriteLine($"[PROFESSORES] Nome: {request.Nome}");
                Console.WriteLine($"[PROFESSORES] Email: {request.Email}");

                var professor = new Professor
                {
                    Nome = request.Nome,
                    Email = request.Email,
                    Disciplina = request.Disciplina,
                    UsuarioId = userId!
                };

                _context.Professores.Add(professor);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[PROFESSORES] ✅ Professor criado - ID: {professor.Id}");
                return CreatedAtAction(nameof(GetProfessor), new { id = professor.Id }, professor);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PROFESSORES] ❌ Erro: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfessor(int id, [FromBody] UpdateProfessorRequest request)
        {
            try
            {
                if (id != request.Id) return BadRequest(new { message = "ID não corresponde" });

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existente = await _context.Professores.FindAsync(id);

                if (existente == null || existente.UsuarioId != userId)
                {
                    Console.WriteLine($"[PROFESSORES] Professor não encontrado - ID: {id}");
                    return NotFound();
                }

                Console.WriteLine($"[PROFESSORES] ========== ATUALIZAR PROFESSOR ==========");
                Console.WriteLine($"[PROFESSORES] ID: {id}");
                Console.WriteLine($"[PROFESSORES] Nome: {request.Nome}");

                existente.Nome = request.Nome;
                existente.Email = request.Email;
                existente.Disciplina = request.Disciplina;

                await _context.SaveChangesAsync();

                Console.WriteLine($"[PROFESSORES] ✅ Professor atualizado");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PROFESSORES] ❌ Erro: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfessor(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var professor = await _context.Professores
                    .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

                if (professor == null)
                {
                    Console.WriteLine($"[PROFESSORES] Professor não encontrado - ID: {id}");
                    return NotFound();
                }

                _context.Professores.Remove(professor);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[PROFESSORES] ✅ Professor deletado - ID: {id}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PROFESSORES] ❌ Erro: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateProfessorRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Disciplina { get; set; }
    }

    public class UpdateProfessorRequest
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Disciplina { get; set; }
    }
}