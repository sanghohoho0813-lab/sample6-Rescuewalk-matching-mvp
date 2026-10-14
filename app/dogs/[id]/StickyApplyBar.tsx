"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import NextWalk from "@/components/NextWalk";
import type { Dog } from "@/lib/types";
import { withJosa } from "@/lib/utils";

/**
 * 모바일 하단 고정 신청 바.
 * 이 화면에서는 하단 내비가 숨겨지므로 화면 맨 아래(안전 영역 포함)에 붙습니다.
 * 버튼 위에 다음 가능한 일정을 붙여, 누르기 전에 '언제 갈 수 있는지'를 알 수 있게 합니다.
 */
export default function StickyApplyBar({ dog }: { dog: Dog }) {
  const resting = dog.availability === "unavailable";

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300/70 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-xl">
        {!resting && <NextWalk dog={dog} variant="line" className="mb-2 justify-center" />}
        <div className="flex items-center gap-3">
          <FavoriteButton
            dogId={dog.id}
            dogName={dog.name}
            className="!h-[52px] !w-[52px] shrink-0 border border-cream-300 !shadow-none"
          />
          {resting ? (
            <button type="button" disabled className="btn-primary btn-lg flex-1">
              지금은 쉬고 있어요
            </button>
          ) : (
            <Link href={`/dogs/${dog.id}/apply`} className="btn-primary btn-lg flex-1">
              {withJosa(dog.name, "와")} 산책 신청하기
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
