using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class DepartmentTypeDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Department type name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public required string Name { get; set; }
    }
}
