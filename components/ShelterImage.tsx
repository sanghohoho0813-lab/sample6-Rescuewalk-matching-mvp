import Image from "next/image";
import { PawPrint } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import { dogs } from "@/lib/data/dogs";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/lib/types";

/**
 * 보호소 이미지 슬롯.
 * - shelter.image 가 있으면 /public/images/shelters/{image} 사진을 사용
 * - 아직 사진이 없는 보호소는 소속 아이들의 얼굴로 채워 빈 자리처럼 보이지 않게 함
 */
export default function ShelterImage({
  shelter,
  className,
  sizes,
  priority = false,
  zoomOnHover = false,
}: {
  shelter: Shelter;
  className?: string;
  sizes: string;
  priority?: boolean;
  zoomOnHover?: boolean;
}) {
  if (shelter.image) {
    return (
      <Image
        src={`/images/shelters/${shelter.image}`}
        alt={`${shelter.name} 사진`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          zoomOnHover && "transition-transform duration-300 group-hover:scale-[1.04]",
          className
        )}
      />
    );
  }

  const residents = dogs.filter((d) => d.shelterId === shelter.id).slice(0, 3);

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${shelter.themeColor}22, ${shelter.themeColor}4d)`,
      }}
    >
      {residents.length > 0 ? (
        <>
          <div className="grid flex-1 grid-cols-3 gap-1 p-1">
            {residents.map((dog) => (
              <div key={dog.id} className="relative overflow-hidden rounded-lg">
                <DogFace dog={dog} sizes="160px" />
              </div>
            ))}
          </div>
          <p className="flex items-center justify-center gap-1.5 pb-2 text-[11px] font-semibold text-ink-500">
            <PawPrint className="h-3 w-3" />
            보호소 사진 준비 중 · 이곳의 아이들이에요
          </p>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white/85 shadow-card"
            style={{ color: shelter.themeColor }}
          >
            <PawPrint className="h-8 w-8" />
          </span>
        </div>
      )}
    </div>
  );
}
