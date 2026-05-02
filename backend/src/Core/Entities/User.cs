using Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;


namespace Domain.Entities
{
    public class User : IdentityUser<Guid>
    {
        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Initials must be longer than 1 characters, and cannot exceed 100 characters.")]
        public required string Initials { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 1, ErrorMessage = "Full name must be longer than 1 characters, and cannot exceed 100 characters.")]
        public required string FullName { get; set; }
        public UserStatus UserStatus { get; set; }

        //FK refererer til den department, som en bruger er tilknyttet til.
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        //FK refererer til den doctortype, som en bruger er tilknyttet til.
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? DoctorTypeId { get; set; }
        public DoctorType? DoctorType { get; set; }

        //FK refererer til den permission, som en bruger er tilknyttet til.
        [Range(0, int.MaxValue, ErrorMessage = "ID number must be between 0 and int32")]
        public Guid? PermissionId { get; set; }
        public Permission? Permission { get; set; }


        //Liste refererer til de employmentperiods en user måtte have. Vil i 99% af tilfælde bare være 1 employment, men giver trods alt muligheden for, at en user kan have mere end én employmentperiod på én gang.
        public List<EmploymentPeriod> EmploymentPeriods { get; set; } = [];

        public User() { }
    }
}
