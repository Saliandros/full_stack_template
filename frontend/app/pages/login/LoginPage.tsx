import { Form } from "react-router";

type LoginPageProps = {
  error?: string;
};

export function LoginPage({ error }: LoginPageProps) {
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

            {error ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
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
