import type { Metadata } from "next";
import { getDog } from "@/lib/data/dogs";
import { withJosa } from "@/lib/utils";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const dog = getDog(params.id);
  // 작성 중인 신청서는 검색에 노출할 이유가 없습니다
  return { title: dog ? `${withJosa(dog.name, "와")}의 산책 신청` : "산책 신청", robots: { index: false } };
}

export default function ApplyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
