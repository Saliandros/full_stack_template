using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Domain.Entities
{
	public class EmploymentPeriod : BaseEntity
	{
        [Range(0, 37, ErrorMessage = "Hours per week must be between 0 and 37.")]
        public int HoursPerWeek { get; set; }

        [DataType(DataType.Date), DisplayFormat(DataFormatString = "{dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime StartDate { get; set; }

        [DataType(DataType.Date), DisplayFormat(DataFormatString = "{dd/MM/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? EndDate { get; set; }

        //FK refererer til den user som har denne employmentPeriod.
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? UserId { get; set; }

		public User? User { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DoctorTypeId { get; set; }
        public DoctorType? DoctorType { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? ShiftTeamId { get; set; }
        public ShiftTeam? ShiftTeam { get; set; }


		public EmploymentPeriod()
		{
		}
	}
}
