import { cn } from "@/lib/utils";

type TagTone = "sage" | "tangerine" | "cream" | "neutral";

const TONE_STYLE: Record<TagTone, string> = {
  sage: "bg-sage-100 text-sage-700 hover:bg-sage-200/80",
  tangerine: "bg-tangerine-100 text-tangerine-700 hover:bg-tangerine-200/70",
  cream: "bg-cream-200 text-ink-700 hover:bg-cream-300/70",
  neutral: "bg-ink-300/15 text-ink-500",
};

export default function Tag({
  children,
  tone = "cream",
  className,
}: {
  children: React.ReactNode;
  tone?: TagTone;
  className?: string;
}) {
  return <span className={cn("chip", TONE_STYLE[tone], className)}>{children}</span>;
}

/** 성격 태그 목록을 톤을 번갈아가며 렌더링 */
export function PersonalityTags({
  tags,
  max,
  className,
}: {
  tags: string[];
  max?: number;
  className?: string;
}) {
  const tones: TagTone[] = ["tangerine", "sage", "cream"];
  const shown = max ? tags.slice(0, max) : tags;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {shown.map((tag, i) => (
        <Tag key={tag} tone={tones[i % tones.length]}>
          {tag}
        </Tag>
      ))}
    </div>
  );
}
