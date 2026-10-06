import type { ActivityLog, WalkRequest } from "@/lib/types";

/**
 * 브라우저 저장값 검증.
 * 저장값은 이전 버전이 남겼거나 사용자가 직접 고친 것일 수 있으므로, 화면에 쓰기 전에 형태를 확인하고
 * 쓸 수 없는 항목만 걸러냅니다(전체를 버리지 않아 정상 데이터는 지켜집니다).
 */

export interface PersistedState {
  favorites: string[];
  requests: WalkRequest[];
  activityLogs: ActivityLog[];
  interestRegions: string[];
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^\d{2}:\d{2}$/;
const STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);

type DogExists = (id: string) => boolean;

export function sanitizeRequest(v: unknown, dogExists: DogExists): WalkRequest | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.dogId) || !dogExists(v.dogId)) return null;
  if (!isStr(v.date) || !ISO_DATE.test(v.date) || !isStr(v.time) || !HHMM.test(v.time)) return null;
  if (!STATUSES.has(v.status as string) || !isObj(v.applicant)) return null;
  const a = v.applicant;
  if (typeof a.name !== "string" || typeof a.phone !== "string") return null;
  return {
    ...(v as unknown as WalkRequest),
    reservationNo: isStr(v.reservationNo) ? v.reservationNo : "-",
    createdAt: isStr(v.createdAt) ? v.createdAt : new Date(0).toISOString(),
    applicant: {
      name: a.name,
      phone: a.phone,
      experienced: !!a.experienced,
      memo: typeof a.memo === "string" ? a.memo : "",
    },
  };
}

export function sanitizeLog(v: unknown, dogExists: DogExists): ActivityLog | null {
  if (!isObj(v) || !isStr(v.id) || !isStr(v.dogId) || !dogExists(v.dogId)) return null;
  if (!isStr(v.date) || !ISO_DATE.test(v.date)) return null;
  if (typeof v.durationMin !== "number" || !(v.durationMin > 0)) return null;
  return {
    id: v.id,
    dogId: v.dogId,
    requestId: isStr(v.requestId) ? v.requestId : undefined,
    date: v.date,
    durationMin: v.durationMin,
    note: typeof v.note === "string" ? v.note : "",
  };
}

const strings = (v: unknown): string[] | null =>
  Array.isArray(v) ? Array.from(new Set(v.filter(isStr))) : null;
const compact = <T>(list: (T | null)[]): T[] => list.filter((x): x is T => x !== null);

/** 필드별로 따로 판단: 깨진 필드만 기본값으로 돌리고 나머지는 살립니다 */
export function sanitizePersisted(
  raw: unknown,
  fallback: PersistedState,
  dogExists: DogExists
): PersistedState {
  if (!isObj(raw)) return fallback;
  return {
    favorites: strings(raw.favorites)?.filter(dogExists) ?? fallback.favorites,
    requests: Array.isArray(raw.requests)
      ? compact(raw.requests.map((r) => sanitizeRequest(r, dogExists)))
      : fallback.requests,
    activityLogs: Array.isArray(raw.activityLogs)
      ? compact(raw.activityLogs.map((l) => sanitizeLog(l, dogExists)))
      : fallback.activityLogs,
    interestRegions: strings(raw.interestRegions) ?? fallback.interestRegions,
  };
}
