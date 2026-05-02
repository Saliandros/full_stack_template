const DEFAULT_API_BASE_URL = "http://localhost:5166";

function getApiBaseUrl() {
  return (
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL
  ).replace(/\/$/, "");
}

export type LoginResponse = {
  userId: string;
  message: string;
};

export async function login(email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/api/login/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Forkert email eller adgangskode.");
  }

  return (await response.json()) as LoginResponse;
}
