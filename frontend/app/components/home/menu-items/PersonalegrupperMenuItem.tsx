import { SidebarMenuButton } from "./SidebarMenuButton";

type PersonalegrupperMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function PersonalegrupperMenuItem({
  isActive,
  onClick,
}: PersonalegrupperMenuItemProps) {
  return (
    <SidebarMenuButton
      label="Personalegrupper"
      isActive={isActive}
      onClick={onClick}
    />
  );
}
