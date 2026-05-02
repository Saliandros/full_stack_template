import { Form, redirect } from "react-router";
import type { Route } from "./+types/login";
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
      error:
        error instanceof Error
          ? error.message
          : "Login mislykkedes.",
    };
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <main className="min-h-screen bg-[#f4f1ea] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center justify-center">
        <section className="w-full max-w-md rounded-[1.75rem] bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="border-b border-slate-200 pb-6">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
              Vagtplan
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Log ind
            </h1>
          </div>

          <Form method="post" className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </span>
              <input
                name="email"
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Adgangskode
              </span>
              <input
                name="password"
                type="password"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
              />
            </label>

            {actionData?.error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {actionData.error}
              </p>
            ) : null}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#1f2b22] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#28352c]"
            >
              Log ind
            </button>
          </Form>
        </section>
      </div>
    </main>
  );
}
