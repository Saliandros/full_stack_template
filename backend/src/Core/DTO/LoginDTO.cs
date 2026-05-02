using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace Domain.DTO
{
    public class LoginDTO
    {
        [Required]
        [StringLength(150, MinimumLength = 3, ErrorMessage = "DEmail must be longer than 3 characters, and cannot exceed 150 characters.")]
        [EmailAddress]
        public required string Email { get; set; }

        [Required]
        [StringLength(255, ErrorMessage = "Password must be between 5 and 255 characters", MinimumLength = 5)]
        [DataType(DataType.Password)]
        public required string Password { get; set; }
    }
}
