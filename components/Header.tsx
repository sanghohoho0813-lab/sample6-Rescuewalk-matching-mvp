"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, UserRound } from "lucide-react";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/dogs", label: "강아지 찾기" },
  { href: "/shelters", label: "보호소 소개" },
  { href: "/guide", label: "봉사 가이드" },
  { href: "/activity", label: "내 활동" },
];

export default function Header() {
  const pathname = usePathname();
  const { favorites, hydrated, showToast } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-cream-300/50 bg-cream-50/90 shadow-header backdrop-blur-md">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[15px] font-medium transition-colors duration-200",
                  active
                    ? "text-sage-700"
                    : "text-ink-500 hover:bg-cream-200/70 hover:text-ink-900"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-4 -bottom-[13px] h-0.5 rounded-full bg-tangerine-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/me"
            aria-label="찜한 강아지"
            className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-tangerine-600 sm:flex"
          >
            <Heart className="h-5 w-5" />
            {hydrated && favorites.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-tangerine-500 text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="알림"
            onClick={() => showToast("아직 새로운 알림이 없어요.", "🔔")}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-cream-200/70 hover:text-ink-900"
          >
            <Bell className="h-5 w-5" />
          </button>
          <Link
            href="/me"
            aria-label="마이페이지"
            className="ml-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-sage-100 text-sage-600 transition-all hover:ring-2 hover:ring-sage-300"
          >
            <UserRound className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
