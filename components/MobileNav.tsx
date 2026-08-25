"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Dog, Home, PawPrint, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "홈", icon: Home, exact: true },
  { href: "/dogs", label: "아이들", icon: Dog, exact: false },
  { href: "/requests", label: "신청내역", icon: CalendarCheck, exact: false },
  { href: "/activity", label: "활동기록", icon: PawPrint, exact: false },
  { href: "/me", label: "마이", icon: UserRound, exact: false },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="모바일 하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-cream-300/60 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors duration-200",
                active ? "text-tangerine-600" : "text-ink-400 hover:text-ink-700"
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-transform duration-200", active && "scale-110")}
                strokeWidth={active ? 2.4 : 2}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
