using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class DepartmentDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Department name has to be longer than 3 characters, and it can't exceed 100 characters")]
        public required string Name { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Department address has to be longer than 3 characters, and it can't exceed 100 characters.")]
        public required string Address { get; set; }

        [Range(0, int.MaxValue, ErrorMessage ="ID number must be between 0 and int32")]
        public Guid? DepartmentTypeId { get; set; }
    }
}
