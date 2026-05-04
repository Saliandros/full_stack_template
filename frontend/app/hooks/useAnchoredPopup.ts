import { useEffect, useState, type RefObject } from "react";

export type PopupPosition = {
  top: number;
  left: number;
  width: number;
};

type UseAnchoredPopupOptions = {
  isOpen: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  popupRef: RefObject<HTMLElement | null>;
  maxWidth: number;
  onClose: () => void;
};

export function useAnchoredPopup({
  isOpen,
  anchorRef,
  popupRef,
  maxWidth,
  onClose,
}: UseAnchoredPopupOptions) {
  const [popupPosition, setPopupPosition] = useState<PopupPosition | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPopupPosition(null);
      return;
    }

    function updatePopupPosition() {
      const anchor = anchorRef.current;
      if (!anchor) {
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const viewportPadding = 16;
      const preferredWidth = Math.min(
        maxWidth,
        window.innerWidth - viewportPadding * 2,
      );
      const left = Math.min(
        rect.right - preferredWidth,
        window.innerWidth - preferredWidth - viewportPadding,
      );

      setPopupPosition({
        top: rect.bottom + 12,
        left: Math.max(viewportPadding, left),
        width: preferredWidth,
      });
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;

      if (
        popupRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }

      onClose();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    updatePopupPosition();
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [anchorRef, isOpen, maxWidth, onClose, popupRef]);

  return popupPosition;
}
