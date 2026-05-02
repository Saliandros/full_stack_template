using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class PermissionDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public required string Name { get; set; }

        [Required]
        public bool Read { get; set; }

        [Required]
        public bool Write { get; set; }

        [Required]
        public bool Edit { get; set; }

        [Required]
        public bool Delete { get; set; }
    }
}
