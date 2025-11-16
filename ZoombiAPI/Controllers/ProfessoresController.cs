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

        [HttpPost]
        public async Task<ActionResult<Professor>> CreateProfessor(Professor professor)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            professor.UsuarioId = userId!;
            
            _context.Professores.Add(professor);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProfessores), new { id = professor.Id }, professor);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProfessor(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var professor = await _context.Professores
                .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == userId);

            if (professor == null) return NotFound();

            _context.Professores.Remove(professor);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}