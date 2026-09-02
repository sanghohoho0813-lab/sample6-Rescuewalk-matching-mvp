import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * 제작사(미래에이아이랩) 브랜드 마크.
 * 서비스 브랜드(RescueWalk)를 가리지 않도록 작게, 밝은 배경 위에만 사용합니다.
 * 로고는 원본 그대로(투명 배경) 사용하며 색·형태를 변형하지 않습니다.
 */

export function MiraeWordmark({
  className,
  width = 132,
}: {
  className?: string;
  width?: number;
}) {
  return (
    <Image
      src="/images/brand/mirae-ai-lab.webp"
      alt="미래에이아이랩"
      width={width}
      height={Math.round((width * 151) / 500)}
      sizes={`${width}px`}
      className={cn("h-auto w-auto", className)}
      style={{ width, height: "auto" }}
    />
  );
}

export function MiraeMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/images/brand/mirae-mark.webp"
      alt=""
      aria-hidden
      width={size}
      height={size}
      sizes={`${size}px`}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** 마크 + 문구 한 줄짜리 작은 배지 */
export function MiraeBadge({
  label = "미래에이아이랩 프로젝트",
  className,
  markSize = 18,
}: {
  label?: string;
  className?: string;
  markSize?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-cream-300/80 bg-white/80 py-1 pl-1.5 pr-3 text-[11px] font-semibold text-ink-500 backdrop-blur",
        className
      )}
    >
      <MiraeMark size={markSize} />
      {label}
    </span>
  );
}

/** 화면 하단에 조용히 남기는 제작 서명 */
export function MiraeSignature({
  prefix = "Powered by",
  className,
  width = 108,
}: {
  prefix?: string;
  className?: string;
  width?: number;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[11px] text-ink-400", className)}>
      {prefix}
      <MiraeWordmark width={width} className="opacity-90" />
    </span>
  );
}
