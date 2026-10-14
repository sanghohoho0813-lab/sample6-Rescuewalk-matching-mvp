import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import DogCard from "@/components/DogCard";
import ShelterImage from "@/components/ShelterImage";
import ShelterWeek, { ShelterOpenNow } from "@/components/ShelterWeek";
import VisitInfo from "@/components/VisitInfo";
import { dogs } from "@/lib/data/dogs";
import { getShelter, shelters } from "@/lib/data/shelters";
import { closedDaysLabel } from "@/lib/domain/schedule";

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

      <div className="relative mt-2 aspect-[16/9] w-full overflow-hidden rounded-[24px] sm:aspect-[21/8]">
        <ShelterImage shelter={shelter} sizes="(max-width: 1280px) 100vw, 1200px" priority />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-sage-700">{shelter.region}</p>
            <ShelterOpenNow shelter={shelter} />
          </div>
          <h1 className="page-title mt-1">{shelter.name}</h1>
          <p className="mt-2 text-[17px] text-ink-700">{shelter.intro}</p>
          <p className="mt-1.5 text-[15px] text-ink-500">
            <span className="tnum">{shelter.hours}</span> · {closedDaysLabel(shelter)}
          </p>
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
