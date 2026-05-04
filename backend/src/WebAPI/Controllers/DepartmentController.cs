using Domain.DTO;
using Domain.Entities;
using Infrastructure.Mapping;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/departments")]
    public class DepartmentController : ControllerBase
    {
        private readonly VagtplanDbContext _context;
        private readonly ILogger<DepartmentController> _logger;

        public DepartmentController(VagtplanDbContext context, ILogger<DepartmentController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{departmentId}")]
        public async Task<IActionResult> GetDepartment(Guid departmentId)
        {
            try
            {
                if (departmentId == Guid.Empty)
                {
                    _logger.LogWarning("Department id was empty");
                    return NotFound(new { message = "Department id not found" });
                }

                var department = await _context.Departments
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x => x.Id == departmentId);

                if (department == null)
                {
                    _logger.LogWarning("Department {DepartmentId} not found", departmentId);
                    return NotFound(new { message = "Department not found" });
                }

                return Ok(department.ToDTO());
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred retrieving department {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving department {DepartmentId}", departmentId);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var departments = await _context.Departments
                    .AsNoTracking()
                    .OrderBy(department => department.Name)
                    .Select(department => new DepartmentAdminDto
                    {
                        Id = department.Id,
                        Name = department.Name,
                        Color = department.Address,
                    })
                    .ToListAsync();

                return Ok(departments);
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred retrieving list of departments");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving departments");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddDepartment([FromBody] DepartmentAdminDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Color))
                {
                    return BadRequest(new { message = "Navn og afdeling er påkrævet." });
                }

                var department = new Department
                {
                    Id = Guid.NewGuid(),
                    Name = dto.Name.Trim(),
                    Address = dto.Color.Trim(),
                    DepartmentTypeId = null,
                };

                await _context.Departments.AddAsync(department);
                await _context.SaveChangesAsync();

                return Ok(ToDepartmentAdminDto(department));
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating department");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating department");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateDepartment(Guid id, [FromBody] DepartmentAdminDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                if (string.IsNullOrWhiteSpace(dto.Name) || string.IsNullOrWhiteSpace(dto.Color))
                {
                    return BadRequest(new { message = "Navn og afdeling er påkrævet." });
                }

                var departmentToUpdate = await _context.Departments.FindAsync(id);
                if (departmentToUpdate == null)
                {
                    _logger.LogWarning("Department {DepartmentId} not found", id);
                    return BadRequest(new { message = "Det valgte afsnit blev ikke fundet." });
                }

                departmentToUpdate.Name = dto.Name.Trim();
                departmentToUpdate.Address = dto.Color.Trim();

                await _context.SaveChangesAsync();

                return Ok(ToDepartmentAdminDto(departmentToUpdate));
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while editing department");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error editing department");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteDepartment(Guid id)
        {
            try
            {
                if (id == Guid.Empty)
                {
                    _logger.LogWarning("Department id was empty");
                    return BadRequest(new { message = "Id blev ikke angivet." });
                }

                var departmentToDelete = await _context.Departments.FindAsync(id);
                if (departmentToDelete == null)
                {
                    _logger.LogWarning("Department {DepartmentId} not found", id);
                    return BadRequest(new { message = "Det valgte afsnit blev ikke fundet." });
                }

                var hasLinkedEmployments = await _context.EmploymentPeriods
                    .AsNoTracking()
                    .AnyAsync(employment => employment.DepartmentId == id);

                if (hasLinkedEmployments)
                {
                    return Conflict(new
                    {
                        message = "Afsnittet kan ikke slettes, fordi der findes tilknyttede ansættelser.",
                    });
                }

                _context.Departments.Remove(departmentToDelete);
                await _context.SaveChangesAsync();

                return Ok(ToDepartmentAdminDto(departmentToDelete));
            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting department");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting department");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static DepartmentAdminDto ToDepartmentAdminDto(Department department) =>
            new()
            {
                Id = department.Id,
                Name = department.Name,
                Color = department.Address,
            };
    }
}
