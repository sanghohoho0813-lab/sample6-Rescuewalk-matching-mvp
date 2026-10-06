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
import type { WalkRequest } from "@/lib/types";
import { sanitizePersisted, type PersistedState } from "@/lib/domain/persist";
import * as Requests from "@/lib/domain/requests";
import { SEED_FAVORITES, SEED_INTEREST_REGIONS, buildSeed } from "@/lib/data/seed";
import { todayISO } from "@/lib/utils";
import { getDog } from "@/lib/data/dogs";
import { STORE_KEY } from "@/lib/storageKeys";

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
const LS_KEY = STORE_KEY;

interface ToastState {
  id: number;
  message: string;
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
  showToast: (message: string) => void;
  /** 새 신청·기록 id 발급 */
  newId: (prefix: string) => string;
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

const dogExists = (id: string) => !!getDog(id);

function loadPersisted(raw: string | null = readRaw()): PersistedState {
  if (!raw) return freshState();
  try {
    return sanitizePersisted(JSON.parse(raw), freshState(), dogExists);
  } catch {
    return freshState();
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(LS_KEY);
  } catch {
    return null;
  }
}

/** 브라우저마다 고유한 id. 같은 밀리초에 두 번 눌러도 겹치지 않게 */
function newId(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
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
    // 다른 탭에서 신청·찜을 바꾸면 이 탭에도 반영(마지막에 저장한 탭이 다른 탭 내용을 덮어쓰지 않게)
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY) setState(loadPersisted(e.newValue));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      // storage 접근이 막힌 환경(시크릿 모드 등)에서는 메모리 상태로만 동작
    }
  }, [state, hydrated]);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message });
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

  const isFavorite = useCallback((dogId: string) => state.favorites.includes(dogId), [state.favorites]);

  const addRequest = useCallback((req: WalkRequest) => {
    setState((s) =>
      // 같은 아이·같은 시간에 열린 신청이 이미 있으면 무시(다른 탭에서 먼저 신청한 경우 등)
      s.requests.some(
        (r) => Requests.isOpen(r) && r.dogId === req.dogId && r.date === req.date && r.time === req.time
      )
        ? s
        : { ...s, requests: [req, ...s.requests] }
    );
  }, []);

  const updateRequest = useCallback((requestId: string, fn: (r: WalkRequest) => WalkRequest) => {
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === requestId ? fn(r) : r)),
    }));
  }, []);

  const cancelRequest = useCallback(
    (requestId: string) => updateRequest(requestId, (r) => Requests.cancel(r, new Date())),
    [updateRequest]
  );

  const confirmRequest = useCallback(
    (requestId: string) => updateRequest(requestId, (r) => Requests.confirm(r, new Date())),
    [updateRequest]
  );

  const completeWalk = useCallback((requestId: string, input: { durationMin: number; note: string }) => {
    const req = stateRef.current.requests.find((r) => r.id === requestId);
    const result =
      req && Requests.complete(req, input, { now: new Date(), today: todayISO(), logId: newId("act") });
    if (!result) return null;
    // 같은 렌더 안에서 두 번 눌러도 기록이 두 개 생기지 않게 ref 도 바로 갱신
    stateRef.current = {
      ...stateRef.current,
      requests: stateRef.current.requests.map((r) => (r.id === requestId ? result.request : r)),
    };
    setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === requestId ? result.request : r)),
      activityLogs: [result.log, ...s.activityLogs],
    }));
    return result.log.id;
  }, []);

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
      newId,
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
