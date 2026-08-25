"use client";

import { cn, formatTimeKo } from "@/lib/utils";

const ALL_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

export default function TimeSlotPicker({
  availableTimes,
  bookedTimes = [],
  value,
  onChange,
}: {
  availableTimes: string[];
  bookedTimes?: string[];
  value: string | null;
  onChange: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {ALL_SLOTS.map((slot) => {
        const booked = bookedTimes.includes(slot);
        const available = availableTimes.includes(slot) && !booked;
        const selected = value === slot;
        return (
          <button
            key={slot}
            type="button"
            disabled={!available}
            onClick={() => onChange(slot)}
            aria-pressed={selected}
            className={cn(
              "flex min-h-[52px] flex-col items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-200",
              selected &&
                "scale-[1.03] border-tangerine-500 bg-tangerine-500 text-white shadow-cta",
              !selected &&
                available &&
                "border-cream-300 bg-white text-ink-700 hover:border-tangerine-300 hover:bg-tangerine-50",
              !available &&
                "cursor-not-allowed border-cream-200 bg-cream-100 text-ink-300 line-through decoration-ink-300/60"
            )}
          >
            {formatTimeKo(slot)}
            {booked && <span className="text-[10px] font-medium no-underline">마감</span>}
          </button>
        );
      })}
    </div>
  );
}
