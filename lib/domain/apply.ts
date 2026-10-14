import type { ExperienceNeeded } from "@/lib/types";

/**
 * 산책 신청 규칙 — 화면과 분리해 단위 테스트합니다.
 *
 * 3단계: 일정(날짜+시간) → 참여자 정보 → 확인·약속
 * 날짜와 시간은 함께 고르는 한 가지 결정이라 한 화면에 두고, 약속은 확인 화면의 짧은 체크 하나로 줄였습니다.
 * 단계 수는 줄었지만 검증(형식·경험·중복·당일 마감)은 그대로입니다.
 */

export const STEP_LABELS = ["일정", "참여자 정보", "확인"] as const;
export const LAST_STEP = STEP_LABELS.length - 1;

/** 보호소가 운영하는 산책 시작 시각(표시 순서의 기준) */
export const ALL_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"] as const;

/**
 * 현장에서 실제로 사고를 막는 약속만 — 약관처럼 길게 쓰지 않습니다.
 * (도착 시간·복장 같은 안내는 방문 안내로 옮겼습니다)
 */
export const SAFETY_PROMISES = [
  {
    title: "리드줄은 짧게, 두 손으로",
    why: "놓치는 순간이 가장 위험해요. 손목에 감지 말고 손으로 잡아주세요.",
  },
  { title: "다른 개·사람과는 거리 두기", why: "인사는 매니저가 괜찮다고 한 경우에만 해요." },
  {
    title: "이상하면 바로 멈추고 연락",
    why: "절뚝이거나 숨이 가쁘면 그 자리에서 쉬고 보호소에 전화해주세요.",
  },
] as const;

export const NAME_MAX = 20;
export const MEMO_MAX = 100;

/** 숫자만 남겨 010-1234-5678 꼴로. 붙여넣기·지우기 중간 상태도 자연스럽게 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;

/**
 * 봉사 경험과 아이에게 필요한 경험의 관계.
 * - block: 처음인 봉사자가 '경험자 필수' 아이를 신청 — 안전을 위해 받지 않습니다
 * - caution: 처음인 봉사자가 '경험 조금 필요' 아이 — 신청은 되지만 안내를 보여줍니다
 */
export function experienceGate(
  needed: ExperienceNeeded,
  experienced: boolean | null
): "ok" | "caution" | "block" {
  if (experienced !== false) return "ok";
  if (needed === "experienced") return "block";
  if (needed === "some") return "caution";
  return "ok";
}

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

export function validateApplicant(a: ApplicantInput, needed: ExperienceNeeded = "beginner"): ApplicantErrors {
  const errors: ApplicantErrors = {};
  if (a.name.trim().length === 0) errors.name = "이름을 입력해주세요.";
  else if (a.name.trim().length > NAME_MAX) errors.name = `이름은 ${NAME_MAX}자까지 입력할 수 있어요.`;
  if (!PHONE_RE.test(a.phone)) errors.phone = "010-0000-0000 형식으로 입력해주세요.";
  if (a.experienced === null) errors.experienced = "봉사 경험 여부를 선택해주세요.";
  else if (experienceGate(needed, a.experienced) === "block")
    errors.experienced = "이 아이는 대형견 산책 경험이 있는 분만 신청할 수 있어요.";
  return errors;
}

export interface ApplyDraft extends ApplicantInput {
  date: string | null;
  time: string | null;
  memo: string;
  /** 확인 화면의 안전 약속 동의 */
  agreed: boolean;
}

/**
 * 앞 단계를 다 채운 만큼까지만 갈 수 있는 단계(0-based).
 * 주소의 ?step= 을 바꾸거나 새로고침해도 빈 확인 화면이 뜨지 않게 하는 기준입니다.
 */
export function maxReachableStep(d: ApplyDraft, needed: ExperienceNeeded = "beginner"): number {
  if (!d.date || !d.time) return 0;
  if (Object.keys(validateApplicant(d, needed)).length > 0) return 1;
  return LAST_STEP;
}

/** 제출 가능 = 모든 단계를 채우고 약속에 동의 */
export const canSubmit = (d: ApplyDraft, needed: ExperienceNeeded = "beginner") =>
  maxReachableStep(d, needed) === LAST_STEP && d.agreed;

/** ?step= (1-based) → 0-based, 범위 밖·숫자 아님은 첫 단계 */
export function parseStepParam(v: string | null): number {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? Math.min(n - 1, LAST_STEP) : 0;
}

/**
 * 저장된 임시 입력값을 복원할 때, 지금 기준으로 더는 유효하지 않은 선택(지난 날짜, 그새 찬 시간)은 버립니다.
 * 형식이 다른 값(직접 수정·이전 버전)도 기본값으로 돌립니다. 이전 버전의 약속 배열도 읽습니다.
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
  const agreed =
    typeof d.agreed === "boolean"
      ? d.agreed
      : Array.isArray(d.agreed) && d.agreed.length > 0
        ? d.agreed.every(Boolean)
        : defaults.agreed;
  return {
    date,
    time,
    name: typeof d.name === "string" ? d.name.slice(0, NAME_MAX) : defaults.name,
    phone: typeof d.phone === "string" ? formatPhone(d.phone) : defaults.phone,
    experienced: typeof d.experienced === "boolean" ? d.experienced : defaults.experienced,
    memo: typeof d.memo === "string" ? d.memo.slice(0, MEMO_MAX) : defaults.memo,
    agreed,
  };
}

/** 링크로 미리 고른 일정(?date=&time=)이 지금도 유효하면 채워 넣습니다 */
export function preselect(
  draft: ApplyDraft,
  q: { date: string | null; time: string | null },
  openSlots: (date: string) => string[]
): ApplyDraft {
  if (!q.date || openSlots(q.date).length === 0) return draft;
  const time = q.time && openSlots(q.date).includes(q.time) ? q.time : null;
  return { ...draft, date: q.date, time };
}
