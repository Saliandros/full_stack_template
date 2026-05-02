import { SidebarMenuButton } from "./SidebarMenuButton";

type AdgangsstyringMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function AdgangsstyringMenuItem({
  isActive,
  onClick,
}: AdgangsstyringMenuItemProps) {
  return (
    <SidebarMenuButton
      label="Adgangsstyring"
      isActive={isActive}
      onClick={onClick}
    />
  );
}
