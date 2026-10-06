import Link from "next/link";
import { MapPin } from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import { PersonalityTags } from "@/components/Tag";
import { getShelter } from "@/lib/data/shelters";
import { cn, energyLabel } from "@/lib/utils";
import type { Dog } from "@/lib/types";

/**
 * 강아지 카드.
 * 카드 전체가 상세로 가는 하나의 링크입니다. 목록에 같은 크기의 신청 버튼을 여러 개 두면
 * 서로 경쟁하므로, 신청은 상세 화면의 단일 주요 행동으로 모았습니다.
 */
export default function DogCard({
  dog,
  className,
  priority = false,
}: {
  dog: Dog;
  className?: string;
  priority?: boolean;
}) {
  const shelter = getShelter(dog.shelterId);
  const unavailable = dog.availability === "unavailable";
  const today = dog.availableToday && dog.availability === "available";

  return (
    <article className={cn("group relative", className)}>
      <div className="relative overflow-hidden rounded-[20px] bg-cream-200">
        <DogImage
          dog={dog}
          priority={priority}
          className={cn(
            "[&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none",
            unavailable && "opacity-70 grayscale-[35%]"
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 380px"
        />
        {(today || unavailable) && (
          <span
            className={cn(
              "chip absolute left-3 top-3 font-semibold",
              unavailable ? "bg-ink-900/75 text-white" : "bg-white/95 text-sage-800 shadow-card"
            )}
          >
            {unavailable ? "잠시 쉬는 중" : "오늘 산책 가능"}
          </span>
        )}
        <FavoriteButton dogId={dog.id} dogName={dog.name} className="absolute right-3 top-3 z-[2]" />
      </div>

      <div className="px-1 pt-3">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-lg font-bold text-ink-900">
            <Link href={`/dogs/${dog.id}`} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none">
              {dog.name}
            </Link>
            <span className="ml-1.5 text-sm font-normal text-ink-400">
              {dog.age}살 · {dog.gender}
            </span>
          </h3>
          <span className="shrink-0 text-[13px] text-ink-400">
            에너지 <span className="font-semibold text-ink-700">{energyLabel(dog.energy)}</span>
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-ink-500">
          {dog.breed} · {dog.size}견 · 산책 {dog.difficulty}
        </p>
        <PersonalityTags tags={dog.personality} max={2} className="mt-2.5" />
        <p className="mt-2.5 flex items-center gap-1 text-[13px] text-ink-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {shelter?.name} · {shelter?.region} <span className="tnum">{dog.distanceKm}km</span>
          </span>
        </p>
      </div>
      {/* 키보드 포커스가 카드 전체 링크에 있을 때 보이는 테두리 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 ring-2 ring-sage-400 ring-offset-4 ring-offset-cream-50 group-has-[a:focus-visible]:opacity-100"
      />
    </article>
  );
}
