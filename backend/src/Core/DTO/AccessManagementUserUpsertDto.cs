using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class AccessManagementUserUpsertDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Fornavn er påkrævet og må maks være 100 tegn.")]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Efternavn er påkrævet og må maks være 100 tegn.")]
        public required string LastName { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "E-mail er ugyldig.")]
        public required string Email { get; set; }

        [MinLength(6, ErrorMessage = "Adgangskode skal være mindst 6 tegn.")]
        public string? Password { get; set; }

        public bool IsAdmin { get; set; }

        public bool IsStaff { get; set; }
    }
}
