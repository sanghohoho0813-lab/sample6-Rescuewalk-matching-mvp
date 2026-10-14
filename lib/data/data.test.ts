import { describe, expect, it } from "vitest";
import { dogs, getDog } from "./dogs";
import { shelters, getShelter } from "./shelters";
import { buildSeed } from "./seed";
import { isShelterOpen, scheduledSlots, shelterHours, slotFitsHours } from "@/lib/domain/schedule";
import { ALL_SLOTS } from "@/lib/domain/apply";

/**
 * 데이터 무결성 — 보호소가 실제로 운영할 수 없는 일정이 데이터에 섞이지 않게 합니다.
 * (예: 휴무일 산책, 문 닫기 직전에 시작하는 산책)
 */
describe("보호소 데이터", () => {
  it.each(shelters.map((s) => [s.name, s] as const))("%s — 운영 시간·방문 안내가 갖춰져 있습니다", (_, s) => {
    expect(shelterHours(s)).not.toBeNull();
    expect(s.features.length).toBeGreaterThanOrEqual(2);
    for (const v of Object.values(s.visit)) expect(v.length).toBeGreaterThan(0);
    expect(s.closedDays.length).toBeLessThan(7);
  });
});

describe("강아지 데이터", () => {
  it.each(dogs.map((d) => [d.name, d] as const))("%s — 일정이 보호소 운영 시간 안에 있습니다", (_, d) => {
    const shelter = getShelter(d.shelterId);
    expect(shelter).toBeDefined();
    for (const t of d.availableTimes) {
      expect((ALL_SLOTS as readonly string[]).includes(t)).toBe(true);
      expect(slotFitsHours(t, shelter!)).toBe(true);
    }
    if (d.availability === "available") {
      // 산책 요일 중 보호소가 여는 날이 최소 하루는 있어야 신청이 가능합니다
      expect(d.walkDays.some((w) => !shelter!.closedDays.includes(w))).toBe(true);
      expect(d.availableTimes.length).toBeGreaterThan(0);
    }
  });

  it.each(dogs.map((d) => [d.name, d] as const))("%s — 매칭 판단 정보가 채워져 있습니다", (_, d) => {
    expect(d.headline.length).toBeGreaterThan(0);
    expect(d.headline.length).toBeLessThanOrEqual(30);
    expect(d.habits.length).toBeGreaterThan(0);
    expect(d.reactions.length).toBeGreaterThanOrEqual(2);
    expect(new Set(d.reactions.map((r) => r.target)).size).toBe(d.reactions.length);
    expect(d.recommendedFor.length).toBeGreaterThan(0);
  });

  it("경험자 추천 아이는 '경험 필요'로 표시되어 있습니다(필터·신청 제한이 이 값을 씁니다)", () => {
    for (const d of dogs.filter((x) => x.personality.includes("경험자 추천"))) {
      expect(d.match.experience).toBe("experienced");
    }
  });
});

describe("시연 시드", () => {
  const { requests, activityLogs } = buildSeed();

  it("모든 신청은 그 아이가 실제로 산책하는 날·시간입니다(휴무일 방문 없음)", () => {
    for (const r of requests) {
      const dog = getDog(r.dogId)!;
      const shelter = getShelter(dog.shelterId)!;
      expect(isShelterOpen(shelter, r.date)).toBe(true);
      expect(scheduledSlots(dog, shelter, r.date)).toContain(r.time);
    }
  });

  it("기록은 모두 아는 아이에 대한 것입니다", () => {
    for (const l of activityLogs) expect(getDog(l.dogId)).toBeDefined();
  });
});
