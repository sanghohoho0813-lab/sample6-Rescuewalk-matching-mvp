import type { ActivityLog, WalkRequest } from "@/lib/types";

/**
 * 산책 신청의 상태 전이와 목록 규칙.
 *
 *   pending(신청완료) ─confirm─▶ confirmed(방문예정) ─complete─▶ completed(산책완료)
 *        └──────────── cancel ──────────┴──▶ cancelled(취소)
 *
 * 전이 함수는 허용되지 않는 상태에서 호출되면 원본을 그대로 돌려줘(같은 참조) 중복 클릭에도 안전합니다.
 */

/** 아직 끝나지 않아 사용자가 챙겨야 하는 신청 */
export const isOpen = (r: WalkRequest) => r.status === "pending" || r.status === "confirmed";
export const canCancel = isOpen;

const byWhenAsc = (a: WalkRequest, b: WalkRequest) => (a.date + a.time).localeCompare(b.date + b.time);

export function confirm(r: WalkRequest, now: Date): WalkRequest {
  return r.status === "pending" ? { ...r, status: "confirmed", confirmedAt: now.toISOString() } : r;
}

export function cancel(r: WalkRequest, now: Date): WalkRequest {
  return isOpen(r) ? { ...r, status: "cancelled", cancelledAt: now.toISOString() } : r;
}

/**
 * 방문예정인 신청을 산책 완료로 바꾸고 활동 기록을 만듭니다.
 * 데모에서는 방문일 전에도 기록할 수 있으므로, 기록 날짜는 미래가 되지 않게 오늘로 맞춥니다.
 */
export function complete(
  r: WalkRequest,
  input: { durationMin: number; note: string },
  ctx: { now: Date; today: string; logId: string }
): { request: WalkRequest; log: ActivityLog } | null {
  if (r.status !== "confirmed" || !(input.durationMin > 0)) return null;
  return {
    request: { ...r, status: "completed", completedAt: ctx.now.toISOString() },
    log: {
      id: ctx.logId,
      requestId: r.id,
      dogId: r.dogId,
      date: r.date <= ctx.today ? r.date : ctx.today,
      durationMin: input.durationMin,
      note: input.note.trim(),
    },
  };
}

/** 진행 중인 신청(가까운 순) / 끝난 신청(최근 순) */
export function groupRequests(requests: readonly WalkRequest[]) {
  return {
    open: requests.filter(isOpen).sort(byWhenAsc),
    closed: requests.filter((r) => !isOpen(r)).sort((a, b) => byWhenAsc(b, a)),
  };
}

/** 오늘 이후 가장 가까운 산책 — 홈의 '다음 산책' 바로가기 */
export function nextWalk(requests: readonly WalkRequest[], today: string): WalkRequest | undefined {
  return requests.filter((r) => isOpen(r) && r.date >= today).sort(byWhenAsc)[0];
}

/** 방문일이 지났는데 아직 열려 있는 신청(기록을 남기거나 정리가 필요한 것) */
export const isOverdue = (r: WalkRequest, today: string) => isOpen(r) && r.date < today;
