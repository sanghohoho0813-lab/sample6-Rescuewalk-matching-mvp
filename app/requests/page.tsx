"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import MyWalkTabs from "@/components/MyWalkTabs";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { cn, formatDateKo, formatTimeKo, relativeDayLabel, todayISO } from "@/lib/utils";
import type { WalkRequest, WalkRequestStatus } from "@/lib/types";

const FILTERS: { key: WalkRequestStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "신청완료" },
  { key: "confirmed", label: "방문예정" },
  { key: "completed", label: "산책완료" },
  { key: "cancelled", label: "취소" },
];

const isActive = (r: WalkRequest) => r.status === "pending" || r.status === "confirmed";

function RequestRow({ req, today }: { req: WalkRequest; today: string }) {
  const dog = getDog(req.dogId);
  if (!dog) return null;
  const shelter = getShelter(dog.shelterId);
  const upcoming = isActive(req) && req.date >= today;
  return (
    <li>
      <Link
        href={`/requests/${req.id}`}
        className={cn(
          "card card-hover flex items-center gap-4 p-4",
          req.status === "cancelled" && "bg-cream-50 shadow-none"
        )}
      >
        <span
          className={cn(
            "h-14 w-14 shrink-0 overflow-hidden rounded-2xl",
            req.status === "cancelled" && "opacity-60 grayscale"
          )}
        >
          <DogFace dog={dog} sizes="56px" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-base font-bold text-ink-900">{dog.name}</span>
            <StatusBadge status={req.status} />
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-ink-500">
            <span className="tnum">
              {formatDateKo(req.date)} {formatTimeKo(req.time)}
            </span>
            {upcoming && (
              <span className="tnum font-semibold text-sage-700">{relativeDayLabel(req.date, today)}</span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-ink-400">{shelter?.name}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
      </Link>
    </li>
  );
}

export default function RequestsPage() {
  const { requests, hydrated } = useStore();
  const [filter, setFilter] = useState<WalkRequestStatus | "all">("all");
  const today = todayISO();

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length };
    for (const r of requests) c[r.status] = (c[r.status] ?? 0) + 1;
    return c;
  }, [requests]);

  // 예정된 산책은 가까운 날짜부터, 지난 신청은 최근 날짜부터
  const upcoming = useMemo(
    () => requests.filter(isActive).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [requests]
  );
  const past = useMemo(
    () =>
      requests.filter((r) => !isActive(r)).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)),
    [requests]
  );
  const filtered = useMemo(
    () => (filter === "all" ? [] : [...upcoming, ...past].filter((r) => r.status === filter)),
    [filter, upcoming, past]
  );

  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      <h1 className="page-title mb-5 md:hidden">신청 내역</h1>
      <div className="hidden md:block">
        <MyWalkTabs />
      </div>

      {/* 신청이 하나도 없을 때는 0만 나열된 필터 대신 빈 상태 안내만 보여줍니다 */}
      {!(hydrated && requests.length === 0) && (
        <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
          {/* 해당 건이 없는 상태는 고를 이유가 없으므로 숨깁니다(선택 중인 것은 유지) */}
          {FILTERS.filter(
            (f) => !hydrated || f.key === "all" || f.key === filter || (counts[f.key] ?? 0) > 0
          ).map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={cn(
                "flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "border-ink-900 bg-ink-900 text-white"
                  : "border-cream-300 bg-white text-ink-500 hover:text-ink-900"
              )}
            >
              {f.label}
              {hydrated && (
                <span className={cn("tnum text-[13px]", filter === f.key ? "text-white/70" : "text-ink-300")}>
                  {counts[f.key] ?? 0}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {!hydrated ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[92px] animate-pulse rounded-[20px] bg-cream-200/70" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          message={"아직 신청한 산책이 없어요.\n오늘 한 번 시작해볼까요?"}
          ctaLabel="산책 가능한 아이들 보기"
          ctaHref="/dogs"
        />
      ) : filter !== "all" ? (
        filtered.length === 0 ? (
          <p className="py-16 text-center text-[15px] text-ink-400">해당하는 신청이 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((r) => (
              <RequestRow key={r.id} req={r} today={today} />
            ))}
          </ul>
        )
      ) : (
        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-sm font-semibold text-ink-500">
              예정된 산책 <span className="tnum text-ink-300">{upcoming.length}</span>
            </h2>
            {upcoming.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-cream-300 px-5 py-8 text-center">
                <p className="text-[15px] text-ink-500">예정된 산책이 없어요.</p>
                <Link href="/dogs" className="btn-primary mt-4">
                  산책 가능한 아이들 보기
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((r) => (
                  <RequestRow key={r.id} req={r} today={today} />
                ))}
              </ul>
            )}
          </section>
          {past.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-ink-500">
                지난 신청 <span className="tnum text-ink-300">{past.length}</span>
              </h2>
              <ul className="space-y-3">
                {past.map((r) => (
                  <RequestRow key={r.id} req={r} today={today} />
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
