"use client";

import { ALL_SLOTS } from "@/lib/domain/apply";
import { cn, formatTimeKo } from "@/lib/utils";

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
  // 이 아이가 원래 산책하지 않는 시간은 보여주지 않습니다(고를 수 없는 칸이 화면을 채우지 않게)
  const slots = ALL_SLOTS.filter((s) => availableTimes.includes(s));
  if (slots.length === 0) {
    return (
      <p className="rounded-2xl bg-cream-100 p-4 text-[15px] text-ink-500">
        이 날은 신청할 수 있는 시간이 없어요.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
      {slots.map((slot) => {
        const booked = bookedTimes.includes(slot);
        const past = pastTimes.includes(slot);
        const available = !booked && !past;
        const selected = value === slot;
        const reason = booked ? "이미 신청함" : past ? "지난 시간" : null;
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
            {reason && <span className="mt-0.5 text-[13px] font-medium">{reason}</span>}
          </button>
        );
      })}
    </div>
  );
}
