using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
    public class ShiftTeam : BaseEntity
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Shift team name must be longer than 0 characters, and cannot exceed 100 characters.")]
        public required string Name { get; set; }

        public List<EmploymentPeriod> EmploymentPeriods { get; set; } = [];
    }
}
