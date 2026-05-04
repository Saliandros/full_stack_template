export type Department = {
  id: string;
  name: string;
  color: string;
};

export type DepartmentInput = {
  name: string;
  color: string;
};

export type PersonnelGroup = {
  id: string;
  name: string;
};

export type PersonnelGroupInput = {
  name: string;
};

export type ShiftTeam = {
  id: string;
  name: string;
};

export type ShiftTeamInput = {
  name: string;
};

export type AccessManagementUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isStaff: boolean;
};

export type AccessManagementUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isAdmin: boolean;
  isStaff: boolean;
};

export type Employment = {
  id: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  personnelGroupId: string;
  personnelGroupName: string;
  shiftTeamId: string;
  shiftTeamName: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
};

export type EmploymentInput = {
  userId: string;
  departmentId: string;
  personnelGroupId: string;
  shiftTeamId: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
};

export type PersonnelRow = {
  name: string;
  departmentName: string;
  personnelGroupName: string;
  shiftTeamName: string;
  hoursPerWeek: number;
  startDate: string;
  endDate: string;
};

const DEFAULT_API_BASE_URL = "http://localhost:5166";

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export async function getDepartments() {
  const response = await fetch(`${getApiBaseUrl()}/api/departments`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente afsnit (${response.status})`);
  }

  return (await response.json()) as Department[];
}

export async function createDepartment(department: DepartmentInput) {
  return sendDepartmentMutation("/api/departments", "POST", department);
}

export async function updateDepartment(id: string, department: DepartmentInput) {
  return sendDepartmentMutation(`/api/departments/${id}`, "PUT", department);
}

export async function deleteDepartment(id: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/departments/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette afsnit.");
  }

  return (await response.json()) as Department;
}

export async function getPersonnelGroups() {
  const response = await fetch(
    `${getApiBaseUrl()}/api/doctortype/personnel-groups`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Kunne ikke hente personalegrupper (${response.status})`);
  }

  return (await response.json()) as PersonnelGroup[];
}

export async function createPersonnelGroup(group: PersonnelGroupInput) {
  return sendPersonnelGroupMutation(
    "/api/doctortype/personnel-groups",
    "POST",
    group,
  );
}

export async function updatePersonnelGroup(
  id: string,
  group: PersonnelGroupInput,
) {
  return sendPersonnelGroupMutation(
    `/api/doctortype/personnel-groups/${id}`,
    "PUT",
    group,
  );
}

export async function deletePersonnelGroup(id: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/doctortype/personnel-groups/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette personalegruppe.");
  }

  return (await response.json()) as PersonnelGroup;
}

export async function getShiftTeams() {
  const response = await fetch(`${getApiBaseUrl()}/api/shiftteam`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente vagtlag (${response.status})`);
  }

  return (await response.json()) as ShiftTeam[];
}

export async function createShiftTeam(shiftTeam: ShiftTeamInput) {
  return sendShiftTeamMutation("/api/shiftteam", "POST", shiftTeam);
}

export async function updateShiftTeam(id: string, shiftTeam: ShiftTeamInput) {
  return sendShiftTeamMutation(`/api/shiftteam/${id}`, "PUT", shiftTeam);
}

export async function deleteShiftTeam(id: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/shiftteam/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette vagtlag.");
  }

  return (await response.json()) as ShiftTeam;
}

export async function getAccessManagementUsers() {
  const response = await fetch(
    `${getApiBaseUrl()}/api/user/access-management`,
    {
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Kunne ikke hente brugere (${response.status})`);
  }

  return (await response.json()) as AccessManagementUser[];
}

export async function createAccessManagementUser(
  user: AccessManagementUserInput,
) {
  return sendAccessManagementMutation("/api/user/access-management", "POST", user);
}

export async function updateAccessManagementUser(
  id: string,
  user: AccessManagementUserInput,
) {
  return sendAccessManagementMutation(
    `/api/user/access-management/${id}`,
    "PUT",
    user,
  );
}

export async function deleteAccessManagementUser(id: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/user/access-management/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette bruger.");
  }

  return (await response.json()) as AccessManagementUser;
}

export async function getEmployments() {
  const response = await fetch(`${getApiBaseUrl()}/api/employmentperiod/admin`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente ansættelser (${response.status})`);
  }

  return (await response.json()) as Employment[];
}

export async function createEmployment(employment: EmploymentInput) {
  return sendEmploymentMutation("/api/employmentperiod/admin", "POST", employment);
}

export async function updateEmployment(id: string, employment: EmploymentInput) {
  return sendEmploymentMutation(
    `/api/employmentperiod/admin/${id}`,
    "PUT",
    employment,
  );
}

export async function deleteEmployment(id: string) {
  const response = await fetch(
    `${getApiBaseUrl()}/api/employmentperiod/admin/${id}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette ansættelse.");
  }

  return (await response.json()) as { id: string };
}

export async function getPersonnel() {
  const response = await fetch(`${getApiBaseUrl()}/api/employmentperiod/personnel`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente personale (${response.status})`);
  }

  return (await response.json()) as PersonnelRow[];
}

async function sendDepartmentMutation(
  path: string,
  method: "POST" | "PUT",
  department: DepartmentInput,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: department.name.trim(),
      color: department.color.trim(),
    }),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme afsnit.");
  }

  return (await response.json()) as Department;
}

async function sendPersonnelGroupMutation(
  path: string,
  method: "POST" | "PUT",
  group: PersonnelGroupInput,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: group.name.trim(),
    }),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme personalegruppe.");
  }

  return (await response.json()) as PersonnelGroup;
}

async function sendShiftTeamMutation(
  path: string,
  method: "POST" | "PUT",
  shiftTeam: ShiftTeamInput,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: shiftTeam.name.trim(),
    }),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme vagtlag.");
  }

  return (await response.json()) as ShiftTeam;
}

async function sendAccessManagementMutation(
  path: string,
  method: "POST" | "PUT",
  user: AccessManagementUserInput,
) {
  const payload = {
    ...user,
    password: user.password?.trim() ? user.password.trim() : undefined,
  };

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme bruger.");
  }

  return (await response.json()) as AccessManagementUser;
}

async function sendEmploymentMutation(
  path: string,
  method: "POST" | "PUT",
  employment: EmploymentInput,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      userId: employment.userId,
      departmentId: employment.departmentId,
      personnelGroupId: employment.personnelGroupId,
      shiftTeamId: employment.shiftTeamId,
      hoursPerWeek: employment.hoursPerWeek,
      startDate: employment.startDate,
      endDate: employment.endDate,
    }),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme ansættelse.");
  }

  return (await response.json()) as Employment;
}

async function createApiError(response: Response, fallbackMessage: string) {
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    const validationMessages = data.errors
      ? Object.values(data.errors).flat().join(" ")
      : "";

    return new Error(data.message || validationMessages || fallbackMessage);
  } catch {
    return new Error(fallbackMessage);
  }
}
