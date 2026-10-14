import type { DogMatch, ReactionLevel } from "@/lib/types";

/**
 * 매칭 정보의 화면 표기. tone 은 색이 아니라 의미(괜찮음/주의)로만 씁니다.
 */
export type Tone = "good" | "neutral" | "care";

export const PEOPLE: Record<DogMatch["people"], { short: string; long: string; tone: Tone }> = {
  high: { short: "좋아해요", long: "사람을 아주 좋아해요", tone: "good" },
  medium: { short: "보통", long: "천천히 친해져요", tone: "neutral" },
  shy: { short: "낯가림", long: "처음엔 낯을 가려요", tone: "care" },
};

export const DOGS: Record<DogMatch["dogs"], { short: string; long: string; tone: Tone }> = {
  good: { short: "잘 지내요", long: "다른 강아지와 잘 지내요", tone: "good" },
  selective: { short: "가려요", long: "다른 강아지를 조금 가려요", tone: "neutral" },
  "keep-distance": { short: "거리 필요", long: "다른 강아지와 거리가 필요해요", tone: "care" },
};

export const PULLING: Record<DogMatch["pulling"], { short: string; long: string; tone: Tone }> = {
  light: { short: "약해요", long: "줄을 거의 당기지 않아요", tone: "good" },
  moderate: { short: "보통", long: "가끔 앞서 당겨요", tone: "neutral" },
  strong: { short: "세요", long: "힘이 세서 두 손으로 잡아야 해요", tone: "care" },
};

export const EXPERIENCE: Record<DogMatch["experience"], { short: string; long: string; tone: Tone }> = {
  beginner: { short: "초보 가능", long: "처음 봉사하는 분도 괜찮아요", tone: "good" },
  some: { short: "경험 조금", long: "산책 봉사를 한두 번 해본 분께 추천해요", tone: "neutral" },
  experienced: { short: "경험자만", long: "대형견 산책 경험이 있는 분만 신청할 수 있어요", tone: "care" },
};

export const REACTION: Record<ReactionLevel, { label: string; tone: Tone }> = {
  good: { label: "괜찮아요", tone: "good" },
  care: { label: "주의", tone: "care" },
  avoid: { label: "피해주세요", tone: "care" },
};

/** 의미별 글자색 — 대비 AA 이상 */
export const TONE_TEXT: Record<Tone, string> = {
  good: "text-sage-700",
  neutral: "text-ink-700",
  care: "text-tangerine-700",
};
