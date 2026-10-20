import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Dog, MapPin, Phone } from "lucide-react";
import DogCard from "@/components/DogCard";
import QuickAction from "@/components/QuickAction";
import ShelterImage from "@/components/ShelterImage";
import ShelterWeek, { ShelterOpenNow } from "@/components/ShelterWeek";
import VisitInfo from "@/components/VisitInfo";
import { dogs } from "@/lib/data/dogs";
import { getShelter, shelters } from "@/lib/data/shelters";
import { closedDaysLabel } from "@/lib/domain/schedule";
import { mapLink, telLink } from "@/lib/visitGuide";

export function generateStaticParams() {
  return shelters.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const shelter = getShelter(params.id);
  return shelter ? { title: shelter.name, description: shelter.intro } : {};
}

/**
 * 보호소 상세 — 소개 페이지가 아니라 '가서 산책할 수 있는 곳'의 운영 정보:
 * 지금 운영 여부, 이번 주 산책 일정, 산책을 기다리는 아이, 찾아가는 방법.
 */
export default function ShelterDetailPage({ params }: { params: { id: string } }) {
  const shelter = getShelter(params.id);
  if (!shelter) notFound();
  // 지금 신청할 수 있는 아이 → 초보 가능 → 그 외, 쉬는 아이는 맨 뒤
  const residents = dogs
    .filter((d) => d.shelterId === shelter.id)
    .sort(
      (a, b) =>
        Number(a.availability === "unavailable") - Number(b.availability === "unavailable") ||
        Number(b.match.experience === "beginner") - Number(a.match.experience === "beginner")
    );
  const walkable = residents.filter((d) => d.availability === "available").length;

  return (
    <div className="container-app pb-10 pt-4 md:pt-8">
      <Link
        href="/shelters"
        className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 보호소
      </Link>

      {/* 사진 위에 이름과 지금 운영 여부 — 상용 앱의 매장 상세처럼 '어디인지'를 한 장면으로 */}
      <div className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-[28px] bg-cream-200 sm:aspect-[21/9]">
        <ShelterImage shelter={shelter} sizes="(max-width: 1280px) 100vw, 1200px" priority />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#1c170f]/85 via-[#1c170f]/25 via-50% to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip bg-white/15 font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
              {shelter.region}
            </span>
            <ShelterOpenNow shelter={shelter} />
          </div>
          <h1 className="mt-2.5 text-[28px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[36px]">
            {shelter.name}
          </h1>
          <p className="mt-1 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-[17px]">
            {shelter.intro}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0">
          <dl className="grid grid-cols-3 divide-x divide-cream-200 rounded-2xl bg-white py-3.5 ring-1 ring-cream-300/70">
            {[
              { label: "운영 시간", value: shelter.hours.replace(/\s/g, "") },
              { label: "쉬는 날", value: closedDaysLabel(shelter) },
              { label: "산책 가능", value: `${walkable}마리` },
            ].map((g) => (
              <div key={g.label} className="flex flex-col-reverse items-center gap-0.5 px-2 text-center">
                <dt className="text-[13px] text-ink-500">{g.label}</dt>
                <dd className="tnum text-[15px] font-bold text-ink-900">{g.value}</dd>
              </div>
            ))}
          </dl>
          <nav aria-label="보호소 바로가기" className="mt-3 grid grid-cols-3 gap-2.5">
            <QuickAction icon={MapPin} label="길찾기" href={mapLink(shelter)} />
            <QuickAction icon={Phone} label="전화하기" href={telLink(shelter.phone)} />
            <QuickAction
              icon={Dog}
              label="아이들 보기"
              href={`/dogs?region=${encodeURIComponent(shelter.region)}&shelter=${shelter.id}`}
            />
          </nav>
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="보호소 특징">
            {shelter.features.map((f) => (
              <li key={f} className="chip bg-sage-50 text-sage-800 ring-1 ring-sage-100">
                {f}
              </li>
            ))}
          </ul>

          <section className="mt-10" aria-labelledby="week-title">
            <h2 id="week-title" className="text-lg font-bold text-ink-900">
              이번 주 산책 일정
            </h2>
            <p className="mt-1 text-sm text-ink-500">날마다 산책을 신청할 수 있는 아이 수예요.</p>
            <div className="mt-4">
              <ShelterWeek shelter={shelter} />
            </div>
          </section>

          <section className="mt-10" aria-labelledby="dogs-title">
            <div className="flex items-end justify-between gap-4">
              <h2 id="dogs-title" className="text-lg font-bold text-ink-900">
                산책을 기다리는 아이{" "}
                <span className="tnum ml-1 text-[15px] font-normal text-ink-500">{walkable}마리</span>
              </h2>
              <Link
                href={`/dogs?region=${encodeURIComponent(shelter.region)}&shelter=${shelter.id}`}
                className="inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold text-ink-700 hover:text-ink-900"
              >
                조건으로 찾기 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-5 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-3">
              {residents.map((dog) => (
                <li key={dog.id}>
                  <DogCard dog={dog} rowOnMobile />
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="about-title">
            <h2 id="about-title" className="text-lg font-bold text-ink-900">
              보호소 이야기
            </h2>
            <p className="mt-3 text-[17px] leading-[1.75] text-ink-700">{shelter.description}</p>
          </section>
        </div>

        <aside aria-labelledby="visit-title" className="lg:block">
          <div className="lg:sticky lg:top-24">
            <h2 id="visit-title" className="text-lg font-bold text-ink-900">
              방문 안내
            </h2>
            <VisitInfo
              shelter={shelter}
              className="mt-3"
              fields={["address", "hours", "meetingPoint", "transit", "parking", "course", "phone"]}
            />
            <p className="mt-3 rounded-2xl bg-sage-50 px-4 py-3 text-[15px] leading-relaxed text-ink-700">
              <strong className="font-semibold text-ink-900">처음 오시나요?</strong>{" "}
              {shelter.visit.firstVisit}
            </p>
            <Link href="/guide" className="btn-secondary mt-4 w-full">
              봉사 가이드 보기
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
