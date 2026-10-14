import { describe, expect, it } from "vitest";
import { MILESTONES, computeImpact, formatDuration } from "./impact";

const shelterOf = (dogId: string) => (dogId === "c" ? "s2" : "s1");
const logs = [
  { date: "2026-09-20", durationMin: 60, dogId: "a", observations: ["사람을 반겼어요"] },
  { date: "2026-10-05", durationMin: 40, dogId: "b" },
  { date: "2026-10-11", durationMin: 30, dogId: "a", observations: ["배변했어요", "금방 지쳤어요"] },
  { date: "2026-10-12", durationMin: 45, dogId: "c" },
];

describe("활동 영향", () => {
  const impact = computeImpact(logs, shelterOf, "2026-10-13");

  it("횟수·시간·아이·보호소", () => {
    expect(impact).toMatchObject({ totalWalks: 4, totalMinutes: 175, uniqueDogs: 3, shelters: 2 });
  });

  it("두 번 이상 만난 아이 = 재방문", () => expect(impact.revisitedDogs).toBe(1));

  it("아이별 관계는 많이 만난 순, 같으면 최근 순", () => {
    expect(impact.bonds.map((b) => b.dogId)).toEqual(["a", "c", "b"]);
    expect(impact.bonds[0]).toMatchObject({
      walks: 2,
      minutes: 90,
      firstDate: "2026-09-20",
      lastDate: "2026-10-11",
    });
  });

  it("이번 달과 보호소에 전한 관찰", () => {
    expect(impact.thisMonth).toEqual({ walks: 3, minutes: 115 });
    expect(impact.observations).toBe(3);
  });

  it("이정표", () => {
    const byId = Object.fromEntries(MILESTONES.map((m) => [m.id, m]));
    expect(byId["revisit"].achieved(impact)).toBe(true);
    expect(byId["five-friends"].achieved(impact)).toBe(false);
    expect(byId["five-friends"].progress(impact)).toBe("3/5마리");
    expect(byId["ten-hours"].progress(impact)).toBe("2/10시간");
  });

  it("기록이 없으면 0", () => {
    expect(computeImpact([], shelterOf, "2026-10-13")).toMatchObject({
      totalWalks: 0,
      revisitedDogs: 0,
      bonds: [],
    });
  });
});

describe("시간 표기", () => {
  it.each([
    [45, "45분"],
    [60, "1시간"],
    [175, "2시간 55분"],
  ])("%i분 → %s", (m, s) => expect(formatDuration(m)).toBe(s));
});
