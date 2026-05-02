import type { Route } from "./+types/home";
import { useState } from "react";
import { getDepartments } from "../services/apiService";

const menuItems = [
  "Perioder",
  "Adgangsstyring",
  "Afsnit",
  "Personalegrupper",
  "Vagtlag",
  "Ansættelser",
  "Personale",
] as const;

type MenuItem = (typeof menuItems)[number];

const titles: Record<MenuItem, string> = {
  Perioder: "Perioder",
  Adgangsstyring: "Adgangsstyring",
  Afsnit: "Afsnit",
  Personalegrupper: "Personalegrupper",
  Vagtlag: "Vagtlag",
  Ansættelser: "Ansættelser",
  Personale: "Personale",
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Vagtplan" },
    { name: "description", content: "Vagtplan frontend" },
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
    };
  }
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { connected, departments, error } = loaderData;
  const [activeItem, setActiveItem] = useState<MenuItem>("Afsnit");

  return (
    <main className="min-h-screen bg-[#f4f1ea] p-4 text-slate-900 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[1.75rem] bg-[#1f2b22] p-4 text-white">
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 px-2 pb-4">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
                Vagtplan
              </p>
            </div>

            <nav className="mt-4 flex-1">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = item === activeItem;

                  return (
                    <li key={item}>
                      <button
                        type="button"
                        onClick={() => setActiveItem(item)}
                        aria-pressed={isActive}
                        className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
                          isActive
                            ? "bg-[#f0b63f] font-semibold text-slate-950"
                            : "text-slate-200 hover:bg-white/8"
                        }`}
                      >
                        {item}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </aside>

        <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {titles[activeItem]}
              </h1>
            </div>

            <div
              className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-sm ${
                connected
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {connected ? "Forbundet" : "Ikke forbundet"}
            </div>
          </div>

          <div className="mt-6">
            {activeItem === "Afsnit" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-950">
                    Afsnit
                  </h2>
                  <span className="text-sm text-slate-500">
                    {departments.length}
                  </span>
                </div>

                {departments.length > 0 ? (
                  <div className="grid gap-3">
                    {departments.map((department) => (
                      <div
                        key={department.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                      >
                        <p className="font-medium text-slate-950">
                          {department.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {department.address}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600">
                    {error || "Ingen afsnit fundet."}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">
                {titles[activeItem]}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
