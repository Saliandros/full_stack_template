using System.ComponentModel.DataAnnotations;


namespace Domain.Entities
{
    public class Permission : BaseEntity
    {
        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public required string Name { get; set; }

        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public bool Read { get; set; }

        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public bool Write { get; set; }

        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public bool Edit { get; set; }

        [StringLength(100, MinimumLength = 3, ErrorMessage = "Permission name must be longer than 3 characters, and cannot exceed 100 characters.")]
        public bool Delete { get; set; }

        //List refererer til de brugere som har denne permission
        public List<User> Users { get; set; } = [];


    }
}
