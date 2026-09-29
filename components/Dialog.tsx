"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * 모바일에서는 바텀시트, sm 이상에서는 중앙 모달.
 * - 열려 있는 동안 body 스크롤 잠금
 * - Esc / 배경 클릭으로 닫기 (busy 중에는 막음)
 * - 열릴 때 패널로 포커스 이동, 닫히면 원래 요소로 복귀
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer: ReactNode;
  busy?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose, busy]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 animate-fade-in bg-ink-900/45"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="relative max-h-[88vh] w-full animate-slide-up overflow-y-auto rounded-t-3xl bg-cream-50 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 outline-none sm:max-w-md sm:animate-fade-up sm:rounded-3xl sm:p-6 motion-reduce:animate-none"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-cream-300 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-lg font-bold text-ink-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="닫기"
            className="-mr-2 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700 disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {description && (
          <p id={descId} className="mt-1 text-[15px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex gap-2.5">{footer}</div>
      </div>
    </div>,
    document.body
  );
}
