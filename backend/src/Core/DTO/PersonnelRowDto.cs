namespace Domain.DTO
{
    public class PersonnelRowDto
    {
        public string Name { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string PersonnelGroupName { get; set; } = string.Empty;
        public string ShiftTeamName { get; set; } = string.Empty;
        public int HoursPerWeek { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
