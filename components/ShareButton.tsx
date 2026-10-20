"use client";

import { Share2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * 아이 소개 공유 — 휴대폰은 기기의 공유 시트(카카오톡·문자 등), 지원하지 않으면 링크 복사.
 * 친구와 함께 봉사를 오거나, 입양을 고민하는 지인에게 아이를 알리는 가장 흔한 행동입니다.
 */
export default function ShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text: string;
  className?: string;
}) {
  const { showToast } = useStore();

  const share = async () => {
    const url = window.location.href.split("#")[0];
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        // 사용자가 공유 시트를 닫은 경우는 조용히
        if ((e as DOMException)?.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("링크를 복사했어요");
    } catch {
      showToast("주소창의 링크를 복사해 공유해주세요");
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      aria-label={`${title} 공유하기`}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-700 shadow-card backdrop-blur transition-transform active:scale-95",
        className
      )}
    >
      <Share2 className="h-[18px] w-[18px]" aria-hidden />
    </button>
  );
}
