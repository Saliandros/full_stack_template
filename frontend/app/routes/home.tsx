import type { Route } from "./+types/home";
import { getDepartments } from "../services/apiService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Vagtplan" },
    {
      name: "description",
      content: "Frontend der viser forbindelse til backend og database.",
    },
  ];
}

export async function loader() {
  try {
    const departments = await getDepartments();

    return {
      apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5166")
        .trim()
        .replace(/\/$/, ""),
      departments,
      connected: true,
      error: null,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    return {
      apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5166")
        .trim()
        .replace(/\/$/, ""),
      departments: [],
      connected: false,
      error:
        error instanceof Error
          ? error.message
          : "Ukendt fejl ved hentning af data.",
      fetchedAt: new Date().toISOString(),
    };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { apiBaseUrl, connected, departments, error, fetchedAt } = loaderData;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#f3f7f4_0%,#edf3ef_45%,#dfe9e3_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_20px_80px_rgba(27,59,43,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                Frontend ↔ backend ↔ database
              </span>
              <div className="space-y-2">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                  Frontenden kan nu vise, at den henter data fra databasen
                </h1>
                <p className="text-base leading-7 text-slate-600">
                  Siden loader afdelinger fra API'et og viser både forbindelsesstatus
                  og et lille data-preview direkte i interfacet.
                </p>
              </div>
            </div>

            <div
              className={`w-full max-w-sm rounded-3xl border p-5 ${
                connected
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-rose-200 bg-rose-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    connected ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                  Datastatus
                </p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {connected ? "Forbundet" : "Ikke forbundet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                API: <span className="font-medium text-slate-800">{apiBaseUrl}</span>
              </p>
              <p className="text-sm leading-6 text-slate-600">
                Sidst hentet:{" "}
                <span className="font-medium text-slate-800">
                  {new Date(fetchedAt).toLocaleString("da-DK")}
                </span>
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                  Afsnit fra databasen
                </p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                  {departments.length}
                </h2>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-medium text-white">
                {connected ? "Live data" : "Ingen data"}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <div
                    key={department.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">
                          {department.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {department.address}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500">
                        {department.departmentTypeId ? "Type sat" : "Ingen type"}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-600">
                  {error || "Der blev ikke fundet nogen afdelinger."}
                </div>
              )}
            </div>
          </article>

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-slate-50 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
              Hvad det demonstrerer
            </p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                UI&apos;en viser en klar indikator for om backend-kaldet lykkes.
              </p>
              <p>
                Hvis API&apos;et svarer, vises rækker fra databasen direkte på siden.
              </p>
              <p>
                Hvis forbindelsen fejler, vises fejlen i stedet, så man hurtigt kan se,
                at problemet ligger i backend, URL eller databaseforbindelsen.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
