"use client";

import { Check } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * 짧은 확인 메시지.
 * 알림 영역(role=status)을 항상 DOM 에 두고 내용만 바꿔야 스크린리더가 놓치지 않고 읽습니다.
 * 모바일에서는 하단 고정 바(내비·신청 버튼) 위로 띄웁니다.
 */
export default function Toast() {
  const { toast } = useStore();

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-50 flex justify-center px-4 md:bottom-10"
    >
      {toast && (
        <div
          key={toast.id}
          className="flex animate-fade-up items-center gap-2 rounded-full bg-ink-900/90 px-5 py-3 text-[15px] font-medium text-white shadow-card-hover backdrop-blur motion-reduce:animate-none"
        >
          <Check className="h-4 w-4 shrink-0 text-sage-300" aria-hidden />
          {toast.message}
        </div>
      )}
    </div>
  );
}
