import Image from "next/image";
import DogAvatar from "@/components/DogAvatar";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

type DogImageDog = Pick<Dog, "name" | "image" | "art">;

/**
 * 강아지 이미지 슬롯.
 * - dog.image 가 있으면 /public/images/dogs/{image} 사진을 사용
 * - 없으면 일러스트 플레이스홀더로 대체되어 레이아웃이 무너지지 않음
 *
 * variant
 * - "full": 전신 사진(정사각 원본). 카드 4:3 / 히어로 16:10 등으로 크롭해 사용
 * - "face": 얼굴 중심으로 미리 크롭해 둔 정사각 썸네일. 작은 아바타에 사용
 */
export default function DogImage({
  dog,
  className,
  aspect = "aspect-[4/3]",
  variant = "full",
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 400px",
  priority = false,
  objectPosition = "50% 42%",
}: {
  dog: DogImageDog;
  className?: string;
  aspect?: string;
  variant?: "full" | "face";
  sizes?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  const src = dog.image
    ? variant === "face"
      ? `/images/dogs/face/${dog.image}`
      : `/images/dogs/${dog.image}`
    : null;

  return (
    <div className={cn("relative w-full overflow-hidden bg-cream-200", aspect, className)}>
      {src ? (
        <Image
          src={src}
          alt={`${dog.name} 사진`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          style={{ objectPosition: variant === "face" ? "50% 50%" : objectPosition }}
        />
      ) : (
        <DogAvatar dog={dog} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

/** 작은 원형·라운드 아바타용 축약 컴포넌트 */
export function DogFace({
  dog,
  className,
  sizes = "80px",
}: {
  dog: DogImageDog;
  className?: string;
  sizes?: string;
}) {
  return (
    <DogImage
      dog={dog}
      variant="face"
      aspect="aspect-square"
      sizes={sizes}
      className={className}
    />
  );
}
