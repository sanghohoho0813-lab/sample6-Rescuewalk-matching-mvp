"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, UserRound } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dogs", label: "강아지 찾기", match: ["/dogs"] },
  { href: "/shelters", label: "보호소", match: ["/shelters"] },
  { href: "/guide", label: "봉사 가이드", match: ["/guide"] },
  { href: "/requests", label: "내 산책", match: ["/requests", "/activity", "/complete"] },
];

export default function Header() {
  const pathname = usePathname();
  const { favorites, hydrated } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/60 bg-cream-50/90 backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden h-full items-center gap-7 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const active = item.match.some((m) => pathname === m || pathname.startsWith(m + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full items-center text-[15px] font-medium transition-colors duration-200",
                  active ? "text-ink-900" : "text-ink-500 hover:text-ink-900"
                )}
              >
                {item.label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-ink-900" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Link
            href="/me#favorites"
            aria-label={`찜한 강아지${hydrated && favorites.length ? ` ${favorites.length}마리` : ""}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-900"
          >
            <Heart className="h-5 w-5" />
            {hydrated && favorites.length > 0 && (
              <span className="tnum absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-900 px-1 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            href="/me"
            aria-label="마이페이지"
            aria-current={pathname === "/me" ? "page" : undefined}
            className="flex h-11 w-11 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-900"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <UserRound className="h-[18px] w-[18px]" />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
