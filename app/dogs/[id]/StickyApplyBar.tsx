"use client";

import Link from "next/link";
import NextWalk from "@/components/NextWalk";
import type { Dog } from "@/lib/types";
import { withJosa } from "@/lib/utils";

/**
 * 모바일 하단 고정 신청 바.
 * 이 화면에서는 하단 내비가 숨겨지므로 화면 맨 아래(안전 영역 포함)에 붙습니다.
 * 왼쪽에 다음 가능한 일정을 두어, 누르기 전에 '언제 갈 수 있는지'를 알 수 있게 합니다.
 * (찜은 사진 위 버튼으로 — 바에는 이 화면의 주요 행동 하나만)
 */
export default function StickyApplyBar({ dog }: { dog: Dog }) {
  const resting = dog.availability === "unavailable";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300/70 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(74,62,42,0.06)] backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-xl items-center gap-4">
        <NextWalk dog={dog} variant="stack" className="flex-1" />
        {resting ? (
          <button type="button" disabled className="btn-primary btn-lg shrink-0">
            지금은 쉬고 있어요
          </button>
        ) : (
          <Link href={`/dogs/${dog.id}/apply`} className="btn-primary btn-lg shrink-0 !px-7">
            {withJosa(dog.name, "와")} 산책 신청
          </Link>
        )}
      </div>
    </div>
  );
}
