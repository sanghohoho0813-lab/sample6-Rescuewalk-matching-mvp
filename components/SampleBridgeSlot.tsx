"use client";

import { usePathname } from "next/navigation";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";

/**
 * 공통 CTA를 레이아웃 레벨에서 모든 페이지 하단에 배치하되,
 * 아래 경로에서는 숨깁니다.
 *
 * - /dogs/[id]/apply : 산책 신청 5단계 폼 진행 중. 이 화면에서 외부 링크를 노출하면
 *   샘플의 핵심 전환 흐름(신청 완료)을 중간에 이탈시키게 되므로 제외했습니다.
 *   대신 신청이 끝난 /complete/[rid] 화면에서는 노출되어, 흐름을 다 본 직후에 CTA를 만납니다.
 */
const HIDDEN_PATHS: RegExp[] = [/^\/dogs\/[^/]+\/apply\/?$/];

export default function SampleBridgeSlot() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.some((re) => re.test(pathname))) return null;
  return <SampleBridgeCTA />;
}
