import Link from "next/link";
import { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";

/** 빈 화면에 겹쳐 보이는 아이들 — 아이콘 하나보다 '여기에 누가 기다리는지'가 먼저 보이게 */
const FACES = ["dog-bori", "dog-songi", "dog-dani"]
  .map(getDog)
  .filter((d): d is NonNullable<typeof d> => !!d);

export default function EmptyState({
  message,
  ctaLabel,
  ctaHref,
  onAction,
}: {
  message: string;
  ctaLabel?: string;
  /** 이동이 필요한 경우 */
  ctaHref?: string;
  /** 같은 화면에서 상태를 바꾸는 경우 (예: 필터 초기화) */
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[24px] bg-white px-6 py-12 text-center ring-1 ring-cream-300/70">
      <span className="flex -space-x-3" aria-hidden>
        {FACES.map((dog, i) => (
          <span
            key={dog.id}
            className="h-12 w-12 overflow-hidden rounded-full ring-[3px] ring-white"
            style={{ transform: `translateY(${i === 1 ? -6 : 0}px)` }}
          >
            <DogFace dog={dog} sizes="48px" />
          </span>
        ))}
      </span>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-500">{message}</p>
      {ctaLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary">
          {ctaLabel}
        </button>
      )}
      {ctaLabel && ctaHref && !onAction && (
        <Link href={ctaHref} className="btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
