import Link from "next/link";
import { Search } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";

const FACES = ["dog-songi", "dog-bori", "dog-janggun"]
  .map(getDog)
  .filter((d): d is NonNullable<typeof d> => !!d);

export default function NotFound() {
  return (
    <div className="container-app flex max-w-lg flex-col items-center py-20 text-center md:py-28">
      {/* 길 잃은 화면에서도 '여기 아이들이 기다려요' — 아이콘보다 얼굴 */}
      <span className="flex -space-x-4" aria-hidden>
        {FACES.map((dog, i) => (
          <span
            key={dog.id}
            className="h-16 w-16 overflow-hidden rounded-full ring-4 ring-cream-50"
            style={{ transform: `translateY(${i === 1 ? -8 : 0}px) rotate(${(i - 1) * 6}deg)` }}
          >
            <DogFace dog={dog} sizes="64px" />
          </span>
        ))}
      </span>
      <p className="tnum mt-6 text-sm font-semibold tracking-widest text-sage-700">404</p>
      <h1 className="mt-1 text-2xl font-bold text-ink-900">앗, 길을 잃었어요</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
        찾으시는 페이지가 없거나 이동했어요.
        <br />
        아이들이 기다리는 곳으로 돌아가볼까요?
      </p>
      <div className="mt-7 flex w-full max-w-xs flex-col gap-2.5">
        <Link href="/dogs" className="btn-primary btn-lg w-full">
          산책 가능한 아이들 보기
        </Link>
        <Link href="/" className="btn-secondary btn-lg w-full">
          홈으로
        </Link>
      </div>
      <Link
        href="/requests"
        className="mt-5 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <Search className="h-4 w-4" aria-hidden /> 내 신청을 찾고 있었다면 — 신청 내역
      </Link>
    </div>
  );
}
