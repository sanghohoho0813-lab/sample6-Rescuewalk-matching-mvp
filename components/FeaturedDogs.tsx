"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import DogCard from "@/components/DogCard";
import { dogs } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { SEED_INTEREST_REGIONS } from "@/lib/data/seed";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * 홈의 "오늘 산책 가능한 아이들".
 * 마이페이지에서 저장한 관심 지역의 아이들을 먼저 보여줍니다(실제 저장값 기반).
 * 저장값을 읽기 전(서버 렌더)에는 처음 방문자의 기본값으로 그려서,
 * 읽은 뒤 카드 순서가 뒤바뀌며 깜빡이는 일을 줄입니다.
 */
export default function FeaturedDogs() {
  const { interestRegions, hydrated } = useStore();
  const regions = hydrated ? interestRegions : SEED_INTEREST_REGIONS;

  const inRegion = (id: string) => regions.includes(getShelter(id)?.region ?? "");
  const list = dogs
    .filter((d) => d.availability === "available" && d.availableToday)
    .sort(
      (a, b) =>
        Number(inRegion(b.shelterId)) - Number(inRegion(a.shelterId)) ||
        Number(b.recommended) - Number(a.recommended) ||
        a.distanceKm - b.distanceKm
    )
    .slice(0, 6);
  const total = dogs.filter((d) => d.availability === "available" && d.availableToday).length;

  return (
    <section className="container-app py-14 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="section-title">오늘 산책 가능한 아이들</h2>
          <p className="mt-1.5 text-[15px] text-ink-500">
            {regions.length > 0
              ? `관심 지역(${regions.join(", ")}) 아이들을 먼저 보여드려요.`
              : "오늘 바로 만날 수 있는 아이들이에요."}
          </p>
        </div>
        <Link
          href="/dogs"
          className="hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ink-700 hover:text-ink-900 sm:flex"
        >
          전체 보기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((dog, i) => (
          <DogCard key={dog.id} dog={dog} priority={i < 3} className={cn(i >= 4 && "hidden sm:block")} />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/dogs?today=1" className="btn-secondary btn-lg">
          <span className="tnum">오늘 가능한 {total}마리</span> 모두 보기
        </Link>
      </div>
    </section>
  );
}
