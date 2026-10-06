import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-2" aria-label="RescueWalk 홈으로">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tangerine-100 text-tangerine-600 transition-transform duration-300 group-hover:rotate-12">
        <PawPrint className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-sage-700">
          RescueWalk
        </span>
        {/* 모바일 헤더에서는 작은 부제가 읽히지 않으므로 숨깁니다 */}
        {!compact && (
          <span className="mt-1 hidden text-xs font-medium text-ink-400 sm:block">따뜻한 발걸음</span>
        )}
      </span>
    </Link>
  );
}
