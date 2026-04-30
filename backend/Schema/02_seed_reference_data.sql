USE VagtPlanDbV2;
GO

/*
    Formål:
    Indsætter stamdata fra opgaven:
    - afsnit
    - personalegrupper
*/

/* Afsnit */
IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = 'Skadestue')
BEGIN
    INSERT INTO dbo.Departments (Id, Name, Address, DepartmentTypeId, CreatedAt, Color)
    VALUES (NEWID(), 'Skadestue', 'Ukendt', NULL, SYSDATETIME(), 'Rød');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = 'Sengeafsnit A')
BEGIN
    INSERT INTO dbo.Departments (Id, Name, Address, DepartmentTypeId, CreatedAt, Color)
    VALUES (NEWID(), 'Sengeafsnit A', 'Ukendt', NULL, SYSDATETIME(), 'Grøn');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Departments WHERE Name = 'Sengeafsnit B')
BEGIN
    INSERT INTO dbo.Departments (Id, Name, Address, DepartmentTypeId, CreatedAt, Color)
    VALUES (NEWID(), 'Sengeafsnit B', 'Ukendt', NULL, SYSDATETIME(), 'Blå');
END
GO

/* Personalegrupper */
IF NOT EXISTS (SELECT 1 FROM dbo.DoctorTypes WHERE Name = 'Overlæge')
BEGIN
    INSERT INTO dbo.DoctorTypes (Id, Name, Abbreviation, DepartmentId, CreatedAt)
    VALUES (NEWID(), 'Overlæge', 'OVL', NULL, SYSDATETIME());
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DoctorTypes WHERE Name = 'Afdelingslæge')
BEGIN
    INSERT INTO dbo.DoctorTypes (Id, Name, Abbreviation, DepartmentId, CreatedAt)
    VALUES (NEWID(), 'Afdelingslæge', 'ADL', NULL, SYSDATETIME());
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DoctorTypes WHERE Name = 'Introlæge')
BEGIN
    INSERT INTO dbo.DoctorTypes (Id, Name, Abbreviation, DepartmentId, CreatedAt)
    VALUES (NEWID(), 'Introlæge', 'INT', NULL, SYSDATETIME());
END
GO
