import Link from "next/link";
import { MapPin } from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import NextWalk from "@/components/NextWalk";
import { getShelter } from "@/lib/data/shelters";
import { EXPERIENCE, PEOPLE, TONE_TEXT } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

/**
 * 강아지 카드 — 사진만 보고 고르지 않도록, 매칭에 필요한 판단 정보를 한눈에.
 *  - 한 줄 성격(headline): 태그 나열 대신
 *  - 핵심 세 가지: 산책 난이도 · 사람 친화 · 필요한 경험
 *  - 다음 가능한 일정 · 보호소 위치
 * 카드 전체가 상세로 가는 하나의 링크입니다(신청은 상세의 단일 행동으로).
 *
 * rowOnMobile: 목록 화면의 모바일에서 사진을 왼쪽에 둔 가로형 — 한 화면에 3~4마리를 비교할 수 있게
 */
export default function DogCard({
  dog,
  className,
  priority = false,
  rowOnMobile = false,
}: {
  dog: Dog;
  className?: string;
  priority?: boolean;
  rowOnMobile?: boolean;
}) {
  const shelter = getShelter(dog.shelterId);
  const resting = dog.availability === "unavailable";
  const specs = [
    {
      label: "산책",
      value: dog.difficulty,
      tone: dog.difficulty === "어려움" ? "care" : dog.difficulty === "쉬움" ? "good" : "neutral",
    },
    { label: "사람", value: PEOPLE[dog.match.people].short, tone: PEOPLE[dog.match.people].tone },
    {
      label: "경험",
      value: EXPERIENCE[dog.match.experience].short,
      tone: EXPERIENCE[dog.match.experience].tone,
    },
  ] as const;

  return (
    <article className={cn("group relative", rowOnMobile && "flex gap-4 sm:block", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-[20px] bg-cream-200",
          rowOnMobile && "w-[116px] self-start rounded-2xl sm:w-auto sm:rounded-[20px]"
        )}
      >
        <DogImage
          dog={dog}
          priority={priority}
          aspect={rowOnMobile ? "aspect-[4/5] sm:aspect-[4/3]" : "aspect-[4/3]"}
          className={cn(
            "[&_img]:transition-transform [&_img]:duration-300 group-hover:[&_img]:scale-[1.03] motion-reduce:[&_img]:transition-none",
            resting && "opacity-70 grayscale-[35%]"
          )}
          sizes={
            rowOnMobile
              ? "(max-width: 640px) 116px, (max-width: 1280px) 45vw, 380px"
              : "(max-width: 640px) 80vw, (max-width: 1280px) 45vw, 380px"
          }
        />
        <NextWalk
          dog={dog}
          variant="badge"
          className={cn("absolute left-3 top-3", rowOnMobile && "hidden sm:inline-flex")}
        />
        <FavoriteButton
          dogId={dog.id}
          dogName={dog.name}
          className={cn(
            "absolute right-3 top-3 z-[2]",
            rowOnMobile && "right-1.5 top-1.5 h-9 w-9 sm:right-3 sm:top-3 sm:h-10 sm:w-10"
          )}
        />
      </div>

      <div className={cn("min-w-0 px-1 pt-3", rowOnMobile && "flex-1 px-0 pt-0.5 sm:px-1 sm:pt-3")}>
        <h3 className="flex items-baseline gap-1.5">
          <Link
            href={`/dogs/${dog.id}`}
            className="text-lg font-bold text-ink-900 after:absolute after:inset-0 after:z-[1] focus-visible:outline-none"
          >
            {dog.name}
          </Link>
          <span className="truncate text-sm font-normal text-ink-500">
            {dog.age}살 · {dog.gender} · {dog.size} <span className="tnum">{dog.weightKg}kg</span>
          </span>
        </h3>
        <p
          className={cn(
            "mt-0.5 truncate text-[15px] text-ink-700",
            rowOnMobile && "line-clamp-2 whitespace-normal sm:line-clamp-1"
          )}
        >
          {dog.headline}
        </p>

        <dl
          className={cn(
            "mt-3 grid grid-cols-3 divide-x divide-cream-200 rounded-xl bg-cream-100/70 py-2",
            rowOnMobile && "mt-2 py-1.5"
          )}
        >
          {specs.map((s) => (
            <div key={s.label} className="flex flex-col-reverse items-center px-1 text-center">
              <dt className="text-[13px] text-ink-500">{s.label}</dt>
              <dd className={cn("whitespace-nowrap text-sm font-semibold", TONE_TEXT[s.tone])}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <NextWalk dog={dog} variant="line" className={cn("mt-2.5", rowOnMobile && "mt-2")} />
        <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin className="h-4 w-4 shrink-0 text-ink-400" aria-hidden />
          <span className="truncate">
            {shelter?.name} · {shelter?.address.split(" ").slice(0, 2).join(" ")}{" "}
            <span className="tnum">{dog.distanceKm}km</span>
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
