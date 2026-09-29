import Link from "next/link";
import Logo from "@/components/Logo";
import { MiraeWordmark } from "@/components/MiraeBrand";

const LINKS = [
  {
    title: "둘러보기",
    items: [
      { href: "/dogs", label: "강아지 찾기" },
      { href: "/shelters", label: "보호소" },
      { href: "/guide", label: "봉사 가이드" },
    ],
  },
  {
    title: "내 산책",
    items: [
      { href: "/requests", label: "신청 내역" },
      { href: "/activity", label: "활동 기록" },
      { href: "/me", label: "마이페이지" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-cream-300/70 bg-cream-100">
      <div className="container-app pb-[calc(6rem+env(safe-area-inset-bottom))] pt-10 lg:pb-10">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Logo compact />
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              유기견 보호소의 아이들과 산책 봉사자를 연결합니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 text-sm sm:gap-16">
            {LINKS.map((col) => (
              <div key={col.title}>
                <h3 className="font-semibold text-ink-700">{col.title}</h3>
                <ul className="mt-2">
                  {col.items.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex min-h-[36px] items-center text-ink-500 hover:text-ink-900">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-4 border-t border-cream-300/70 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] leading-relaxed text-ink-400">
            © 2026 RescueWalk · 데모 서비스로, 보호소·강아지 정보와 신청 내역은 예시입니다.
          </p>
          <MiraeWordmark width={112} className="opacity-80" />
        </div>
      </div>
    </footer>
  );
}
