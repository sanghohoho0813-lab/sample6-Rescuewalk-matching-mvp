import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 날짜 한 칸 — 신청 1단계와 상세의 '가능한 일정'이 같은 모양·같은 상태 표현을 씁니다.
 * 7칸씩 놓이므로(같은 열 = 같은 요일) 휴무 요일이 세로로 줄지어 보여 운영 패턴이 한눈에 읽힙니다.
 *  - selected: 고른 날 / open: 고를 수 있는 날 / off: 휴무·마감·산책하지 않는 날
 */
export default function DateCell({
  top,
  day,
  sub,
  state,
  topClassName,
  compact = false,
  className,
  ...button
}: {
  top: ReactNode;
  day: number;
  sub: ReactNode;
  state: "selected" | "open" | "off";
  /** 요일 글자색(주말 등) — 고르지 않은 열린 날에만 */
  topClassName?: string;
  /** 좁은 자리(PC 옆 패널): 아래 글자 대신 점 하나 — 자세한 내용은 읽는 이름(aria-label)에 */
  compact?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">) {
  return (
    <button
      type="button"
      disabled={state === "off"}
      className={cn(
        compact ? "min-h-[58px]" : "min-h-[64px]",
        "flex w-full flex-col items-center justify-center rounded-xl border px-0.5 transition-[background-color,border-color,box-shadow] duration-150",
        state === "selected" &&
          "border-sage-600 bg-sage-600 text-white shadow-[0_4px_12px_rgba(90,122,64,0.28)]",
        state === "open" && "border-cream-300 bg-white hover:border-sage-400 active:bg-sage-50",
        state === "off" && "cursor-not-allowed border-transparent bg-cream-100/80 text-ink-400",
        className
      )}
      {...button}
    >
      <span
        className={cn(
          "whitespace-nowrap text-[13px] leading-tight",
          state === "selected"
            ? "text-white"
            : state === "off"
              ? "text-ink-400"
              : (topClassName ?? "text-ink-500")
        )}
      >
        {top}
      </span>
      <span
        className={cn(
          "tnum mt-0.5 text-base font-semibold leading-tight",
          state === "open" && "text-ink-900"
        )}
      >
        {day}
      </span>
      {compact ? (
        <span
          aria-hidden
          className={cn(
            "mt-1.5 h-1.5 w-1.5 rounded-full",
            state === "selected" ? "bg-white" : state === "open" ? "bg-sage-500" : "bg-transparent"
          )}
        />
      ) : (
        <span
          className={cn(
            "mt-0.5 whitespace-nowrap text-[13px] leading-tight tracking-tight",
            state === "selected" ? "text-white" : state === "off" ? "text-ink-400" : "text-sage-700"
          )}
        >
          {sub}
        </span>
      )}
    </button>
  );
}
