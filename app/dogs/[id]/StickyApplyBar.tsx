"use client";

import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import type { Dog } from "@/lib/types";

/** 모바일 하단 고정 신청 바 — Bottom Navigation 위에 표시 */
export default function StickyApplyBar({ dog }: { dog: Dog }) {
  const unavailable = dog.availability === "unavailable";

  return (
    <div className="fixed inset-x-0 bottom-[calc(56px+env(safe-area-inset-bottom))] z-30 border-t border-cream-300/60 bg-white/95 px-4 py-3 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <FavoriteButton
          dogId={dog.id}
          dogName={dog.name}
          className="!h-12 !w-12 shrink-0 border border-cream-300 !shadow-none"
        />
        {unavailable ? (
          <button type="button" disabled className="btn-primary min-h-[48px] flex-1">
            지금은 쉬고 있어요
          </button>
        ) : (
          <Link href={`/dogs/${dog.id}/apply`} className="btn-primary min-h-[48px] flex-1">
            {dog.name}와 산책 신청하기
          </Link>
        )}
      </div>
    </div>
  );
}
