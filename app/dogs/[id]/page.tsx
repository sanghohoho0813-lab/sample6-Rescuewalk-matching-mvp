import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  Baby,
  Cake,
  CheckCircle2,
  Clock,
  Dog as DogIcon,
  Footprints,
  Heart,
  MapPin,
  PawPrint,
  Phone,
  Ruler,
  Scale,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import EnergyMeter from "@/components/EnergyMeter";
import Tag, { PersonalityTags } from "@/components/Tag";
import DogCard from "@/components/DogCard";
import StickyApplyBar from "./StickyApplyBar";
import { dogs, getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { cn, formatTimeKo } from "@/lib/utils";

export function generateStaticParams() {
  return dogs.map((d) => ({ id: d.id }));
}

export default function DogDetailPage({ params }: { params: { id: string } }) {
  const dog = getDog(params.id);
  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);
  const unavailable = dog.availability === "unavailable";
  const friends = dogs
    .filter((d) => d.shelterId === dog.shelterId && d.id !== dog.id)
    .slice(0, 3);

  const basics = [
    { icon: Cake, label: "나이", value: `${dog.age}살` },
    { icon: DogIcon, label: "견종", value: dog.breed },
    { icon: Ruler, label: "크기", value: `${dog.size}견` },
    { icon: Scale, label: "체중", value: `${dog.weightKg}kg` },
    { icon: Heart, label: "성별", value: `${dog.gender}${dog.neutered ? " · 중성화" : ""}` },
    { icon: Footprints, label: "산책 난이도", value: dog.difficulty },
  ];

  const walkInfos: { icon: typeof Timer; label: string; value: string; caution?: boolean }[] = [
    { icon: Timer, label: "추천 산책 시간", value: dog.walkNote.recommendedDuration },
    { icon: AlertCircle, label: "주의사항", value: dog.walkNote.caution, caution: true },
    {
      icon: CheckCircle2,
      label: "리드줄 적응",
      value: dog.walkNote.leashTrained ? "리드줄에 잘 적응했어요" : "리드줄 훈련을 진행 중이에요",
    },
    { icon: Footprints, label: "산책 경험", value: dog.walkNote.walkExperience },
    { icon: Users, label: "다른 강아지와의 관계", value: dog.walkNote.dogFriendly },
    {
      icon: Baby,
      label: "아이 동반",
      value: dog.walkNote.kidFriendly ? "아이와 함께 걸어도 무난해요" : "성인 봉사자를 추천해요",
    },
  ];

  return (
    <>
      <div className="container-app py-6 md:py-10">
        {/* 브레드크럼 */}
        <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-ink-400" aria-label="현재 위치">
          <Link href="/dogs" className="hover:text-tangerine-600">강아지 찾기</Link>
          <span aria-hidden>›</span>
          <span className="font-semibold text-ink-700">{dog.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* 좌측 본문 */}
          <div className="min-w-0 animate-fade-up">
            {/* 히어로 이미지 (16:9 슬롯) */}
            <div className="relative overflow-hidden rounded-[24px] border-4 border-white shadow-card-hover">
              <DogImage dog={dog} aspect="aspect-video" />
              <div className="absolute left-4 top-4 flex gap-1.5">
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
              <FavoriteButton dogId={dog.id} dogName={dog.name} className="absolute right-4 top-4" />
            </div>

            {/* 기본 정보 */}
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
                  {dog.name}
                  <span className="ml-2 text-base font-medium text-ink-400">
                    {dog.breed} · {dog.age}살 · {dog.gender}
                  </span>
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                  <MapPin className="h-4 w-4 text-sage-500" />
                  {shelter?.name} · {shelter?.region} · {dog.distanceKm}km
                </p>
              </div>
              <EnergyMeter level={dog.energy} showLabel className="mt-1" />
            </div>

            <PersonalityTags tags={dog.personality} className="mt-4" />
            {dog.walkNote.beginnerFriendly && (
              <Tag tone="sage" className="mt-2">🌱 초보 봉사자도 괜찮아요</Tag>
            )}

            {/* 기본 스펙 그리드 */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {basics.map(({ icon: Icon, label, value }) => (
                <div key={label} className="card flex items-center gap-3 p-3.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-200 text-sage-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <p className="text-[11px] text-ink-400">{label}</p>
                    <p className="truncate text-sm font-bold text-ink-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 스토리 */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-extrabold text-ink-900">
                {dog.name}의 이야기
              </h2>
              <div className="card border-l-4 border-l-tangerine-400 p-5">
                <p className="leading-relaxed text-ink-700">{dog.story}</p>
              </div>
            </section>

            {/* 산책 정보 */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-extrabold text-ink-900">산책 정보</h2>
              <ul className="card divide-y divide-cream-200 p-1">
                {walkInfos.map(({ icon: Icon, label, value, caution }) => (
                  <li key={label} className="flex items-start gap-3 p-4">
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                        caution ? "bg-tangerine-100 text-tangerine-600" : "bg-sage-100 text-sage-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink-400">{label}</p>
                      <p className="mt-0.5 text-[15px] leading-relaxed text-ink-900">{value}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* 보호소 정보 */}
            {shelter && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-extrabold text-ink-900">보호소 정보</h2>
                <div className="card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-ink-900">{shelter.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-500">{shelter.intro}</p>
                    </div>
                    <Link
                      href={`/shelters/${shelter.id}`}
                      className="btn-secondary shrink-0 !min-h-[38px] px-4 text-[13px]"
                    >
                      상세 보기
                    </Link>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-ink-500">
                    <li className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-sage-500" /> {shelter.address}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-sage-500" /> {shelter.hours}
                    </li>
                    <li className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-sage-500" /> {shelter.phone}
                    </li>
                  </ul>
                </div>
              </section>
            )}

            {/* 같은 보호소 친구들 */}
            {friends.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 text-lg font-extrabold text-ink-900">
                  {shelter?.name}의 다른 친구들
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {friends.map((f) => (
                    <DogCard key={f.id} dog={f} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* 우측 신청 요약 카드 (PC) */}
          <aside className="hidden lg:block">
            <div className="card sticky top-24 p-6">
              <p className="section-label">
                <PawPrint className="h-4 w-4" /> 산책 신청
              </p>
              <h2 className="text-lg font-extrabold text-ink-900">
                {dog.name}와 함께 걸어볼까요?
              </h2>
              <div className="mt-4 space-y-3 rounded-2xl bg-cream-100 p-4 text-sm">
                <p className="flex items-center justify-between">
                  <span className="text-ink-400">산책 난이도</span>
                  <span className="font-bold text-ink-900">{dog.difficulty}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-ink-400">추천 시간</span>
                  <span className="font-bold text-ink-900">{dog.walkNote.recommendedDuration}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-ink-400">초보 가능</span>
                  <span className="font-bold text-ink-900">
                    {dog.walkNote.beginnerFriendly ? "가능해요" : "경험자 추천"}
                  </span>
                </p>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-[13px] font-semibold text-ink-400">가능 시간대</p>
                <div className="flex flex-wrap gap-1.5">
                  {dog.availableTimes.length > 0 ? (
                    dog.availableTimes.map((t) => (
                      <Tag key={t} tone="cream">{formatTimeKo(t)}</Tag>
                    ))
                  ) : (
                    <p className="text-sm text-ink-400">지금은 예약 가능한 시간이 없어요.</p>
                  )}
                </div>
              </div>
              {unavailable ? (
                <p className="mt-5 rounded-2xl bg-cream-200 p-4 text-center text-sm font-medium text-ink-500">
                  {dog.name}는 지금 잠시 쉬는 중이에요. 곧 다시 만나요!
                </p>
              ) : (
                <Link href={`/dogs/${dog.id}/apply`} className="btn-primary mt-5 w-full">
                  산책 신청하기
                </Link>
              )}
              <p className="mt-3 text-center text-xs text-ink-400">
                신청 후 보호소 확인을 거쳐 확정돼요.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* 모바일 Sticky CTA */}
      <StickyApplyBar dog={dog} />
    </>
  );
}
