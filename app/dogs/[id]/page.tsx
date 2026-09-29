import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import EnergyMeter from "@/components/EnergyMeter";
import { PersonalityTags } from "@/components/Tag";
import DogCard from "@/components/DogCard";
import StickyApplyBar from "./StickyApplyBar";
import { dogs, getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { formatTimeKo } from "@/lib/utils";

export function generateStaticParams() {
  return dogs.map((d) => ({ id: d.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const dog = getDog(params.id);
  return dog ? { title: `${dog.name} · ${dog.breed}`, description: dog.story } : {};
}

export default function DogDetailPage({ params }: { params: { id: string } }) {
  const dog = getDog(params.id);
  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);
  const unavailable = dog.availability === "unavailable";
  const friends = dogs.filter((d) => d.shelterId === dog.shelterId && d.id !== dog.id).slice(0, 3);

  const walkInfo = [
    { label: "추천 산책 시간", value: dog.walkNote.recommendedDuration },
    {
      label: "리드줄",
      value: dog.walkNote.leashTrained ? "리드줄에 잘 적응했어요" : "리드줄 훈련을 진행 중이에요",
    },
    { label: "산책 경험", value: dog.walkNote.walkExperience },
    { label: "다른 강아지", value: dog.walkNote.dogFriendly },
    {
      label: "아이 동반",
      value: dog.walkNote.kidFriendly ? "아이와 함께 걸어도 무난해요" : "성인 봉사자를 추천해요",
    },
  ];

  const applyPanel = (
    <>
      <p className="text-sm font-semibold text-ink-500">가능한 시간</p>
      {dog.availableTimes.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {dog.availableTimes.map((t) => (
            <li key={t} className="tnum rounded-lg bg-cream-100 px-2.5 py-1 text-sm text-ink-700">
              {formatTimeKo(t)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-[15px] text-ink-500">지금은 신청 가능한 시간이 없어요.</p>
      )}
      {unavailable ? (
        <p className="mt-5 rounded-2xl bg-cream-100 p-4 text-center text-[15px] text-ink-500">
          {dog.name}는 지금 잠시 쉬는 중이에요.
        </p>
      ) : (
        <Link href={`/dogs/${dog.id}/apply`} className="btn-primary btn-lg mt-5 w-full">
          산책 신청하기
        </Link>
      )}
      <p className="mt-3 text-center text-[13px] text-ink-400">보호소가 확인한 뒤 확정돼요.</p>
    </>
  );

  return (
    <>
      <div className="container-app pb-28 pt-4 md:pt-8 lg:pb-10">
        <Link
          href="/dogs"
          className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" /> 강아지 찾기
        </Link>

        <div className="mt-2 grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-12">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[24px]">
              <DogImage
                dog={dog}
                aspect="aspect-[4/3] sm:aspect-[16/10]"
                objectPosition="50% 34%"
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
                className={unavailable ? "grayscale-[35%]" : undefined}
              />
              {(unavailable || dog.availableToday) && (
                <span
                  className={
                    unavailable
                      ? "chip absolute left-4 top-4 bg-ink-900/75 font-semibold text-white"
                      : "chip absolute left-4 top-4 bg-white/95 font-semibold text-sage-800 shadow-card"
                  }
                >
                  {unavailable ? "잠시 쉬는 중" : "오늘 산책 가능"}
                </span>
              )}
              <FavoriteButton dogId={dog.id} dogName={dog.name} className="absolute right-4 top-4" />
            </div>

            {/* 이름과 기본 정보 */}
            <div className="mt-6">
              <h1 className="text-[28px] font-bold tracking-tight text-ink-900 sm:text-[32px]">{dog.name}</h1>
              <p className="mt-1 text-[15px] text-ink-500">
                {dog.breed} · {dog.age}살 · {dog.gender}
                {dog.neutered ? "(중성화)" : ""} · <span className="tnum">{dog.weightKg}kg</span>
              </p>
              <p className="mt-1 text-[15px] text-ink-500">
                {shelter?.name} · {shelter?.region} <span className="tnum">{dog.distanceKm}km</span>
              </p>
              <PersonalityTags tags={dog.personality} className="mt-4" />
            </div>

            {/* 봉사자 판단에 필요한 핵심 3가지 */}
            <dl className="mt-6 grid grid-cols-3 divide-x divide-cream-300 border-y border-cream-300 py-4 text-center">
              <div className="flex flex-col-reverse gap-1 px-2">
                <dt className="text-[13px] text-ink-400">산책 난이도</dt>
                <dd className="text-[17px] font-bold text-ink-900">{dog.difficulty}</dd>
              </div>
              <div className="flex flex-col-reverse gap-1 px-2">
                <dt className="text-[13px] text-ink-400">에너지</dt>
                <dd className="flex h-[25.5px] items-center justify-center">
                  <EnergyMeter level={dog.energy} />
                </dd>
              </div>
              <div className="flex flex-col-reverse gap-1 px-2">
                <dt className="text-[13px] text-ink-400">초보 봉사자</dt>
                <dd className="text-[17px] font-bold text-ink-900">
                  {dog.walkNote.beginnerFriendly ? "괜찮아요" : "경험자 추천"}
                </dd>
              </div>
            </dl>

            <section className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">{dog.name}의 이야기</h2>
              <p className="mt-3 text-[17px] leading-[1.75] text-ink-700">{dog.story}</p>
            </section>

            <section className="mt-10">
              <h2 className="text-lg font-bold text-ink-900">산책 전에 알아두세요</h2>
              <p className="mt-3 flex gap-2.5 rounded-2xl bg-tangerine-50 p-4 text-[15px] leading-relaxed text-ink-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tangerine-600" aria-hidden />
                {dog.walkNote.caution}
              </p>
              <dl className="mt-2 divide-y divide-cream-200">
                {walkInfo.map(({ label, value }) => (
                  <div key={label} className="flex gap-4 py-3.5 text-[15px]">
                    <dt className="w-28 shrink-0 text-ink-400">{label}</dt>
                    <dd className="leading-relaxed text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {shelter && (
              <section className="mt-10">
                <h2 className="text-lg font-bold text-ink-900">보호소</h2>
                <Link
                  href={`/shelters/${shelter.id}`}
                  className="mt-3 flex items-center gap-4 border-y border-cream-200 py-4 hover:bg-cream-100/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-ink-900">{shelter.name}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">{shelter.address}</span>
                    <span className="mt-0.5 block text-sm text-ink-500">{shelter.hours}</span>
                  </span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-ink-300" aria-hidden />
                </Link>
              </section>
            )}

            {friends.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-bold text-ink-900">{shelter?.name}의 다른 친구들</h2>
                <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                  {friends.map((f) => (
                    <DogCard key={f.id} dog={f} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* PC: 신청 요약 */}
          <aside className="hidden lg:block">
            <div className="card sticky top-24 p-6">
              <p className="text-lg font-bold text-ink-900">{dog.name}와 산책하기</p>
              <p className="mt-1 text-sm text-ink-500">추천 산책 시간 {dog.walkNote.recommendedDuration}</p>
              <div className="mt-5 border-t border-cream-200 pt-5">{applyPanel}</div>
            </div>
          </aside>
        </div>
      </div>

      <StickyApplyBar dog={dog} />
    </>
  );
}
