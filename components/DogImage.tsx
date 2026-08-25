import DogAvatar from "@/components/DogAvatar";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

/**
 * 강아지 대표 이미지 슬롯.
 * - dog.image 가 있으면 /images/dogs/{image} 사진을 사용
 * - 없으면 일러스트 플레이스홀더로 대체되어 레이아웃이 무너지지 않음
 * 비율은 aspect 클래스로 카드(4:3), 히어로(16:9) 등에서 일관되게 유지합니다.
 */
export default function DogImage({
  dog,
  className,
  aspect = "aspect-[4/3]",
}: {
  dog: Pick<Dog, "name" | "image" | "art">;
  className?: string;
  aspect?: string;
}) {
  return (
    <div className={cn("relative w-full overflow-hidden bg-cream-200", aspect, className)}>
      {dog.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/images/dogs/${dog.image}`}
          alt={`${dog.name} 사진`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <DogAvatar dog={dog} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
