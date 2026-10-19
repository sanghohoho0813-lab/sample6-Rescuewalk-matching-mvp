"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Dog, Home, PawPrint, UserRound } from "lucide-react";
import { isFocusRoute } from "@/lib/routes";
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
  // 강아지 상세·신청 흐름은 화면의 주요 행동이 하단에 고정되므로 내비를 뺍니다
  if (isFocusRoute(pathname)) return null;

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
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs transition-colors duration-200",
                active ? "font-semibold text-sage-800" : "font-medium text-ink-400 hover:text-ink-700"
              )}
            >
              {/* 현재 화면은 아이콘 뒤에 옅은 알약 모양 — 색만으로 구분하지 않게 */}
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200",
                  active ? "bg-sage-100" : "group-active:bg-cream-200"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.3 : 1.9} aria-hidden />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
