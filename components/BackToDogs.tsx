"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DOGS_LIST_HREF_KEY, safeSession } from "@/lib/storageKeys";
import { cn } from "@/lib/utils";

/**
 * 상세 → 목록으로 돌아갈 때, 보던 필터·정렬 조건을 그대로 유지합니다.
 * variant="overlay": 모바일 상세에서 사진 위에 떠 있는 원형 버튼
 */
export default function BackToDogs({
  variant = "link",
  className,
}: {
  variant?: "link" | "overlay";
  className?: string;
}) {
  const [href, setHref] = useState("/dogs");

  useEffect(() => {
    const saved = safeSession.get(DOGS_LIST_HREF_KEY);
    // 같은 사이트의 목록 주소만 신뢰(다른 값이 들어 있어도 엉뚱한 곳으로 보내지 않게)
    if (saved && /^\/dogs(\?|$)/.test(saved)) setHref(saved);
  }, []);

  if (variant === "overlay") {
    return (
      <Link
        href={href}
        aria-label="강아지 찾기"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink-900 shadow-card backdrop-blur transition-transform active:scale-95",
          className
        )}
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden /> 강아지 찾기
    </Link>
  );
}
