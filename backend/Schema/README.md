## Schema Scripts

Denne mappe indeholder SQL Server-scripts til dokumentation af de databasevalg,
der blev lavet oven på den eksisterende `VagtPlanDbV2` database.

Filer:

- `01_schema_updates.sql`
  Opdaterer den eksisterende database, så den matcher kravene bedre.
- `02_seed_reference_data.sql`
  Indsætter afsnit og personalegrupper fra opgavebeskrivelsen.
- `03_seed_test_users.sql`
  Indsætter fem testansatte og deres ansættelser.
  Scriptet genbruger password-hash fra den seedede bruger `user@hospital.dk`.
  I seed-koden er den bruger oprettet med passwordet `user123`, så de nye
  testbrugere logger også ind med `user123`.

Kørsel i SSMS:

1. Kør `01_schema_updates.sql`
2. Kør `02_seed_reference_data.sql`
3. Kør `03_seed_test_users.sql`

Bemærk:

- Scriptsene er skrevet til Microsoft SQL Server.
- Scriptsene forventer, at databasen `VagtPlanDbV2` allerede findes.
- `03_seed_test_users.sql` genbruger password-hash fra den seedede bruger
  `user@hospital.dk`, så testbrugerne kan logge ind uden at man manuelt skal
  generere password-hashes i SQL.
