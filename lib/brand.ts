/**
 * 제작사(미래AI랩) 브랜드 상수.
 *
 * ── 링크를 바꾸려면 이 파일의 MIRAE_LINKS 만 수정하면 전체에 반영됩니다.
 * ── CTA 문구를 바꾸려면 아래 MIRAE_CTA_COPY 를 수정하면 됩니다.
 *    (특정 페이지에서만 다르게 쓰려면 <SampleBridgeCTA> 에 props 로 덮어쓸 수 있습니다.)
 */

export const MIRAE_LINKS = {
  /** 메인 CTA — "우리 회사도 만들어보기" */
  consult: "https://miraeailab.com/business-diagnosis",
  /** 다른 샘플 보기 */
  samples: "https://miraeailab.com/business-services",
  /** 미래AI랩 홈페이지 */
  home: "https://miraeailab.com/",
} as const;

export const MIRAE_CTA_COPY = {
  eyebrow: "MIRAE AI LAB",
  kicker: "이 샘플은 미래AI랩이 기획·제작했습니다",
  title: "이 샘플이 마음에 드셨다면,\n대표님 회사도 이렇게 설계해볼 수 있습니다.",
  description:
    "미래AI랩은 평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX · MVP · 플랫폼 기획과 개발을 진행합니다.",
  note: "짧은 진단으로 우리 회사에 맞는 방향부터 확인해보실 수 있어요.",
  consultLabel: "우리 회사도 만들어보기",
  samplesLabel: "다른 샘플 보기",
  homeLabel: "미래AI랩 홈페이지",
} as const;

/** 이 샘플 자체에 대한 한 줄 설명 — CTA 섹션에서 "무엇을 만든 샘플인지" 보여줍니다. */
export const SAMPLE_META = {
  name: "RescueWalk",
  tagline: "유기견 산책 매칭 MVP",
} as const;
