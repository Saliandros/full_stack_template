## Local secrets

Projektet er sat op til at bruge `.NET User Secrets` til lokal connection string i stedet
for at have den liggende i `appsettings.json`.

Kør fra `backend`-mappen:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=DIABLO\SQLEXPRESS;Database=VagtPlanDbV2;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True" --project .\src\WebAPI\WebAPI.csproj
```

Hvis du vil se at den er gemt:

```powershell
dotnet user-secrets list --project .\src\WebAPI\WebAPI.csproj
```

Applikationen læser stadig connection stringen på normal .NET-vis via:

```csharp
builder.Configuration.GetConnectionString("DefaultConnection")
```
