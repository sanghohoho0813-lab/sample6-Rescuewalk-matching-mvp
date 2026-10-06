import type { Dog, WalkRequest } from "@/lib/types";

/** 산책 신청 5단계의 규칙 — 화면과 분리해 단위 테스트합니다. */

export const STEP_LABELS = ["날짜", "시간", "정보", "주의사항", "확인"] as const;
export const LAST_STEP = STEP_LABELS.length - 1;

/** 보호소가 운영하는 산책 시간대. 각 아이는 이 중 일부만 가능합니다 */
export const ALL_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"] as const;

export const CAUTIONS = [
  "방문 10분 전까지 보호소에 도착할게요.",
  "산책하기 편한 복장과 운동화를 착용할게요.",
  "리드줄은 보호소 지침에 따라 두 손으로 잡을게요.",
  "산책 중 상황은 보호소 매니저의 안내를 따를게요.",
] as const;

/** 당일 신청은 시작까지 이만큼 여유가 있어야 합니다(보호소 준비 시간) */
export const SAME_DAY_LEAD_MIN = 30;
export const NAME_MAX = 20;
export const MEMO_MAX = 100;

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** 오늘이라면 이미 지났거나 곧 시작해 준비가 어려운 시간대 */
export function pastSlotsFor(dateISO: string, now: Date, todayISO: string): string[] {
  if (dateISO !== todayISO) return [];
  const cutoff = now.getHours() * 60 + now.getMinutes() + SAME_DAY_LEAD_MIN;
  return ALL_SLOTS.filter((s) => toMin(s) <= cutoff);
}

/** 같은 아이에게 이미 신청해 둔(취소 제외) 날짜별 시간 */
export function bookedSlotsByDate(requests: readonly WalkRequest[], dogId: string): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const r of requests) {
    if (r.dogId !== dogId || r.status === "cancelled") continue;
    map.set(r.date, [...(map.get(r.date) ?? []), r.time]);
  }
  return map;
}

/** 그 날 실제로 고를 수 있는 시간 = 아이의 가능 시간 − 이미 신청 − 지난 시간 */
export function openSlotsOn(
  dog: Pick<Dog, "availableTimes">,
  dateISO: string,
  booked: Map<string, string[]>,
  now: Date,
  todayISO: string
): string[] {
  const blocked = new Set([...(booked.get(dateISO) ?? []), ...pastSlotsFor(dateISO, now, todayISO)]);
  return dog.availableTimes.filter((t) => !blocked.has(t));
}

/** 숫자만 남겨 010-1234-5678 꼴로. 붙여넣기·지우기 중간 상태도 자연스럽게 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;

export interface ApplicantInput {
  name: string;
  phone: string;
  experienced: boolean | null;
}

export interface ApplicantErrors {
  name?: string;
  phone?: string;
  experienced?: string;
}

export function validateApplicant(a: ApplicantInput): ApplicantErrors {
  const errors: ApplicantErrors = {};
  if (a.name.trim().length === 0) errors.name = "이름을 입력해주세요.";
  else if (a.name.trim().length > NAME_MAX) errors.name = `이름은 ${NAME_MAX}자까지 입력할 수 있어요.`;
  if (!PHONE_RE.test(a.phone)) errors.phone = "010-0000-0000 형식으로 입력해주세요.";
  if (a.experienced === null) errors.experienced = "봉사 경험 여부를 선택해주세요.";
  return errors;
}

export interface ApplyDraft extends ApplicantInput {
  date: string | null;
  time: string | null;
  memo: string;
  agreed: boolean[];
}

/**
 * 앞 단계를 다 채운 만큼까지만 갈 수 있는 단계(0-based).
 * 주소의 ?step= 을 바꾸거나 새로고침해도 빈 확인 화면이 뜨지 않게 하는 기준입니다.
 */
export function maxReachableStep(d: ApplyDraft): number {
  if (!d.date) return 0;
  if (!d.time) return 1;
  if (Object.keys(validateApplicant(d)).length > 0) return 2;
  if (!d.agreed.every(Boolean)) return 3;
  return LAST_STEP;
}

/** ?step= (1-based) → 0-based, 범위 밖·숫자 아님은 첫 단계 */
export function parseStepParam(v: string | null): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? Math.min(n - 1, LAST_STEP) : 0;
}

/**
 * 저장된 임시 입력값을 복원할 때, 지금 기준으로 더는 유효하지 않은 선택(지난 날짜, 그새 찬 시간)은 버립니다.
 * 형식이 다른 값(직접 수정·이전 버전)도 기본값으로 돌립니다.
 */
export function restoreDraft(
  raw: unknown,
  ctx: { selectableDates: readonly string[]; openSlots: (date: string) => string[] },
  defaults: ApplyDraft
): ApplyDraft {
  if (typeof raw !== "object" || raw === null) return defaults;
  const d = raw as Record<string, unknown>;
  const date =
    typeof d.date === "string" && ctx.selectableDates.includes(d.date) && ctx.openSlots(d.date).length > 0
      ? d.date
      : null;
  const time = date && typeof d.time === "string" && ctx.openSlots(date).includes(d.time) ? d.time : null;
  return {
    date,
    time,
    name: typeof d.name === "string" ? d.name.slice(0, NAME_MAX) : defaults.name,
    phone: typeof d.phone === "string" ? formatPhone(d.phone) : defaults.phone,
    experienced: typeof d.experienced === "boolean" ? d.experienced : defaults.experienced,
    memo: typeof d.memo === "string" ? d.memo.slice(0, MEMO_MAX) : defaults.memo,
    agreed:
      Array.isArray(d.agreed) && d.agreed.length === CAUTIONS.length
        ? d.agreed.map(Boolean)
        : defaults.agreed,
  };
}
