import Link from "next/link";
import { PawPrint } from "lucide-react";

export default function EmptyState({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream-200 text-tangerine-500">
        <PawPrint className="h-7 w-7" />
      </span>
      <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-500">{message}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary text-sm">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
