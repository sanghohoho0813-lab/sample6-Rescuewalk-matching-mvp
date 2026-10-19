import Link from "next/link";
import ShelterImage from "@/components/ShelterImage";
import { dogs } from "@/lib/data/dogs";
import { closedDaysLabel } from "@/lib/domain/schedule";
import type { Shelter } from "@/lib/types";

/** 보호소 카드 — 강아지 카드와 같은 결(테두리 없는 사진 + 텍스트). 산책 가능한 아이 수는 사진 위에. */
export default function ShelterCard({ shelter }: { shelter: Shelter }) {
  const shelterDogs = dogs.filter((d) => d.shelterId === shelter.id);
  const walkable = shelterDogs.filter((d) => d.availability === "available").length;

  return (
    <Link
      href={`/shelters/${shelter.id}`}
      className="group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 focus-visible:ring-offset-4 focus-visible:ring-offset-cream-50"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-cream-200">
        <ShelterImage
          shelter={shelter}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          zoomOnHover
        />
        <span className="tnum absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[13px] font-semibold text-sage-800 shadow-card">
          산책 가능 {walkable}마리
        </span>
      </div>
      <div className="px-1 pt-3">
        <h3 className="text-lg font-bold text-ink-900 group-hover:text-sage-700">{shelter.name}</h3>
        <p className="mt-0.5 text-sm text-ink-500">
          {shelter.address.split(" ").slice(0, 2).join(" ")} · {closedDaysLabel(shelter)} ·{" "}
          <span className="tnum">아이들 {shelterDogs.length}마리</span>
        </p>
        <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-ink-700">{shelter.intro}</p>
      </div>
    </Link>
  );
}
