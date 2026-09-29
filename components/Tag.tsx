import { cn } from "@/lib/utils";

type TagTone = "sage" | "neutral";

const TONE_STYLE: Record<TagTone, string> = {
  sage: "bg-sage-100 text-sage-800",
  neutral: "bg-cream-200/80 text-ink-700",
};

export default function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
}) {
  return <span className={cn("chip", TONE_STYLE[tone], className)}>{children}</span>;
}

/**
 * 성격 태그.
 * 태그마다 색을 돌려 쓰면 화면이 산만해지므로 모두 중립 톤으로 두고,
 * 봉사자 판단에 직접 영향을 주는 "초보 가능" 류만 세이지로 구분합니다.
 */
const HIGHLIGHT = /초보/;

export function PersonalityTags({
  tags,
  max,
  className,
}: {
  tags: string[];
  max?: number;
  className?: string;
}) {
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((tag) => (
        <Tag key={tag} tone={HIGHLIGHT.test(tag) ? "sage" : "neutral"}>
          {tag}
        </Tag>
      ))}
    </div>
  );
}
