import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number; // 0-based
}) {
  return (
    <ol className="flex items-center" aria-label="신청 단계">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cn("flex items-center", i > 0 && "flex-1")}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-300 sm:mx-2",
                  done || active ? "bg-tangerine-400" : "bg-cream-300"
                )}
              />
            )}
            <span className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
                  done && "bg-sage-500 text-white",
                  active && "scale-110 bg-tangerine-500 text-white shadow-cta",
                  !done && !active && "bg-cream-200 text-ink-400"
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] font-medium sm:text-xs",
                  active ? "text-tangerine-600" : done ? "text-sage-600" : "text-ink-400"
                )}
              >
                {label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
