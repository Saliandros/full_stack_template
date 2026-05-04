using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class AccessManagementUserDto
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Navn er påkrævet og må maks være 100 tegn.")]
        public required string FullName { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "E-mail er ugyldig.")]
        public required string Email { get; set; }

        public bool IsAdmin { get; set; }

        public bool IsStaff { get; set; }
    }
}
