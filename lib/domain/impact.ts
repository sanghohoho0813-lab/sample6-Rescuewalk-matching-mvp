import type { ActivityLog, ActivityStats, Milestone } from "@/lib/types";

/**
 * 활동 기록을 '내가 만든 실제 영향'으로 묶는 계산.
 * 포인트·레벨 대신 실제로 있었던 일(횟수, 시간, 다시 만난 아이, 보호소에 전한 관찰)만 셉니다.
 */

export interface DogBond {
  dogId: string;
  walks: number;
  minutes: number;
  firstDate: string;
  lastDate: string;
}

export interface Impact extends ActivityStats {
  /** 아이별 관계 — 많이 만난 순, 같으면 최근 순 */
  bonds: DogBond[];
  /** 보호소에 전한 산책 관찰 수 */
  observations: number;
  /** 이번 달 산책 */
  thisMonth: { walks: number; minutes: number };
}

export function computeImpact(
  logs: readonly Pick<ActivityLog, "dogId" | "date" | "durationMin" | "observations">[],
  shelterOf: (dogId: string) => string | undefined,
  today: string
): Impact {
  const byDog = new Map<string, DogBond>();
  for (const l of logs) {
    const b = byDog.get(l.dogId);
    if (!b)
      byDog.set(l.dogId, {
        dogId: l.dogId,
        walks: 1,
        minutes: l.durationMin,
        firstDate: l.date,
        lastDate: l.date,
      });
    else {
      b.walks += 1;
      b.minutes += l.durationMin;
      if (l.date < b.firstDate) b.firstDate = l.date;
      if (l.date > b.lastDate) b.lastDate = l.date;
    }
  }
  const bonds = Array.from(byDog.values()).sort(
    (a, b) => b.walks - a.walks || b.lastDate.localeCompare(a.lastDate)
  );
  const month = today.slice(0, 7);
  const monthLogs = logs.filter((l) => l.date.startsWith(month));
  const shelters = new Set(logs.map((l) => shelterOf(l.dogId)).filter(Boolean));
  return {
    totalWalks: logs.length,
    totalMinutes: logs.reduce((s, l) => s + l.durationMin, 0),
    uniqueDogs: byDog.size,
    revisitedDogs: bonds.filter((b) => b.walks >= 2).length,
    shelters: shelters.size,
    bonds,
    observations: logs.reduce((s, l) => s + (l.observations?.length ?? 0), 0),
    thisMonth: { walks: monthLogs.length, minutes: monthLogs.reduce((s, l) => s + l.durationMin, 0) },
  };
}

/** "2시간 55분" / "45분" */
export function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}분`;
  return m ? `${h}시간 ${m}분` : `${h}시간`;
}

/** 산책 기록에 남길 수 있는 관찰 — 보호소가 아이 기록에 그대로 쓰는 표현 */
export const OBSERVATIONS = [
  "리드줄을 잘 따라 걸었어요",
  "냄새 탐색을 많이 했어요",
  "사람을 반겼어요",
  "다른 강아지에게 반응했어요",
  "소리에 놀랐어요",
  "금방 지쳤어요",
  "배변했어요",
] as const;

export const MILESTONES: Milestone[] = [
  {
    id: "first-walk",
    label: "첫 산책",
    description: "처음으로 아이와 함께 걸었어요",
    achieved: (s) => s.totalWalks >= 1,
    progress: (s) => `${Math.min(s.totalWalks, 1)}/1회`,
  },
  {
    id: "revisit",
    label: "다시 만난 친구",
    description: "같은 아이를 두 번 이상 만났어요 — 아이에게 익숙한 사람이 생겼어요",
    achieved: (s) => s.revisitedDogs >= 1,
    progress: (s) => `${Math.min(s.revisitedDogs, 1)}/1마리`,
  },
  {
    id: "three-walks",
    label: "3회 참여",
    description: "산책 봉사 3회를 함께했어요",
    achieved: (s) => s.totalWalks >= 3,
    progress: (s) => `${Math.min(s.totalWalks, 3)}/3회`,
  },
  {
    id: "five-friends",
    label: "5마리 친구",
    description: "다섯 아이와 인연을 맺었어요",
    achieved: (s) => s.uniqueDogs >= 5,
    progress: (s) => `${Math.min(s.uniqueDogs, 5)}/5마리`,
  },
  {
    id: "ten-hours",
    label: "누적 10시간",
    description: "함께 걸은 시간이 10시간을 넘었어요",
    achieved: (s) => s.totalMinutes >= 600,
    progress: (s) => `${Math.floor(Math.min(s.totalMinutes, 600) / 60)}/10시간`,
  },
  {
    id: "ten-walks",
    label: "10회 참여",
    description: "산책 봉사 10회를 함께했어요",
    achieved: (s) => s.totalWalks >= 10,
    progress: (s) => `${Math.min(s.totalWalks, 10)}/10회`,
  },
];
