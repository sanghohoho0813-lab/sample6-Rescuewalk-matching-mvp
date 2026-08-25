"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Sparkles } from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import Tag, { PersonalityTags } from "@/components/Tag";
import EnergyMeter from "@/components/EnergyMeter";
import { getShelter } from "@/lib/data/shelters";
import { cn, formatTimeKo } from "@/lib/utils";
import type { Dog } from "@/lib/types";

const DIFFICULTY_TONE: Record<Dog["difficulty"], string> = {
  쉬움: "bg-sage-100 text-sage-700",
  보통: "bg-cream-200 text-ink-700",
  어려움: "bg-tangerine-100 text-tangerine-700",
};

export default function DogCard({ dog, className }: { dog: Dog; className?: string }) {
  const router = useRouter();
  const shelter = getShelter(dog.shelterId);
  const unavailable = dog.availability === "unavailable";

  return (
    <article className={cn("card card-hover group relative flex flex-col overflow-hidden", className)}>
      <Link
        href={`/dogs/${dog.id}`}
        className="absolute inset-0 z-[1]"
        aria-label={`${dog.name} 상세 보기`}
      />

      <div className="relative">
        <DogImage dog={dog} className="transition-transform duration-300 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3 z-[2] flex gap-1.5">
          {dog.recommended && (
            <span className="chip bg-tangerine-500 font-bold text-white shadow-cta">
              <Sparkles className="h-3 w-3" /> 추천
            </span>
          )}
          {dog.availableToday && !unavailable && (
            <span className="chip bg-white/95 font-bold text-sage-700 shadow-card">
              오늘 산책 가능
            </span>
          )}
          {unavailable && (
            <span className="chip bg-ink-900/70 font-bold text-white">잠시 쉬는 중</span>
          )}
        </div>
        <FavoriteButton
          dogId={dog.id}
          dogName={dog.name}
          className="absolute right-3 top-3 z-[2]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-extrabold text-ink-900">
            {dog.name}
            <span className="ml-1.5 text-sm font-medium text-ink-400">
              {dog.age}살 · {dog.gender}
            </span>
          </h3>
          <span className={cn("chip", DIFFICULTY_TONE[dog.difficulty])}>
            산책 {dog.difficulty}
          </span>
        </div>

        <p className="text-sm text-ink-500">{dog.breed} · {dog.size}견</p>

        <PersonalityTags tags={dog.personality} max={3} />

        <div className="mt-auto space-y-1.5 pt-1 text-[13px] text-ink-500">
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-sage-500" />
            {shelter?.name} · {shelter?.region} {dog.distanceKm}km
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-sage-500" />
              {dog.availableTimes.length > 0
                ? `${formatTimeKo(dog.availableTimes[0])} 부터 ${dog.availableTimes.length}개 시간`
                : "예약 가능한 시간 없음"}
            </p>
            <EnergyMeter level={dog.energy} />
          </div>
        </div>

        <button
          type="button"
          disabled={unavailable}
          onClick={(e) => {
            e.preventDefault();
            router.push(`/dogs/${dog.id}/apply`);
          }}
          className="btn-primary relative z-[2] mt-2 w-full text-sm"
        >
          {unavailable ? "지금은 쉬고 있어요" : "산책 신청하기"}
        </button>
      </div>
    </article>
  );
}
