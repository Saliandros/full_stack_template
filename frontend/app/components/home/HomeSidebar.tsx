import { useState, type ReactNode } from "react";
import { Form } from "react-router";
import { AdgangsstyringMenuItem } from "./menu-items/AdgangsstyringMenuItem";
import { AfsnitMenuItem } from "./menu-items/AfsnitMenuItem";
import { AnsaettelserMenuItem } from "./menu-items/AnsaettelserMenuItem";
import { PerioderMenuItem } from "./menu-items/PerioderMenuItem";
import { PersonalegrupperMenuItem } from "./menu-items/PersonalegrupperMenuItem";
import { PersonaleMenuItem } from "./menu-items/PersonaleMenuItem";
import { VagtlagMenuItem } from "./menu-items/VagtlagMenuItem";

export type HomeSidebarItem =
  | "Perioder"
  | "Adgangsstyring"
  | "Afsnit"
  | "Personalegrupper"
  | "Vagtlag"
  | "Ansaettelser"
  | "Personale";

type HomeSidebarProps = {
  children: (activeItem: HomeSidebarItem) => ReactNode;
};

export function HomeSidebar({ children }: HomeSidebarProps) {
  const [activeItem, setActiveItem] = useState<HomeSidebarItem>("Afsnit");

  return (
    <>
      <aside className="rounded-[1.75rem] bg-[#1f2b22] p-4 text-white">
        <div className="flex h-full flex-col">
          <div className="border-b border-white/10 px-2 pb-4">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-emerald-200/80">
              Vagtplan
            </p>
          </div>

          <nav className="mt-4 flex-1">
            <ul className="space-y-2">
              <PerioderMenuItem
                isActive={activeItem === "Perioder"}
                onClick={() => setActiveItem("Perioder")}
              />
              <AdgangsstyringMenuItem
                isActive={activeItem === "Adgangsstyring"}
                onClick={() => setActiveItem("Adgangsstyring")}
              />
              <AfsnitMenuItem
                isActive={activeItem === "Afsnit"}
                onClick={() => setActiveItem("Afsnit")}
              />
              <PersonalegrupperMenuItem
                isActive={activeItem === "Personalegrupper"}
                onClick={() => setActiveItem("Personalegrupper")}
              />
              <VagtlagMenuItem
                isActive={activeItem === "Vagtlag"}
                onClick={() => setActiveItem("Vagtlag")}
              />
              <AnsaettelserMenuItem
                isActive={activeItem === "Ansaettelser"}
                onClick={() => setActiveItem("Ansaettelser")}
              />
              <PersonaleMenuItem
                isActive={activeItem === "Personale"}
                onClick={() => setActiveItem("Personale")}
              />
            </ul>
          </nav>

          <Form method="post" className="mt-4 border-t border-white/10 pt-4">
            <input type="hidden" name="intent" value="logout" />
            <button
              type="submit"
              className="w-full rounded-2xl border border-white/12 px-4 py-3 text-left text-sm font-medium text-slate-200 transition hover:bg-white/8"
            >
              Log ud
            </button>
          </Form>
        </div>
      </aside>

      {children(activeItem)}
    </>
  );
}
