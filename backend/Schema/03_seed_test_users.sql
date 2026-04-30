USE VagtPlanDbV2;
GO

/*
    Formål:
    Indsætter fem testansatte med forskellige afsnit og personalegrupper.

    Login:
    Brugerne genbruger password-hash fra den seedede bruger `user@hospital.dk`.
    Det betyder, at alle nye testbrugere får samme password som den bruger.

    Hvor kommer passwordet fra:
    - I C# seed-koden oprettes `user@hospital.dk` med passwordet `user123`
    - Det sker i `src/Infrastructure/Persistence/Contexts/VagtplanDbContext.cs`
    - Dette script kopierer kun den eksisterende PasswordHash fra databasen
      og sætter den på de nye testbrugere

    Praktisk konsekvens:
    - Alle brugere i dette script logger ind med passwordet `user123`
*/

DECLARE @PasswordHash nvarchar(max) =
(
    SELECT TOP 1 PasswordHash
    FROM dbo.AspNetUsers
    WHERE Email = 'user@hospital.dk'
);

IF @PasswordHash IS NULL
BEGIN
    RAISERROR('Kunne ikke finde user@hospital.dk. Start backend seed-data først.', 16, 1);
    RETURN;
END

DECLARE @UserPermissionId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.Permissions
    WHERE Name = 'User'
);

DECLARE @AdminPermissionId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.Permissions
    WHERE Name = 'Admin'
);

DECLARE @SkadestueId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.Departments
    WHERE Name = 'Skadestue'
);

DECLARE @SengeAId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.Departments
    WHERE Name = 'Sengeafsnit A'
);

DECLARE @SengeBId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.Departments
    WHERE Name = 'Sengeafsnit B'
);

DECLARE @OverlaegeId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.DoctorTypes
    WHERE Name = 'Overlæge'
);

DECLARE @AfdelingslaegeId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.DoctorTypes
    WHERE Name = 'Afdelingslæge'
);

DECLARE @IntrolaegeId uniqueidentifier =
(
    SELECT TOP 1 Id
    FROM dbo.DoctorTypes
    WHERE Name = 'Introlæge'
);

/* 1. John Hansen -> Skadestue -> Overlæge */
INSERT INTO dbo.AspNetUsers
(
    Id, Initials, FullName, UserStatus, DepartmentId, DoctorTypeId, PermissionId,
    UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
    PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    IsAdmin, IsPersonnel
)
SELECT
    NEWID(), 'JOH', 'John Hansen', 1, @SkadestueId, @OverlaegeId, @UserPermissionId,
    'john@john.dk', 'JOHN@JOHN.DK', 'john@john.dk', 'JOHN@JOHN.DK', 1,
    @PasswordHash, NEWID(), NEWID(), '11111111',
    0, 0, NULL, 0, 0,
    0, 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Email = 'john@john.dk');

/* 2. Sara Nielsen -> Sengeafsnit A -> Afdelingslæge */
INSERT INTO dbo.AspNetUsers
(
    Id, Initials, FullName, UserStatus, DepartmentId, DoctorTypeId, PermissionId,
    UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
    PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    IsAdmin, IsPersonnel
)
SELECT
    NEWID(), 'SAR', 'Sara Nielsen', 1, @SengeAId, @AfdelingslaegeId, @UserPermissionId,
    'sara@sara.dk', 'SARA@SARA.DK', 'sara@sara.dk', 'SARA@SARA.DK', 1,
    @PasswordHash, NEWID(), NEWID(), '22222222',
    0, 0, NULL, 0, 0,
    0, 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Email = 'sara@sara.dk');

/* 3. Mikkel Larsen -> Sengeafsnit B -> Introlæge */
INSERT INTO dbo.AspNetUsers
(
    Id, Initials, FullName, UserStatus, DepartmentId, DoctorTypeId, PermissionId,
    UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
    PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    IsAdmin, IsPersonnel
)
SELECT
    NEWID(), 'MIK', 'Mikkel Larsen', 1, @SengeBId, @IntrolaegeId, @UserPermissionId,
    'mikkel@mikkel.dk', 'MIKKEL@MIKKEL.DK', 'mikkel@mikkel.dk', 'MIKKEL@MIKKEL.DK', 1,
    @PasswordHash, NEWID(), NEWID(), '33333333',
    0, 0, NULL, 0, 0,
    0, 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Email = 'mikkel@mikkel.dk');

/* 4. Emma Pedersen -> Skadestue -> Afdelingslæge -> Admin */
INSERT INTO dbo.AspNetUsers
(
    Id, Initials, FullName, UserStatus, DepartmentId, DoctorTypeId, PermissionId,
    UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
    PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    IsAdmin, IsPersonnel
)
SELECT
    NEWID(), 'EMM', 'Emma Pedersen', 1, @SkadestueId, @AfdelingslaegeId, @AdminPermissionId,
    'emma@emma.dk', 'EMMA@EMMA.DK', 'emma@emma.dk', 'EMMA@EMMA.DK', 1,
    @PasswordHash, NEWID(), NEWID(), '44444444',
    0, 0, NULL, 0, 0,
    1, 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Email = 'emma@emma.dk');

/* 5. Oliver Jensen -> Sengeafsnit A -> Overlæge */
INSERT INTO dbo.AspNetUsers
(
    Id, Initials, FullName, UserStatus, DepartmentId, DoctorTypeId, PermissionId,
    UserName, NormalizedUserName, Email, NormalizedEmail, EmailConfirmed,
    PasswordHash, SecurityStamp, ConcurrencyStamp, PhoneNumber,
    PhoneNumberConfirmed, TwoFactorEnabled, LockoutEnd, LockoutEnabled, AccessFailedCount,
    IsAdmin, IsPersonnel
)
SELECT
    NEWID(), 'OLI', 'Oliver Jensen', 1, @SengeAId, @OverlaegeId, @UserPermissionId,
    'oliver@oliver.dk', 'OLIVER@OLIVER.DK', 'oliver@oliver.dk', 'OLIVER@OLIVER.DK', 1,
    @PasswordHash, NEWID(), NEWID(), '55555555',
    0, 0, NULL, 0, 0,
    0, 1
WHERE NOT EXISTS (SELECT 1 FROM dbo.AspNetUsers WHERE Email = 'oliver@oliver.dk');
GO

/*
    Opret ansættelser til hver bruger.
    Hver ansættelse kopierer afdeling og personalegruppe fra brugerens egne relationer.
*/
INSERT INTO dbo.EmploymentPeriods (Id, StartDate, EndDate, UserId, CreatedAt, DepartmentId, DoctorTypeId)
SELECT NEWID(), '2024-01-01', NULL, u.Id, SYSDATETIME(), u.DepartmentId, u.DoctorTypeId
FROM dbo.AspNetUsers u
WHERE u.Email = 'john@john.dk'
  AND NOT EXISTS (SELECT 1 FROM dbo.EmploymentPeriods ep WHERE ep.UserId = u.Id);

INSERT INTO dbo.EmploymentPeriods (Id, StartDate, EndDate, UserId, CreatedAt, DepartmentId, DoctorTypeId)
SELECT NEWID(), '2024-02-01', NULL, u.Id, SYSDATETIME(), u.DepartmentId, u.DoctorTypeId
FROM dbo.AspNetUsers u
WHERE u.Email = 'sara@sara.dk'
  AND NOT EXISTS (SELECT 1 FROM dbo.EmploymentPeriods ep WHERE ep.UserId = u.Id);

INSERT INTO dbo.EmploymentPeriods (Id, StartDate, EndDate, UserId, CreatedAt, DepartmentId, DoctorTypeId)
SELECT NEWID(), '2024-03-01', NULL, u.Id, SYSDATETIME(), u.DepartmentId, u.DoctorTypeId
FROM dbo.AspNetUsers u
WHERE u.Email = 'mikkel@mikkel.dk'
  AND NOT EXISTS (SELECT 1 FROM dbo.EmploymentPeriods ep WHERE ep.UserId = u.Id);

INSERT INTO dbo.EmploymentPeriods (Id, StartDate, EndDate, UserId, CreatedAt, DepartmentId, DoctorTypeId)
SELECT NEWID(), '2024-04-01', NULL, u.Id, SYSDATETIME(), u.DepartmentId, u.DoctorTypeId
FROM dbo.AspNetUsers u
WHERE u.Email = 'emma@emma.dk'
  AND NOT EXISTS (SELECT 1 FROM dbo.EmploymentPeriods ep WHERE ep.UserId = u.Id);

INSERT INTO dbo.EmploymentPeriods (Id, StartDate, EndDate, UserId, CreatedAt, DepartmentId, DoctorTypeId)
SELECT NEWID(), '2024-05-01', NULL, u.Id, SYSDATETIME(), u.DepartmentId, u.DoctorTypeId
FROM dbo.AspNetUsers u
WHERE u.Email = 'oliver@oliver.dk'
  AND NOT EXISTS (SELECT 1 FROM dbo.EmploymentPeriods ep WHERE ep.UserId = u.Id);
GO
