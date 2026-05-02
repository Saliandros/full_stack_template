import { SidebarMenuButton } from "./SidebarMenuButton";

type PerioderMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function PerioderMenuItem({ isActive, onClick }: PerioderMenuItemProps) {
  return (
    <SidebarMenuButton label="Perioder" isActive={isActive} onClick={onClick} />
  );
}
