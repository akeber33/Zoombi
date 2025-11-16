using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ZoombiAPI.DTOs;
using ZoombiAPI.Data;
using ZoombiAPI.Models;

namespace ZoombiAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult> GetDashboard()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "Usuário não autenticado" });
            }

            var materias = await _context.Materias
                .Include(m => m.Professor)
                .Include(m => m.Aulas)
                .Include(m => m.Trabalhos)
                .Where(m => m.UsuarioId == userId)
                .ToListAsync();

            var professores = await _context.Professores
                .Where(p => p.UsuarioId == userId)
                .ToListAsync();

            var totalAulas = materias.Sum(m => m.Aulas.Count);
            var aulasPresentes = materias.Sum(m => m.Aulas.Count(a => a.Presente));
            var totalTrabalhos = materias.Sum(m => m.Trabalhos.Count);
            var trabalhosConcluidos = materias.Sum(m => m.Trabalhos.Count(t => t.Concluido));

            var frequenciaGeral = totalAulas > 0 ? (double)aulasPresentes / totalAulas * 100 : 0;
            var percentualTrabalhos = totalTrabalhos > 0 ? (double)trabalhosConcluidos / totalTrabalhos * 100 : 0;
            var pontuacaoGeral = (frequenciaGeral + percentualTrabalhos) / 2;

            var dashboard = new DashboardDTO
            {
                MetricasProgresso = new MetricasProgressoDTO
                {
                    FrequenciaGeral = Math.Round(frequenciaGeral, 0),
                    AulasPresentes = aulasPresentes,
                    TotalAulas = totalAulas,
                    PercentualTrabalhos = Math.Round(percentualTrabalhos, 0),
                    TrabalhosConcluidos = trabalhosConcluidos,
                    TotalTrabalhos = totalTrabalhos,
                    PontuacaoGeral = Math.Round(pontuacaoGeral, 0)
                },
                MateriasResumidas = materias.Select(m => new MateriaResumoDTO
                {
                    Id = m.Id,
                    Nome = m.Nome,
                    Cor = m.Cor,
                    NomeProfessor = m.Professor?.Nome ?? "",
                    Nota = CalcularNotaMateria(m),
                    FrequenciaPresente = m.Aulas.Count(a => a.Presente),
                    FrequenciaTotal = m.Aulas.Count,
                    TrabalhosConcluidos = m.Trabalhos.Count(t => t.Concluido),
                    TrabalhosTotal = m.Trabalhos.Count
                }).ToList(),
                Professores = professores.Select(p => new ProfessorDTO
                {
                    Id = p.Id,
                    Nome = p.Nome,
                    Email = p.Email,
                    Disciplina = p.Disciplina ?? ""
                }).ToList()
            };

            return Ok(dashboard);
        }

        private double CalcularNotaMateria(Materia materia)
        {
            var freq = materia.Aulas.Count > 0
                ? (double)materia.Aulas.Count(a => a.Presente) / materia.Aulas.Count * 100
                : 0;

            var trab = materia.Trabalhos.Count > 0
                ? (double)materia.Trabalhos.Count(t => t.Concluido) / materia.Trabalhos.Count * 100
                : 0;

            return Math.Round((freq + trab) / 20, 1); // Escala de 0-10
        }
    }
}
