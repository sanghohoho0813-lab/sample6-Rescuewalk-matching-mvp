"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DogCard from "@/components/DogCard";
import Carousel from "@/components/Carousel";
import { dogs } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { searchDogs, type WhenKey, EMPTY_FILTERS, toDogQuery } from "@/lib/domain/dogSearch";
import { useStore } from "@/lib/store";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/utils";

/**
 * 홈의 '지금 산책 가능한 아이'.
 * - 오늘 남은 시간에 가능한 아이가 있으면 '오늘', 없으면(저녁 등) '이번 주'를 먼저 보여줍니다.
 * - 관심 지역을 저장했다면 그 지역부터(전체로 넓힐 수 있음).
 * 가능 여부는 방문자의 지금 시각으로 계산하므로 그리기 전에는 자리만 잡아 둡니다.
 */
export default function FeaturedDogs() {
  const { interestRegions, hydrated } = useStore();
  const clock = useClock();
  const [when, setWhen] = useState<WhenKey | null>(null);
  const [scope, setScope] = useState<"interest" | "all">("interest");

  const ready = hydrated && !!clock;
  const regions = interestRegions;
  const inRegion = (dogId: string) => {
    const d = dogs.find((x) => x.id === dogId);
    return !!d && regions.includes(getShelter(d.shelterId)?.region ?? "");
  };

  const todayAll = ready ? searchDogs(dogs, { ...EMPTY_FILTERS, when: "today" }, "soon", clock) : [];
  const activeWhen: WhenKey = when ?? (todayAll.length > 0 ? "today" : "week");
  const all = ready ? searchDogs(dogs, { ...EMPTY_FILTERS, when: activeWhen }, "soon", clock) : [];
  const useInterest = scope === "interest" && regions.length > 0 && all.some((d) => inRegion(d.id));
  const list = (useInterest ? all.filter((d) => inRegion(d.id)) : all).slice(0, 6);
  const singleRegion = useInterest && regions.length === 1 ? regions[0] : null;
  const moreHref = `/dogs${toDogQuery({ ...EMPTY_FILTERS, when: activeWhen, region: (singleRegion as typeof EMPTY_FILTERS.region) ?? null }, "soon")}`;
  const moreCount = useInterest ? all.filter((d) => inRegion(d.id)).length : all.length;

  return (
    <section className="container-app py-12 md:py-16" aria-labelledby="available-title">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h2 id="available-title" className="section-title">
            지금 산책 가능한 아이
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-500">
            {useInterest
              ? `관심 지역(${regions.join(", ")})부터 보여드려요`
              : "가장 빨리 만날 수 있는 순서예요"}
          </p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="기간">
          {(["today", "week"] as const).map((w) => (
            <button
              key={w}
              type="button"
              aria-pressed={activeWhen === w}
              onClick={() => setWhen(w)}
              className={cn(
                "min-h-[40px] rounded-full border px-4 text-[15px] transition-colors",
                activeWhen === w
                  ? "border-ink-900 bg-ink-900 font-semibold text-white"
                  : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
              )}
            >
              {w === "today" ? "오늘" : "이번 주"}
              {ready && w === "today" && <span className="tnum ml-1 opacity-70">{todayAll.length}</span>}
            </button>
          ))}
          {regions.length > 0 && (
            <button
              type="button"
              aria-pressed={scope === "all"}
              onClick={() => setScope((s) => (s === "all" ? "interest" : "all"))}
              className="min-h-[40px] rounded-full px-3 text-[15px] font-medium text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
            >
              {scope === "all" ? "관심 지역만" : "전체 지역"}
            </button>
          )}
        </div>
      </div>

      <div className="mt-7">
        {!ready ? (
          <div className="flex gap-4 overflow-hidden sm:gap-5 lg:gap-6" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[360px] w-[80%] shrink-0 animate-pulse rounded-[20px] bg-cream-200/70 sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="rounded-2xl bg-cream-100 p-5 text-[15px] text-ink-500">
            지금은 신청할 수 있는 일정이 없어요. 다음 주 일정을 확인해 보세요.
          </p>
        ) : (
          <Carousel label="지금 산책 가능한 아이">
            {list.map((dog, i) => (
              <DogCard key={dog.id} dog={dog} priority={i < 3} />
            ))}
          </Carousel>
        )}
      </div>
      {ready && moreCount > 0 && (
        <div className="mt-8 text-center">
          <Link href={moreHref} className="btn-secondary btn-lg">
            <span className="tnum">
              {activeWhen === "today" ? "오늘" : "이번 주"} 가능한 {moreCount}마리
            </span>{" "}
            모두 보기 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}
    </section>
  );
}
