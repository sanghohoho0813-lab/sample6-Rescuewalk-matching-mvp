import Link from "next/link";
import { Dog as DogIcon, MapPin, PawPrint } from "lucide-react";
import { dogs } from "@/lib/data/dogs";
import type { Shelter } from "@/lib/types";

export default function ShelterCard({ shelter }: { shelter: Shelter }) {
  const shelterDogs = dogs.filter((d) => d.shelterId === shelter.id);
  const walkable = shelterDogs.filter((d) => d.availability === "available").length;

  return (
    <Link
      href={`/shelters/${shelter.id}`}
      className="card card-hover group flex flex-col overflow-hidden"
    >
      {/* 보호소 썸네일 슬롯 (16:9) — /public/images/shelters/ 이미지로 교체 가능 */}
      <div className="relative aspect-video w-full overflow-hidden">
        {shelter.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/images/shelters/${shelter.image}`}
            alt={`${shelter.name} 사진`}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${shelter.themeColor}22, ${shelter.themeColor}55)`,
            }}
          >
            <span
              className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 shadow-card"
              style={{ color: shelter.themeColor }}
            >
              <PawPrint className="h-8 w-8" />
            </span>
          </div>
        )}
        <span className="chip absolute left-3 top-3 bg-white/95 font-bold text-sage-700 shadow-card">
          {shelter.region}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-extrabold text-ink-900 transition-colors group-hover:text-tangerine-600">
          {shelter.name}
        </h3>
        <p className="text-sm leading-relaxed text-ink-500">{shelter.intro}</p>
        <div className="mt-auto flex items-center justify-between pt-2 text-[13px] text-ink-500">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-sage-500" />
            {shelter.address.split(" ").slice(0, 2).join(" ")}
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-sage-700">
            <DogIcon className="h-4 w-4" />
            {shelterDogs.length}마리 · 산책 가능 {walkable}
          </span>
        </div>
      </div>
    </Link>
  );
}
