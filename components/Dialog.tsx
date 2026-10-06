"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 모바일에서는 바텀시트, sm 이상에서는 중앙 모달.
 * - 머리말 · 스크롤되는 본문 · 하단에 고정된 버튼 영역
 * - 열려 있는 동안 body 스크롤 잠금 + Tab 포커스가 시트 밖으로 나가지 않음
 * - Esc / 배경 클릭으로 닫기 (busy 중에는 막음), 닫히면 원래 요소로 포커스 복귀
 * - body[data-modal-open] 표시 → 화면에 떠 있는 공용 버튼(뒤로·앞으로)이 시트를 가리지 않게 숨김
 */
export default function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  busy = false,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer: ReactNode;
  busy?: boolean;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  // 최신 onClose/busy 를 effect 재실행 없이 쓰기 위해 ref 로 보관
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.dataset.modalOpen = "true";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyRef.current) {
        closeRef.current();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      delete document.body.dataset.modalOpen;
      window.removeEventListener("keydown", onKey);
      prevFocus?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="닫기"
        tabIndex={-1}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 animate-fade-in bg-ink-900/45 motion-reduce:animate-none"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[90dvh] w-full animate-slide-up flex-col rounded-t-3xl bg-cream-50 outline-none sm:max-w-md sm:animate-fade-up sm:rounded-3xl motion-reduce:animate-none",
          className
        )}
      >
        <div className="shrink-0 px-5 pt-3 sm:px-6 sm:pt-6">
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
              className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-cream-200 hover:text-ink-700 disabled:opacity-40"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {description && (
            <p id={descId} className="mt-1 text-[15px] leading-relaxed text-ink-500">
              {description}
            </p>
          )}
        </div>
        {children && <div className="min-h-0 flex-1 overflow-y-auto px-5 pt-5 sm:px-6">{children}</div>}
        <div className="flex shrink-0 gap-2.5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-6 sm:pb-6">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
}
