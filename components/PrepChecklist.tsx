"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { prepKey, safeLocal } from "@/lib/storageKeys";
import { cn } from "@/lib/utils";

/**
 * 챙겨 올 것 — 읽고 지나가는 목록이 아니라 방문 전날 하나씩 체크하는 목록.
 * 체크 상태는 신청별로 이 브라우저에 기억합니다(다시 열어도 이어서).
 */
export default function PrepChecklist({ requestId, items }: { requestId: string; items: readonly string[] }) {
  const [done, setDone] = useState<string[]>([]);
  // 부모가 그릴 때마다 새 배열을 넘겨도 다시 읽지 않도록 내용으로 비교
  const itemsKey = items.join("|");

  useEffect(() => {
    const valid = itemsKey.split("|");
    try {
      const raw: unknown = JSON.parse(safeLocal.get(prepKey(requestId)) ?? "[]");
      setDone(
        Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string" && valid.includes(x)) : []
      );
    } catch {
      setDone([]);
    }
  }, [requestId, itemsKey]);

  const toggle = (item: string) =>
    setDone((prev) => {
      const next = prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item];
      safeLocal.set(prepKey(requestId), JSON.stringify(next));
      return next;
    });

  const all = done.length === items.length;

  return (
    <div>
      <ul className="divide-y divide-cream-200 overflow-hidden rounded-2xl bg-white ring-1 ring-cream-300/80">
        {items.map((item) => {
          const on = done.includes(item);
          return (
            <li key={item}>
              <label className="flex min-h-[52px] cursor-pointer items-center gap-3 px-4 py-2.5 transition-colors hover:bg-cream-50">
                <input type="checkbox" checked={on} onChange={() => toggle(item)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-sage-400 peer-focus-visible:ring-offset-2",
                    on ? "border-sage-600 bg-sage-600 text-white" : "border-cream-300 bg-white"
                  )}
                >
                  {on && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "text-[15px] transition-colors",
                    on ? "text-ink-400 line-through decoration-ink-300" : "text-ink-900"
                  )}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p
        className={cn("mt-2 text-sm", all ? "font-semibold text-sage-700" : "text-ink-500")}
        aria-live="polite"
      >
        {all ? "준비 끝! 가벼운 마음으로 오세요." : `${done.length}/${items.length} 준비했어요 · 눌러서 체크`}
      </p>
    </div>
  );
}
