import { describe, expect, it } from "vitest";
import { dogs } from "@/lib/data/dogs";
import {
  EMPTY_FILTERS,
  SORTS,
  activeFilterChips,
  isResting,
  isWalkableToday,
  matchesFilters,
  parseDogQuery,
  searchDogs,
  sortDogs,
  toDogQuery,
  type DogFilters,
} from "./dogSearch";

const parse = (q: string) => parseDogQuery(new URLSearchParams(q));

describe("URL 쿼리 ↔ 필터", () => {
  it("기본값은 빈 쿼리", () => {
    expect(toDogQuery(EMPTY_FILTERS, "recommended")).toBe("");
    expect(parse("")).toEqual({ filters: EMPTY_FILTERS, sort: "recommended" });
  });

  it("직렬화한 쿼리를 다시 읽으면 같은 조건", () => {
    const f: DogFilters = {
      region: "서울",
      shelterId: "sh-happy",
      size: "중형",
      difficulty: "쉬움",
      traits: ["초보 가능", "애교많음"],
      todayOnly: true,
    };
    expect(parse(toDogQuery(f, "distance"))).toEqual({ filters: f, sort: "distance" });
  });

  it("알 수 없는 값은 버립니다", () => {
    const { filters, sort } = parse("region=제주&size=거대&level=x&trait=날개,애교많음&shelter=nope&sort=price");
    expect(filters).toEqual({ ...EMPTY_FILTERS, traits: ["애교많음"] });
    expect(sort).toBe("recommended");
  });

  it("지역과 맞지 않는 보호소는 버립니다(항상 0건이 되는 조합)", () => {
    expect(parse("region=부산&shelter=sh-happy").filters.shelterId).toBeNull();
    expect(parse("region=서울&shelter=sh-happy").filters.shelterId).toBe("sh-happy");
  });

  it("중복 성격 태그는 하나로", () => {
    expect(parse("trait=애교많음,애교많음").filters.traits).toEqual(["애교많음"]);
  });
});

describe("필터 규칙", () => {
  it("오늘 가능 = 오늘 일정이 있고 쉬는 중이 아님", () => {
    const result = searchDogs(dogs, { ...EMPTY_FILTERS, todayOnly: true }, "recommended");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(isWalkableToday)).toBe(true);
  });

  it("'초보 가능'은 성격 태그가 아니라 초보 적합 여부로 판정", () => {
    const result = searchDogs(dogs, { ...EMPTY_FILTERS, traits: ["초보 가능"] }, "recommended");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((d) => d.walkNote.beginnerFriendly)).toBe(true);
  });

  it("성격 태그끼리는 OR", () => {
    const a = searchDogs(dogs, { ...EMPTY_FILTERS, traits: ["애교많음"] }, "recommended");
    const ab = searchDogs(dogs, { ...EMPTY_FILTERS, traits: ["애교많음", "차분해요"] }, "recommended");
    expect(ab.length).toBeGreaterThanOrEqual(a.length);
    expect(ab.every((d) => d.personality.includes("애교많음") || d.personality.includes("차분해요"))).toBe(true);
  });

  it("조건 사이는 AND", () => {
    const f = { ...EMPTY_FILTERS, region: "서울" as const, size: "소형" as const };
    for (const d of dogs) {
      const both = matchesFilters(d, f);
      expect(both).toBe(
        matchesFilters(d, { ...EMPTY_FILTERS, region: "서울" }) && matchesFilters(d, { ...EMPTY_FILTERS, size: "소형" })
      );
    }
  });
});

describe("정렬", () => {
  it.each(SORTS.map((s) => s.key))("%s — 쉬는 중인 아이는 항상 맨 뒤", (sort) => {
    const sorted = sortDogs(dogs, sort);
    const firstResting = sorted.findIndex(isResting);
    expect(firstResting).toBeGreaterThan(-1);
    expect(sorted.slice(firstResting).every(isResting)).toBe(true);
  });

  it("가까운 순은 거리 오름차순(쉬는 아이 제외 구간)", () => {
    const active = sortDogs(dogs, "distance").filter((d) => !isResting(d));
    expect(active.map((d) => d.distanceKm)).toEqual([...active.map((d) => d.distanceKm)].sort((a, b) => a - b));
  });

  it("원본 배열을 바꾸지 않습니다", () => {
    const before = dogs.map((d) => d.id);
    sortDogs(dogs, "recent");
    expect(dogs.map((d) => d.id)).toEqual(before);
  });
});

describe("적용 조건 칩", () => {
  it("지역 칩을 지우면 그 지역 보호소 선택도 함께 풀립니다", () => {
    const f: DogFilters = { ...EMPTY_FILTERS, region: "서울", shelterId: "sh-happy", traits: ["애교많음"] };
    const region = activeFilterChips(f).find((c) => c.key === "region")!;
    expect(region.without).toEqual({ ...f, region: null, shelterId: null });
  });

  it("조건 수만큼 칩", () => {
    const f: DogFilters = { ...EMPTY_FILTERS, todayOnly: true, size: "대형", traits: ["애교많음", "차분해요"] };
    expect(activeFilterChips(f).map((c) => c.label)).toEqual(["오늘 산책 가능", "대형견", "애교많음", "차분해요"]);
  });
});
