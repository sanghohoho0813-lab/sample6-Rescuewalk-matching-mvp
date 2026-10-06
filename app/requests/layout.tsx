import type { Metadata } from "next";

// 개인 기록 화면 — 검색 노출 제외
export const metadata: Metadata = {
  title: { default: "신청 내역", template: "%s | RescueWalk" },
  robots: { index: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
