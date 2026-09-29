import Link from "next/link";
import { PawPrint } from "lucide-react";

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
    <div className="flex flex-col items-center gap-4 rounded-[20px] border border-dashed border-cream-300 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream-200 text-sage-600">
        <PawPrint className="h-6 w-6" />
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
