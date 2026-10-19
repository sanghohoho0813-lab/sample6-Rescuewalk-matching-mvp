"use client";

import { CalendarClock } from "lucide-react";
import { getShelter } from "@/lib/data/shelters";
import { dayLabel, nextOpening } from "@/lib/domain/schedule";
import { useClock } from "@/lib/useClock";
import { cn, formatTimeKo } from "@/lib/utils";
import type { Dog } from "@/lib/types";

/**
 * 다음 산책 가능 일정 — 방문자의 지금 시각 기준(브라우저에서만 계산).
 * badge: 사진 위 표시 / line: 본문 한 줄 / stack: 하단 고정 바의 두 줄(이름표 + 일정)
 */
export default function NextWalk({
  dog,
  variant,
  className,
}: {
  dog: Dog;
  variant: "badge" | "line" | "stack";
  className?: string;
}) {
  const clock = useClock();
  const resting = dog.availability === "unavailable";

  if (resting) {
    return variant === "badge" ? (
      <span className={cn("chip bg-ink-900/80 font-semibold text-white", className)}>잠시 쉬는 중</span>
    ) : (
      <p className={cn("text-sm font-medium text-ink-500", className)}>건강을 회복하고 있어요</p>
    );
  }

  const shelter = getShelter(dog.shelterId);
  const opening = clock && shelter ? nextOpening(dog, shelter, clock) : null;
  const today = clock && opening?.date === clock.today;
  const label = !clock
    ? null
    : opening
      ? `${dayLabel(opening.date, clock.today)} ${formatTimeKo(opening.time)}`
      : "2주 안 일정 마감";

  if (variant === "badge") {
    // 오늘 가능한 아이만 사진 위에서 강조합니다(나머지는 본문 한 줄로 충분)
    if (!today || !label) return null;
    return (
      <span className={cn("chip bg-white/95 font-semibold text-sage-800 shadow-card", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-sage-500" aria-hidden />
        오늘 산책 가능
      </span>
    );
  }

  if (variant === "stack") {
    return (
      <p className={cn("min-w-0 leading-tight", className)}>
        <span className="block text-[13px] text-ink-500">{opening || !label ? "다음 가능" : "일정"}</span>
        <span
          className={cn(
            "tnum mt-0.5 block min-h-[22px] text-base font-bold",
            today ? "text-sage-700" : opening ? "text-ink-900" : "text-ink-500"
          )}
        >
          {label ?? ""}
        </span>
      </p>
    );
  }

  return (
    <p className={cn("flex min-h-[20px] items-center gap-1.5 text-sm", className)}>
      {label && (
        <>
          <CalendarClock
            className={cn("h-4 w-4 shrink-0", opening ? "text-sage-600" : "text-ink-400")}
            aria-hidden
          />
          <span className={opening ? "text-ink-700" : "text-ink-500"}>
            {opening ? (
              <>
                <span className="text-ink-500">다음 가능</span>{" "}
                <span className={cn("tnum font-semibold", today ? "text-sage-700" : "text-ink-900")}>
                  {label}
                </span>
              </>
            ) : (
              label
            )}
          </span>
        </>
      )}
    </p>
  );
}
