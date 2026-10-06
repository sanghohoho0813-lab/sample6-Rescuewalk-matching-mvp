"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";
import { useStore } from "@/lib/store";
import { formatDateKo, formatTimeKo, relativeDayLabel, todayISO, withJosa } from "@/lib/utils";

/**
 * 홈 히어로 하단 한 줄.
 * 다가오는 산책이 있으면 그 산책으로 바로 가는 지름길을, 없으면 서비스 규모를 보여줍니다.
 * (다시 찾아온 사용자가 '내 다음 산책'을 찾으려고 메뉴를 두세 번 누르지 않게)
 */
export default function HeroStatus({ todayCount, shelterCount }: { todayCount: number; shelterCount: number }) {
  const { requests, hydrated } = useStore();
  const today = todayISO();
  const next = hydrated
    ? requests
        .filter((r) => (r.status === "pending" || r.status === "confirmed") && r.date >= today)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
    : undefined;
  const dog = next ? getDog(next.dogId) : undefined;

  if (next && dog) {
    return (
      <Link
        href={`/requests/${next.id}`}
        className="mt-7 inline-flex max-w-full items-center gap-3 rounded-2xl border border-cream-300 bg-white py-2.5 pl-2.5 pr-4 transition-colors hover:border-sage-300"
      >
        <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl">
          <DogFace dog={dog} sizes="40px" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold text-ink-900">
            <span className="text-sage-700">{relativeDayLabel(next.date, today)}</span> · {withJosa(dog.name, "와")}의
            산책
          </span>
          <span className="block truncate text-sm text-ink-500">
            <span className="tnum">{formatDateKo(next.date)}</span> <span className="tnum">{formatTimeKo(next.time)}</span>
            {next.status === "pending" ? " · 보호소 확인 중" : " · 방문 확정"}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
      </Link>
    );
  }

  return (
    <p className="mt-8 text-sm text-ink-400">
      오늘 산책 가능한 아이 <strong className="tnum font-semibold text-ink-700">{todayCount}마리</strong>
      <span className="mx-2 text-cream-300">|</span>
      함께하는 보호소 <strong className="tnum font-semibold text-ink-700">{shelterCount}곳</strong>
    </p>
  );
}
