import {
  HomeSidebar,
  type HomeSidebarItem,
} from "../../components/home/HomeSidebar";
import { AccessManagementSection } from "../../components/home/AccessManagementSection";
import type { AccessManagementUser } from "../../services/apiService";

type HomePageProps = {
  connected: boolean;
  users: AccessManagementUser[];
  usersError: string | null;
  currentUserIsAdmin: boolean;
};

const titles: Record<HomeSidebarItem, string> = {
  Perioder: "Perioder",
  Adgangsstyring: "Adgangsstyring",
  Afsnit: "Afsnit",
  Personalegrupper: "Personalegrupper",
  Vagtlag: "Vagtlag",
  Ansaettelser: "Ansaettelser",
  Personale: "Personale",
};

function renderSection(
  activeItem: HomeSidebarItem,
  users: AccessManagementUser[],
  usersError: string | null,
  currentUserIsAdmin: boolean,
) {
  if (activeItem === "Adgangsstyring") {
    return (
      <AccessManagementSection
        users={users}
        loadError={usersError}
        currentUserIsAdmin={currentUserIsAdmin}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-sm text-slate-500">
      {titles[activeItem]}
    </div>
  );
}

export function HomePage({
  connected,
  users,
  usersError,
  currentUserIsAdmin,
}: HomePageProps) {
  return (
    <main className="min-h-screen bg-[#f4f1ea] p-4 text-slate-900 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <HomeSidebar>
          {(activeItem) => (
            <section className="rounded-[1.75rem] bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-8">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                  {titles[activeItem]}
                </h1>

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
                {renderSection(
                  activeItem,
                  users,
                  usersError,
                  currentUserIsAdmin,
                )}
              </div>
            </section>
          )}
        </HomeSidebar>
      </div>
    </main>
  );
}
