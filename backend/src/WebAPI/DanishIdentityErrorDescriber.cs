using Microsoft.AspNetCore.Identity;

public class DanishIdentityErrorDescriber : IdentityErrorDescriber
{
    public override IdentityError DefaultError() =>
        new() { Code = nameof(DefaultError), Description = "En ukendt fejl opstod." };

    public override IdentityError ConcurrencyFailure() =>
        new() { Code = nameof(ConcurrencyFailure), Description = "Optimistisk concurrency-fejl. Objektet er blevet ændret." };

    public override IdentityError PasswordMismatch() =>
        new() { Code = nameof(PasswordMismatch), Description = "Forkert adgangskode." };

    public override IdentityError InvalidToken() =>
        new() { Code = nameof(InvalidToken), Description = "Ugyldigt token." };

    public override IdentityError LoginAlreadyAssociated() =>
        new() { Code = nameof(LoginAlreadyAssociated), Description = "En bruger med dette login findes allerede." };

    public override IdentityError InvalidUserName(string? userName) =>
        new() { Code = nameof(InvalidUserName), Description = $"Brugernavnet '{userName}' er ugyldigt. Det må kun indeholde bogstaver og tal." };

    public override IdentityError InvalidEmail(string? email) =>
        new() { Code = nameof(InvalidEmail), Description = $"E-mailadressen '{email}' er ugyldig." };

    public override IdentityError DuplicateUserName(string userName) =>
        new() { Code = nameof(DuplicateUserName), Description = $"Brugernavnet '{userName}' er allerede i brug." };

    public override IdentityError DuplicateEmail(string email) =>
        new() { Code = nameof(DuplicateEmail), Description = $"E-mailadressen '{email}' er allerede i brug." };

    public override IdentityError InvalidRoleName(string? role) =>
        new() { Code = nameof(InvalidRoleName), Description = $"Rollenavnet '{role}' er ugyldigt." };

    public override IdentityError DuplicateRoleName(string role) =>
        new() { Code = nameof(DuplicateRoleName), Description = $"Rollenavnet '{role}' er allerede i brug." };

    public override IdentityError UserAlreadyHasPassword() =>
        new() { Code = nameof(UserAlreadyHasPassword), Description = "Brugeren har allerede en adgangskode." };

    public override IdentityError UserLockoutNotEnabled() =>
        new() { Code = nameof(UserLockoutNotEnabled), Description = "Kontospærring er ikke aktiveret for denne bruger." };

    public override IdentityError UserAlreadyInRole(string role) =>
        new() { Code = nameof(UserAlreadyInRole), Description = $"Brugeren har allerede rollen '{role}'." };

    public override IdentityError UserNotInRole(string role) =>
        new() { Code = nameof(UserNotInRole), Description = $"Brugeren har ikke rollen '{role}'." };

    public override IdentityError PasswordTooShort(int length) =>
        new() { Code = nameof(PasswordTooShort), Description = $"Adgangskoden skal være mindst {length} tegn lang." };

    public override IdentityError PasswordRequiresNonAlphanumeric() =>
        new() { Code = nameof(PasswordRequiresNonAlphanumeric), Description = "Adgangskoden skal indeholde mindst ét specialtegn (f.eks. !, @, #)." };

    public override IdentityError PasswordRequiresDigit() =>
        new() { Code = nameof(PasswordRequiresDigit), Description = "Adgangskoden skal indeholde mindst ét tal ('0'-'9')." };

    public override IdentityError PasswordRequiresLower() =>
        new() { Code = nameof(PasswordRequiresLower), Description = "Adgangskoden skal indeholde mindst ét lille bogstav ('a'-'z')." };

    public override IdentityError PasswordRequiresUpper() =>
        new() { Code = nameof(PasswordRequiresUpper), Description = "Adgangskoden skal indeholde mindst ét stort bogstav ('A'-'Z')." };

    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars) =>
        new() { Code = nameof(PasswordRequiresUniqueChars), Description = $"Adgangskoden skal indeholde mindst {uniqueChars} unikke tegn." };

    public override IdentityError RecoveryCodeRedemptionFailed() =>
        new() { Code = nameof(RecoveryCodeRedemptionFailed), Description = "Gendannelseskoden kunne ikke indløses." };
}
