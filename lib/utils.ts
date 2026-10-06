import type { ActivityStats, Badge, WalkRequestStatus } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 이름 뒤에 받침에 맞는 조사를 붙입니다. ("장군" + "와" → "장군과", "보리" + "와" → "보리와")
 * 이름이 데이터로 바뀌어도 "장군와 산책", "몽실를 찜했어요" 같은 문장이 생기지 않게 합니다.
 */
const JOSA: Record<string, [withFinal: string, withoutFinal: string]> = {
  와: ["과", "와"],
  과: ["과", "와"],
  가: ["이", "가"],
  이: ["이", "가"],
  를: ["을", "를"],
  을: ["을", "를"],
  는: ["은", "는"],
  은: ["은", "는"],
};

export function withJosa(word: string, josa: keyof typeof JOSA): string {
  const code = word.charCodeAt(word.length - 1);
  const isHangul = code >= 0xac00 && code <= 0xd7a3;
  const hasFinal = isHangul && (code - 0xac00) % 28 !== 0;
  return word + JOSA[josa][hasFinal ? 0 : 1];
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"] as const;

export function formatDateKo(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${m}월 ${d}일 (${DAY_NAMES[date.getDay()]})`;
}

export function formatDateFullKo(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return `${y}년 ${m}월 ${d}일 (${DAY_NAMES[date.getDay()]})`;
}

export function formatTimeKo(time: string): string {
  const [h, min] = time.split(":").map(Number);
  const isPm = h >= 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${isPm ? "오후" : "오전"} ${hour12}:${String(min).padStart(2, "0")}`;
}

/** 에너지 레벨(1~5)을 카드에서 바로 읽히는 말로 */
export function energyLabel(level: number): string {
  return level <= 2 ? "낮음" : level === 3 ? "보통" : level === 4 ? "높음" : "아주 높음";
}

export function todayISO(): string {
  const now = new Date();
  return toISODate(now);
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** 오늘 기준 n일 뒤(음수면 이전)의 ISO 날짜 */
export function daysFromToday(n: number, base = new Date()): string {
  return toISODate(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n));
}

/** 두 ISO 날짜의 일수 차이 (b - a) */
export function diffDays(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** 방문일을 "오늘 / 내일 / D-3 / 3일 전" 처럼 짧게 */
export function relativeDayLabel(iso: string, today = todayISO()): string {
  const d = diffDays(today, iso);
  if (d === 0) return "오늘";
  if (d === 1) return "내일";
  if (d > 1) return `D-${d}`;
  return `${-d}일 전`;
}

/** 오늘부터 14일간의 신청 가능 날짜 목록 */
export function upcomingDates(count = 14): { iso: string; day: number; weekday: string; isToday: boolean }[] {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      iso: toISODate(d),
      day: d.getDate(),
      weekday: DAY_NAMES[d.getDay()],
      isToday: i === 0,
    });
  }
  return out;
}

export function isWeekend(iso: string): boolean {
  const [y, m, d] = iso.split("-").map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
}

export function makeReservationNo(dateISO: string): string {
  const compact = dateISO.slice(2).replaceAll("-", "");
  const serial = String(Math.floor(Math.random() * 900) + 100);
  return `RW-${compact}-${serial}`;
}

export const STATUS_LABEL: Record<WalkRequestStatus, string> = {
  pending: "신청완료",
  confirmed: "방문예정",
  completed: "산책완료",
  cancelled: "취소",
};

export const STATUS_STYLE: Record<WalkRequestStatus, string> = {
  pending: "bg-tangerine-100 text-tangerine-700",
  confirmed: "bg-sage-100 text-sage-700",
  completed: "bg-sage-600 text-white",
  cancelled: "bg-ink-300/20 text-ink-500",
};

export const BADGES: Badge[] = [
  {
    id: "first-walk",
    label: "첫 산책",
    description: "처음으로 아이와 함께 걸었어요",
    icon: "🐾",
    achieved: (s) => s.totalWalks >= 1,
    progress: (s) => `${Math.min(s.totalWalks, 1)}/1회`,
  },
  {
    id: "three-walks",
    label: "3회 참여",
    description: "산책 봉사 3회를 달성했어요",
    icon: "🌱",
    achieved: (s) => s.totalWalks >= 3,
    progress: (s) => `${Math.min(s.totalWalks, 3)}/3회`,
  },
  {
    id: "weekend-walker",
    label: "주말 산책러",
    description: "주말에 산책 봉사에 참여했어요",
    icon: "☀️",
    achieved: (s) => s.weekendWalks >= 1,
    progress: () => "주말 산책 1회",
  },
  {
    id: "five-friends",
    label: "5마리 친구",
    description: "다섯 아이와 인연을 맺었어요",
    icon: "💛",
    achieved: (s) => s.uniqueDogs >= 5,
    progress: (s) => `${Math.min(s.uniqueDogs, 5)}/5마리`,
  },
  {
    id: "ten-hours",
    label: "누적 10시간",
    description: "함께 걸은 시간이 10시간을 넘었어요",
    icon: "⏰",
    achieved: (s) => s.totalMinutes >= 600,
    progress: (s) => `${Math.floor(Math.min(s.totalMinutes, 600) / 60)}/10시간`,
  },
  {
    id: "ten-walks",
    label: "10회 참여",
    description: "산책 봉사 10회를 달성했어요",
    icon: "🏅",
    achieved: (s) => s.totalWalks >= 10,
    progress: (s) => `${Math.min(s.totalWalks, 10)}/10회`,
  },
];

export function computeStats(
  logs: { date: string; durationMin: number; dogId: string }[]
): ActivityStats {
  return {
    totalWalks: logs.length,
    uniqueDogs: new Set(logs.map((l) => l.dogId)).size,
    totalMinutes: logs.reduce((sum, l) => sum + l.durationMin, 0),
    weekendWalks: logs.filter((l) => isWeekend(l.date)).length,
  };
}
