"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, CheckCircle2, ChevronRight, PawPrint, Repeat } from "lucide-react";
import DogImage, { DogFace } from "@/components/DogImage";
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

  // 일지는 달마다 묶어(최근 달부터) 기간의 흐름이 보이게
  const months: { key: string; label: string; minutes: number; logs: typeof logs }[] = [];
  for (const log of logs) {
    const key = log.date.slice(0, 7);
    let g = months.find((m) => m.key === key);
    if (!g) {
      const [y, mo] = key.split("-").map(Number);
      g = { key, label: `${y}년 ${mo}월`, minutes: 0, logs: [] };
      months.push(g);
    }
    g.logs.push(log);
    g.minutes += log.durationMin;
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

      {/* 핵심 — 함께 걸은 시간. 이 화면의 한 장면이므로 브랜드 색 면 위에 */}
      <section
        aria-label="내 활동 요약"
        className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-sage-800 to-sage-700 p-5 text-white shadow-card sm:p-7"
      >
        <PawPrint
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rotate-12 text-white/[0.06]"
        />
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-white/80">아이들과 함께 걸은 시간</p>
            <p className="tnum mt-1.5 text-[34px] font-extrabold leading-none tracking-tight sm:text-[40px]">
              {formatDuration(impact.totalMinutes)}
            </p>
            <p className="mt-2.5 text-[15px] text-white/85">
              이번 달 <span className="tnum font-semibold text-white">{impact.thisMonth.walks}회</span>
              {impact.thisMonth.walks > 0 && (
                <span className="tnum"> · {formatDuration(impact.thisMonth.minutes)}</span>
              )}
            </p>
          </div>
          {/* 만난 아이들의 얼굴 — 숫자보다 먼저 떠오르는 것 */}
          <ul className="flex shrink-0 -space-x-3" aria-label="만난 아이들">
            {impact.bonds.slice(0, 4).map((b) => {
              const dog = getDog(b.dogId);
              return dog ? (
                <li
                  key={b.dogId}
                  className="h-11 w-11 overflow-hidden rounded-full ring-2 ring-sage-700 sm:h-12 sm:w-12"
                >
                  <DogFace dog={dog} sizes="48px" />
                </li>
              ) : null;
            })}
          </ul>
        </div>
        <dl className="relative mt-6 grid grid-cols-4 divide-x divide-white/15 rounded-2xl bg-white/10 py-3.5 ring-1 ring-white/10">
          {[
            { label: "산책", value: impact.totalWalks, unit: "회" },
            { label: "만난 아이", value: impact.uniqueDogs, unit: "마리" },
            { label: "다시 만난", value: impact.revisitedDogs, unit: "마리" },
            { label: "보호소", value: impact.shelters, unit: "곳" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center px-1 text-center">
              <dt className="mt-0.5 text-[13px] text-white/80">{s.label}</dt>
              <dd className="tnum text-lg font-bold">
                {s.value}
                <span className="ml-0.5 text-[13px] font-semibold text-white/80">{s.unit}</span>
              </dd>
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

      {/* 아이별 관계 — 숫자 목록이 아니라 '함께 걸은 아이들'의 얼굴 */}
      <section className="mt-10" aria-labelledby="bonds-title">
        <h2 id="bonds-title" className="text-lg font-bold text-ink-900">
          함께 걸은 아이들{" "}
          <span className="tnum ml-1 text-[15px] font-normal text-ink-500">{impact.uniqueDogs}마리</span>
        </h2>
        <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0">
          {impact.bonds.map((b) => {
            const dog = getDog(b.dogId);
            if (!dog) return null;
            const available = dog.availability === "available";
            return (
              <li
                key={b.dogId}
                className="flex w-[46%] max-w-[200px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] bg-white ring-1 ring-cream-300/70 sm:w-auto sm:max-w-none"
              >
                <Link href={`/dogs/${dog.id}`} className="group block">
                  <span className="relative block overflow-hidden">
                    <DogImage
                      dog={dog}
                      aspect="aspect-[4/3]"
                      sizes="(max-width: 640px) 46vw, 240px"
                      className="[&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.04]"
                    />
                    {b.walks > 1 && (
                      <span className="chip absolute left-2 top-2 bg-white/95 font-semibold text-sage-800 shadow-card">
                        <Repeat className="h-3 w-3" aria-hidden /> 다시 만난 친구
                      </span>
                    )}
                  </span>
                  <span className="block px-3 pt-2.5">
                    <span className="block font-bold text-ink-900 group-hover:text-sage-700">{dog.name}</span>
                    <span className="tnum block text-sm text-ink-700">
                      {b.walks}번 · {formatDuration(b.minutes)}
                    </span>
                    <span className="tnum block text-[13px] text-ink-500">
                      마지막 {formatDateKo(b.lastDate)}
                    </span>
                  </span>
                </Link>
                <div className="mt-auto p-3 pt-2.5">
                  {available ? (
                    <Link
                      href={`/dogs/${dog.id}/apply`}
                      className="flex min-h-[40px] items-center justify-center gap-0.5 rounded-full border border-cream-300 bg-white text-sm font-semibold text-ink-900 transition-colors hover:border-sage-400 hover:bg-sage-50"
                      aria-label={`${withJosa(dog.name, "와")} 다시 산책하기`}
                    >
                      다시 산책 <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <p className="flex min-h-[40px] items-center justify-center text-[13px] text-ink-500">
                      지금은 쉬는 중
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 이정표 — 게임 점수가 아니라 기준선. 얼마나 남았는지 막대로 */}
      <section className="mt-10" aria-labelledby="milestones-title">
        <h2 id="milestones-title" className="text-lg font-bold text-ink-900">
          이정표
        </h2>
        <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {MILESTONES.map((m) => {
            const done = m.achieved(impact);
            const fresh = reached.some((r) => r.id === m.id);
            const pct = Math.round(m.ratio(impact) * 100);
            return (
              <li
                key={m.id}
                className={cn(
                  "rounded-2xl px-4 pb-3.5 pt-3",
                  done ? "bg-white ring-1 ring-sage-200" : "bg-cream-100",
                  fresh && "animate-pop-in ring-2 ring-sage-500 motion-reduce:animate-none"
                )}
                title={m.description}
              >
                <p
                  className={cn(
                    "flex items-center gap-1.5 text-[15px] font-semibold",
                    done ? "text-ink-900" : "text-ink-700"
                  )}
                >
                  {done && <Check className="h-4 w-4 text-sage-600" strokeWidth={3} aria-hidden />}
                  {m.label}
                </p>
                <p className="tnum mt-0.5 text-[13px] text-ink-500">
                  {done ? "닿았어요" : m.progress(impact)}
                </p>
                <div
                  role="progressbar"
                  aria-label={`${m.label} 진행`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-cream-200"
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700 ease-out",
                      done ? "bg-sage-500" : "bg-sage-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 산책 일지 — 달마다 묶은 타임라인 */}
      <section className="mt-10" aria-labelledby="journal-title">
        <h2 id="journal-title" className="text-lg font-bold text-ink-900">
          산책 일지
        </h2>
        {months.map((g) => (
          <div key={g.key} className="mt-4">
            <h3 className="sticky top-16 z-10 -mx-4 flex items-baseline gap-2 bg-cream-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
              <span className="text-[15px] font-bold text-ink-900">{g.label}</span>
              <span className="tnum text-[13px] text-ink-500">
                {g.logs.length}회 · {formatDuration(g.minutes)}
              </span>
            </h3>
            <ol className="relative ml-[23px] border-l-2 border-cream-200 pl-5">
              {g.logs.map((log) => {
                const dog = getDog(log.dogId);
                if (!dog) return null;
                const shelter = getShelter(dog.shelterId);
                const isNew = log.id === newId;
                const body = (
                  <>
                    <span className="flex items-center gap-3">
                      <span className="h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                        <DogFace dog={dog} sizes="44px" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-bold text-ink-900">{dog.name}</span>
                          <span className="tnum text-sm text-ink-500">
                            {formatDateKo(log.date)} · {log.durationMin}분
                          </span>
                          {isNew && (
                            <span className="chip bg-sage-600 font-semibold text-white">새 기록</span>
                          )}
                        </span>
                        <span className="block text-[13px] text-ink-500">{shelter?.name}</span>
                      </span>
                    </span>
                    {log.note && (
                      <span className="mt-2 block text-[15px] leading-relaxed text-ink-700">{log.note}</span>
                    )}
                    {log.observations && log.observations.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {log.observations.map((o) => (
                          <span key={o} className="chip bg-cream-200/80 text-ink-700">
                            {o}
                          </span>
                        ))}
                      </span>
                    )}
                  </>
                );
                const cls = cn(
                  "block rounded-2xl bg-white p-4 ring-1 ring-cream-300/70 transition-shadow",
                  isNew && "bg-sage-50 ring-2 ring-sage-400"
                );
                return (
                  <li key={log.id} className="relative py-2">
                    {/* 타임라인 점 */}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-[27px] top-7 h-3 w-3 rounded-full ring-4 ring-cream-50",
                        isNew ? "bg-sage-600" : "bg-sage-400"
                      )}
                    />
                    {log.requestId ? (
                      <Link href={`/requests/${log.requestId}`} className={cn(cls, "hover:shadow-card")}>
                        {body}
                      </Link>
                    ) : (
                      <div className={cls}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        ))}
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
