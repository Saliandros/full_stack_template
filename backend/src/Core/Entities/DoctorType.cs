using System;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
	public class DoctorType : BaseEntity
	{
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Doctor type name must be longer than 0 characters, and cannot exceed 100 characters.")]
        public string Name { get; set; }

        [Required]
        [StringLength(10, MinimumLength = 1, ErrorMessage = "Doctor type abbrevation must be longer than 0 characters, and cannot exceed 10 characters.")]
        public string Abbreviation { get; set; }


        //FK refererer til den department som doctortypen er assignet til
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentId { get; set; }

		//Liste refererer til de users som har denne doctortype.
		public List<User> Users { get; set; } = new List<User>();

		public DoctorType() { }


	}
}
