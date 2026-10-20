"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusRoute } from "@/lib/routes";

/** 집중 화면(상세·신청)의 모바일에서는 감싼 영역(푸터 등)을 빼서 그 화면의 흐름만 남깁니다 */
export default function HideOnFocus({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <div className={isFocusRoute(pathname) ? "hidden md:block" : undefined}>{children}</div>;
}
