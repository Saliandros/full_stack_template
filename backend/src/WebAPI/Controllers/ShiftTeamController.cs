using System.Data.Common;
using Domain.DTO;
using Domain.Entities;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ShiftTeamController : ControllerBase
    {
        private readonly VagtplanDbContext _context;
        private readonly ILogger<ShiftTeamController> _logger;

        public ShiftTeamController(VagtplanDbContext context, ILogger<ShiftTeamController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var shiftTeams = await _context.ShiftTeams
                    .AsNoTracking()
                    .OrderBy(shiftTeam => shiftTeam.Name)
                    .Select(shiftTeam => new ShiftTeamDto
                    {
                        Id = shiftTeam.Id,
                        Name = shiftTeam.Name,
                    })
                    .ToListAsync();

                return Ok(shiftTeams);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving shift teams");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving shift teams");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ShiftTeamDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { message = "Navn er påkrævet." });
                }

                var shiftTeam = new ShiftTeam
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name.Trim(),
                };

                await _context.ShiftTeams.AddAsync(shiftTeam);
                await _context.SaveChangesAsync();

                return Ok(ToDto(shiftTeam));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating shift team");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating shift team");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ShiftTeamDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                if (string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new { message = "Navn er påkrævet." });
                }

                var shiftTeam = await _context.ShiftTeams.FindAsync(id);
                if (shiftTeam == null)
                {
                    return NotFound(new { message = "Vagtlaget blev ikke fundet." });
                }

                shiftTeam.Name = dto.Name.Trim();
                await _context.SaveChangesAsync();

                return Ok(ToDto(shiftTeam));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating shift team {ShiftTeamId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating shift team {ShiftTeamId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest(new { message = "Id blev ikke angivet." });
                }

                var shiftTeam = await _context.ShiftTeams.FindAsync(id);
                if (shiftTeam == null)
                {
                    return NotFound(new { message = "Vagtlaget blev ikke fundet." });
                }

                var hasLinkedEmployments = await _context.EmploymentPeriods
                    .AsNoTracking()
                    .AnyAsync(employment => employment.ShiftTeamId == id);

                if (hasLinkedEmployments)
                {
                    return Conflict(new
                    {
                        message = "Vagtlaget kan ikke slettes, fordi der findes tilknyttede ansættelser.",
                    });
                }

                _context.ShiftTeams.Remove(shiftTeam);
                await _context.SaveChangesAsync();

                return Ok(ToDto(shiftTeam));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting shift team {ShiftTeamId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting shift team {ShiftTeamId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static ShiftTeamDto ToDto(ShiftTeam shiftTeam) =>
            new()
            {
                Id = shiftTeam.Id,
                Name = shiftTeam.Name,
            };
    }
}
