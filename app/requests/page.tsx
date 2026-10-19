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
import { currentStageIndex, groupRequests, isOpen, isOverdue } from "@/lib/domain/requests";
import { useClock } from "@/lib/useClock";
import { cn, formatDateKo, formatTimeKo, relativeDayLabel, todayISO, withJosa } from "@/lib/utils";
import type { WalkRequest, WalkRequestStatus } from "@/lib/types";

const FILTERS: { key: WalkRequestStatus | "all"; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "신청완료" },
  { key: "confirmed", label: "방문예정" },
  { key: "completed", label: "산책완료" },
  { key: "cancelled", label: "취소" },
];

function RequestRow({ req, today }: { req: WalkRequest; today: string }) {
  const dog = getDog(req.dogId);
  if (!dog) return null;
  const shelter = getShelter(dog.shelterId);
  const upcoming = isOpen(req) && req.date >= today;
  const overdue = isOverdue(req, today);
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
            {overdue && (
              <span className="font-semibold text-tangerine-700">
                {req.status === "confirmed" ? "기록 남기기" : "방문일 지남"}
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-ink-400">{shelter?.name}</span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
      </Link>
    </li>
  );
}

const TRACK_NOTE = [
  "",
  "보호소가 신청을 확인하고 있어요",
  "방문 확정 · 10분 전까지 도착해주세요",
  "산책을 마쳤다면 기록을 남겨주세요",
];

/**
 * 가장 가까운 산책 — 주문 추적 카드처럼 지금 어느 단계인지(접수 → 승인 → 방문 예정 → 산책 → 완료)를
 * 막대 다섯 칸으로 보여줍니다. 단계 계산은 신청 상세와 같은 규칙(currentStageIndex).
 */
function TrackingCard({ req, today }: { req: WalkRequest; today: string }) {
  const clock = useClock();
  const dog = getDog(req.dogId);
  if (!dog) return null;
  const shelter = getShelter(dog.shelterId);
  const idx = clock ? currentStageIndex(req, clock.now) : -1;

  return (
    <Link
      href={`/requests/${req.id}`}
      className="group block overflow-hidden rounded-[24px] bg-white shadow-card ring-1 ring-cream-300/60 transition-shadow hover:shadow-card-hover"
    >
      <div className="flex items-center gap-4 p-5 pb-4">
        <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
          <DogFace dog={dog} sizes="64px" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-sage-700">다가오는 산책</span>
          <span className="block truncate text-lg font-bold text-ink-900">
            {withJosa(dog.name, "와")}의 산책
          </span>
          <span className="tnum block text-sm text-ink-700">
            {formatDateKo(req.date)} {formatTimeKo(req.time)}
          </span>
          <span className="block truncate text-[13px] text-ink-500">{shelter?.name}</span>
        </span>
        <span className="tnum shrink-0 rounded-full bg-sage-50 px-3 py-1.5 text-sm font-bold text-sage-700 ring-1 ring-sage-100">
          {relativeDayLabel(req.date, today)}
        </span>
      </div>
      <div className="border-t border-cream-200 bg-cream-50/60 px-5 py-4">
        <div className="grid grid-cols-5 gap-1.5" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full",
                i < idx ? "bg-sage-500" : i === idx ? "bg-tangerine-500" : "bg-cream-300"
              )}
            />
          ))}
        </div>
        <p className="mt-2.5 flex items-center justify-between gap-3 text-sm">
          <span className="min-w-0 truncate text-ink-700">{idx > 0 ? TRACK_NOTE[idx] : ""}</span>
          <span className="flex shrink-0 items-center font-semibold text-ink-900">
            자세히{" "}
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </p>
      </div>
    </Link>
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
  const { open: upcoming, closed: past } = useMemo(() => groupRequests(requests), [requests]);
  const filtered = useMemo(
    () => (filter === "all" ? [] : [...upcoming, ...past].filter((r) => r.status === filter)),
    [filter, upcoming, past]
  );
  const next = upcoming.find((r) => r.date >= today) ?? null;
  const rest = upcoming.filter((r) => r !== next);

  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      <h1 className="page-title mb-5 md:sr-only">신청 내역</h1>
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
              <>
                {/* 방문일이 남은 가장 가까운 산책은 진행 카드로, 나머지는 목록으로 */}
                {next && <TrackingCard req={next} today={today} />}
                {rest.length > 0 && (
                  <ul className={cn("space-y-3", next && "mt-3")}>
                    {rest.map((r) => (
                      <RequestRow key={r.id} req={r} today={today} />
                    ))}
                  </ul>
                )}
              </>
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
