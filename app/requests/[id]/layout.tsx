import type { Metadata } from "next";

export const metadata: Metadata = { title: "신청 상세", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
