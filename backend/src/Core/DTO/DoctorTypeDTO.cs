using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class DoctorTypeDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Doctor type name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public required string Name { get; set; }

        [Required]
        [StringLength(10, MinimumLength = 1, ErrorMessage = "Doctor type abbrevation must be longer than 0 characters, and cannot exceed 10 characters.")]
        public required string Abbreviation { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentId { get; set; }
    }
}
