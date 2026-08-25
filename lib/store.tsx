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
import { seedActivityLogs, seedRequests } from "@/lib/data/seed";

/**
 * 데모용 클라이언트 스토어.
 * MVP에서는 localStorage에 영속화하며, 동일한 인터페이스로
 * Supabase(walk_requests / favorites / activity_logs 테이블)로 교체할 수 있도록
 * 액션 단위로 분리해 두었습니다.
 */

const LS_KEY = "rescuewalk-store-v1";

interface ToastState {
  id: number;
  message: string;
  emoji?: string;
}

interface StoreState {
  favorites: string[];
  requests: WalkRequest[];
  activityLogs: ActivityLog[];
  hydrated: boolean;
  toast: ToastState | null;
  toggleFavorite: (dogId: string) => void;
  isFavorite: (dogId: string) => boolean;
  addRequest: (req: WalkRequest) => void;
  cancelRequest: (requestId: string) => void;
  showToast: (message: string, emoji?: string) => void;
}

const StoreContext = createContext<StoreState | null>(null);

interface PersistedState {
  favorites: string[];
  requests: WalkRequest[];
  activityLogs: ActivityLog[];
}

function loadPersisted(): PersistedState {
  const fallback: PersistedState = {
    favorites: ["dog-bori", "dog-dubu"],
    requests: seedRequests,
    activityLogs: seedActivityLogs,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : fallback.favorites,
      requests: Array.isArray(parsed.requests) ? parsed.requests : fallback.requests,
      activityLogs: Array.isArray(parsed.activityLogs)
        ? parsed.activityLogs
        : fallback.activityLogs,
    };
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [requests, setRequests] = useState<WalkRequest[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const persisted = loadPersisted();
    setFavorites(persisted.favorites);
    setRequests(persisted.requests);
    setActivityLogs(persisted.activityLogs);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({ favorites, requests, activityLogs })
      );
    } catch {
      // storage 접근이 막힌 환경에서는 메모리 상태로만 동작
    }
  }, [favorites, requests, activityLogs, hydrated]);

  const showToast = useCallback((message: string, emoji?: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    const id = Date.now();
    setToast({ id, message, emoji });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const toggleFavorite = useCallback(
    (dogId: string) => {
      setFavorites((prev) => {
        const next = prev.includes(dogId)
          ? prev.filter((id) => id !== dogId)
          : [...prev, dogId];
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback(
    (dogId: string) => favorites.includes(dogId),
    [favorites]
  );

  const addRequest = useCallback((req: WalkRequest) => {
    setRequests((prev) => [req, ...prev]);
  }, []);

  const cancelRequest = useCallback((requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" as const } : r))
    );
  }, []);

  const value = useMemo<StoreState>(
    () => ({
      favorites,
      requests,
      activityLogs,
      hydrated,
      toast,
      toggleFavorite,
      isFavorite,
      addRequest,
      cancelRequest,
      showToast,
    }),
    [
      favorites,
      requests,
      activityLogs,
      hydrated,
      toast,
      toggleFavorite,
      isFavorite,
      addRequest,
      cancelRequest,
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
