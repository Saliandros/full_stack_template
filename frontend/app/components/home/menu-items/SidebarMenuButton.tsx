type SidebarMenuButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

export function SidebarMenuButton({
  label,
  isActive,
  onClick,
}: SidebarMenuButtonProps) {
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
