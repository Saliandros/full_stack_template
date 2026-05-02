using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Domain.Entities
{
	public class Department : BaseEntity
	{

        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Department name has to be longer than 3 characters, and it can't exceed 100 characters")] 
        public required string Name { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Department address has to be longer than 3 characters, and it can't exceed 100 characters.")]
		public required string Address { get; set; }

        //FK refererer til den departmenttype, som denne department tilhører.
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentTypeId { get; set; }

		public DepartmentType? DepartmentType { get; set; }

		//Samling af en departments tilknyttede usere. Foreign key for department findes i User model.
		public List<User> Users { get; set; } = [];

		//Samling af doctor typer som er tilknyttet til en department
		public List<DoctorType> DoctorTypes { get; set; } = [];

		public Department() { }

        
    }
}
