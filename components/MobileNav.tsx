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

/**
 * 하단 내비를 숨기는 화면.
 * 강아지 상세(하단 고정 신청 버튼)와 신청 5단계(하단 고정 진행 버튼)는
 * 화면의 주요 행동이 하단에 고정되므로, 고정 바가 두 겹으로 쌓이지 않게 내비를 뺍니다.
 */
const HIDE_ON = [/^\/dogs\/[^/]+\/?$/, /^\/dogs\/[^/]+\/apply\/?$/];

export default function MobileNav() {
  const pathname = usePathname();
  if (HIDE_ON.some((re) => re.test(pathname))) return null;

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
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-200",
                active ? "text-sage-700" : "text-ink-400 hover:text-ink-700"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.9} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
