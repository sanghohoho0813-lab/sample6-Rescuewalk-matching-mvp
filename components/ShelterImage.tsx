import Image from "next/image";
import { PawPrint } from "lucide-react";
import DogImage from "@/components/DogImage";
import { dogs } from "@/lib/data/dogs";
import { cn } from "@/lib/utils";
import type { Shelter } from "@/lib/types";

/**
 * 보호소 이미지 슬롯.
 * - shelter.image 가 있으면 /public/images/shelters/{image} 사진을 사용
 * - 사진이 없는 보호소는 소속 아이들의 사진을 한 장의 콜라주로 채워 빈 자리처럼 보이지 않게 함
 *   (큰 사진 하나 + 작은 사진 둘 — 어떤 비율의 자리에서도 빈틈 없이 채워짐)
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
  const zoom = zoomOnHover && "transition-transform duration-300 group-hover:scale-[1.04]";

  if (shelter.image) {
    return (
      <Image
        src={`/images/shelters/${shelter.image}`}
        alt={`${shelter.name} 사진`}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", zoom, className)}
      />
    );
  }

  const residents = dogs.filter((d) => d.shelterId === shelter.id && d.image).slice(0, 3);

  if (residents.length === 0) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${shelter.themeColor}22, ${shelter.themeColor}4d)` }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/85 shadow-card"
          style={{ color: shelter.themeColor }}
        >
          <PawPrint className="h-8 w-8" aria-hidden />
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${shelter.name}의 아이들 사진`}
      className={cn("absolute inset-0 grid grid-cols-3 grid-rows-2 gap-0.5 bg-white", zoom)}
    >
      {residents.map((dog, i) => (
        <div
          key={dog.id}
          className={cn(
            "relative overflow-hidden",
            i === 0 && "col-span-2 row-span-2",
            residents.length === 2 && i === 1 && "row-span-2"
          )}
        >
          <DogImage
            dog={dog}
            aspect="h-full"
            variant={i === 0 ? "full" : "face"}
            sizes={i === 0 ? sizes : "160px"}
            objectPosition="50% 40%"
          />
        </div>
      ))}
    </div>
  );
}
