"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const smooth = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/**
 * 옆으로 넘겨 보는 카드 줄.
 * - 모바일: 손가락으로 넘기기(다음 카드가 살짝 보여 '더 있다'를 알림)
 * - PC: 한 화면에 세 장, 양옆 화살표로 한 화면씩 넘김(끝에 닿으면 그쪽 화살표는 사라짐)
 * 세로로 긴 격자 대신 한 줄로 두어, 홈에서 다음 섹션이 금방 보이게 합니다.
 */
export default function Carousel({ label, children }: { label: string; children: ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    measure();
    el?.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      el?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [measure, children]);

  const page = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth, behavior: smooth() });
  };

  const arrow =
    "pointer-events-auto absolute top-[30%] z-[3] hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink-900 shadow-card-hover ring-1 ring-cream-300/70 transition-[opacity,transform] duration-200 hover:scale-105 lg:flex";

  return (
    <div className="relative">
      <ul
        ref={ref}
        aria-label={label}
        className="no-scrollbar -mx-4 -my-2 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 py-2 sm:-mx-6 sm:scroll-px-6 sm:gap-5 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:gap-6 lg:px-0"
      >
        {Children.map(children, (child) =>
          child ? (
            <li className="w-[80%] max-w-[340px] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] sm:max-w-none lg:w-[calc((100%-3rem)/3)]">
              {child}
            </li>
          ) : null
        )}
      </ul>
      <button
        type="button"
        onClick={() => page(-1)}
        aria-label="이전 카드"
        tabIndex={edges.start ? -1 : 0}
        className={cn(arrow, "-left-6", edges.start && "pointer-events-none opacity-0")}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => page(1)}
        aria-label="다음 카드"
        tabIndex={edges.end ? -1 : 0}
        className={cn(arrow, "-right-6", edges.end && "pointer-events-none opacity-0")}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
