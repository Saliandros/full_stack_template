

using Domain.Entities;
using Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Infrastructure.Persistence.Contexts
{
    public class VagtplanDbContext : IdentityDbContext<User, IdentityRole<Guid>, Guid>
    {
        private const string AdminClaimType = "is_admin";
        private const string StaffClaimType = "is_staff";

        private readonly ILogger<VagtplanDbContext> _logger;

        public VagtplanDbContext(DbContextOptions<VagtplanDbContext> options, ILogger<VagtplanDbContext> logger)
            : base(options)
        {
            _logger = logger;
        }

        public DbSet<Department> Departments { get; set; }
        public DbSet<DepartmentType> DepartmentTypes { get; set; }
        public DbSet<DoctorType> DoctorTypes { get; set; }
        public DbSet<EmploymentPeriod> EmploymentPeriods { get; set; }
        public DbSet<Permission> Permissions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Department>(entity =>
            {
                entity.HasOne(d => d.DepartmentType)
                      .WithMany()
                      .HasForeignKey(d => d.DepartmentTypeId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(d => d.DoctorTypes)
                      .WithOne()
                      .HasForeignKey(dt => dt.DepartmentId)
                      .OnDelete(DeleteBehavior.SetNull);
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasOne(u => u.Department)
                      .WithMany(d => d.Users)
                      .HasForeignKey(u => u.DepartmentId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(u => u.DoctorType)
                      .WithMany(dt => dt.Users)
                      .HasForeignKey(u => u.DoctorTypeId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(u => u.Permission)
                      .WithMany(p => p.Users)
                      .HasForeignKey(u => u.PermissionId)
                      .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(u => u.EmploymentPeriods)
                      .WithOne(ep => ep.User)
                      .HasForeignKey(ep => ep.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }

        public void SeedData()
        {
            _logger.LogInformation("Starting SeedData method.");

            if (!DepartmentTypes.Any())
            {
                var departmentTypes = new List<DepartmentType>
                {
                    new() { Id = Guid.NewGuid(), Name = "Kirurgi" },
                    new() { Id = Guid.NewGuid(), Name = "Medicin" },
                    new() { Id = Guid.NewGuid(), Name = "Ortopædkirurgi" }
                };

                DepartmentTypes.AddRange(departmentTypes);
                SaveChanges();
                _logger.LogInformation("Added Department Types: {0}", string.Join(", ", departmentTypes.Select(dt => dt.Name)));
            }

            if (!Departments.Any())
            {
                var departmentType = DepartmentTypes.FirstOrDefault();
                if (departmentType != null)
                {
                    var department = new Department
                    {
                        Id = Guid.NewGuid(),
                        Name = "Kirurgisk Afdeling",
                        Address = "Afdelingsvej 1",
                        DepartmentTypeId = departmentType.Id
                    };

                    Departments.Add(department);
                    SaveChanges();
                    _logger.LogInformation("Added Department: {0}", department.Name);
                }
            }

            if (!Permissions.Any())
            {
                var permissions = new List<Permission>
                {
                    new() { Id = Guid.NewGuid(), Name = "Admin", Read = true, Write = true, Edit = true, Delete = true },
                    new() { Id = Guid.NewGuid(), Name = "User", Read = true, Write = false, Edit = false, Delete = false }
                };

                Permissions.AddRange(permissions);
                SaveChanges();
                _logger.LogInformation("Added Permissions");
            }

            if (!DoctorTypes.Any())
            {
                var department = Departments.FirstOrDefault();
                if (department != null)
                {
                    var doctorTypes = new List<DoctorType>
                    {
                        new() { Id = Guid.NewGuid(), Name = "Kirurg", Abbreviation = "KIR", DepartmentId = department.Id },
                        new() { Id = Guid.NewGuid(), Name = "Anæstesilæge", Abbreviation = "ANÆ", DepartmentId = department.Id }
                    };

                    DoctorTypes.AddRange(doctorTypes);
                    SaveChanges();
                    _logger.LogInformation("Added Doctor Types: {0}", string.Join(", ", doctorTypes.Select(dt => dt.Name)));
                }
            }

            if (!Users.Any())
            {
                var department = Departments.FirstOrDefault();
                var doctorType = DoctorTypes.FirstOrDefault();
                var adminPermission = Permissions.FirstOrDefault(p => p.Name == "Admin");
                var userPermission = Permissions.FirstOrDefault(p => p.Name == "User");

                if (department != null && doctorType != null && adminPermission != null && userPermission != null)
                {
                    var hasher = new PasswordHasher<User>();

                    var adminUser = new User
                    {
                        Id = Guid.NewGuid(),
                        UserName = "admin@hospital.dk",
                        NormalizedUserName = "ADMIN@HOSPITAL.DK",
                        Email = "admin@hospital.dk",
                        NormalizedEmail = "ADMIN@HOSPITAL.DK",
                        EmailConfirmed = true,
                        Initials = "ADM",
                        FullName = "Admin User",
                        PhoneNumber = "12345678",
                        UserStatus = UserStatus.Active,
                        DepartmentId = department.Id,
                        DoctorTypeId = doctorType.Id,
                        PermissionId = adminPermission.Id,
                        SecurityStamp = Guid.NewGuid().ToString()
                    };
                    adminUser.PasswordHash = hasher.HashPassword(adminUser, "admin123");

                    var regularUser = new User
                    {
                        Id = Guid.NewGuid(),
                        UserName = "user@hospital.dk",
                        NormalizedUserName = "USER@HOSPITAL.DK",
                        Email = "user@hospital.dk",
                        NormalizedEmail = "USER@HOSPITAL.DK",
                        EmailConfirmed = true,
                        Initials = "USR",
                        FullName = "Regular User",
                        PhoneNumber = "87654321",
                        UserStatus = UserStatus.Active,
                        DepartmentId = department.Id,
                        DoctorTypeId = doctorType.Id,
                        PermissionId = userPermission.Id,
                        SecurityStamp = Guid.NewGuid().ToString()
                    };
                    regularUser.PasswordHash = hasher.HashPassword(regularUser, "user123");

                    Users.AddRange(new[] { adminUser, regularUser });
                    SaveChanges();
                    _logger.LogInformation("Added Users: {0}", string.Join(", ", new[] { adminUser.FullName, regularUser.FullName }));

                    var adminEmployment = new EmploymentPeriod
                    {
                        Id = Guid.NewGuid(),
                        StartDate = DateTime.Now.AddYears(-2),
                        UserId = adminUser.Id
                    };

                    var regularEmployment = new EmploymentPeriod
                    {
                        Id = Guid.NewGuid(),
                        StartDate = DateTime.Now.AddYears(-1),
                        UserId = regularUser.Id
                    };

                    EmploymentPeriods.AddRange(new[] { adminEmployment, regularEmployment });
                    SaveChanges();
                    _logger.LogInformation("Added Employment Periods for users");
                }
            }

            var seededAdmin = Users.FirstOrDefault(user => user.Email == "admin@hospital.dk");
            var seededUser = Users.FirstOrDefault(user => user.Email == "user@hospital.dk");

            if (seededAdmin != null)
            {
                EnsureBooleanClaim(seededAdmin.Id, AdminClaimType, true);
                EnsureBooleanClaim(seededAdmin.Id, StaffClaimType, true);
            }

            if (seededUser != null)
            {
                EnsureBooleanClaim(seededUser.Id, AdminClaimType, false);
                EnsureBooleanClaim(seededUser.Id, StaffClaimType, true);
            }
        }

        private void EnsureBooleanClaim(Guid userId, string claimType, bool value)
        {
            var existingClaims = UserClaims.Where(claim => claim.UserId == userId && claim.ClaimType == claimType);

            if (!existingClaims.Any(claim =>
                string.Equals(claim.ClaimValue, value.ToString(), StringComparison.OrdinalIgnoreCase)))
            {
                UserClaims.RemoveRange(existingClaims);
                UserClaims.Add(new IdentityUserClaim<Guid>
                {
                    UserId = userId,
                    ClaimType = claimType,
                    ClaimValue = value.ToString(),
                });
                SaveChanges();
            }
        }
    }
}
