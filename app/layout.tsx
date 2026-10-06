import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import SampleBridgeSlot from "@/components/SampleBridgeSlot";
import Toast from "@/components/Toast";
import Script from "next/script";

/** 공유 미리보기의 절대 경로 기준. 배포 시 NEXT_PUBLIC_SITE_URL 로 실제 주소를 넣습니다 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RescueWalk — 유기견 산책 매칭",
    template: "%s | RescueWalk",
  },
  description:
    "산책이 필요한 아이와, 함께 걸어줄 당신을 연결합니다. 가까운 보호소의 유기견과 산책 봉사에 참여해보세요.",
  applicationName: "RescueWalk",
  authors: [{ name: "미래에이아이랩" }],
  creator: "미래에이아이랩",
  publisher: "미래에이아이랩",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "RescueWalk",
    title: "RescueWalk — 유기견 산책 매칭",
    description:
      "산책이 필요한 아이와, 함께 걸어줄 당신을 연결합니다. 미래에이아이랩이 만든 유기견 산책 매칭 서비스.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "산책 친구를 기다리는 보호소 강아지 보리" }],
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFDF8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans">
        {/* 미래AI랩 데모 공용 뒤로·앞으로 버튼 */}
        <Script src="/mirae-history-nav.js" strategy="beforeInteractive" />
        <a
          href="#main"
          className="sr-only z-[70] rounded-full bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          본문으로 건너뛰기
        </a>
        <StoreProvider>
          <Header />
          <main id="main" tabIndex={-1} className="min-h-[70vh] pb-10 focus:outline-none md:pb-0">
            {children}
          </main>
          <SampleBridgeSlot />
          <Footer />
          <MobileNav />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
