export type Department = {
  id: string;
  name: string;
  address: string;
  departmentTypeId: string | null;
};

export type AccessManagementUser = {
  id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isStaff: boolean;
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
    throw new Error(`Kunne ikke hente afdelinger (${response.status})`);
  }

  return (await response.json()) as Department[];
}

export async function getAccessManagementUsers() {
  const response = await fetch(`${getApiBaseUrl()}/api/user/access-management`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Kunne ikke hente brugere (${response.status})`);
  }

  return (await response.json()) as AccessManagementUser[];
}

export async function createAccessManagementUser(
  user: Omit<AccessManagementUser, "id">,
) {
  return sendAccessManagementMutation("/api/user/access-management", "POST", user);
}

export async function updateAccessManagementUser(
  id: string,
  user: Omit<AccessManagementUser, "id">,
) {
  return sendAccessManagementMutation(
    `/api/user/access-management/${id}`,
    "PUT",
    user,
  );
}

export async function deleteAccessManagementUser(id: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/user/access-management/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke slette bruger.");
  }

  return (await response.json()) as AccessManagementUser;
}

async function sendAccessManagementMutation(
  path: string,
  method: "POST" | "PUT",
  user: Omit<AccessManagementUser, "id">,
) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw await createApiError(response, "Kunne ikke gemme bruger.");
  }

  return (await response.json()) as AccessManagementUser;
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
