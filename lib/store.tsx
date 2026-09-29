"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ActivityLog, WalkRequest } from "@/lib/types";
import { SEED_FAVORITES, SEED_INTEREST_REGIONS, buildSeed } from "@/lib/data/seed";
import { todayISO } from "@/lib/utils";

/**
 * 데모용 클라이언트 스토어.
 * MVP에서는 localStorage에 영속화하며, 동일한 인터페이스로
 * Supabase(walk_requests / favorites / activity_logs 테이블)로 교체할 수 있도록
 * 액션 단위로 분리해 두었습니다.
 *
 * 신청 상태 전이
 *   pending(신청완료) ─ confirmRequest ─▶ confirmed(방문예정) ─ completeWalk ─▶ completed(산책완료)
 *        └──────────── cancelRequest ─────────┴──▶ cancelled(취소)
 * completeWalk 는 activity_logs 에 기록을 추가해 활동 통계·배지에 바로 반영됩니다.
 */

// v2: 날짜가 오늘 기준 상대값으로 바뀐 시드. 이전 버전의 고정 날짜 데이터는 버립니다.
const LS_KEY = "rescuewalk-store-v2";

interface ToastState {
  id: number;
  message: string;
  emoji?: string;
}

interface PersistedState {
  favorites: string[];
  requests: WalkRequest[];
  activityLogs: ActivityLog[];
  interestRegions: string[];
}

interface StoreState extends PersistedState {
  hydrated: boolean;
  toast: ToastState | null;
  toggleFavorite: (dogId: string) => void;
  isFavorite: (dogId: string) => boolean;
  addRequest: (req: WalkRequest) => void;
  cancelRequest: (requestId: string) => void;
  /** 데모: 보호소가 신청을 승인한 것처럼 처리 */
  confirmRequest: (requestId: string) => void;
  /** 산책 완료를 기록하고 새 활동 기록의 id 를 돌려줍니다 */
  completeWalk: (requestId: string, input: { durationMin: number; note: string }) => string | null;
  toggleInterestRegion: (region: string) => void;
  resetDemo: () => void;
  showToast: (message: string, emoji?: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

function freshState(): PersistedState {
  const seed = buildSeed();
  return {
    favorites: [...SEED_FAVORITES],
    requests: seed.requests,
    activityLogs: seed.activityLogs,
    interestRegions: [...SEED_INTEREST_REGIONS],
  };
}

function loadPersisted(): PersistedState {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    const fallback = freshState();
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : fallback.favorites,
      requests: Array.isArray(parsed.requests) ? parsed.requests : fallback.requests,
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : fallback.activityLogs,
      interestRegions: Array.isArray(parsed.interestRegions)
        ? parsed.interestRegions
        : fallback.interestRegions,
    };
  } catch {
    return freshState();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>({
    favorites: [],
    requests: [],
    activityLogs: [],
    interestRegions: [],
  });
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // completeWalk 가 새 기록 id 를 동기적으로 돌려주기 위해 최신 상태를 ref 로도 들고 있습니다
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(loadPersisted());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // storage 접근이 막힌 환경(시크릿 모드 등)에서는 메모리 상태로만 동작
    }
  }, [state, hydrated]);

  const showToast = useCallback((message: string, emoji?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, emoji });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const toggleFavorite = useCallback((dogId: string) => {
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(dogId)
        ? s.favorites.filter((id) => id !== dogId)
        : [...s.favorites, dogId],
    }));
  }, []);

  const isFavorite = useCallback(
    (dogId: string) => state.favorites.includes(dogId),
    [state.favorites]
  );

  const addRequest = useCallback((req: WalkRequest) => {
    setState((s) => ({ ...s, requests: [req, ...s.requests] }));
  }, []);

  const updateRequest = useCallback(
    (requestId: string, fn: (r: WalkRequest) => WalkRequest) => {
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) => (r.id === requestId ? fn(r) : r)),
      }));
    },
    []
  );

  const cancelRequest = useCallback(
    (requestId: string) =>
      updateRequest(requestId, (r) =>
        r.status === "pending" || r.status === "confirmed"
          ? { ...r, status: "cancelled", cancelledAt: new Date().toISOString() }
          : r
      ),
    [updateRequest]
  );

  const confirmRequest = useCallback(
    (requestId: string) =>
      updateRequest(requestId, (r) =>
        r.status === "pending"
          ? { ...r, status: "confirmed", confirmedAt: new Date().toISOString() }
          : r
      ),
    [updateRequest]
  );

  const completeWalk = useCallback(
    (requestId: string, input: { durationMin: number; note: string }) => {
      const req = stateRef.current.requests.find((r) => r.id === requestId);
      if (!req || req.status !== "confirmed") return null;
      const today = todayISO();
      const log: ActivityLog = {
        id: `act-${Date.now()}`,
        requestId,
        dogId: req.dogId,
        // 데모에서는 방문일 전에도 기록할 수 있으므로, 미래 날짜라면 오늘로 기록합니다
        date: req.date <= today ? req.date : today,
        durationMin: input.durationMin,
        note: input.note.trim(),
      };
      setState((s) => ({
        ...s,
        requests: s.requests.map((r) =>
          r.id === requestId
            ? { ...r, status: "completed", completedAt: new Date().toISOString() }
            : r
        ),
        activityLogs: [log, ...s.activityLogs],
      }));
      return log.id;
    },
    []
  );

  const toggleInterestRegion = useCallback((region: string) => {
    setState((s) => ({
      ...s,
      interestRegions: s.interestRegions.includes(region)
        ? s.interestRegions.filter((r) => r !== region)
        : [...s.interestRegions, region],
    }));
  }, []);

  const resetDemo = useCallback(() => {
    setState(freshState());
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      ...state,
      hydrated,
      toast,
      toggleFavorite,
      isFavorite,
      addRequest,
      cancelRequest,
      confirmRequest,
      completeWalk,
      toggleInterestRegion,
      resetDemo,
      showToast,
    }),
    [
      state,
      hydrated,
      toast,
      toggleFavorite,
      isFavorite,
      addRequest,
      cancelRequest,
      confirmRequest,
      completeWalk,
      toggleInterestRegion,
      resetDemo,
      showToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
