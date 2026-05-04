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
    public class EmploymentPeriodController : ControllerBase
    {
        private const string StaffClaimType = "is_staff";

        private readonly VagtplanDbContext _context;
        private readonly ILogger<EmploymentPeriodController> _logger;

        public EmploymentPeriodController(VagtplanDbContext context, ILogger<EmploymentPeriodController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminEmploymentList()
        {
            try
            {
                var employments = await _context.EmploymentPeriods
                    .AsNoTracking()
                    .Include(employment => employment.User)
                    .Include(employment => employment.Department)
                    .Include(employment => employment.DoctorType)
                    .Include(employment => employment.ShiftTeam)
                    .OrderBy(employment => employment.User != null ? employment.User.FullName : string.Empty)
                    .ThenBy(employment => employment.StartDate)
                    .Select(employment => new EmploymentAdminDto
                    {
                        Id = employment.Id,
                        UserId = employment.UserId ?? Guid.Empty,
                        UserName = employment.User != null ? employment.User.FullName : string.Empty,
                        DepartmentId = employment.DepartmentId ?? Guid.Empty,
                        DepartmentName = employment.Department != null ? employment.Department.Name : string.Empty,
                        PersonnelGroupId = employment.DoctorTypeId ?? Guid.Empty,
                        PersonnelGroupName = employment.DoctorType != null ? employment.DoctorType.Name : string.Empty,
                        ShiftTeamId = employment.ShiftTeamId ?? Guid.Empty,
                        ShiftTeamName = employment.ShiftTeam != null ? employment.ShiftTeam.Name : string.Empty,
                        HoursPerWeek = employment.HoursPerWeek,
                        StartDate = employment.StartDate,
                        EndDate = employment.EndDate ?? employment.StartDate,
                    })
                    .ToListAsync();

                return Ok(employments);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving employment periods");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving employment periods");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("personnel")]
        public async Task<IActionResult> GetPersonnel([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                if (startDate.HasValue && endDate.HasValue && endDate.Value.Date < startDate.Value.Date)
                {
                    return BadRequest(new { message = "Slutdato skal være efter eller lig med startdato." });
                }

                var query = _context.EmploymentPeriods
                    .AsNoTracking()
                    .Include(employment => employment.User)
                    .Include(employment => employment.Department)
                    .Include(employment => employment.DoctorType)
                    .Include(employment => employment.ShiftTeam)
                    .Where(employment => employment.User != null &&
                        employment.Department != null &&
                        employment.DoctorType != null &&
                        employment.ShiftTeam != null);

                if (startDate.HasValue)
                {
                    var filterStart = startDate.Value.Date;
                    query = query.Where(employment =>
                        (employment.EndDate ?? DateTime.MaxValue).Date >= filterStart);
                }

                if (endDate.HasValue)
                {
                    var filterEnd = endDate.Value.Date;
                    query = query.Where(employment => employment.StartDate.Date <= filterEnd);
                }

                var personnel = await query
                    .OrderBy(employment => employment.User!.FullName)
                    .ThenBy(employment => employment.StartDate)
                    .Select(employment => new PersonnelRowDto
                    {
                        Name = employment.User!.FullName,
                        DepartmentName = employment.Department!.Name,
                        PersonnelGroupName = employment.DoctorType!.Name,
                        ShiftTeamName = employment.ShiftTeam!.Name,
                        HoursPerWeek = employment.HoursPerWeek,
                        StartDate = employment.StartDate,
                        EndDate = employment.EndDate ?? employment.StartDate,
                    })
                    .ToListAsync();

                return Ok(personnel);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving personnel");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving personnel");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("admin")]
        public async Task<IActionResult> CreateAdminEmployment([FromBody] EmploymentAdminDto dto)
        {
            try
            {
                var validation = await ValidateEmploymentAsync(dto, null);
                if (validation != null)
                {
                    return validation;
                }

                var employment = new EmploymentPeriod
                {
                    Id = Guid.NewGuid(),
                    UserId = dto.UserId,
                    DepartmentId = dto.DepartmentId,
                    DoctorTypeId = dto.PersonnelGroupId,
                    ShiftTeamId = dto.ShiftTeamId,
                    HoursPerWeek = dto.HoursPerWeek,
                    StartDate = dto.StartDate.Date,
                    EndDate = dto.EndDate.Date,
                };

                await _context.EmploymentPeriods.AddAsync(employment);
                await _context.SaveChangesAsync();

                return Ok(await MapEmploymentAsync(employment.Id));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating employment period");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating employment period");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("admin/{id:guid}")]
        public async Task<IActionResult> UpdateAdminEmployment(Guid id, [FromBody] EmploymentAdminDto dto)
        {
            try
            {
                var existingEmployment = await _context.EmploymentPeriods.FirstOrDefaultAsync(employment => employment.Id == id);
                if (existingEmployment == null)
                {
                    return NotFound(new { message = "Ansættelsen blev ikke fundet." });
                }

                var validation = await ValidateEmploymentAsync(dto, id);
                if (validation != null)
                {
                    return validation;
                }

                existingEmployment.UserId = dto.UserId;
                existingEmployment.DepartmentId = dto.DepartmentId;
                existingEmployment.DoctorTypeId = dto.PersonnelGroupId;
                existingEmployment.ShiftTeamId = dto.ShiftTeamId;
                existingEmployment.HoursPerWeek = dto.HoursPerWeek;
                existingEmployment.StartDate = dto.StartDate.Date;
                existingEmployment.EndDate = dto.EndDate.Date;

                await _context.SaveChangesAsync();

                return Ok(await MapEmploymentAsync(existingEmployment.Id));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating employment period {EmploymentPeriodId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating employment period {EmploymentPeriodId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("admin/{id:guid}")]
        public async Task<IActionResult> DeleteAdminEmployment(Guid id)
        {
            try
            {
                var employment = await _context.EmploymentPeriods.FindAsync(id);
                if (employment == null)
                {
                    return NotFound(new { message = "Ansættelsen blev ikke fundet." });
                }

                _context.EmploymentPeriods.Remove(employment);
                await _context.SaveChangesAsync();

                return Ok(new { id });
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting employment period {EmploymentPeriodId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting employment period {EmploymentPeriodId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private async Task<IActionResult?> ValidateEmploymentAsync(EmploymentAdminDto dto, Guid? currentEmploymentId)
        {
            if (dto.UserId == Guid.Empty ||
                dto.DepartmentId == Guid.Empty ||
                dto.PersonnelGroupId == Guid.Empty ||
                dto.ShiftTeamId == Guid.Empty)
            {
                return BadRequest(new { message = "Alle felter skal udfyldes." });
            }

            if (dto.HoursPerWeek < 0 || dto.HoursPerWeek > 37)
            {
                return BadRequest(new { message = "Timer pr. uge skal være mellem 0 og 37." });
            }

            if (dto.EndDate.Date <= dto.StartDate.Date)
            {
                return BadRequest(new { message = "Slutdato skal være efter startdato." });
            }

            var userExists = await _context.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == dto.UserId);

            if (!userExists)
            {
                return BadRequest(new { message = "Den valgte person blev ikke fundet." });
            }

            var isStaffUser = await _context.UserClaims
                .AsNoTracking()
                .AnyAsync(claim =>
                    claim.UserId == dto.UserId &&
                    claim.ClaimType == StaffClaimType &&
                    (claim.ClaimValue == bool.TrueString || claim.ClaimValue == "true"));

            if (!isStaffUser)
            {
                return BadRequest(new { message = "Den valgte person skal have rollen Personale." });
            }

            var departmentExists = await _context.Departments
                .AsNoTracking()
                .AnyAsync(department => department.Id == dto.DepartmentId);
            var personnelGroupExists = await _context.DoctorTypes
                .AsNoTracking()
                .AnyAsync(group => group.Id == dto.PersonnelGroupId);
            var shiftTeamExists = await _context.ShiftTeams
                .AsNoTracking()
                .AnyAsync(shiftTeam => shiftTeam.Id == dto.ShiftTeamId);

            if (!departmentExists || !personnelGroupExists || !shiftTeamExists)
            {
                return BadRequest(new { message = "Et eller flere valgte felter blev ikke fundet." });
            }

            var overlappingEmployment = await _context.EmploymentPeriods
                .AsNoTracking()
                .Where(employment => employment.UserId == dto.UserId)
                .Where(employment => currentEmploymentId == null || employment.Id != currentEmploymentId)
                .Where(employment =>
                    employment.StartDate.Date <= dto.EndDate.Date &&
                    (employment.EndDate ?? DateTime.MaxValue).Date >= dto.StartDate.Date)
                .Select(employment => new
                {
                    employment.StartDate,
                    employment.EndDate,
                })
                .FirstOrDefaultAsync();

            if (overlappingEmployment != null)
            {
                var overlappingStart = overlappingEmployment.StartDate.ToString("dd-MM-yyyy");
                var overlappingEnd = overlappingEmployment.EndDate.HasValue
                    ? overlappingEmployment.EndDate.Value.ToString("dd-MM-yyyy")
                    : "løbende";

                return Conflict(new
                {
                    message =
                        $"Ansættelsen kan ikke gemmes, fordi perioden overlapper med en eksisterende ansættelse ({overlappingStart} - {overlappingEnd}). " +
                        "Ansættelsesperioder må ikke overlappe for samme person. Afslut eller redigér den eksisterende ansættelse først.",
                });
            }

            return null;
        }

        private async Task<EmploymentAdminDto> MapEmploymentAsync(Guid id)
        {
            var employment = await _context.EmploymentPeriods
                .AsNoTracking()
                .Include(item => item.User)
                .Include(item => item.Department)
                .Include(item => item.DoctorType)
                .Include(item => item.ShiftTeam)
                .FirstAsync(item => item.Id == id);

            return new EmploymentAdminDto
            {
                Id = employment.Id,
                UserId = employment.UserId ?? Guid.Empty,
                UserName = employment.User?.FullName ?? string.Empty,
                DepartmentId = employment.DepartmentId ?? Guid.Empty,
                DepartmentName = employment.Department?.Name ?? string.Empty,
                PersonnelGroupId = employment.DoctorTypeId ?? Guid.Empty,
                PersonnelGroupName = employment.DoctorType?.Name ?? string.Empty,
                ShiftTeamId = employment.ShiftTeamId ?? Guid.Empty,
                ShiftTeamName = employment.ShiftTeam?.Name ?? string.Empty,
                HoursPerWeek = employment.HoursPerWeek,
                StartDate = employment.StartDate,
                EndDate = employment.EndDate ?? employment.StartDate,
            };
        }
    }
}
