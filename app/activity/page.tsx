"use client";

import Link from "next/link";
import { CalendarDays, Clock3, Dog as DogIcon, Footprints, Heart, Timer } from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import EmptyState from "@/components/EmptyState";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { BADGES, cn, computeStats, formatDateKo } from "@/lib/utils";

export default function ActivityPage() {
  const { activityLogs, hydrated } = useStore();
  const stats = computeStats(activityLogs);
  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = stats.totalMinutes % 60;

  const metDogs = Array.from(new Set(activityLogs.map((l) => l.dogId)))
    .map((id) => getDog(id))
    .filter((d): d is NonNullable<typeof d> => !!d);

  const statCards = [
    { icon: Footprints, label: "총 산책 횟수", value: `${stats.totalWalks}회` },
    { icon: DogIcon, label: "함께한 강아지", value: `${stats.uniqueDogs}마리` },
    { icon: Timer, label: "누적 활동 시간", value: mins ? `${hours}시간 ${mins}분` : `${hours}시간` },
  ];

  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      <header className="mb-6">
        <p className="section-label">내 활동</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          활동 기록
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          당신의 한 걸음 한 걸음이 아이들의 큰 하루가 되었어요.
        </p>
      </header>

      {!hydrated ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="card h-24 animate-pulse bg-cream-100" />
            ))}
          </div>
          <div className="card h-48 animate-pulse bg-cream-100" />
        </div>
      ) : activityLogs.length === 0 ? (
        <EmptyState
          message={"첫 산책을 시작하면 활동 기록이 쌓여요."}
          ctaLabel="산책 가능한 아이들 보기"
          ctaHref="/dogs"
        />
      ) : (
        <>
          {/* 활동 통계 */}
          <div className="grid grid-cols-3 gap-3">
            {statCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="card flex flex-col items-center gap-1.5 p-4 text-center sm:p-5">
                <Icon className="h-5 w-5 text-tangerine-500" />
                <p className="text-lg font-extrabold text-ink-900 sm:text-2xl">{value}</p>
                <p className="text-[11px] text-ink-400 sm:text-xs">{label}</p>
              </div>
            ))}
          </div>

          {/* 활동 배지 */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold text-ink-900">활동 배지</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {BADGES.map((badge) => {
                const done = badge.achieved(stats);
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "card flex items-center gap-3 p-3.5 transition-all duration-300",
                      done ? "border-tangerine-200 bg-tangerine-50/70" : "opacity-55 grayscale"
                    )}
                  >
                    <span className="text-2xl" aria-hidden>{badge.icon}</span>
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-bold text-ink-900">{badge.label}</p>
                      <p className="mt-0.5 truncate text-[11px] text-ink-400">
                        {done ? badge.description : "아직 잠겨 있어요"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 내가 만난 아이들 */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold text-ink-900">내가 만난 아이들</h2>
            <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
              {metDogs.map((dog) => (
                <Link
                  key={dog.id}
                  href={`/dogs/${dog.id}`}
                  className="card card-hover w-28 shrink-0 overflow-hidden text-center"
                >
                  <DogAvatar dog={dog} className="aspect-square w-full" />
                  <p className="truncate px-2 py-2 text-sm font-bold text-ink-900">{dog.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 산책 일지 */}
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-extrabold text-ink-900">산책 일지</h2>
            <ul className="space-y-3">
              {[...activityLogs]
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((log) => {
                  const dog = getDog(log.dogId);
                  if (!dog) return null;
                  const shelter = getShelter(dog.shelterId);
                  return (
                    <li key={log.id} className="card flex gap-4 p-4">
                      <Link
                        href={`/dogs/${dog.id}`}
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-card"
                        aria-label={`${dog.name} 상세 보기`}
                      >
                        <DogAvatar dog={dog} className="h-full w-full" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-extrabold text-ink-900">{dog.name}</p>
                          <span className="flex items-center gap-1 text-xs text-ink-400">
                            <CalendarDays className="h-3.5 w-3.5" /> {formatDateKo(log.date)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-ink-400">
                            <Clock3 className="h-3.5 w-3.5" /> {log.durationMin}분
                          </span>
                          <span className="text-xs text-ink-400">{shelter?.name}</span>
                        </div>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink-700">{log.note}</p>
                      </div>
                    </li>
                  );
                })}
            </ul>
          </section>

          <div className="card mt-8 flex items-center gap-3 border-sage-200 bg-sage-50/70 p-5">
            <Heart className="h-5 w-5 shrink-0 fill-tangerine-400 text-tangerine-400" />
            <p className="text-sm leading-relaxed text-sage-700">
              지금까지 <strong>{stats.uniqueDogs}마리</strong>의 아이들과{" "}
              <strong>{stats.totalWalks}번</strong> 걸었어요. 아이들이 당신을 기억하고 있을 거예요.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
