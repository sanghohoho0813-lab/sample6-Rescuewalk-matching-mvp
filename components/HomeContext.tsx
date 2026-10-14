"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, MapPin, Repeat } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import { dogs, getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { computeImpact, formatDuration } from "@/lib/domain/impact";
import { nextWalk } from "@/lib/domain/requests";
import { useStore } from "@/lib/store";
import { useClock } from "@/lib/useClock";
import { formatDateKo, formatTimeKo, relativeDayLabel, withJosa } from "@/lib/utils";

const BEGINNER_COUNT = dogs.filter(
  (d) => d.availability === "available" && d.match.experience === "beginner"
).length;

/**
 * 홈 첫 화면의 '지금 나에게 필요한 것' 하나.
 *  1) 다가오는 산책이 있으면 → 그 방문 안내(날짜·시간·만나는 곳)
 *  2) 기록이 있으면 → 마지막으로 만난 아이와 다시 산책하기
 *  3) 처음이라면 → 참여 방법 세 단계와 초보 가능한 아이
 */
export default function HomeContext() {
  const { requests, activityLogs, hydrated } = useStore();
  const clock = useClock();

  if (!hydrated || !clock) {
    return (
      <div
        className="h-[236px] animate-pulse rounded-[24px] bg-white/70"
        aria-busy="true"
        aria-label="내 산책을 불러오는 중"
      />
    );
  }

  const next = nextWalk(requests, clock.today);
  const nextDog = next ? getDog(next.dogId) : undefined;
  if (next && nextDog) {
    const shelter = getShelter(nextDog.shelterId);
    return (
      <section aria-labelledby="ctx-title" className="rounded-[24px] bg-white p-5 shadow-card sm:p-6">
        <p id="ctx-title" className="flex items-center gap-1.5 text-sm font-semibold text-sage-700">
          <CalendarCheck className="h-4 w-4" aria-hidden /> 다가오는 내 산책
        </p>
        <div className="mt-3 flex items-center gap-4">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <DogFace dog={nextDog} sizes="56px" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-900">
              <span className="text-sage-700">{relativeDayLabel(next.date, clock.today)}</span> ·{" "}
              {withJosa(nextDog.name, "와")}의 산책
            </p>
            <p className="text-[15px] text-ink-700">
              <span className="tnum">{formatDateKo(next.date)}</span>{" "}
              <span className="tnum">{formatTimeKo(next.time)}</span> ·{" "}
              {next.status === "pending" ? "보호소 확인 중" : "방문 확정"}
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {shelter?.name} · {shelter?.visit.meetingPoint.split(" — ")[0]}
        </p>
        <Link href={`/requests/${next.id}`} className="btn-secondary mt-4 w-full">
          방문 안내 보기
        </Link>
      </section>
    );
  }

  if (activityLogs.length > 0) {
    const impact = computeImpact(activityLogs, (id) => getDog(id)?.shelterId, clock.today);
    const last = [...activityLogs].sort((a, b) => b.date.localeCompare(a.date))[0];
    const lastDog = getDog(last.dogId);
    return (
      <section aria-labelledby="ctx-title" className="rounded-[24px] bg-white p-5 shadow-card sm:p-6">
        <p id="ctx-title" className="flex items-center gap-1.5 text-sm font-semibold text-sage-700">
          <Repeat className="h-4 w-4" aria-hidden /> 다시 만나볼까요?
        </p>
        <p className="mt-2 text-[15px] text-ink-700">
          지금까지 <strong className="tnum font-semibold text-ink-900">{impact.uniqueDogs}마리</strong>와{" "}
          <strong className="tnum font-semibold text-ink-900">{formatDuration(impact.totalMinutes)}</strong>{" "}
          함께 걸었어요.
        </p>
        {lastDog && (
          <div className="mt-4 flex items-center gap-4">
            <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
              <DogFace dog={lastDog} sizes="56px" />
            </span>
            <p className="min-w-0 text-[15px] text-ink-700">
              마지막으로 만난 <strong className="font-semibold text-ink-900">{lastDog.name}</strong>
              <span className="block text-sm text-ink-500">{formatDateKo(last.date)}</span>
            </p>
          </div>
        )}
        {lastDog?.availability === "available" && (
          <Link href={`/dogs/${lastDog.id}`} className="btn-secondary mt-4 w-full">
            {withJosa(lastDog.name, "와")} 다시 산책하기
          </Link>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby="ctx-title" className="rounded-[24px] bg-white p-5 shadow-card sm:p-6">
      <p id="ctx-title" className="text-sm font-semibold text-sage-700">
        처음이라면 이렇게 시작해요
      </p>
      <ol className="mt-3 space-y-2.5">
        {[
          "나에게 맞는 아이와 가능한 시간을 골라요",
          "보호소가 확인하면 문자로 방문 안내가 와요",
          "현장에서 매니저 안내를 받고 함께 걸어요",
        ].map((t, i) => (
          <li key={t} className="flex gap-3 text-[15px] text-ink-900">
            <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-[13px] font-bold text-sage-800">
              {i + 1}
            </span>
            {t}
          </li>
        ))}
      </ol>
      <Link href="/dogs?need=beginner" className="btn-secondary mt-5 w-full">
        초보도 괜찮은 아이 {BEGINNER_COUNT}마리 보기 <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
