using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class EmploymentAdminDto
    {
        public Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        [Required]
        public Guid DepartmentId { get; set; }

        public string DepartmentName { get; set; } = string.Empty;

        [Required]
        public Guid PersonnelGroupId { get; set; }

        public string PersonnelGroupName { get; set; } = string.Empty;

        [Required]
        public Guid ShiftTeamId { get; set; }

        public string ShiftTeamName { get; set; } = string.Empty;

        [Range(0, 37, ErrorMessage = "Timer pr. uge skal være mellem 0 og 37.")]
        public int HoursPerWeek { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}
