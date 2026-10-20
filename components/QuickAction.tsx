import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 바로가기 한 칸 — 아이콘 원 + 짧은 이름. 신청 상세·보호소 상세가 같은 모양을 씁니다.
 * href 가 http 로 시작하면 새 창(지도 앱), tel: 은 전화, 그 외는 앱 안 이동, onClick 은 버튼.
 */
export default function QuickAction({
  icon: Icon,
  label,
  href,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}) {
  const cls = cn(
    "flex min-h-[84px] w-full flex-col items-center justify-center gap-1.5 rounded-2xl bg-white px-2 text-sm font-semibold text-ink-900 ring-1 ring-cream-300/80 transition-[box-shadow,transform] duration-150 hover:shadow-card hover:ring-sage-200 active:scale-[0.97]",
    className
  );
  const body = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-50 text-sage-700">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      {label}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  if (href?.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  if (href?.startsWith("tel:")) {
    return (
      <a href={href} className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={href ?? "#"} className={cls}>
      {body}
    </Link>
  );
}
