USE VagtPlanDbV2;
GO

/*
    Formål:
    Udvider den eksisterende database, så den passer bedre til krav om:
    - adgangsstyring
    - afsnit med farve
    - personalegrupper
    - ansættelser, der kobles direkte til afsnit og personalegruppe
*/

/* 1. Tilføj direkte rollefelter på brugeren */
IF COL_LENGTH('dbo.AspNetUsers', 'IsAdmin') IS NULL
BEGIN
    ALTER TABLE dbo.AspNetUsers
    ADD IsAdmin bit NOT NULL
        CONSTRAINT DF_AspNetUsers_IsAdmin DEFAULT (0);
END
GO

IF COL_LENGTH('dbo.AspNetUsers', 'IsPersonnel') IS NULL
BEGIN
    ALTER TABLE dbo.AspNetUsers
    ADD IsPersonnel bit NOT NULL
        CONSTRAINT DF_AspNetUsers_IsPersonnel DEFAULT (0);
END
GO

/* 2. Gør email unik */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_AspNetUsers_Email'
      AND object_id = OBJECT_ID('dbo.AspNetUsers')
)
BEGIN
    CREATE UNIQUE INDEX UX_AspNetUsers_Email
    ON dbo.AspNetUsers(Email)
    WHERE Email IS NOT NULL;
END
GO

/* 3. Tilføj farve på afsnit */
IF COL_LENGTH('dbo.Departments', 'Color') IS NULL
BEGIN
    ALTER TABLE dbo.Departments
    ADD Color nvarchar(50) NOT NULL
        CONSTRAINT DF_Departments_Color DEFAULT ('Ukendt');
END
GO

/* 4. Udvid DoctorTypes.Name så længere titler kan gemmes */
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.DoctorTypes')
      AND name = 'Name'
      AND max_length < 200
)
BEGIN
    ALTER TABLE dbo.DoctorTypes
    ALTER COLUMN Name nvarchar(100) NOT NULL;
END
GO

/* 5. Kobl ansættelser direkte til afdeling og personalegruppe */
IF COL_LENGTH('dbo.EmploymentPeriods', 'DepartmentId') IS NULL
BEGIN
    ALTER TABLE dbo.EmploymentPeriods
    ADD DepartmentId uniqueidentifier NULL;
END
GO

IF COL_LENGTH('dbo.EmploymentPeriods', 'DoctorTypeId') IS NULL
BEGIN
    ALTER TABLE dbo.EmploymentPeriods
    ADD DoctorTypeId uniqueidentifier NULL;
END
GO

/* 6. Udfyld de nye felter ud fra brugerens nuværende relationer */
UPDATE ep
SET
    ep.DepartmentId = u.DepartmentId,
    ep.DoctorTypeId = u.DoctorTypeId
FROM dbo.EmploymentPeriods ep
INNER JOIN dbo.AspNetUsers u ON u.Id = ep.UserId
WHERE ep.DepartmentId IS NULL
   OR ep.DoctorTypeId IS NULL;
GO

/* 7. Foreign keys, så sletning af afdeling/personalegruppe kan blokeres */
IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_EmploymentPeriods_Departments_DepartmentId'
)
BEGIN
    ALTER TABLE dbo.EmploymentPeriods
    ADD CONSTRAINT FK_EmploymentPeriods_Departments_DepartmentId
        FOREIGN KEY (DepartmentId)
        REFERENCES dbo.Departments(Id)
        ON DELETE NO ACTION;
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE name = 'FK_EmploymentPeriods_DoctorTypes_DoctorTypeId'
)
BEGIN
    ALTER TABLE dbo.EmploymentPeriods
    ADD CONSTRAINT FK_EmploymentPeriods_DoctorTypes_DoctorTypeId
        FOREIGN KEY (DoctorTypeId)
        REFERENCES dbo.DoctorTypes(Id)
        ON DELETE NO ACTION;
END
GO

/* 8. Hjælpeindekser på de nye relationer */
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_EmploymentPeriods_DepartmentId'
      AND object_id = OBJECT_ID('dbo.EmploymentPeriods')
)
BEGIN
    CREATE INDEX IX_EmploymentPeriods_DepartmentId
    ON dbo.EmploymentPeriods(DepartmentId);
END
GO

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_EmploymentPeriods_DoctorTypeId'
      AND object_id = OBJECT_ID('dbo.EmploymentPeriods')
)
BEGIN
    CREATE INDEX IX_EmploymentPeriods_DoctorTypeId
    ON dbo.EmploymentPeriods(DoctorTypeId);
END
GO
