import { redirect } from "react-router";
import type { Route } from "./+types/login";
import { LoginPage } from "../pages/login/LoginPage";
import { login } from "../services/authService";
import { createUserSession, getSession } from "../services/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login | Vagtplan" },
    { name: "description", content: "Login til Vagtplan" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.get("userId")) {
    throw redirect("/");
  }

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Indtast email og adgangskode." };
  }

  try {
    const result = await login(email, password);
    return createUserSession(result.userId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Login mislykkedes.",
    };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  return <LoginPage error={actionData?.error} />;
}
