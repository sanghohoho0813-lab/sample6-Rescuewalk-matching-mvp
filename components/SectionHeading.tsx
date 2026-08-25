import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function SectionHeading({
  label,
  title,
  subtitle,
  moreHref,
  moreLabel = "전체 보기",
}: {
  label?: string;
  title: string;
  subtitle?: string;
  moreHref?: string;
  moreLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {label && <p className="section-label">{label}</p>}
        <h2 className="text-xl font-extrabold tracking-tight text-ink-900 sm:text-2xl">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-ink-500">{subtitle}</p>}
      </div>
      {moreHref && (
        <Link
          href={moreHref}
          className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-sage-600 transition-colors hover:text-tangerine-600"
        >
          {moreLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
