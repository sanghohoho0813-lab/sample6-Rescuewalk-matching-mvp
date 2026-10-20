"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DateCell from "@/components/DateCell";
import { getShelter } from "@/lib/data/shelters";
import { availabilityWindow, bookedSlotsByDate, scheduledSlots, weekdayOf } from "@/lib/domain/schedule";
import { useStore } from "@/lib/store";
import { useClock } from "@/lib/useClock";
import { cn, formatTimeKo } from "@/lib/utils";
import type { Dog } from "@/lib/types";

const DAY = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_TONE: Record<number, string> = { 0: "text-red-600", 6: "text-sage-700" };

/**
 * 상세의 '가능한 일정' — 2주 안에서 날짜를 고르면 그 날의 시간이 보이고,
 * 시간을 누르면 일정이 채워진 채로 신청이 시작됩니다(신청 화면에서 다시 고르지 않게).
 * 날짜 칸은 신청 1단계와 같은 7칸 달력(compact: PC 옆 패널은 이번 주 7일만).
 */
export default function DogSchedule({ dog, compact = false }: { dog: Dog; compact?: boolean }) {
  const clock = useClock();
  const { requests, hydrated } = useStore();
  const shelter = getShelter(dog.shelterId);
  const days = useMemo(() => {
    if (!clock || !shelter || !hydrated) return null;
    return availabilityWindow(dog, shelter, { ...clock, booked: bookedSlotsByDate(requests, dog.id) });
  }, [clock, shelter, hydrated, requests, dog]);
  const [picked, setPicked] = useState<string | null>(null);

  if (dog.availability === "unavailable") {
    return (
      <p className="rounded-2xl bg-cream-100 p-4 text-[15px] text-ink-500">
        지금은 산책 신청을 받지 않아요. 건강해지면 다시 열려요.
      </p>
    );
  }
  if (!days) {
    return (
      <div
        className={cn("animate-pulse rounded-2xl bg-cream-200/70", compact ? "h-[132px]" : "h-[196px]")}
        aria-busy="true"
        aria-label="일정을 불러오는 중"
      />
    );
  }

  const firstOpen = days.find((d) => d.open.length > 0)?.date ?? null;
  const selected = picked && days.some((d) => d.date === picked && d.open.length > 0) ? picked : firstOpen;
  const selectedDay = days.find((d) => d.date === selected);

  if (!firstOpen) {
    return (
      <p className="rounded-2xl bg-cream-100 p-4 text-[15px] text-ink-500">앞으로 2주 일정이 모두 찼어요.</p>
    );
  }

  return (
    <div>
      <ul className="grid grid-cols-7 gap-1.5" aria-label="날짜">
        {(compact ? days.slice(0, 7) : days).map((d) => {
          const [, m, day] = d.date.split("-").map(Number);
          const wd = weekdayOf(d.date);
          const open = d.open.length > 0;
          const isSel = d.date === selected;
          // 신청 1단계와 같은 구분: 보호소 휴무 / 그 날 시간이 다 참 / 이 아이가 산책하지 않는 요일
          const off = open
            ? null
            : d.closed
              ? "휴무"
              : shelter && scheduledSlots(dog, shelter, d.date).length > 0
                ? "마감"
                : "–";
          return (
            <li key={d.date}>
              <DateCell
                state={isSel ? "selected" : open ? "open" : "off"}
                top={d.date === clock?.today ? "오늘" : DAY[wd]}
                topClassName={WEEKDAY_TONE[wd]}
                day={day}
                sub={off ?? `${d.open.length}타임`}
                onClick={() => setPicked(d.date)}
                aria-pressed={isSel}
                aria-label={`${m}월 ${day}일 ${DAY[wd]}요일 ${open ? `${d.open.length}개 시간 가능` : off === "휴무" ? "보호소 휴무" : off === "마감" ? "신청 마감" : "산책하지 않는 날"}`}
              />
            </li>
          );
        })}
      </ul>

      {selectedDay && (
        <div className="mt-3">
          <p className="sr-only" aria-live="polite">
            {selectedDay.date} 가능한 시간 {selectedDay.open.length}개
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {selectedDay.open.map((t) => (
              <li key={t}>
                <Link
                  href={`/dogs/${dog.id}/apply?date=${selectedDay.date}&time=${t}`}
                  className="tnum flex min-h-[48px] items-center justify-center rounded-xl border border-cream-300 bg-white px-2 text-[15px] font-semibold text-ink-900 transition-colors hover:border-sage-500 hover:text-sage-800 active:bg-sage-50"
                >
                  {formatTimeKo(t)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[13px] text-ink-500">시간을 누르면 그 일정으로 바로 신청을 시작해요.</p>
        </div>
      )}
    </div>
  );
}
