"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DOGS_LIST_HREF_KEY, safeSession } from "@/lib/storageKeys";

/** 상세 → 목록으로 돌아갈 때, 보던 필터·정렬 조건을 그대로 유지합니다. */
export default function BackToDogs() {
  const [href, setHref] = useState("/dogs");

  useEffect(() => {
    const saved = safeSession.get(DOGS_LIST_HREF_KEY);
    // 같은 사이트의 목록 주소만 신뢰(다른 값이 들어 있어도 엉뚱한 곳으로 보내지 않게)
    if (saved && /^\/dogs(\?|$)/.test(saved)) setHref(saved);
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
