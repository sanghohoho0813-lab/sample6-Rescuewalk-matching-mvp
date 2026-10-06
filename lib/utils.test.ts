import { describe, expect, it } from "vitest";
import {
  BADGES,
  computeStats,
  daysFromToday,
  diffDays,
  formatDateKo,
  formatTimeKo,
  isWeekend,
  relativeDayLabel,
  withJosa,
} from "@/lib/utils";

describe("withJosa — 이름 뒤 조사", () => {
  it.each([
    ["장군", "와", "장군과"],
    ["보리", "와", "보리와"],
    ["몽실", "를", "몽실을"],
    ["해피", "를", "해피를"],
    ["연탄", "가", "연탄이"],
    ["두부", "는", "두부는"],
  ] as const)("%s + %s → %s", (word, josa, expected) => {
    expect(withJosa(word, josa)).toBe(expected);
  });

  it("한글이 아닌 이름은 받침 없는 형태로 붙입니다", () => {
    expect(withJosa("Max", "와")).toBe("Max와");
  });
});

describe("날짜·시간 표기", () => {
  it("오전/오후 12시간제", () => {
    expect(formatTimeKo("09:00")).toBe("오전 9:00");
    expect(formatTimeKo("12:30")).toBe("오후 12:30");
    expect(formatTimeKo("00:05")).toBe("오전 12:05");
    expect(formatTimeKo("17:00")).toBe("오후 5:00");
  });

  it("요일 포함 날짜", () => {
    expect(formatDateKo("2026-10-06")).toBe("10월 6일 (화)");
  });

  it("월·연도 경계를 넘는 일수 차이", () => {
    expect(diffDays("2026-01-31", "2026-02-01")).toBe(1);
    expect(diffDays("2026-12-31", "2027-01-01")).toBe(1);
    expect(diffDays("2026-10-08", "2026-10-06")).toBe(-2);
  });

  it("상대 날짜 라벨", () => {
    const today = "2026-10-06";
    expect(relativeDayLabel("2026-10-06", today)).toBe("오늘");
    expect(relativeDayLabel("2026-10-07", today)).toBe("내일");
    expect(relativeDayLabel("2026-10-09", today)).toBe("D-3");
    expect(relativeDayLabel("2026-10-04", today)).toBe("2일 전");
  });

  it("기준일로부터 n일", () => {
    const base = new Date(2026, 9, 30);
    expect(daysFromToday(2, base)).toBe("2026-11-01");
    expect(daysFromToday(-30, base)).toBe("2026-09-30");
  });

  it("주말 판정", () => {
    expect(isWeekend("2026-10-10")).toBe(true);
    expect(isWeekend("2026-10-11")).toBe(true);
    expect(isWeekend("2026-10-12")).toBe(false);
  });
});

describe("활동 통계와 배지", () => {
  const logs = [
    { date: "2026-10-03", durationMin: 60, dogId: "a" },
    { date: "2026-10-05", durationMin: 40, dogId: "b" },
    { date: "2026-10-06", durationMin: 30, dogId: "a" },
  ];

  it("횟수·아이 수·시간·주말 산책", () => {
    expect(computeStats(logs)).toEqual({ totalWalks: 3, uniqueDogs: 2, totalMinutes: 130, weekendWalks: 1 });
  });

  it("달성 여부와 진행도", () => {
    const stats = computeStats(logs);
    const byId = Object.fromEntries(BADGES.map((b) => [b.id, b]));
    expect(byId["three-walks"].achieved(stats)).toBe(true);
    expect(byId["five-friends"].achieved(stats)).toBe(false);
    expect(byId["five-friends"].progress(stats)).toBe("2/5마리");
    expect(byId["ten-hours"].progress(stats)).toBe("2/10시간");
  });
});
