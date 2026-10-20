import { describe, expect, it } from "vitest";
import { dogs } from "@/lib/data/dogs";
import {
  EMPTY_FILTERS,
  SORTS,
  activeFilterChips,
  canWalkThisWeek,
  canWalkToday,
  isResting,
  QUERY_MAX,
  matchesFilters,
  matchesQuery,
  nextOpeningOf,
  parseDogQuery,
  searchDogs,
  sortDogs,
  toDogQuery,
  type DogFilters,
} from "./dogSearch";

const parse = (q: string) => parseDogQuery(new URLSearchParams(q));
// 2026-10-13(화) 오전 9시 기준
const ctx = { now: new Date(2026, 9, 13, 9, 0), today: "2026-10-13" };

describe("URL 쿼리 ↔ 필터", () => {
  it("기본값은 빈 쿼리", () => {
    expect(toDogQuery(EMPTY_FILTERS, "recommended")).toBe("");
    expect(parse("")).toEqual({ filters: EMPTY_FILTERS, sort: "recommended" });
  });

  it("직렬화한 쿼리를 다시 읽으면 같은 조건", () => {
    const f: DogFilters = {
      q: "보리",
      region: "서울",
      shelterId: "sh-happy",
      size: "중형",
      difficulty: "쉬움",
      needs: ["beginner", "dogs"],
      traits: ["애교많음"],
      when: "week",
    };
    expect(parse(toDogQuery(f, "soon"))).toEqual({ filters: f, sort: "soon" });
  });

  it("알 수 없는 값은 버립니다", () => {
    const { filters, sort } = parse(
      "region=제주&size=거대&level=x&trait=날개,애교많음&need=fly&shelter=nope&sort=price&when=year"
    );
    expect(filters).toEqual({ ...EMPTY_FILTERS, traits: ["애교많음"] });
    expect(sort).toBe("recommended");
  });

  it("이전 주소 형식도 읽습니다(today=1, trait=초보 가능, sort=today)", () => {
    expect(parse("today=1&trait=초보 가능&sort=today")).toEqual({
      filters: { ...EMPTY_FILTERS, when: "today", needs: ["beginner"] },
      sort: "soon",
    });
  });

  it("검색어는 앞뒤 공백을 지우고 길이를 제한합니다", () => {
    expect(parse("q=%20%20보리%20").filters.q).toBe("보리");
    expect(parse(`q=${"가".repeat(50)}`).filters.q).toHaveLength(QUERY_MAX);
    expect(toDogQuery({ ...EMPTY_FILTERS, q: "보리" }, "recommended")).toBe("?q=%EB%B3%B4%EB%A6%AC");
  });

  it("지역과 맞지 않는 보호소는 버립니다(항상 0건이 되는 조합)", () => {
    expect(parse("region=부산&shelter=sh-happy").filters.shelterId).toBeNull();
    expect(parse("region=서울&shelter=sh-happy").filters.shelterId).toBe("sh-happy");
  });
});

describe("필터 규칙", () => {
  it("'오늘' = 오늘 남은 시간에 신청할 수 있는 아이", () => {
    const result = searchDogs(dogs, { ...EMPTY_FILTERS, when: "today" }, "recommended", ctx);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((d) => canWalkToday(d, ctx))).toBe(true);
    // 저녁에는 오늘 가능한 아이가 없고, 이번 주로 넓히면 있습니다
    const evening = { now: new Date(2026, 9, 13, 20, 0), today: "2026-10-13" };
    expect(searchDogs(dogs, { ...EMPTY_FILTERS, when: "today" }, "recommended", evening)).toHaveLength(0);
    expect(
      searchDogs(dogs, { ...EMPTY_FILTERS, when: "week" }, "recommended", evening).length
    ).toBeGreaterThan(0);
  });

  it("'이번 주'는 '오늘'보다 넓습니다", () => {
    const today = searchDogs(dogs, { ...EMPTY_FILTERS, when: "today" }, "recommended", ctx);
    const week = searchDogs(dogs, { ...EMPTY_FILTERS, when: "week" }, "recommended", ctx);
    expect(week.length).toBeGreaterThanOrEqual(today.length);
    expect(week.every((d) => canWalkThisWeek(d, ctx))).toBe(true);
  });

  it("일정 조건은 시각을 모르면(서버 렌더) 적용하지 않습니다", () => {
    expect(searchDogs(dogs, { ...EMPTY_FILTERS, when: "today" }, "recommended")).toHaveLength(dogs.length);
  });

  it("'초보 가능'·'힘이 약한 편'은 매칭 정보로 판정하고 모두 만족해야 합니다", () => {
    const r = searchDogs(dogs, { ...EMPTY_FILTERS, needs: ["beginner", "gentle"] }, "recommended");
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((d) => d.match.experience === "beginner" && d.match.pulling === "light")).toBe(true);
  });

  it("성격 태그끼리는 OR", () => {
    const a = searchDogs(dogs, { ...EMPTY_FILTERS, traits: ["애교많음"] }, "recommended");
    const ab = searchDogs(dogs, { ...EMPTY_FILTERS, traits: ["애교많음", "차분해요"] }, "recommended");
    expect(ab.length).toBeGreaterThanOrEqual(a.length);
    expect(ab.every((d) => d.personality.includes("애교많음") || d.personality.includes("차분해요"))).toBe(
      true
    );
  });

  it("조건 사이는 AND", () => {
    const f = { ...EMPTY_FILTERS, region: "서울" as const, size: "소형" as const };
    for (const d of dogs) {
      expect(matchesFilters(d, f)).toBe(
        matchesFilters(d, { ...EMPTY_FILTERS, region: "서울" }) &&
          matchesFilters(d, { ...EMPTY_FILTERS, size: "소형" })
      );
    }
  });
});

describe("검색", () => {
  const names = (q: string) => searchDogs(dogs, { ...EMPTY_FILTERS, q }, "recommended").map((d) => d.name);

  it("이름으로 찾습니다", () => {
    expect(names("보리")).toEqual(["보리"]);
  });

  it("품종·보호소·지역으로도 찾고, 띄어쓰기·대소문자는 무시합니다", () => {
    expect(names("허스키")).toContain("장군");
    expect(names("허 스키")).toContain("장군");
    const happy = dogs
      .filter((d) => d.shelterId === "sh-happy")
      .map((d) => d.name)
      .sort();
    expect(names("행복한쉼터").sort()).toEqual(happy);
    expect(names("강서구").sort()).toEqual(happy);
  });

  it("다른 조건과 함께 쓰면 모두 만족해야 합니다(AND)", () => {
    const f = { ...EMPTY_FILTERS, q: "행복한 쉼터", size: "중형" as const };
    for (const d of searchDogs(dogs, f, "recommended")) {
      expect(matchesQuery(d, "행복한 쉼터") && d.size === "중형").toBe(true);
    }
  });

  it("없는 이름은 0건, 빈 검색어는 모두", () => {
    expect(names("고양이")).toEqual([]);
    expect(names("   ")).toHaveLength(dogs.length);
  });

  it("검색어도 해제 가능한 칩이 됩니다", () => {
    const chips = activeFilterChips({ ...EMPTY_FILTERS, q: "보리", region: "서울" });
    expect(chips.map((c) => c.key)).toEqual(["q", "region"]);
    expect(chips[0].without).toEqual({ ...EMPTY_FILTERS, region: "서울" });
  });
});

describe("정렬", () => {
  it.each(SORTS.map((s) => s.key))("%s — 쉬는 중인 아이는 항상 맨 뒤", (sort) => {
    const sorted = sortDogs(dogs, sort, ctx);
    const firstResting = sorted.findIndex(isResting);
    expect(firstResting).toBeGreaterThan(-1);
    expect(sorted.slice(firstResting).every(isResting)).toBe(true);
  });

  it("빠른 일정 순은 다음 가능한 일정 오름차순", () => {
    const keys = sortDogs(dogs, "soon", ctx)
      .filter((d) => !isResting(d))
      .map((d) => {
        const o = nextOpeningOf(d, ctx);
        return o ? `${o.date} ${o.time}` : "~";
      });
    expect(keys).toEqual([...keys].sort());
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
    const f: DogFilters = {
      ...EMPTY_FILTERS,
      when: "today",
      size: "대형",
      needs: ["gentle"],
      traits: ["애교많음"],
    };
    expect(activeFilterChips(f).map((c) => c.label)).toEqual([
      "오늘 산책 가능",
      "대형견",
      "힘이 약한 편",
      "애교많음",
    ]);
  });
});
