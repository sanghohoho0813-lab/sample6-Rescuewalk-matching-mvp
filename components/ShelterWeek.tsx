"use client";

import { dogs } from "@/lib/data/dogs";
import { addDays, isShelterOpen, openSlotsOn, shelterHours, weekdayOf } from "@/lib/domain/schedule";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/lib/types";

const DAY = ["일", "월", "화", "수", "목", "금", "토"];

/** 지금 운영 중인지 — 방문자의 시각 기준 */
export function ShelterOpenNow({ shelter, className }: { shelter: Shelter; className?: string }) {
  const clock = useClock();
  if (!clock) return <span className={cn("inline-block h-6 w-20", className)} aria-hidden />;
  const hours = shelterHours(shelter);
  const open = isShelterOpen(shelter, clock.today);
  const min = clock.now.getHours() * 60 + clock.now.getMinutes();
  const label = !open
    ? "오늘 휴무"
    : hours && min >= hours.open && min < hours.close
      ? "지금 운영 중"
      : "운영 시간 아님";
  const on = label === "지금 운영 중";
  return (
    <span
      className={cn(
        "chip font-semibold",
        on ? "bg-sage-100 text-sage-800" : "bg-cream-200 text-ink-700",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", on ? "bg-sage-600" : "bg-ink-400")} aria-hidden />
      {label}
    </span>
  );
}

/**
 * 이번 주(오늘부터 7일) 산책 일정 — 날마다 몇 마리가 몇 타임 가능한지.
 * 봉사자는 '언제 가면 되는지', 보호소는 '어느 날이 비는지'를 한눈에 봅니다.
 */
export default function ShelterWeek({ shelter }: { shelter: Shelter }) {
  const clock = useClock();
  if (!clock) return <div className="h-[104px] animate-pulse rounded-2xl bg-cream-200/70" aria-busy="true" />;
  const residents = dogs.filter((d) => d.shelterId === shelter.id);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(clock.today, i);
    const open = isShelterOpen(shelter, date);
    const perDog = residents.map((d) => openSlotsOn(d, shelter, date, clock).length);
    return {
      date,
      open,
      dogsCount: perDog.filter((n) => n > 0).length,
      slots: perDog.reduce((a, b) => a + b, 0),
    };
  });

  return (
    <ul className="grid grid-cols-7 gap-1.5" aria-label="이번 주 산책 일정">
      {week.map((d) => {
        const [, , dd] = d.date.split("-").map(Number);
        const has = d.slots > 0;
        return (
          <li
            key={d.date}
            className={cn(
              "flex flex-col items-center rounded-2xl py-2.5 text-center",
              has ? "bg-white ring-1 ring-cream-300" : "bg-cream-100"
            )}
          >
            <span className="text-[13px] text-ink-500">
              {d.date === clock.today ? "오늘" : DAY[weekdayOf(d.date)]}
            </span>
            <span className="tnum text-[15px] font-semibold text-ink-900">{dd}</span>
            <span className={cn("mt-1 text-[13px] font-semibold", has ? "text-sage-700" : "text-ink-500")}>
              {!d.open ? "휴무" : has ? `${d.dogsCount}마리` : "마감"}
            </span>
            <span className="sr-only">{has ? `${d.slots}개 시간 가능` : ""}</span>
          </li>
        );
      })}
    </ul>
  );
}
