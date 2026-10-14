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
  input: { durationMin: number; note: string; observations?: string[] },
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
      ...(input.observations?.length ? { observations: Array.from(new Set(input.observations)) } : {}),
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

/**
 * 사용자에게 보여주는 진행 단계.
 * 저장하는 상태는 4개(pending/confirmed/completed/cancelled) 그대로 두고,
 * 방문 시각과 지금 시각을 비교해 '방문 예정'과 '산책'을 나눠 보여줍니다(상태 전이 규칙은 바뀌지 않음).
 *
 *   접수 → 승인 → 방문 예정 → 산책 → 완료
 */
export type StageKey = "received" | "approved" | "upcoming" | "walk" | "done";
export type StageState = "done" | "current" | "todo";

export interface VisitStage {
  key: StageKey;
  label: string;
  state: StageState;
  /** 완료된 단계의 시각(ISO) */
  at?: string;
}

const STAGE_LABEL: Record<StageKey, string> = {
  received: "접수",
  approved: "승인",
  upcoming: "방문 예정",
  walk: "산책",
  done: "완료",
};

/** 방문 시작 시각(로컬) */
export function visitStart(r: Pick<WalkRequest, "date" | "time">): Date {
  const [y, m, d] = r.date.split("-").map(Number);
  const [hh, mm] = r.time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

/** 지금 몇 번째 단계에 있는지(0~4). 취소된 신청은 -1 */
export function currentStageIndex(r: WalkRequest, now: Date): number {
  switch (r.status) {
    case "pending":
      return 1;
    case "confirmed":
      return now >= visitStart(r) ? 3 : 2;
    case "completed":
      return 5;
    default:
      return -1;
  }
}

export function visitStages(r: WalkRequest, now: Date): VisitStage[] {
  const idx = currentStageIndex(r, now);
  const keys: StageKey[] = ["received", "approved", "upcoming", "walk", "done"];
  const at: Partial<Record<StageKey, string>> = {
    received: r.createdAt,
    approved: r.confirmedAt,
    upcoming: idx > 2 ? visitStart(r).toISOString() : undefined,
    walk: r.completedAt,
    done: r.completedAt,
  };
  return keys.map((key, i) => {
    // 취소된 신청은 실제로 거친 단계(접수, 승인했다면 승인)만 완료로 표시
    const state: StageState =
      idx === -1
        ? key === "received" || (key === "approved" && r.confirmedAt)
          ? "done"
          : "todo"
        : i < idx
          ? "done"
          : i === idx
            ? "current"
            : "todo";
    return { key, label: STAGE_LABEL[key], state, at: state === "done" ? at[key] : undefined };
  });
}
