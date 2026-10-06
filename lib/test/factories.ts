import type { WalkRequest } from "@/lib/types";

/** 테스트용 신청 — 필요한 필드만 덮어써서 씁니다 */
export function makeRequest(overrides: Partial<WalkRequest> = {}): WalkRequest {
  return {
    id: "req-1",
    reservationNo: "RW-261006-123",
    dogId: "dog-bori",
    date: "2026-10-08",
    time: "10:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: true, memo: "" },
    status: "pending",
    createdAt: "2026-10-06T01:00:00.000Z",
    ...overrides,
  };
}
