"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { cn, formatDateKo, formatTimeKo } from "@/lib/utils";
import type { WalkRequestStatus } from "@/lib/types";

const FILTER_TABS: { key: WalkRequestStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "신청완료" },
  { key: "confirmed", label: "방문예정" },
  { key: "completed", label: "산책완료" },
  { key: "cancelled", label: "취소" },
];

export default function RequestsPage() {
  const { requests, hydrated, cancelRequest, showToast } = useStore();
  const [tab, setTab] = useState<WalkRequestStatus | "all">("all");

  const list = useMemo(() => {
    const filtered = tab === "all" ? requests : requests.filter((r) => r.status === tab);
    return [...filtered].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [requests, tab]);

  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      <header className="mb-6">
        <p className="section-label">내 활동</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          신청 내역
        </h1>
      </header>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTER_TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
              tab === t.key
                ? "bg-sage-600 text-white"
                : "bg-white text-ink-500 shadow-card hover:bg-cream-200"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card h-32 animate-pulse bg-cream-100" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          message={"아직 신청한 산책이 없어요.\n오늘 한 번 시작해볼까요?"}
          ctaLabel="산책 가능한 아이들 보기"
          ctaHref="/dogs"
        />
      ) : (
        <ul className="space-y-4">
          {list.map((req) => {
            const dog = getDog(req.dogId);
            if (!dog) return null;
            const shelter = getShelter(dog.shelterId);
            const cancellable = req.status === "pending" || req.status === "confirmed";
            return (
              <li key={req.id} className="card card-hover overflow-hidden">
                <div className="flex items-start gap-4 p-4 sm:p-5">
                  <Link
                    href={`/dogs/${dog.id}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-card sm:h-20 sm:w-20"
                    aria-label={`${dog.name} 상세 보기`}
                  >
                    <DogFace dog={dog} sizes="80px" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-extrabold text-ink-900">
                        {dog.name}
                        <span className="ml-1.5 text-[13px] font-medium text-ink-400">
                          {dog.breed}
                        </span>
                      </p>
                      <StatusBadge status={req.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-sage-500" />
                        {formatDateKo(req.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-sage-500" />
                        {formatTimeKo(req.time)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-sage-500" />
                        {shelter?.name}
                      </span>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] tracking-wider text-ink-300">
                      {req.reservationNo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-cream-200 bg-cream-100/60 px-4 py-2.5">
                  {cancellable && (
                    <button
                      type="button"
                      onClick={() => {
                        cancelRequest(req.id);
                        showToast("산책 신청을 취소했어요.", "😢");
                      }}
                      className="btn-ghost !min-h-[36px] px-3 text-[13px]"
                    >
                      신청 취소
                    </button>
                  )}
                  <Link
                    href={req.status === "completed" ? "/activity" : `/complete/${req.id}`}
                    className="btn-secondary !min-h-[36px] px-4 text-[13px]"
                  >
                    {req.status === "completed" ? "활동 기록 보기" : "상세 보기"}
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
