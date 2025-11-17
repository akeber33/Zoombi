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
    public class MateriasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MateriasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Materia>>> GetMaterias()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Materias
                .Include(m => m.Professor)
                .Include(m => m.Aulas)
                .Include(m => m.Trabalhos)
                .Where(m => m.UsuarioId == userId)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Materia>> GetMateria(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var materia = await _context.Materias
                .Include(m => m.Professor)
                .Include(m => m.Aulas)
                .Include(m => m.Trabalhos)
                .FirstOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId);

            if (materia == null) return NotFound();

            return materia;
        }

        [HttpPost]
        public async Task<ActionResult<Materia>> CreateMateria([FromBody] CreateMateriaRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                Console.WriteLine($"[MATERIAS] ========== CRIAR MATÉRIA ==========");
                Console.WriteLine($"[MATERIAS] UserId: {userId}");
                Console.WriteLine($"[MATERIAS] Nome: {request.Nome}");
                Console.WriteLine($"[MATERIAS] ProfessorId: {request.ProfessorId}");

                var materia = new Materia
                {
                    Nome = request.Nome,
                    Cor = request.Cor,
                    ProfessorId = request.ProfessorId,
                    UsuarioId = userId!,
                    NotaProva = request.NotaProva ?? 0
                };

                _context.Materias.Add(materia);
                await _context.SaveChangesAsync();

                // Se tiver dados iniciais de aulas/trabalhos, adicionar
                if (request.TotalAulas.HasValue && request.TotalAulas.Value > 0)
                {
                    for (int i = 0; i < request.TotalAulas.Value; i++)
                    {
                        var aula = new Aula
                        {
                            MateriaId = materia.Id,
                            DataAula = DateTime.UtcNow.AddDays(-i),
                            Presente = i < (request.AulasPresentes ?? 0)
                        };
                        _context.Aulas.Add(aula);
                    }
                }

                if (request.TotalTrabalhos.HasValue && request.TotalTrabalhos.Value > 0)
                {
                    for (int i = 0; i < request.TotalTrabalhos.Value; i++)
                    {
                        var trabalho = new Trabalho
                        {
                            MateriaId = materia.Id,
                            Titulo = $"Trabalho {i + 1}",
                            DataEntrega = DateTime.UtcNow.AddDays(7 * (i + 1)),
                            Concluido = i < (request.TrabalhosConcluidos ?? 0)
                        };
                        _context.Trabalhos.Add(trabalho);
                    }
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"[MATERIAS] ✅ Matéria criada - ID: {materia.Id}");

                // Recarregar com includes
                materia = await _context.Materias
                    .Include(m => m.Professor)
                    .Include(m => m.Aulas)
                    .Include(m => m.Trabalhos)
                    .FirstAsync(m => m.Id == materia.Id);

                return CreatedAtAction(nameof(GetMateria), new { id = materia.Id }, materia);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MATERIAS] ❌ Erro: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMateria(int id, [FromBody] UpdateMateriaRequest request)
        {
            try
            {
                if (id != request.Id) return BadRequest();

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var existente = await _context.Materias.FindAsync(id);

                if (existente == null || existente.UsuarioId != userId)
                    return NotFound();

                Console.WriteLine($"[MATERIAS] ========== ATUALIZAR MATÉRIA ==========");
                Console.WriteLine($"[MATERIAS] ID: {id}");
                Console.WriteLine($"[MATERIAS] Nome: {request.Nome}");
                Console.WriteLine($"[MATERIAS] NotaProva recebida: {request.NotaProva}");

                existente.Nome = request.Nome;
                existente.Cor = request.Cor;
                existente.ProfessorId = request.ProfessorId;

                // CORREÇÃO: Só atualiza a nota se foi fornecida
                if (request.NotaProva.HasValue)
                {
                    existente.NotaProva = request.NotaProva.Value;
                    Console.WriteLine($"[MATERIAS] Nota atualizada para: {request.NotaProva.Value}");
                }
                else
                {
                    Console.WriteLine($"[MATERIAS] Nota não foi alterada (valor atual: {existente.NotaProva})");
                }

                await _context.SaveChangesAsync();

                Console.WriteLine($"[MATERIAS] ✅ Matéria atualizada");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MATERIAS] ❌ Erro: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMateria(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var materia = await _context.Materias
                .FirstOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId);

            if (materia == null) return NotFound();

            _context.Materias.Remove(materia);
            await _context.SaveChangesAsync();

            Console.WriteLine($"[MATERIAS] ✅ Matéria deletada - ID: {id}");
            return NoContent();
        }

    [HttpPost("{id}/presenca")]
public async Task<ActionResult<Materia>> RegistrarPresenca(int id)
{
    try
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var materia = await _context.Materias
            .Include(m => m.Aulas)
            .Include(m => m.Professor)
            .Include(m => m.Trabalhos)
            .FirstOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId);
        
        if (materia == null) return NotFound();
        
        // Apenas adiciona uma aula - NÃO MEXE NA NOTA!
        var novaAula = new Aula
        {
            MateriaId = id,
            DataAula = DateTime.UtcNow,
            Presente = true
        };
        
        _context.Aulas.Add(novaAula);
        await _context.SaveChangesAsync();
        
        Console.WriteLine($"[MATERIAS] ✅ Presença registrada - Matéria ID: {id}");
        return Ok(materia);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MATERIAS] ❌ Erro ao registrar presença: {ex.Message}");
        return StatusCode(500, new { message = ex.Message });
    }
}

        // NOVO: Adicionar trabalho
        [HttpPost("{id}/trabalhos")]
        public async Task<ActionResult<Trabalho>> AdicionarTrabalho(int id, [FromBody] CreateTrabalhoRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var materia = await _context.Materias
                    .FirstOrDefaultAsync(m => m.Id == id && m.UsuarioId == userId);

                if (materia == null) return NotFound();

                var trabalho = new Trabalho
                {
                    MateriaId = id,
                    Titulo = request.Titulo,
                    Descricao = request.Descricao,
                    DataEntrega = request.DataEntrega,
                    Concluido = request.Concluido
                };

                _context.Trabalhos.Add(trabalho);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[MATERIAS] ✅ Trabalho adicionado - ID: {trabalho.Id}");
                return CreatedAtAction(nameof(GetMateria), new { id = materia.Id }, trabalho);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MATERIAS] ❌ Erro ao adicionar trabalho: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // NOVO: Atualizar trabalho
        [HttpPut("{materiaId}/trabalhos/{trabalhoId}")]
        public async Task<IActionResult> AtualizarTrabalho(int materiaId, int trabalhoId, [FromBody] UpdateTrabalhoRequest request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var materia = await _context.Materias
                    .FirstOrDefaultAsync(m => m.Id == materiaId && m.UsuarioId == userId);

                if (materia == null) return NotFound();

                var trabalho = await _context.Trabalhos
                    .FirstOrDefaultAsync(t => t.Id == trabalhoId && t.MateriaId == materiaId);

                if (trabalho == null) return NotFound();

                trabalho.Titulo = request.Titulo;
                trabalho.Descricao = request.Descricao;
                trabalho.DataEntrega = request.DataEntrega;
                trabalho.Concluido = request.Concluido;

                await _context.SaveChangesAsync();

                Console.WriteLine($"[MATERIAS] ✅ Trabalho atualizado - ID: {trabalhoId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MATERIAS] ❌ Erro ao atualizar trabalho: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // NOVO: Deletar trabalho
        [HttpDelete("{materiaId}/trabalhos/{trabalhoId}")]
        public async Task<IActionResult> DeletarTrabalho(int materiaId, int trabalhoId)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var materia = await _context.Materias
                    .FirstOrDefaultAsync(m => m.Id == materiaId && m.UsuarioId == userId);

                if (materia == null) return NotFound();

                var trabalho = await _context.Trabalhos
                    .FirstOrDefaultAsync(t => t.Id == trabalhoId && t.MateriaId == materiaId);

                if (trabalho == null) return NotFound();

                _context.Trabalhos.Remove(trabalho);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[MATERIAS] ✅ Trabalho deletado - ID: {trabalhoId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MATERIAS] ❌ Erro ao deletar trabalho: {ex.Message}");
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class CreateMateriaRequest
    {
        public string Nome { get; set; } = string.Empty;
        public string Cor { get; set; } = "#3B82F6";
        public int ProfessorId { get; set; }
        public int? TotalAulas { get; set; }
        public int? AulasPresentes { get; set; }
        public int? TotalTrabalhos { get; set; }
        public int? TrabalhosConcluidos { get; set; }
        public double? NotaProva { get; set; }
    }

    public class UpdateMateriaRequest
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cor { get; set; } = "#3B82F6";
        public int ProfessorId { get; set; }
        public double? NotaProva { get; set; }
    }

    public class CreateTrabalhoRequest
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public DateTime DataEntrega { get; set; }
        public bool Concluido { get; set; } = false;
    }

    public class UpdateTrabalhoRequest
    {
        public string Titulo { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public DateTime DataEntrega { get; set; }
        public bool Concluido { get; set; }
    }
}