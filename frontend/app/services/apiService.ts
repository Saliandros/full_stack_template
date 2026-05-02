export type Department = {
  id: string;
  name: string;
  address: string;
  departmentTypeId: string | null;
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
