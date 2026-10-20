"use client";

import { Check } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * 짧은 확인 메시지.
 * 알림 영역(role=status)을 항상 DOM 에 두고 내용만 바꿔야 스크린리더가 놓치지 않고 읽습니다.
 * 모바일에서는 하단 고정 바(내비·신청 버튼) 위로 띄웁니다.
 * 되돌릴 수 있는 일(찜 해제 등)은 '되돌리기'를 함께 — 확인 창 없이 실수를 바로 고칠 수 있게.
 */
export default function Toast() {
  const { toast, hideToast } = useStore();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-10"
    >
      {toast && (
        <div
          key={toast.id}
          className="flex max-w-full animate-fade-up items-center gap-2 rounded-full bg-ink-900/90 py-2 pl-5 text-[15px] font-medium text-white shadow-card-hover backdrop-blur motion-reduce:animate-none"
          style={{ paddingRight: toast.action ? "0.5rem" : "1.25rem" }}
        >
          <Check className="h-4 w-4 shrink-0 text-sage-300" aria-hidden />
          <span className="min-w-0 py-1">{toast.message}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                hideToast();
              }}
              className="pointer-events-auto ml-1 min-h-[36px] shrink-0 rounded-full bg-white/15 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/25"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
