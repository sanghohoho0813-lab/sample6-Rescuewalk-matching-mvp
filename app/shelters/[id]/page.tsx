import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPin, Phone } from "lucide-react";
import DogCard from "@/components/DogCard";
import ShelterImage from "@/components/ShelterImage";
import { dogs } from "@/lib/data/dogs";
import { getShelter, shelters } from "@/lib/data/shelters";

export function generateStaticParams() {
  return shelters.map((s) => ({ id: s.id }));
}

export default function ShelterDetailPage({ params }: { params: { id: string } }) {
  const shelter = getShelter(params.id);
  if (!shelter) notFound();
  const shelterDogs = dogs.filter((d) => d.shelterId === shelter.id);
  const walkable = shelterDogs.filter((d) => d.availability === "available").length;

  return (
    <div className="container-app py-6 md:py-10">
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-ink-400" aria-label="현재 위치">
        <Link href="/shelters" className="hover:text-tangerine-600">보호소 소개</Link>
        <span aria-hidden>›</span>
        <span className="font-semibold text-ink-700">{shelter.name}</span>
      </nav>

      {/* 보호소 히어로 (16:9 이미지 슬롯) */}
      <div className="relative aspect-video w-full overflow-hidden rounded-[24px] border-4 border-white shadow-card-hover sm:aspect-[21/9]">
        <ShelterImage
          shelter={shelter}
          sizes="(max-width: 1280px) 100vw, 1200px"
          priority
        />
        <span className="chip absolute left-4 top-4 bg-white/95 font-bold text-sage-700 shadow-card">
          {shelter.region}
        </span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
            {shelter.name}
          </h1>
          <p className="mt-2 text-[15px] font-medium text-sage-700">{shelter.intro}</p>
          <p className="mt-4 leading-relaxed text-ink-700">{shelter.description}</p>

          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="text-lg font-extrabold text-ink-900">
                이곳에서 지내는 아이들
                <span className="ml-2 text-sm font-medium text-ink-400">
                  {shelterDogs.length}마리 · 산책 가능 {walkable}마리
                </span>
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {shelterDogs.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          </section>
        </div>

        <aside>
          <div className="card sticky top-24 p-5">
            <h2 className="font-extrabold text-ink-900">방문 안내</h2>
            <ul className="mt-4 space-y-3.5 text-sm text-ink-700">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                <span className="leading-relaxed">{shelter.address}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                <span className="leading-relaxed">{shelter.hours}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
                <span className="leading-relaxed">{shelter.phone}</span>
              </li>
            </ul>
            <Link href="/guide" className="btn-secondary mt-5 w-full text-sm">
              봉사 가이드 보기
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
