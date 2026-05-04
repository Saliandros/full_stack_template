import { createPortal } from "react-dom";
import type { PropsWithChildren, RefObject } from "react";
import type { PopupPosition } from "../../hooks/useAnchoredPopup";

type AnchoredPopupProps = PropsWithChildren<{
  isOpen: boolean;
  popupRef: RefObject<HTMLDivElement | null>;
  position: PopupPosition | null;
  title: string;
  description: string;
  onClose: () => void;
  isBusy?: boolean;
}>;

export function AnchoredPopup({
  isOpen,
  popupRef,
  position,
  title,
  description,
  onClose,
  isBusy = false,
  children,
}: AnchoredPopupProps) {
  if (!isOpen || !position) {
    return null;
  }

  return createPortal(
    <div
      ref={popupRef}
      className="fixed z-[100] rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.22)]"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
      }}
    >
      <div className="absolute -top-2 right-8 h-4 w-4 rotate-45 border-l border-t border-slate-200 bg-white" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={isBusy}
          className="rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed"
        >
          Luk
        </button>
      </div>

      {children}
    </div>,
    document.body,
  );
}
