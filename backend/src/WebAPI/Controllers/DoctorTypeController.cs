using System.Data.Common;
using Domain.DTO;
using Domain.Entities;
using Infrastructure.Mapping;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorTypeController : ControllerBase
    {
        private readonly VagtplanDbContext _context;
        private readonly ILogger<DoctorTypeController> _logger;

        public DoctorTypeController(VagtplanDbContext context, ILogger<DoctorTypeController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{doctorTypeId}")]
        public async Task<IActionResult> GetById(Guid doctorTypeId)
        {
            try
            {
                var doctorType = await _context.DoctorTypes
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == doctorTypeId);

                if (doctorType == null)
                {
                    _logger.LogWarning("Doctor type {DoctorTypeId} not found", doctorTypeId);
                    return NotFound(new { message = "Doctor type not found" });
                }

                return Ok(doctorType.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving doctor type {DoctorTypeId}", doctorTypeId);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving doctor type {DoctorTypeId}", doctorTypeId);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var doctorTypes = await _context.DoctorTypes
                    .AsNoTracking()
                    .ToListAsync();

                if (!doctorTypes.Any())
                {
                    _logger.LogWarning("No doctor types found");
                    return NotFound(new { message = "No doctor types found" });
                }

                return Ok(doctorTypes);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving doctor types");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving doctor types");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("personnel-groups")]
        public async Task<IActionResult> GetPersonnelGroups()
        {
            try
            {
                var groups = await _context.DoctorTypes
                    .AsNoTracking()
                    .OrderBy(group => group.Name)
                    .Select(group => new PersonnelGroupDto
                    {
                        Id = group.Id,
                        Name = group.Name,
                    })
                    .ToListAsync();

                return Ok(groups);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving personnel groups");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving personnel groups");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("personnel-groups")]
        public async Task<IActionResult> CreatePersonnelGroup([FromBody] PersonnelGroupDto dto)
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

                var doctorType = new DoctorType
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name.Trim(),
                    Abbreviation = CreateAbbreviation(dto.Name),
                    DepartmentId = null,
                };

                await _context.DoctorTypes.AddAsync(doctorType);
                await _context.SaveChangesAsync();

                return Ok(ToPersonnelGroupDto(doctorType));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating personnel group");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating personnel group");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("personnel-groups/{id:guid}")]
        public async Task<IActionResult> UpdatePersonnelGroup(Guid id, [FromBody] PersonnelGroupDto dto)
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

                var doctorType = await _context.DoctorTypes.FindAsync(id);
                if (doctorType == null)
                {
                    return NotFound(new { message = "Personalegruppen blev ikke fundet." });
                }

                doctorType.Name = dto.Name.Trim();
                doctorType.Abbreviation = CreateAbbreviation(dto.Name);

                await _context.SaveChangesAsync();

                return Ok(ToPersonnelGroupDto(doctorType));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating personnel group {DoctorTypeId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating personnel group {DoctorTypeId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("personnel-groups/{id:guid}")]
        public async Task<IActionResult> DeletePersonnelGroup(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    return BadRequest(new { message = "Id blev ikke angivet." });
                }

                var doctorType = await _context.DoctorTypes.FindAsync(id);
                if (doctorType == null)
                {
                    return NotFound(new { message = "Personalegruppen blev ikke fundet." });
                }

                var hasLinkedEmployments = await _context.EmploymentPeriods
                    .AsNoTracking()
                    .AnyAsync(employment => employment.DoctorTypeId == id);

                if (hasLinkedEmployments)
                {
                    return Conflict(new
                    {
                        message = "Personalegruppen kan ikke slettes, fordi der findes tilknyttede ansættelser.",
                    });
                }

                _context.DoctorTypes.Remove(doctorType);
                await _context.SaveChangesAsync();

                return Ok(ToPersonnelGroupDto(doctorType));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting personnel group {DoctorTypeId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting personnel group {DoctorTypeId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("Add")]
        public async Task<IActionResult> Create([FromBody] DoctorTypeDTO entity)
        {
            try
            {
                if (entity == null)
                {
                    _logger.LogWarning("Entity was null");
                    return BadRequest(new { message = "Entity wasnt given" });
                }

                var doctorType = entity.ToEntity();

                await _context.DoctorTypes.AddAsync(doctorType);
                await _context.SaveChangesAsync();

                return Ok(doctorType.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating doctor type");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating doctor type");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] DoctorType entity)
        {
            try
            {
                var doctorType = await _context.DoctorTypes.FindAsync(entity.Id);

                if (doctorType == null)
                {
                    _logger.LogWarning("Doctor type {DoctorTypeId} not found", entity);
                    return NotFound(new { message = "Doctor type not found" });
                }

                doctorType.Name = entity.Name;
                doctorType.Abbreviation = entity.Abbreviation;
                doctorType.DepartmentId = entity.DepartmentId;

                await _context.SaveChangesAsync();

                return Ok(doctorType.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating doctor type {DoctorTypeId}", entity);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating doctor type {DoctorTypeId}", entity);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Id was empty.");
                    return BadRequest(new { message = "Id wasnt provided." });
                }

                var doctorType = await _context.DoctorTypes.FindAsync(id);

                if (doctorType == null)
                {
                    _logger.LogWarning("Doctor type {DoctorTypeId} not found", id);
                    return NotFound(new { message = "Doctor type not found" });
                }

                _context.DoctorTypes.Remove(doctorType);
                await _context.SaveChangesAsync();

                return Ok(doctorType.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting doctor type {DoctorTypeId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting doctor type {DoctorTypeId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static PersonnelGroupDto ToPersonnelGroupDto(DoctorType doctorType) =>
            new()
            {
                Id = doctorType.Id,
                Name = doctorType.Name,
            };

        private static string CreateAbbreviation(string name)
        {
            var abbreviation = string.Concat(
                name.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Take(3)
                    .Select(part => char.ToUpperInvariant(part[0])));

            if (!string.IsNullOrWhiteSpace(abbreviation))
            {
                return abbreviation[..Math.Min(10, abbreviation.Length)];
            }

            var trimmedName = name.Trim();
            return trimmedName[..Math.Min(10, trimmedName.Length)].ToUpperInvariant();
        }
    }
}
