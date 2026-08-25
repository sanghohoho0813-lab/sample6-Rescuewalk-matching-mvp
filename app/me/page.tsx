"use client";

import Link from "next/link";
import {
  Bell,
  CalendarCheck,
  ChevronRight,
  Footprints,
  Heart,
  MapPin,
  PawPrint,
  UserRound,
} from "lucide-react";
import DogCard from "@/components/DogCard";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { useStore } from "@/lib/store";
import { computeStats } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useState } from "react";

const INTEREST_REGIONS = ["서울", "인천", "경기", "대전", "부산"];

export default function MyPage() {
  const { favorites, requests, activityLogs, hydrated, showToast } = useStore();
  const stats = computeStats(activityLogs);
  const favoriteDogs = dogs.filter((d) => favorites.includes(d.id));
  const upcoming = requests.filter(
    (r) => r.status === "pending" || r.status === "confirmed"
  ).length;

  const [interestRegions, setInterestRegions] = useState<string[]>(["서울"]);
  const [notify, setNotify] = useState({ newDogs: true, reminder: true, news: false });

  return (
    <div className="container-app max-w-3xl py-8 md:py-10">
      {/* 프로필 */}
      <section className="card flex items-center gap-4 p-5 sm:p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
          <UserRound className="h-8 w-8" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-extrabold text-ink-900">김지우님, 안녕하세요! 👋</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {hydrated && stats.totalWalks > 0
              ? `지금까지 ${stats.uniqueDogs}마리의 아이들과 ${stats.totalWalks}번 걸었어요.`
              : "오늘은 어떤 친구와 산책할까요?"}
          </p>
        </div>
        <span className="chip hidden bg-tangerine-100 font-bold text-tangerine-700 sm:inline-flex">
          데모 계정
        </span>
      </section>

      {/* 요약 바로가기 */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { href: "/requests", icon: CalendarCheck, label: "신청 내역", value: hydrated ? `${upcoming}건 예정` : "—" },
          { href: "/activity", icon: Footprints, label: "활동 기록", value: hydrated ? `${stats.totalWalks}회 산책` : "—" },
          { href: "#favorites", icon: Heart, label: "찜한 아이들", value: hydrated ? `${favorites.length}마리` : "—" },
        ].map(({ href, icon: Icon, label, value }) => (
          <Link
            key={label}
            href={href}
            className="card card-hover flex flex-col items-center gap-1.5 p-4 text-center"
          >
            <Icon className="h-5 w-5 text-tangerine-500" />
            <p className="text-sm font-bold text-ink-900">{label}</p>
            <p className="text-xs text-ink-400">{value}</p>
          </Link>
        ))}
      </div>

      {/* 찜한 강아지 */}
      <section className="mt-8" id="favorites">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink-900">찜한 강아지</h2>
          <Link
            href="/dogs"
            className="flex items-center gap-0.5 text-sm font-semibold text-sage-600 hover:text-tangerine-600"
          >
            아이들 더 보기 <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        {!hydrated ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="card h-72 animate-pulse bg-cream-100" />
            ))}
          </div>
        ) : favoriteDogs.length === 0 ? (
          <EmptyState
            message={"마음에 드는 아이를 저장해보세요."}
            ctaLabel="아이들 둘러보기"
            ctaHref="/dogs"
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {favoriteDogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        )}
      </section>

      {/* 관심 지역 */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <MapPin className="h-5 w-5 text-tangerine-500" /> 관심 지역
        </h2>
        <div className="card p-5">
          <p className="mb-3 text-sm text-ink-500">
            관심 지역의 새로운 아이들 소식을 우선으로 보여드려요.
          </p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_REGIONS.map((region) => {
              const active = interestRegions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setInterestRegions((prev) =>
                      active ? prev.filter((r) => r !== region) : [...prev, region]
                    )
                  }
                  className={cn(
                    "min-h-[40px] rounded-full border px-4 text-sm font-semibold transition-all duration-200",
                    active
                      ? "border-sage-500 bg-sage-500 text-white"
                      : "border-cream-300 bg-white text-ink-500 hover:border-sage-300"
                  )}
                >
                  {region}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 알림 설정 */}
      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-ink-900">
          <Bell className="h-5 w-5 text-tangerine-500" /> 알림 설정
        </h2>
        <ul className="card divide-y divide-cream-200">
          {(
            [
              { key: "newDogs", label: "관심 지역 새 친구 알림", desc: "관심 지역에 새 아이가 등록되면 알려드려요" },
              { key: "reminder", label: "산책 리마인드", desc: "예약한 산책 하루 전에 알려드려요" },
              { key: "news", label: "소식지", desc: "아이들의 입양 소식과 보호소 이야기" },
            ] as const
          ).map(({ key, label, desc }) => (
            <li key={key} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-bold text-ink-900">{label}</p>
                <p className="mt-0.5 text-xs text-ink-400">{desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notify[key]}
                aria-label={label}
                onClick={() => {
                  setNotify((prev) => ({ ...prev, [key]: !prev[key] }));
                  showToast(
                    notify[key] ? "알림을 껐어요." : "알림을 켰어요!",
                    notify[key] ? "🔕" : "🔔"
                  );
                }}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
                  notify[key] ? "bg-sage-500" : "bg-cream-300"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200",
                    notify[key] ? "left-6" : "left-1"
                  )}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="card mt-8 flex items-center gap-3 bg-cream-100 p-5">
        <PawPrint className="h-5 w-5 shrink-0 text-tangerine-500" />
        <p className="text-[13px] leading-relaxed text-ink-500">
          RescueWalk는 데모 서비스예요. 신청 내역과 활동 기록은 이 브라우저에만 저장되며,
          실제 보호소 예약과 연결되지 않아요.
        </p>
      </div>
    </div>
  );
}
