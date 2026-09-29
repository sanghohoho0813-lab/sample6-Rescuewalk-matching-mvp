import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 제작사(미래AI랩) 워드마크 — 원본 로고 그대로(투명 배경).
 * 로고가 짙은 남색이라 밝은 배경에서만 사용합니다.
 * 샘플 안에서 제작사 로고는 푸터 한 곳에만 두고, 소개·상담 안내는 SampleBridgeCTA 가 맡습니다.
 */
export function MiraeWordmark({ className, width = 132 }: { className?: string; width?: number }) {
  return (
    <Image
      src="/images/brand/mirae-ai-lab.webp"
      alt="미래에이아이랩"
      width={width}
      height={Math.round((width * 151) / 500)}
      sizes={`${width}px`}
      className={cn("h-auto", className)}
      style={{ width, height: "auto" }}
    />
  );
}
