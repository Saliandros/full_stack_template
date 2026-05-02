import { SidebarMenuButton } from "./SidebarMenuButton";

type VagtlagMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function VagtlagMenuItem({ isActive, onClick }: VagtlagMenuItemProps) {
  return <SidebarMenuButton label="Vagtlag" isActive={isActive} onClick={onClick} />;
}
