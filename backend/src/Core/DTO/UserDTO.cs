using Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class UserDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Initials must be longer than 1 characters, and cannot exceed 100 characters.")]
        public required string Initials { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public required string FullName { get; set; }

        public UserStatus UserStatus { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentId { get; set; } = Guid.Empty;

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DoctorTypeId { get; set; } = Guid.Empty;
    }
}
