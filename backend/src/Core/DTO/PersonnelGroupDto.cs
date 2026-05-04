using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class PersonnelGroupDto
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Navn er påkrævet og må maks være 100 tegn.")]
        public required string Name { get; set; }
    }
}
