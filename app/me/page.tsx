"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Check, ChevronRight, Home, MapPin, PawPrint, RotateCcw, UserRound } from "lucide-react";
import Dialog from "@/components/Dialog";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import NextWalk from "@/components/NextWalk";
import EmptyState from "@/components/EmptyState";
import { dogs, getDog } from "@/lib/data/dogs";
import { useStore } from "@/lib/store";
import { isOpen } from "@/lib/domain/requests";
import { computeImpact } from "@/lib/domain/impact";
import { cn, todayISO } from "@/lib/utils";

const REGIONS = ["서울", "인천", "경기", "대전", "부산"];

export default function MyPage() {
  const {
    favorites,
    requests,
    activityLogs,
    interestRegions,
    hydrated,
    toggleInterestRegion,
    resetDemo,
    showToast,
  } = useStore();
  const [resetOpen, setResetOpen] = useState(false);

  // 이번 달 수치는 쓰지 않으므로 기준일은 렌더 시점이어도 괜찮습니다
  const stats = computeImpact(activityLogs, (id) => getDog(id)?.shelterId, todayISO());
  const favoriteDogs = dogs.filter((d) => favorites.includes(d.id));
  const upcoming = requests.filter(isOpen).length;

  return (
    <div className="container-app max-w-4xl py-8 md:py-12">
      {/* 프로필 + 요약 — 한 장의 카드로 */}
      <section className="overflow-hidden rounded-[24px] bg-white shadow-card ring-1 ring-cream-300/60">
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sage-100 to-sage-200 text-sage-700">
            <UserRound className="h-8 w-8" aria-hidden />
          </span>
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-[22px] font-bold tracking-tight text-ink-900">
              김지우님
              <span className="rounded-full bg-cream-200 px-2.5 py-0.5 text-[13px] font-semibold text-ink-500">
                데모 계정
              </span>
            </h1>
            <p className="mt-1 text-[15px] text-ink-500">
              {hydrated && stats.totalWalks > 0
                ? `지금까지 ${stats.uniqueDogs}마리의 아이들과 ${stats.totalWalks}번 걸었어요.`
                : "오늘은 어떤 친구와 산책할까요?"}
            </p>
          </div>
        </div>

        <nav
          aria-label="내 산책 요약"
          className="grid grid-cols-3 divide-x divide-cream-200 border-t border-cream-200 bg-cream-50/70"
        >
          {[
            { href: "/requests", label: "예정된 산책", value: `${upcoming}건` },
            { href: "/activity", label: "활동 기록", value: `${stats.totalWalks}회` },
            { href: "#favorites", label: "찜한 아이", value: `${favorites.length}마리` },
          ].map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="flex flex-col items-center px-2 py-4 transition-colors hover:bg-white"
            >
              <span className="tnum text-xl font-bold text-ink-900">{hydrated ? s.value : "–"}</span>
              <span className="mt-0.5 text-[13px] text-ink-500">{s.label}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* 찜한 아이들 — 작은 사진 카드로 여러 마리를 한 번에 */}
      <section id="favorites" className="mt-10 scroll-mt-24" aria-labelledby="fav-title">
        <div className="flex items-end justify-between">
          <h2 id="fav-title" className="text-lg font-bold text-ink-900">
            찜한 아이들
            {hydrated && favoriteDogs.length > 0 && (
              <span className="tnum ml-1.5 text-[15px] font-normal text-ink-500">
                {favoriteDogs.length}마리
              </span>
            )}
          </h2>
          {favoriteDogs.length > 0 && (
            <Link
              href="/dogs"
              className="flex min-h-[44px] items-center gap-0.5 text-sm font-medium text-ink-500 hover:text-ink-900"
            >
              더 둘러보기 <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
        <div className="mt-3">
          {!hydrated ? (
            <div className="flex gap-3 overflow-hidden" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/5] w-[42%] shrink-0 animate-pulse rounded-[20px] bg-cream-200 sm:w-48"
                />
              ))}
            </div>
          ) : favoriteDogs.length === 0 ? (
            <EmptyState
              message={"마음에 드는 아이를 저장해보세요."}
              ctaLabel="아이들 둘러보기"
              ctaHref="/dogs"
            />
          ) : (
            <ul
              aria-label="찜한 아이들"
              className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4"
            >
              {favoriteDogs.map((dog) => (
                <li
                  key={dog.id}
                  className="w-[42%] max-w-[190px] shrink-0 snap-start sm:w-auto sm:max-w-none"
                >
                  <article className="group relative">
                    <div className="relative overflow-hidden rounded-[20px] bg-cream-200">
                      <DogImage
                        dog={dog}
                        aspect="aspect-[4/5]"
                        sizes="(max-width: 640px) 42vw, 220px"
                        className={cn(
                          "[&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.04]",
                          dog.availability === "unavailable" && "grayscale-[35%]"
                        )}
                      />
                      <FavoriteButton
                        dogId={dog.id}
                        dogName={dog.name}
                        className="absolute right-2 top-2 z-[2] h-9 w-9"
                      />
                    </div>
                    <h3 className="mt-2 px-0.5">
                      <Link
                        href={`/dogs/${dog.id}`}
                        className="font-bold text-ink-900 after:absolute after:inset-0 after:z-[1] focus-visible:outline-none"
                      >
                        {dog.name}
                      </Link>
                    </h3>
                    <NextWalk
                      dog={dog}
                      variant="stack"
                      className="mt-0.5 px-0.5 [&>span:last-child]:text-sm"
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 ring-2 ring-sage-400 ring-offset-4 ring-offset-cream-50 group-has-[a:focus-visible]:opacity-100"
                    />
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* 설정 — 앱의 계정 화면처럼 한 묶음의 목록 */}
      <section className="mt-10" aria-labelledby="settings-title">
        <h2 id="settings-title" className="text-lg font-bold text-ink-900">
          설정과 안내
        </h2>
        <div className="mt-3 divide-y divide-cream-200 overflow-hidden rounded-[20px] bg-white ring-1 ring-cream-300/70">
          <div className="p-4 sm:p-5">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink-900">
              <MapPin className="h-4 w-4 text-sage-600" aria-hidden /> 관심 지역
            </p>
            <p className="mt-0.5 text-sm text-ink-500">홈에서 이 지역 아이들을 먼저 보여드려요.</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="관심 지역">
              {REGIONS.map((region) => {
                const active = hydrated && interestRegions.includes(region);
                return (
                  <button
                    key={region}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleInterestRegion(region)}
                    className={cn(
                      "inline-flex min-h-[40px] items-center gap-1 rounded-full border px-4 text-[15px] font-medium transition-colors",
                      active
                        ? "border-sage-600 bg-sage-600 text-white"
                        : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />}
                    {region}
                  </button>
                );
              })}
            </div>
          </div>
          {[
            { href: "/guide", icon: BookOpen, label: "봉사 가이드", desc: "참여 방법·준비물·현장 약속" },
            { href: "/shelters", icon: Home, label: "함께하는 보호소", desc: "운영 시간·방문 안내" },
            { href: "/activity", icon: PawPrint, label: "활동 기록", desc: "함께 걸은 시간과 이정표" },
          ].map(({ href, icon: Icon, label, desc }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-cream-50 sm:px-5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-ink-700">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-ink-900">{label}</span>
                <span className="block truncate text-[13px] text-ink-500">{desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream-50 sm:px-5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-100 text-ink-700">
              <RotateCcw className="h-[18px] w-[18px]" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink-900">처음 상태로 되돌리기</span>
              <span className="block text-[13px] text-ink-500">
                데모 데이터 — 신청·기록·찜을 예시로 되돌려요
              </span>
            </span>
          </button>
        </div>
        <p className="mt-3 px-1 text-[13px] leading-relaxed text-ink-500">
          신청 내역·활동 기록·찜은 이 브라우저에만 저장돼요. 실제 보호소 예약과는 연결되지 않아요.
        </p>
      </section>

      <Dialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="데모 데이터를 처음 상태로 되돌릴까요?"
        description="직접 만든 신청과 활동 기록, 찜, 관심 지역이 모두 초기 예시 데이터로 바뀌어요."
        footer={
          <>
            <button type="button" onClick={() => setResetOpen(false)} className="btn-secondary flex-1">
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemo();
                setResetOpen(false);
                showToast("데모 데이터를 처음 상태로 되돌렸어요");
              }}
              className="btn-danger flex-1"
            >
              되돌리기
            </button>
          </>
        }
      />
    </div>
  );
}
