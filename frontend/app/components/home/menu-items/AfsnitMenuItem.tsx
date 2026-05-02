import { SidebarMenuButton } from "./SidebarMenuButton";

type AfsnitMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function AfsnitMenuItem({ isActive, onClick }: AfsnitMenuItemProps) {
  return <SidebarMenuButton label="Afsnit" isActive={isActive} onClick={onClick} />;
}
