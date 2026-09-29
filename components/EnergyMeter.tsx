import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnergyLevel } from "@/lib/types";

export default function EnergyMeter({
  level,
  className,
  showLabel = false,
}: {
  level: EnergyLevel;
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`에너지 레벨 5점 만점에 ${level}점`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <PawPrint
          key={i}
          aria-hidden
          className={cn(
            "h-3.5 w-3.5",
            i <= level ? "fill-sage-500 text-sage-500" : "text-cream-300"
          )}
        />
      ))}
      {showLabel && (
        <span className="ml-1 text-xs font-medium text-ink-500">에너지 {level}/5</span>
      )}
    </span>
  );
}
