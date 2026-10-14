"use client";

import { Check, X } from "lucide-react";
import { visitStages } from "@/lib/domain/requests";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/utils";
import type { WalkRequest } from "@/lib/types";

/** 단계 아래 날짜 — 다섯 칸이 모바일 한 줄에 들어가도록 날짜만 */
function day(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

/**
 * 신청 진행 단계: 접수 → 승인 → 방문 예정 → 산책 → 완료
 * 지금 단계만 강조하고, 지난 단계에는 언제 그렇게 됐는지 시각을 남깁니다.
 */
export default function VisitStages({ req, className }: { req: WalkRequest; className?: string }) {
  const clock = useClock();
  const stages = visitStages(req, clock?.now ?? new Date(0));
  const cancelled = req.status === "cancelled";

  return (
    <ol className={cn("grid grid-cols-5", className)} aria-label="신청 진행 단계">
      {stages.map((s, i) => {
        const done = s.state === "done";
        const current = s.state === "current" && !!clock;
        return (
          <li
            key={s.key}
            className="relative flex flex-col items-center text-center"
            aria-current={current ? "step" : undefined}
          >
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                  done || current ? "bg-sage-400" : "bg-cream-300"
                )}
              />
            )}
            <span
              className={cn(
                "relative z-[1] flex h-6 w-6 items-center justify-center rounded-full border-2",
                done && "border-sage-600 bg-sage-600 text-white",
                current && "border-tangerine-600 bg-white",
                !done && !current && "border-cream-300 bg-white"
              )}
            >
              {done && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
              {current && <span className="h-2 w-2 rounded-full bg-tangerine-600" aria-hidden />}
            </span>
            <span
              className={cn(
                "mt-2 whitespace-nowrap text-[13px] font-semibold",
                done ? "text-ink-900" : current ? "text-tangerine-700" : "text-ink-500"
              )}
            >
              {s.label}
            </span>
            <span className="tnum mt-0.5 min-h-[18px] text-[13px] text-ink-500">
              {done ? (day(s.at) ?? "") : current ? "지금" : ""}
              <span className="sr-only">{done ? " 완료" : current ? " 진행 중" : " 예정"}</span>
            </span>
          </li>
        );
      })}
      {cancelled && (
        <li className="col-span-5 mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-500">
          <X className="h-4 w-4" aria-hidden /> {day(req.cancelledAt)} 신청을 취소했어요
        </li>
      )}
    </ol>
  );
}
