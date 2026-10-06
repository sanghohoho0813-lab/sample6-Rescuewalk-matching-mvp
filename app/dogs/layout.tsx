import type { Metadata } from "next";

export const metadata: Metadata = {
  // 하위(상세·신청) 제목에도 서비스명이 붙도록 template 을 다시 지정
  title: { default: "강아지 찾기", template: "%s | RescueWalk" },
  description: "지역·크기·산책 난이도·성격으로 나와 맞는 산책 친구를 찾아보세요.",
};

export default function DogsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
