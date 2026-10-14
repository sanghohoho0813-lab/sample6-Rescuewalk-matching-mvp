"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle2, ChevronRight, Repeat } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import EmptyState from "@/components/EmptyState";
import MyWalkTabs from "@/components/MyWalkTabs";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { MILESTONES, computeImpact, formatDuration } from "@/lib/domain/impact";
import { useStore } from "@/lib/store";
import { useClock } from "@/lib/useClock";
import { cn, formatDateKo, withJosa } from "@/lib/utils";

const shelterOf = (dogId: string) => getDog(dogId)?.shelterId;

/**
 * 활동 기록 — 점수가 아니라 실제로 있었던 일:
 * 함께 걸은 시간, 만난 아이와 다시 만난 아이, 보호소에 전한 관찰, 아이별로 쌓인 관계.
 */
function ActivityContent() {
  const { activityLogs, hydrated } = useStore();
  const clock = useClock();
  const newId = useSearchParams().get("new");

  const logs = useMemo(() => [...activityLogs].sort((a, b) => b.date.localeCompare(a.date)), [activityLogs]);
  const impact = useMemo(
    () => (clock ? computeImpact(activityLogs, shelterOf, clock.today) : null),
    [activityLogs, clock]
  );

  // 방금 기록한 산책으로 새로 닿은 이정표(기록 전/후 비교)
  const newLog = newId ? activityLogs.find((l) => l.id === newId) : undefined;
  const reached = useMemo(() => {
    if (!newLog || !impact || !clock) return [];
    const before = computeImpact(
      activityLogs.filter((l) => l.id !== newLog.id),
      shelterOf,
      clock.today
    );
    return MILESTONES.filter((m) => m.achieved(impact) && !m.achieved(before));
  }, [newLog, activityLogs, impact, clock]);

  if (!hydrated || !impact) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-32 animate-pulse rounded-[20px] bg-cream-200/70" />
        <div className="h-40 animate-pulse rounded-[20px] bg-cream-200/70" />
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        message={"첫 산책을 기록하면 함께 걸은 시간과 만난 아이들이 여기에 쌓여요."}
        ctaLabel="초보도 괜찮은 아이 보기"
        ctaHref="/dogs?need=beginner"
      />
    );
  }

  const newDog = newLog ? getDog(newLog.dogId) : undefined;
  const newBond = newLog ? impact.bonds.find((b) => b.dogId === newLog.dogId) : undefined;

  return (
    <>
      {newLog && newDog && (
        <div
          role="status"
          className="mb-8 animate-fade-up rounded-[20px] border border-sage-200 bg-sage-50 p-5 motion-reduce:animate-none"
        >
          <p className="flex items-center gap-2 text-[17px] font-bold text-ink-900">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-sage-600" aria-hidden />
            {withJosa(newDog.name, "와")}의 산책이 기록됐어요
          </p>
          <p className="mt-1 text-[15px] text-ink-700">
            {newBond && newBond.walks > 1
              ? `${withJosa(newDog.name, "와")} ${newBond.walks}번째 산책이에요. 익숙한 사람이 생긴다는 건 아이에게 큰 안정이에요.`
              : `지금까지 ${impact.uniqueDogs}마리의 아이들과 ${impact.totalWalks}번 걸었어요.`}
          </p>
          {newLog.observations && newLog.observations.length > 0 && (
            <p className="mt-1 text-sm text-ink-500">
              남긴 관찰 {newLog.observations.length}개는 보호소의 아이 기록에 반영돼요.
            </p>
          )}
          {reached.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {reached.map((m) => (
                <li
                  key={m.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-900 shadow-card"
                >
                  <Check className="h-4 w-4 text-sage-600" strokeWidth={3} aria-hidden /> 새 이정표 ·{" "}
                  {m.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 핵심 — 함께 걸은 시간 */}
      <section aria-label="내 활동 요약" className="rounded-[20px] bg-white p-5 shadow-card sm:p-6">
        <p className="text-sm text-ink-500">아이들과 함께 걸은 시간</p>
        <p className="tnum mt-1 text-[32px] font-bold leading-none tracking-tight text-ink-900">
          {formatDuration(impact.totalMinutes)}
        </p>
        <p className="mt-2 text-[15px] text-ink-500">
          이번 달 <span className="tnum font-semibold text-ink-900">{impact.thisMonth.walks}회</span>
          {impact.thisMonth.walks > 0 && (
            <span className="tnum"> · {formatDuration(impact.thisMonth.minutes)}</span>
          )}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-y-4 border-t border-cream-200 pt-5 sm:grid-cols-4">
          {[
            { label: "산책", value: `${impact.totalWalks}회` },
            { label: "만난 아이", value: `${impact.uniqueDogs}마리` },
            { label: "다시 만난 아이", value: `${impact.revisitedDogs}마리` },
            { label: "함께한 보호소", value: `${impact.shelters}곳` },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="mt-0.5 text-sm text-ink-500">{s.label}</dt>
              <dd className="tnum text-xl font-bold text-ink-900">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {impact.observations > 0 && (
        <p className="mt-4 rounded-2xl bg-sage-50 px-4 py-3 text-[15px] leading-relaxed text-ink-700">
          산책하며 남긴 관찰{" "}
          <strong className="tnum font-semibold text-ink-900">{impact.observations}개</strong>가 보호소의 아이
          기록에 쌓였어요. 입양 상담 때 새 가족에게 전해지는 정보예요.
        </p>
      )}

      {/* 아이별 관계 */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-ink-900">함께 걸은 아이들</h2>
        <ul className="mt-3 divide-y divide-cream-200 border-y border-cream-200">
          {impact.bonds.map((b) => {
            const dog = getDog(b.dogId);
            if (!dog) return null;
            const available = dog.availability === "available";
            return (
              <li key={b.dogId} className="flex items-center gap-4 py-3.5">
                <Link href={`/dogs/${dog.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl">
                    <DogFace dog={dog} sizes="48px" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-ink-900">{dog.name}</span>
                      {b.walks > 1 && (
                        <span className="chip bg-sage-100 text-sage-800">
                          <Repeat className="h-3 w-3" aria-hidden /> 다시 만난 친구
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-500">
                      <span className="tnum">{b.walks}번</span> ·{" "}
                      <span className="tnum">{formatDuration(b.minutes)}</span> · 마지막{" "}
                      <span className="tnum">{formatDateKo(b.lastDate)}</span>
                    </span>
                  </span>
                </Link>
                {available && (
                  <Link
                    href={`/dogs/${dog.id}/apply`}
                    className="inline-flex min-h-[40px] shrink-0 items-center gap-0.5 rounded-full border border-cream-300 bg-white px-3.5 text-sm font-semibold text-ink-900 hover:border-sage-400"
                    aria-label={`${withJosa(dog.name, "와")} 다시 산책하기`}
                  >
                    다시 산책 <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* 이정표 — 게임 점수가 아니라 기준선 */}
      <section className="mt-10">
        <h2 className="text-base font-bold text-ink-900">이정표</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {MILESTONES.map((m) => {
            const done = m.achieved(impact);
            const fresh = reached.some((r) => r.id === m.id);
            return (
              <li
                key={m.id}
                className={cn(
                  "rounded-2xl px-4 py-3",
                  done ? "bg-white ring-1 ring-sage-200" : "bg-cream-100",
                  fresh && "ring-2 ring-sage-500"
                )}
                title={m.description}
              >
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-[15px] font-semibold",
                    done ? "text-ink-900" : "text-ink-500"
                  )}
                >
                  {done && <Check className="h-4 w-4 text-sage-600" strokeWidth={3} aria-hidden />}
                  {m.label}
                </p>
                <p className="tnum mt-0.5 text-[13px] text-ink-500">
                  {done ? "닿았어요" : m.progress(impact)}
                </p>
              </li>
            );
          })}
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
                    <span className="tnum text-sm text-ink-500">
                      {formatDateKo(log.date)} · {log.durationMin}분
                    </span>
                    {isNew && <span className="chip bg-sage-600 font-semibold text-white">새 기록</span>}
                  </span>
                  {log.note && (
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-700">{log.note}</span>
                  )}
                  {log.observations && log.observations.length > 0 && (
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      {log.observations.map((o) => (
                        <span key={o} className="chip bg-cream-200/80 text-ink-700">
                          {o}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="mt-1 block text-[13px] text-ink-500">{shelter?.name}</span>
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
      <h1 className="page-title mb-5 md:sr-only">활동 기록</h1>
      <div className="hidden md:block">
        <MyWalkTabs />
      </div>
      <Suspense fallback={<div className="h-32 animate-pulse rounded-[20px] bg-cream-200/70" />}>
        <ActivityContent />
      </Suspense>
    </div>
  );
}
