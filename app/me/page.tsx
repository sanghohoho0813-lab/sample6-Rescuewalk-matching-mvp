"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCcw, UserRound } from "lucide-react";
import DogCard from "@/components/DogCard";
import DogRail from "@/components/DogRail";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { useStore } from "@/lib/store";
import { cn, computeStats } from "@/lib/utils";

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

  const stats = computeStats(activityLogs);
  const favoriteDogs = dogs.filter((d) => favorites.includes(d.id));
  const upcoming = requests.filter((r) => r.status === "pending" || r.status === "confirmed").length;

  return (
    <div className="container-app max-w-4xl py-8 md:py-12">
      {/* 프로필 */}
      <section className="flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-700">
          <UserRound className="h-8 w-8" />
        </span>
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
            김지우님
            <span className="rounded-md bg-cream-200 px-2 py-0.5 text-[13px] font-semibold text-ink-500">
              데모 계정
            </span>
          </h1>
          <p className="mt-1 text-[15px] text-ink-500">
            {hydrated && stats.totalWalks > 0
              ? `지금까지 ${stats.uniqueDogs}마리의 아이들과 ${stats.totalWalks}번 걸었어요.`
              : "오늘은 어떤 친구와 산책할까요?"}
          </p>
        </div>
      </section>

      {/* 요약 */}
      <nav
        aria-label="내 산책 요약"
        className="mt-8 grid grid-cols-3 divide-x divide-cream-300 rounded-[20px] bg-white py-4 shadow-card"
      >
        {[
          { href: "/requests", label: "예정된 산책", value: `${upcoming}건` },
          { href: "/activity", label: "활동 기록", value: `${stats.totalWalks}회` },
          { href: "#favorites", label: "찜한 아이", value: `${favorites.length}마리` },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="flex flex-col items-center px-2 py-1 hover:text-sage-700">
            <span className="tnum text-xl font-bold text-ink-900">{hydrated ? s.value : "–"}</span>
            <span className="mt-0.5 text-[13px] text-ink-400">{s.label}</span>
          </Link>
        ))}
      </nav>

      {/* 찜한 강아지 */}
      <section id="favorites" className="mt-12 scroll-mt-24">
        <div className="flex items-end justify-between">
          <h2 className="text-lg font-bold text-ink-900">찜한 아이들</h2>
          {favoriteDogs.length > 0 && (
            <Link href="/dogs" className="text-sm font-medium text-ink-500 hover:text-ink-900">
              더 둘러보기
            </Link>
          )}
        </div>
        <div className="mt-5">
          {!hydrated ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {[0, 1].map((i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-[20px] bg-cream-200" />
              ))}
            </div>
          ) : favoriteDogs.length === 0 ? (
            <EmptyState message={"마음에 드는 아이를 저장해보세요."} ctaLabel="아이들 둘러보기" ctaHref="/dogs" />
          ) : (
            <DogRail label="찜한 아이들">
              {favoriteDogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </DogRail>
          )}
        </div>
      </section>

      {/* 관심 지역 */}
      <section className="mt-12 border-t border-cream-300/70 pt-8">
        <h2 className="text-lg font-bold text-ink-900">관심 지역</h2>
        <p className="mt-1 text-[15px] text-ink-500">홈에서 이 지역 아이들을 먼저 보여드려요.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const active = hydrated && interestRegions.includes(region);
            return (
              <button
                key={region}
                type="button"
                aria-pressed={active}
                onClick={() => toggleInterestRegion(region)}
                className={cn(
                  "min-h-[44px] rounded-full border px-5 text-[15px] font-medium transition-colors",
                  active
                    ? "border-sage-600 bg-sage-600 text-white"
                    : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
                )}
              >
                {region}
              </button>
            );
          })}
        </div>
      </section>

      {/* 데모 데이터 */}
      <section className="mt-12 border-t border-cream-300/70 pt-8">
        <h2 className="text-lg font-bold text-ink-900">데모 데이터</h2>
        <p className="mt-1 text-[15px] leading-relaxed text-ink-500">
          신청 내역·활동 기록·찜은 이 브라우저에만 저장돼요. 실제 보호소 예약과는 연결되지 않아요.
        </p>
        <button type="button" onClick={() => setResetOpen(true)} className="btn-secondary mt-4">
          <RotateCcw className="h-4 w-4" /> 처음 상태로 되돌리기
        </button>
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
