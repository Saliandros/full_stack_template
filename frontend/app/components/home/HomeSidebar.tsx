import { useState, type ReactNode } from "react";
import { Form } from "react-router";

export type HomeSidebarItem =
  | "Perioder"
  | "Adgangsstyring"
  | "Afsnit"
  | "Personalegrupper"
  | "Vagtlag"
  | "Ansaettelser"
  | "Personale";

const sidebarItems: HomeSidebarItem[] = [
  "Perioder",
  "Adgangsstyring",
  "Afsnit",
  "Personalegrupper",
  "Vagtlag",
  "Ansaettelser",
  "Personale",
];

type HomeSidebarProps = {
  children: (activeItem: HomeSidebarItem) => ReactNode;
};

function SidebarMenuButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        className={`w-full rounded-2xl px-4 py-3 text-left text-sm transition ${
          isActive
            ? "bg-[#f0b63f] font-semibold text-slate-950"
            : "text-slate-200 hover:bg-white/8"
        }`}
      >
        {label}
      </button>
    </li>
  );
}

export function HomeSidebar({ children }: HomeSidebarProps) {
  const [activeItem, setActiveItem] = useState<HomeSidebarItem>("Adgangsstyring");

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
              {sidebarItems.map((item) => (
                <SidebarMenuButton
                  key={item}
                  label={item}
                  isActive={activeItem === item}
                  onClick={() => setActiveItem(item)}
                />
              ))}
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
