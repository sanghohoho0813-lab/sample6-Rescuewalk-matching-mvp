"use client";

import { useEffect, useState } from "react";
import { todayISO } from "@/lib/utils";

export interface Clock {
  now: Date;
  today: string;
}

/**
 * 지금 시각 — 브라우저에서만 값을 줍니다(서버 렌더 시점과 방문 시점의 날짜가 다르므로).
 * 그리기 전(서버·하이드레이션)에는 null 이라, 일정 표시는 그 동안 자리만 잡아 둡니다.
 * 1분마다 갱신해 당일 마감 시간이 열어 둔 화면에서도 맞게 바뀝니다.
 */
export function useClock(): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null);
  useEffect(() => {
    const tick = () => setClock({ now: new Date(), today: todayISO() });
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return clock;
}
