import type { Shelter } from "@/lib/types";

/**
 * 방문 안내 — 상세·신청 완료·신청 상세가 같은 문구를 씁니다.
 * 보호소마다 다른 정보(만나는 곳, 주차 등)는 보호소 데이터에서, 공통 안내는 여기에서.
 */

/** 봉사자가 챙길 것 */
export const COMMON_BRING = ["걷기 편한 운동화", "물과 휴대용 물그릇", "신분증 (명단 확인)"] as const;

/** 보호소가 준비하는 것 — 봉사자가 따로 사 오지 않도록 */
export const PROVIDED = "리드줄·하네스·배변봉투·간식은 보호소에서 준비해요";

/** 신청 이후 연락 흐름 */
export const CONTACT_FLOW = [
  "보호소가 신청을 확인하면 문자로 승인 안내를 드려요 (보통 하루 안)",
  "방문 전날 저녁, 날씨와 아이 컨디션을 다시 알려드려요",
  "일정이 어려우면 하루 전까지 신청을 취소해주세요",
] as const;

/** 방문 시각보다 이만큼 먼저 도착 */
export const ARRIVE_EARLY_MIN = 10;

/** 지도 앱으로 바로 — 주소 검색 링크 */
export const mapLink = (shelter: Pick<Shelter, "name" | "address">) =>
  `https://map.kakao.com/link/search/${encodeURIComponent(shelter.address)}`;

export const telLink = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
