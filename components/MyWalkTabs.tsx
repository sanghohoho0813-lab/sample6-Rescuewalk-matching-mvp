"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** "내 산책" 영역의 두 화면(신청 내역 · 활동 기록)을 오가는 탭 */
const TABS = [
  { href: "/requests", label: "신청 내역" },
  { href: "/activity", label: "활동 기록" },
];

export default function MyWalkTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="내 산책" className="mb-6 flex gap-6 border-b border-cream-300/80">
      {TABS.map((t) => {
        const active = pathname === t.href || pathname.startsWith(t.href + "/");
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex min-h-[44px] items-center border-b-2 text-[15px] font-semibold transition-colors",
              active
                ? "border-ink-900 text-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-700"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
