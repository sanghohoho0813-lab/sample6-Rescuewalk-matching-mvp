"use client";

import { cn, formatTimeKo } from "@/lib/utils";

export const ALL_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function TimeSlotPicker({
  availableTimes,
  bookedTimes = [],
  pastTimes = [],
  value,
  onChange,
}: {
  availableTimes: string[];
  bookedTimes?: string[];
  /** 오늘 이미 지난 시간 */
  pastTimes?: string[];
  value: string | null;
  onChange: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {ALL_SLOTS.map((slot) => {
        const booked = bookedTimes.includes(slot);
        const past = pastTimes.includes(slot);
        const offered = availableTimes.includes(slot);
        const available = offered && !booked && !past;
        const selected = value === slot;
        const reason = booked ? "신청함" : past ? "지난 시간" : !offered ? "불가" : null;
        return (
          <button
            key={slot}
            type="button"
            disabled={!available}
            onClick={() => onChange(slot)}
            aria-pressed={selected}
            aria-label={`${formatTimeKo(slot)}${reason ? ` (${reason})` : ""}`}
            className={cn(
              "flex min-h-[56px] flex-col items-center justify-center rounded-2xl border text-[15px] font-semibold transition-colors duration-150",
              selected && "border-sage-600 bg-sage-600 text-white",
              !selected && available && "border-cream-300 bg-white text-ink-900 hover:border-sage-400",
              !available && "cursor-not-allowed border-transparent bg-cream-100 text-ink-300"
            )}
          >
            <span className="tnum">{formatTimeKo(slot)}</span>
            {reason && <span className="mt-0.5 text-xs font-medium">{reason}</span>}
          </button>
        );
      })}
    </div>
  );
}
