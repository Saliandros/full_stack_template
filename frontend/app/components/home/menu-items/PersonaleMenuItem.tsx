import { SidebarMenuButton } from "./SidebarMenuButton";

type PersonaleMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function PersonaleMenuItem({
  isActive,
  onClick,
}: PersonaleMenuItemProps) {
  return (
    <SidebarMenuButton label="Personale" isActive={isActive} onClick={onClick} />
  );
}
