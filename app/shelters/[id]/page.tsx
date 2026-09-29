import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DogCard from "@/components/DogCard";
import ShelterImage from "@/components/ShelterImage";
import { dogs } from "@/lib/data/dogs";
import { getShelter, shelters } from "@/lib/data/shelters";

export function generateStaticParams() {
  return shelters.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const shelter = getShelter(params.id);
  return shelter ? { title: shelter.name, description: shelter.intro } : {};
}

export default function ShelterDetailPage({ params }: { params: { id: string } }) {
  const shelter = getShelter(params.id);
  if (!shelter) notFound();
  const shelterDogs = dogs.filter((d) => d.shelterId === shelter.id);
  const walkable = shelterDogs.filter((d) => d.availability === "available").length;

  const visit = [
    { label: "주소", value: shelter.address },
    { label: "운영 시간", value: shelter.hours },
    { label: "전화", value: shelter.phone },
  ];

  return (
    <div className="container-app pb-10 pt-4 md:pt-8">
      <Link
        href="/shelters"
        className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" /> 보호소
      </Link>

      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-[24px] sm:aspect-[21/9]">
        <ShelterImage shelter={shelter} sizes="(max-width: 1280px) 100vw, 1200px" priority />
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-12">
        <div className="min-w-0">
          <p className="section-label">{shelter.region}</p>
          <h1 className="page-title">{shelter.name}</h1>
          <p className="mt-3 text-[17px] leading-[1.75] text-ink-700">{shelter.description}</p>

          {/* 모바일: 방문 정보를 소개 바로 아래에 */}
          <dl className="mt-6 divide-y divide-cream-200 border-y border-cream-200 lg:hidden">
            {visit.map((v) => (
              <div key={v.label} className="flex gap-4 py-3 text-[15px]">
                <dt className="w-20 shrink-0 text-ink-400">{v.label}</dt>
                <dd className="text-ink-900">{v.value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-12">
            <h2 className="text-lg font-bold text-ink-900">
              이곳의 아이들{" "}
              <span className="tnum ml-1 text-[15px] font-normal text-ink-400">
                {shelterDogs.length}마리 · 산책 가능 {walkable}마리
              </span>
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {shelterDogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <h2 className="text-base font-bold text-ink-900">방문 안내</h2>
            <dl className="mt-3 divide-y divide-cream-200 border-y border-cream-200">
              {visit.map((v) => (
                <div key={v.label} className="py-3 text-[15px]">
                  <dt className="text-[13px] text-ink-400">{v.label}</dt>
                  <dd className="mt-0.5 text-ink-900">{v.value}</dd>
                </div>
              ))}
            </dl>
            <Link href="/guide" className="btn-secondary mt-5 w-full">
              처음이라면 봉사 가이드
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
