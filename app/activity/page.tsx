"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import EmptyState from "@/components/EmptyState";
import MyWalkTabs from "@/components/MyWalkTabs";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { BADGES, cn, computeStats, formatDateKo } from "@/lib/utils";

function formatDuration(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

function ActivityContent() {
  const { activityLogs, hydrated } = useStore();
  const newId = useSearchParams().get("new");

  const logs = useMemo(
    () => [...activityLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [activityLogs]
  );
  const stats = useMemo(() => computeStats(activityLogs), [activityLogs]);

  // 방금 기록한 산책으로 새로 열린 배지 (기록 전/후 통계 비교)
  const newLog = newId ? activityLogs.find((l) => l.id === newId) : undefined;
  const unlocked = useMemo(() => {
    if (!newLog) return [];
    const before = computeStats(activityLogs.filter((l) => l.id !== newLog.id));
    return BADGES.filter((b) => b.achieved(stats) && !b.achieved(before));
  }, [newLog, activityLogs, stats]);

  const metDogs = useMemo(
    () =>
      Array.from(new Set(logs.map((l) => l.dogId)))
        .map((id) => getDog(id))
        .filter((d): d is NonNullable<typeof d> => !!d),
    [logs]
  );

  if (!hydrated) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-24 animate-pulse rounded-[20px] bg-cream-200/70" />
        <div className="h-40 animate-pulse rounded-[20px] bg-cream-200/70" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        message={"첫 산책을 시작하면 활동 기록이 쌓여요."}
        ctaLabel="산책 가능한 아이들 보기"
        ctaHref="/dogs"
      />
    );
  }

  const newDog = newLog ? getDog(newLog.dogId) : undefined;

  return (
    <>
      {newLog && newDog && (
        <div
          role="status"
          className="mb-8 animate-fade-up rounded-[20px] border border-sage-200 bg-sage-50 p-5 motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-[17px] font-bold text-ink-900">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-600" aria-hidden />
            {newDog.name}와의 산책이 기록됐어요
          </p>
          <p className="mt-1 text-[15px] text-ink-700">
            지금까지 {stats.uniqueDogs}마리의 아이들과 {stats.totalWalks}번 걸었어요.
          </p>
          {unlocked.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {unlocked.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-900 shadow-card"
                >
                  <span aria-hidden>{b.icon}</span> 새 배지 · {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 핵심 지표 — 카드 3개 대신 한 줄 */}
      <dl className="grid grid-cols-3 divide-x divide-cream-300 rounded-[20px] bg-white py-5 shadow-card">
        {[
          { label: "산책", value: `${stats.totalWalks}회` },
          { label: "함께한 아이", value: `${stats.uniqueDogs}마리` },
          { label: "함께 걸은 시간", value: formatDuration(stats.totalMinutes) },
        ].map((s) => (
          <div key={s.label} className="px-3 text-center">
            <dt className="text-[13px] text-ink-400">{s.label}</dt>
            <dd className="tnum mt-1 text-xl font-bold text-ink-900 sm:text-2xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {/* 배지 */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-ink-900">배지</h2>
        <ul className="mt-4 grid grid-cols-3 gap-y-6 sm:grid-cols-6">
          {BADGES.map((badge) => {
            const done = badge.achieved(stats);
            const fresh = unlocked.some((u) => u.id === badge.id);
            return (
              <li key={badge.id} className="flex flex-col items-center text-center">
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full text-2xl",
                    done ? "bg-tangerine-50 ring-1 ring-tangerine-100" : "bg-cream-100 opacity-50 grayscale",
                    fresh && "ring-2 ring-sage-400"
                  )}
                  aria-hidden
                >
                  {badge.icon}
                </span>
                <span className={cn("mt-2 text-[13px] font-semibold", done ? "text-ink-900" : "text-ink-400")}>
                  {badge.label}
                </span>
                <span className="tnum mt-0.5 text-xs text-ink-400">
                  {done ? "달성" : badge.progress(stats)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 만난 아이들 */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-ink-900">내가 만난 아이들</h2>
        <ul className="no-scrollbar -mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-1">
          {metDogs.map((dog) => (
            <li key={dog.id} className="shrink-0">
              <Link href={`/dogs/${dog.id}`} className="group flex w-16 flex-col items-center">
                <span className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-white transition-shadow group-hover:ring-sage-300">
                  <DogFace dog={dog} sizes="64px" />
                </span>
                <span className="mt-1.5 text-[13px] font-medium text-ink-700">{dog.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 산책 일지 */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-ink-900">산책 일지</h2>
        <ul className="mt-3 divide-y divide-cream-200 border-y border-cream-200">
          {logs.map((log) => {
            const dog = getDog(log.dogId);
            if (!dog) return null;
            const shelter = getShelter(dog.shelterId);
            const isNew = log.id === newId;
            const body = (
              <>
                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
                  <DogFace dog={dog} sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-bold text-ink-900">{dog.name}</span>
                    <span className="tnum text-sm text-ink-400">
                      {formatDateKo(log.date)} · {log.durationMin}분
                    </span>
                    {isNew && (
                      <span className="chip bg-sage-500 font-semibold text-white">새 기록</span>
                    )}
                  </span>
                  {log.note && (
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-700">{log.note}</span>
                  )}
                  <span className="mt-1 block text-[13px] text-ink-400">{shelter?.name}</span>
                </span>
              </>
            );
            const cls = cn("flex gap-4 px-1 py-4", isNew && "-mx-3 rounded-2xl bg-sage-50 px-4");
            return (
              <li key={log.id}>
                {log.requestId ? (
                  <Link href={`/requests/${log.requestId}`} className={cn(cls, "hover:bg-cream-100/60")}>
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

export default function ActivityPage() {
  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      <h1 className="page-title mb-5 md:hidden">활동 기록</h1>
      <div className="hidden md:block">
        <MyWalkTabs />
      </div>
      <Suspense fallback={<div className="h-24 animate-pulse rounded-[20px] bg-cream-200/70" />}>
        <ActivityContent />
      </Suspense>
    </div>
  );
}
