"use client";

import { useEffect, useRef, useState } from "react";
import BackToDogs from "@/components/BackToDogs";
import FavoriteButton from "@/components/FavoriteButton";
import { DogFace } from "@/components/DogImage";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

type SectionLink = { id: string; label: string };

/** 목차가 화면 위에 붙은 상태에서 섹션 제목이 닿았다고 보는 선(앱 바 56 + 탭 44 + 여유) */
const SPY_LINE = 140;

const smooth = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

/**
 * 모바일 상세의 접히는 앱 바 + 목차.
 * 사진을 지나 내려가면 위에서 내려와(이름·뒤로·찜을 다시 손 닿는 곳에), 지금 읽는 섹션을 탭으로 표시합니다.
 * 탭을 누르면 그 섹션으로 부드럽게 이동하고, 주소에 #을 남기지 않아 뒤로가기가 목록으로 바로 갑니다.
 */
export default function DetailAppBar({ dog, sections }: { dog: Dog; sections: SectionLink[] }) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const tabsRef = useRef<HTMLDivElement>(null);
  const ids = sections.map((s) => s.id).join(",");

  useEffect(() => {
    const list = ids.split(",");
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const hero = document.getElementById("dog-hero");
        setShown(!!hero && hero.getBoundingClientRect().bottom < 64);
        // 보이는 섹션만(PC 전용으로 숨겨진 섹션 등은 건너뜀)
        const visible = list
          .map((id) => document.getElementById(id))
          .filter((el): el is HTMLElement => !!el && el.offsetParent !== null);
        let current = visible[0]?.id ?? "";
        for (const el of visible) if (el.getBoundingClientRect().top <= SPY_LINE) current = el.id;
        // 마지막 섹션이 짧아 선에 닿기 전에 페이지 끝에 도달하는 경우
        const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
        if (atBottom && visible.length) current = visible[visible.length - 1].id;
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

  // 지금 섹션의 탭이 탭 줄 가운데 오도록(탭 줄만 옆으로 — 페이지는 움직이지 않음)
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!row || !tab || !shown) return;
    row.scrollTo({ left: tab.offsetLeft - row.clientWidth / 2 + tab.offsetWidth / 2, behavior: smooth() });
  }, [active, shown]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b border-cream-300/70 bg-cream-50/95 pt-[env(safe-area-inset-top)] shadow-header backdrop-blur-md transition-[transform,opacity,visibility] duration-200 md:hidden",
        shown ? "visible translate-y-0 opacity-100" : "invisible -translate-y-3 opacity-0"
      )}
    >
      <div className="flex h-14 items-center gap-2 px-2">
        <BackToDogs variant="overlay" label="목록으로 돌아가기" className="!bg-transparent !shadow-none" />
        <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          <DogFace dog={dog} sizes="32px" />
        </span>
        <p className="min-w-0 flex-1 truncate text-[17px] font-bold text-ink-900">{dog.name}</p>
        <FavoriteButton dogId={dog.id} dogName={dog.name} className="!bg-transparent !shadow-none" />
      </div>
      <nav aria-label={`${dog.name} 소개 목차`}>
        <div ref={tabsRef} className="no-scrollbar flex overflow-x-auto px-2">
          {sections.map((s) => {
            const on = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                data-section={s.id}
                aria-current={on ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: smooth(), block: "start" });
                }}
                className={cn(
                  "relative flex min-h-[44px] shrink-0 items-center px-3.5 text-[15px] font-semibold transition-colors duration-150",
                  on ? "text-ink-900" : "text-ink-400 hover:text-ink-700"
                )}
              >
                {s.label}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-ink-900 transition-opacity duration-150",
                    on ? "opacity-100" : "opacity-0"
                  )}
                />
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
