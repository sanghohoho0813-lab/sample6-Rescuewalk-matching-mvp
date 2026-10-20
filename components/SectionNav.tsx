"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const smooth = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/** 헤더(64) + 이 목차(약 60) 아래를 지난 섹션을 '지금 읽는 곳'으로 */
const SPY_LINE = 150;

/**
 * 긴 안내 화면의 목차 — 헤더 아래에 붙어 따라오고, 지금 읽는 섹션을 채워서 표시합니다.
 * 누르면 그 섹션으로 부드럽게 이동하고 주소에 #을 남기지 않습니다(뒤로가기 = 이전 화면).
 */
export default function SectionNav({
  label,
  items,
}: {
  label: string;
  items: { id: string; label: string }[];
}) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const rowRef = useRef<HTMLDivElement>(null);
  const ids = items.map((i) => i.id).join(",");

  useEffect(() => {
    const list = ids.split(",");
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let current = list[0];
        for (const id of list) {
          const el = document.getElementById(id);
          if (el && el.getBoundingClientRect().top <= SPY_LINE) current = id;
        }
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) {
          current = list[list.length - 1];
        }
        setActive(current);
      });
    };
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [ids]);

  // 지금 칩이 가로 줄 안에 보이도록(줄만 옆으로)
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!row || !chip) return;
    if (
      chip.offsetLeft < row.scrollLeft ||
      chip.offsetLeft + chip.offsetWidth > row.scrollLeft + row.clientWidth
    ) {
      row.scrollTo({ left: chip.offsetLeft - 16, behavior: smooth() });
    }
  }, [active]);

  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-20 -mx-4 border-b border-cream-300/60 bg-cream-50/95 py-2.5 backdrop-blur-md sm:-mx-6 lg:-mx-8"
    >
      <div ref={rowRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              data-section={it.id}
              aria-current={on ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(it.id)?.scrollIntoView({ behavior: smooth(), block: "start" });
              }}
              className={cn(
                "inline-flex min-h-[40px] shrink-0 items-center rounded-full border px-4 text-[15px] transition-colors duration-150",
                on
                  ? "border-ink-900 bg-ink-900 font-semibold text-white"
                  : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
              )}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
