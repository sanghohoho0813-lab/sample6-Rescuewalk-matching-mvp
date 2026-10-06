import { Children, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * 카드 묶음 — 모바일에서는 옆으로 넘겨 보는 한 줄, 넓은 화면에서는 격자.
 * 모바일에서 큰 카드를 세로로 쌓으면 카드 몇 장에 화면이 수천 px 길어지므로,
 * 다음 카드가 살짝 보이게 해서 '옆으로 더 있다'는 걸 자연스럽게 알립니다.
 */
export default function DogRail({
  children,
  wideCols = "lg:grid-cols-3",
  label,
}: {
  children: ReactNode;
  /** 넓은 화면에서 3열이 되는 지점 (본문이 좁은 화면은 xl 부터) */
  wideCols?: "lg:grid-cols-3" | "xl:grid-cols-3";
  label?: string;
}) {
  return (
    <ul
      aria-label={label}
      className={cn(
        "no-scrollbar -mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-2",
        "sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0",
        wideCols
      )}
    >
      {Children.map(children, (child) =>
        child ? <li className="w-[80%] max-w-[340px] shrink-0 snap-start sm:w-auto sm:max-w-none">{child}</li> : null
      )}
    </ul>
  );
}
