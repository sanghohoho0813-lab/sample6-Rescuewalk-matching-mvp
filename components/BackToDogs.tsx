"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** 상세 → 목록으로 돌아갈 때, 보던 필터·정렬 조건을 그대로 유지합니다. */
export default function BackToDogs() {
  const [href, setHref] = useState("/dogs");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("rw:dogsHref");
      if (saved?.startsWith("/dogs")) setHref(saved);
    } catch {
      /* 저장소가 막혀 있으면 기본 목록 */
    }
  }, []);

  return (
    <Link
      href={href}
      className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900"
    >
      <ArrowLeft className="h-4 w-4" /> 강아지 찾기
    </Link>
  );
}
