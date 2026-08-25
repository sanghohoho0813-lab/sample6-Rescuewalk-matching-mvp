import { cn, STATUS_LABEL, STATUS_STYLE } from "@/lib/utils";
import type { WalkRequestStatus } from "@/lib/types";

export default function StatusBadge({
  status,
  className,
}: {
  status: WalkRequestStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold leading-none transition-colors duration-300",
        STATUS_STYLE[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
