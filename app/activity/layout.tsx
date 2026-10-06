import type { Metadata } from "next";

// 개인 기록 화면 — 검색 노출 제외
export const metadata: Metadata = { title: "활동 기록", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
