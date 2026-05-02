import { SidebarMenuButton } from "./SidebarMenuButton";

type AnsaettelserMenuItemProps = {
  isActive: boolean;
  onClick: () => void;
};

export function AnsaettelserMenuItem({
  isActive,
  onClick,
}: AnsaettelserMenuItemProps) {
  return (
    <SidebarMenuButton
      label="Ansaettelser"
      isActive={isActive}
      onClick={onClick}
    />
  );
}
