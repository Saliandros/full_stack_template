using System.Data.Common;
using System.Security.Claims;
using Domain.DTO;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Mapping;
using Infrastructure.Persistence.Contexts;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private const string AdminClaimType = "is_admin";
        private const string StaffClaimType = "is_staff";

        private readonly VagtplanDbContext _context;
        private readonly ILogger<UserController> _logger;
        private readonly UserManager<User> _userManager;

        public UserController(
            VagtplanDbContext context,
            ILogger<UserController> logger,
            UserManager<User> userManager)
        {
            _context = context;
            _logger = logger;
            _userManager = userManager;
        }

        [HttpGet("access-management")]
        public async Task<IActionResult> GetAccessManagementUsers()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .OrderBy(u => u.FullName)
                    .Select(u => new AccessManagementUserDto
                    {
                        Id = u.Id,
                        FullName = u.FullName,
                        Email = u.Email ?? string.Empty,
                    })
                    .ToListAsync();

                var userIds = users.Select(u => u.Id).ToList();
                var roleClaims = await _context.UserClaims
                    .AsNoTracking()
                    .Where(claim => userIds.Contains(claim.UserId) &&
                        (claim.ClaimType == AdminClaimType || claim.ClaimType == StaffClaimType))
                    .ToListAsync();

                foreach (var user in users)
                {
                    user.IsAdmin = roleClaims.Any(claim =>
                        claim.UserId == user.Id &&
                        claim.ClaimType == AdminClaimType &&
                        string.Equals(claim.ClaimValue, bool.TrueString, StringComparison.OrdinalIgnoreCase));

                    user.IsStaff = roleClaims.Any(claim =>
                        claim.UserId == user.Id &&
                        claim.ClaimType == StaffClaimType &&
                        string.Equals(claim.ClaimValue, bool.TrueString, StringComparison.OrdinalIgnoreCase));
                }

                return Ok(users);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving access management users");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving access management users");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("access-management")]
        public async Task<IActionResult> CreateAccessManagementUser([FromBody] AccessManagementUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                var normalizedEmail = NormalizeEmail(dto.Email);
                if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
                {
                    return BadRequest(new { message = "Navn og e-mail er påkrævet." });
                }

                var emailExists = await _context.Users.AnyAsync(user =>
                    user.NormalizedEmail == normalizedEmail || user.NormalizedUserName == normalizedEmail);

                if (emailExists)
                {
                    return Conflict(new { message = "E-mail findes allerede." });
                }

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = dto.FullName.Trim(),
                    Initials = CreateInitials(dto.FullName),
                    Email = dto.Email.Trim(),
                    NormalizedEmail = normalizedEmail,
                    UserName = dto.Email.Trim(),
                    NormalizedUserName = normalizedEmail,
                    EmailConfirmed = true,
                    UserStatus = UserStatus.Active,
                    SecurityStamp = Guid.NewGuid().ToString(),
                };

                var result = await _userManager.CreateAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = string.Join(" ", result.Errors.Select(error => error.Description)),
                    });
                }

                await SyncRoleClaimsAsync(user, dto.IsAdmin, dto.IsStaff);

                return Ok(await MapToAccessManagementUserAsync(user));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating access management user");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating access management user");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("access-management/{id:guid}")]
        public async Task<IActionResult> UpdateAccessManagementUser(Guid id, [FromBody] AccessManagementUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return ValidationProblem(ModelState);
                }

                var existingUser = await _userManager.FindByIdAsync(id.ToString());
                if (existingUser == null)
                {
                    return NotFound(new { message = "Bruger blev ikke fundet." });
                }

                var normalizedEmail = NormalizeEmail(dto.Email);
                if (string.IsNullOrWhiteSpace(dto.FullName) || string.IsNullOrWhiteSpace(dto.Email))
                {
                    return BadRequest(new { message = "Navn og e-mail er påkrævet." });
                }

                var emailExists = await _context.Users.AnyAsync(user =>
                    user.Id != id &&
                    (user.NormalizedEmail == normalizedEmail || user.NormalizedUserName == normalizedEmail));

                if (emailExists)
                {
                    return Conflict(new { message = "E-mail findes allerede." });
                }

                existingUser.FullName = dto.FullName.Trim();
                existingUser.Initials = CreateInitials(dto.FullName);
                existingUser.Email = dto.Email.Trim();
                existingUser.NormalizedEmail = normalizedEmail;
                existingUser.UserName = dto.Email.Trim();
                existingUser.NormalizedUserName = normalizedEmail;

                var result = await _userManager.UpdateAsync(existingUser);
                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = string.Join(" ", result.Errors.Select(error => error.Description)),
                    });
                }

                await SyncRoleClaimsAsync(existingUser, dto.IsAdmin, dto.IsStaff);

                return Ok(await MapToAccessManagementUserAsync(existingUser));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating access management user {UserId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating access management user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("access-management/{id:guid}")]
        public async Task<IActionResult> DeleteAccessManagementUser(Guid id)
        {
            try
            {
                var user = await _context.Users
                    .Include(existingUser => existingUser.EmploymentPeriods)
                    .FirstOrDefaultAsync(existingUser => existingUser.Id == id);

                if (user == null)
                {
                    return NotFound(new { message = "Bruger blev ikke fundet." });
                }

                var deletedUser = await MapToAccessManagementUserAsync(user);

                if (user.EmploymentPeriods.Count > 0)
                {
                    _context.EmploymentPeriods.RemoveRange(user.EmploymentPeriods);
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    return BadRequest(new
                    {
                        message = string.Join(" ", result.Errors.Select(error => error.Description)),
                    });
                }

                await _context.SaveChangesAsync();

                return Ok(deletedUser);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting access management user {UserId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting access management user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetById(Guid userId)
        {
            try
            {
                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    _logger.LogWarning("Employment period {userId} not found", userId);
                    return NotFound(new { message = "Employment period not found" });
                }

                return Ok(user.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving employment period {EmploymentPeriodId}", userId);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving employment period {EmploymentPeriodId}", userId);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .ToListAsync();

                if (!users.Any())
                {
                    _logger.LogWarning("No users found");
                    return NotFound(new { message = "No users found" });
                }

                return Ok(users);
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving users");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving users");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("GetAdminInfo")]
        public async Task<IActionResult> GetAdminInfo()
        {
            try
            {
                var admin = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Permission != null &&
                                             u.Permission.Delete &&
                                             u.Permission.Read &&
                                             u.Permission.Write &&
                                             u.Permission.Edit);

                if (admin == null)
                {
                    _logger.LogWarning("Admin user not found");
                    return NotFound(new { message = "Admin not found" });
                }

                return Ok(admin.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving admin info");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving admin info");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpGet("GetUsersWithEmployment")]
        public async Task<IActionResult> GetUsersWithEmployment()
        {
            try
            {
                var users = await _context.Users
                    .AsNoTracking()
                    .Where(u => u.DoctorType != null && u.EmploymentPeriods.Any())
                    .ToListAsync();

                if (!users.Any())
                {
                    _logger.LogWarning("No users with employment found");
                    return NotFound(new { message = "No users in employment" });
                }

                return Ok(users.Select(u => u.ToDTO()));
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while retrieving users with employment");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while retrieving users with employment");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPost("Add")]
        public async Task<IActionResult> Create([FromBody] UserDTO dto)
        {
            try
            {
                if (dto == null)
                {
                    _logger.LogWarning("DTO was null");
                    return BadRequest(new { message = "User data wasn't provided" });
                }

                var user = dto.ToEntity();
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();

                return Ok(user.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while creating user");
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while creating user");
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] User entity)
        {
            try
            {
                if (entity == null)
                {
                    _logger.LogWarning("DTO was null");
                    return BadRequest(new { message = "User data wasn't provided" });
                }

                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == entity.Id);

                if (existingUser == null)
                {
                    _logger.LogWarning("User {UserId} not found", entity.Id);
                    return NotFound(new { message = "User not found" });
                }

                existingUser.FullName = entity.FullName;
                existingUser.Email = entity.Email;
                existingUser.PhoneNumber = entity.PhoneNumber;
                existingUser.DepartmentId = entity.DepartmentId;
                existingUser.DoctorTypeId = entity.DoctorTypeId;

                await _context.SaveChangesAsync();

                return Ok(existingUser.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while updating user {UserId}", entity.Id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while updating user {UserId}", entity.Id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                if (id == default)
                {
                    _logger.LogWarning("Id was null");
                    return BadRequest(new { message = "Id wasn't provided" });
                }

                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                {
                    _logger.LogWarning("User {UserId} not found", id);
                    return NotFound(new { message = "User not found" });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(user.ToDTO());
            }
            catch (DbException dbEx)
            {
                _logger.LogError(dbEx, "Database error occurred while deleting user {UserId}", id);
                return StatusCode(500, new { message = "A database error occurred" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error occurred while deleting user {UserId}", id);
                return StatusCode(500, new { message = "An unexpected error occurred" });
            }
        }

        private static string NormalizeEmail(string email) => email.Trim().ToUpperInvariant();

        private static string CreateInitials(string fullName)
        {
            var initials = string.Concat(
                fullName
                    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Take(3)
                    .Select(part => char.ToUpperInvariant(part[0])));

            if (!string.IsNullOrWhiteSpace(initials))
            {
                return initials;
            }

            var trimmedName = fullName.Trim();
            return trimmedName[..Math.Min(3, trimmedName.Length)].ToUpperInvariant();
        }

        private async Task<AccessManagementUserDto> MapToAccessManagementUserAsync(User user)
        {
            var claims = await _userManager.GetClaimsAsync(user);

            return new AccessManagementUserDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                IsAdmin = HasClaimValue(claims, AdminClaimType),
                IsStaff = HasClaimValue(claims, StaffClaimType),
            };
        }

        private async Task SyncRoleClaimsAsync(User user, bool isAdmin, bool isStaff)
        {
            var claims = await _userManager.GetClaimsAsync(user);

            await ReplaceBooleanClaimAsync(user, claims, AdminClaimType, isAdmin);
            await ReplaceBooleanClaimAsync(user, claims, StaffClaimType, isStaff);
        }

        private async Task ReplaceBooleanClaimAsync(
            User user,
            IList<Claim> claims,
            string claimType,
            bool value)
        {
            foreach (var claim in claims.Where(claim => claim.Type == claimType).ToList())
            {
                var removeResult = await _userManager.RemoveClaimAsync(user, claim);
                if (!removeResult.Succeeded)
                {
                    throw new InvalidOperationException(
                        $"Could not remove claim '{claimType}' for user '{user.Id}'.");
                }
            }

            var addResult = await _userManager.AddClaimAsync(
                user,
                new Claim(claimType, value.ToString()));

            if (!addResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Could not add claim '{claimType}' for user '{user.Id}'.");
            }
        }

        private static bool HasClaimValue(IEnumerable<Claim> claims, string claimType) =>
            claims.Any(claim =>
                claim.Type == claimType &&
                string.Equals(claim.Value, bool.TrueString, StringComparison.OrdinalIgnoreCase));
    }
}
