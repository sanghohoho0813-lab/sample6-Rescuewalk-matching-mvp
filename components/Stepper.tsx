import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** 단계형 진행 표시 — 현재 단계만 강조하고 지난 단계는 체크로 */
export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start" aria-label={`신청 단계 ${current + 1} / ${steps.length}`}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3.5 h-0.5 w-full",
                  done || active ? "bg-sage-400" : "bg-cream-300"
                )}
              />
            )}
            <span
              aria-current={active ? "step" : undefined}
              className={cn(
                "relative flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold transition-colors duration-200",
                done && "bg-sage-500 text-white",
                active && "bg-ink-900 text-white",
                !done && !active && "bg-cream-200 text-ink-400"
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
            </span>
            <span
              className={cn(
                "mt-1.5 whitespace-nowrap text-xs",
                active ? "font-semibold text-ink-900" : "text-ink-400"
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
