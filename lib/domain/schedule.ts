import type { Dog, Shelter, Weekday, WalkRequest } from "@/lib/types";

/**
 * 산책 일정 규칙 — "이 아이를 이 날, 이 시간에 신청할 수 있는가"의 단일 기준.
 *
 *   가능한 시간 = 아이의 산책 요일 ∩ 보호소 운영일
 *              → 아이의 시작 시각 목록
 *              − 같은 아이에 이미 열린 신청이 있는 시간
 *              − (당일이면) 지금부터 준비 시간 안에 시작하는 시간
 *
 * 카드·상세·보호소·신청 화면이 모두 이 함수들을 써서, 화면마다 '가능'의 뜻이 달라지지 않게 합니다.
 * 시각(now)은 인자로 받습니다 — 서버 렌더와 브라우저의 날짜가 다를 수 있어 화면에서 주입합니다.
 */

/** 당일 신청은 시작까지 이만큼 여유가 있어야 합니다(보호소 준비 시간) */
export const SAME_DAY_LEAD_MIN = 30;
/** 신청을 받는 기간 */
export const BOOKING_WINDOW_DAYS = 14;

const DAY = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function weekdayOf(iso: string): Weekday {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay() as Weekday;
}

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(y, m - 1, d + n);
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}

export const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "10:00 – 17:00" → 열고 닫는 시각(분). 형식이 다르면 null */
export function shelterHours(shelter: Pick<Shelter, "hours">): { open: number; close: number } | null {
  const m = shelter.hours.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  return m ? { open: toMinutes(m[1]), close: toMinutes(m[2]) } : null;
}

/** "월요일 휴무" / "월·화 휴무" / "연중무휴" */
export function closedDaysLabel(shelter: Pick<Shelter, "closedDays">): string {
  const days = [...shelter.closedDays].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (days.length === 0) return "연중무휴";
  if (days.length === 1) return `${DAY[days[0]]}요일 휴무`;
  return `${days.map((d) => DAY[d]).join("·")} 휴무`;
}

export const isShelterOpen = (shelter: Pick<Shelter, "closedDays">, iso: string) =>
  !shelter.closedDays.includes(weekdayOf(iso));

/** 그 날 원래 정해진 시작 시각(신청·당일 여부와 무관) */
export function scheduledSlots(
  dog: Pick<Dog, "availability" | "walkDays" | "availableTimes">,
  shelter: Pick<Shelter, "closedDays">,
  iso: string
): string[] {
  if (dog.availability !== "available") return [];
  if (!isShelterOpen(shelter, iso) || !dog.walkDays.includes(weekdayOf(iso))) return [];
  return dog.availableTimes;
}

/** 오늘이라면 이미 지났거나 곧 시작해 준비가 어려운 시각 */
export function pastSlots(slots: readonly string[], iso: string, now: Date, today: string): string[] {
  if (iso !== today) return [];
  const cutoff = now.getHours() * 60 + now.getMinutes() + SAME_DAY_LEAD_MIN;
  return slots.filter((s) => toMinutes(s) <= cutoff);
}

/** 같은 아이에게 이미 신청해 둔(취소 제외) 날짜별 시각 */
export function bookedSlotsByDate(requests: readonly WalkRequest[], dogId: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const r of requests) {
    if (r.dogId !== dogId || r.status === "cancelled") continue;
    map.set(r.date, [...(map.get(r.date) ?? []), r.time]);
  }
  return map;
}

export interface ScheduleContext {
  now: Date;
  today: string;
  /** 사용자의 기존 신청(같은 시간 중복 신청 방지). 목록 화면처럼 모를 때는 생략 */
  booked?: Map<string, string[]>;
}

/** 그 날 실제로 고를 수 있는 시각 */
export function openSlotsOn(
  dog: Pick<Dog, "availability" | "walkDays" | "availableTimes">,
  shelter: Pick<Shelter, "closedDays">,
  iso: string,
  ctx: ScheduleContext
): string[] {
  const slots = scheduledSlots(dog, shelter, iso);
  if (slots.length === 0 || iso < ctx.today) return [];
  const blocked = new Set([...(ctx.booked?.get(iso) ?? []), ...pastSlots(slots, iso, ctx.now, ctx.today)]);
  return slots.filter((t) => !blocked.has(t));
}

/** 오늘부터 n일 동안의 날짜별 가능 시각 */
export function availabilityWindow(
  dog: Pick<Dog, "availability" | "walkDays" | "availableTimes">,
  shelter: Pick<Shelter, "closedDays">,
  ctx: ScheduleContext,
  days = BOOKING_WINDOW_DAYS
): { date: string; open: string[]; closed: boolean }[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(ctx.today, i);
    return { date, open: openSlotsOn(dog, shelter, date, ctx), closed: !isShelterOpen(shelter, date) };
  });
}

/** 가장 빨리 신청할 수 있는 일정. 기간 안에 없으면 null */
export function nextOpening(
  dog: Pick<Dog, "availability" | "walkDays" | "availableTimes">,
  shelter: Pick<Shelter, "closedDays">,
  ctx: ScheduleContext,
  days = BOOKING_WINDOW_DAYS
): { date: string; time: string } | null {
  for (const d of availabilityWindow(dog, shelter, ctx, days)) {
    if (d.open.length > 0) return { date: d.date, time: d.open[0] };
  }
  return null;
}

/** 이번 주(오늘 포함 7일) 산책 가능한 날 수 */
export function openDaysThisWeek(
  dog: Pick<Dog, "availability" | "walkDays" | "availableTimes">,
  shelter: Pick<Shelter, "closedDays">,
  ctx: ScheduleContext
): number {
  return availabilityWindow(dog, shelter, ctx, 7).filter((d) => d.open.length > 0).length;
}

/** 카드·목록용 짧은 일정 표기: "오늘", "내일", "목요일", "10월 22일" */
export function dayLabel(iso: string, today: string): string {
  const [ty, tm, td] = today.split("-").map(Number);
  const [y, m, d] = iso.split("-").map(Number);
  const diff = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "내일";
  if (diff > 1 && diff < 7) return `${DAY[weekdayOf(iso)]}요일`;
  return `${m}월 ${d}일`;
}

/** 보호소 운영 시간 안에서 산책을 마칠 수 있는지 — 데이터 무결성 검사용 */
export function slotFitsHours(slot: string, shelter: Pick<Shelter, "hours">, walkMin = 60): boolean {
  const h = shelterHours(shelter);
  if (!h) return false;
  const start = toMinutes(slot);
  return start >= h.open && start + walkMin <= h.close;
}
