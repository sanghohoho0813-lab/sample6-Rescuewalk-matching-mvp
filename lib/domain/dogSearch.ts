import { getShelter } from "@/lib/data/shelters";
import type { Dog } from "@/lib/types";
import { nextOpening, openSlotsOn, openDaysThisWeek, type ScheduleContext } from "./schedule";

/**
 * 강아지 찾기의 필터·정렬 규칙.
 * 화면 상태는 URL 쿼리에 두므로(공유·뒤로가기·새로고침에 강함) 파싱/직렬화를 한 곳에서 다룹니다.
 */

export const REGIONS = ["서울", "인천", "경기", "대전", "부산"] as const;
export const SIZES = ["소형", "중형", "대형"] as const;
export const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
export const TRAITS = ["사람 좋아함", "애교많음", "차분해요", "온순한 성격", "밝고 발랄"] as const;

/**
 * 안전한 매칭에 실제로 영향을 주는 조건 — 성격 태그와 달리 모두 만족해야(AND) 합니다.
 */
export const NEEDS = [
  { key: "beginner", label: "초보 가능", test: (d: Dog) => d.match.experience === "beginner" },
  { key: "gentle", label: "힘이 약한 편", test: (d: Dog) => d.match.pulling === "light" },
  { key: "dogs", label: "다른 강아지 OK", test: (d: Dog) => d.match.dogs === "good" },
  { key: "kids", label: "아이 동반 가능", test: (d: Dog) => d.walkNote.kidFriendly },
] as const;
export type NeedKey = (typeof NEEDS)[number]["key"];

export const WHENS = [
  { key: "today", label: "오늘" },
  { key: "week", label: "이번 주" },
] as const;
export type WhenKey = (typeof WHENS)[number]["key"];

export const SORTS = [
  { key: "recommended", label: "추천순" },
  { key: "soon", label: "빠른 일정 순" },
  { key: "distance", label: "가까운 순" },
  { key: "recent", label: "최근 등록순" },
] as const;
export type SortKey = (typeof SORTS)[number]["key"];
export const DEFAULT_SORT: SortKey = "recommended";

export interface DogFilters {
  region: (typeof REGIONS)[number] | null;
  shelterId: string | null;
  size: (typeof SIZES)[number] | null;
  difficulty: (typeof DIFFICULTIES)[number] | null;
  needs: NeedKey[];
  traits: string[];
  when: WhenKey | null;
}

export const EMPTY_FILTERS: DogFilters = {
  region: null,
  shelterId: null,
  size: null,
  difficulty: null,
  needs: [],
  traits: [],
  when: null,
};

const pick = <T extends string>(v: string | null, allowed: readonly T[]): T | null =>
  v !== null && (allowed as readonly string[]).includes(v) ? (v as T) : null;

const list = (v: string | null) => (v ?? "").split(",").filter(Boolean);

/** 알 수 없는 값은 조용히 버립니다(오래된 링크·직접 고친 주소에도 화면이 깨지지 않게) */
export function parseDogQuery(sp: URLSearchParams): { filters: DogFilters; sort: SortKey } {
  const shelterId = sp.get("shelter");
  const region = pick(sp.get("region"), REGIONS);
  const shelter = shelterId ? getShelter(shelterId) : undefined;
  const legacyTraits = list(sp.get("trait"));
  const needs = new Set(list(sp.get("need")).filter((n): n is NeedKey => NEEDS.some((x) => x.key === n)));
  // 이전 링크의 trait=초보 가능 은 조건(need)으로 옮겨 읽습니다
  if (legacyTraits.includes("초보 가능")) needs.add("beginner");
  const sortRaw = sp.get("sort") === "today" ? "soon" : sp.get("sort");
  return {
    filters: {
      region,
      // 지역과 맞지 않는 보호소 조합은 결과가 항상 0건이므로 보호소 쪽을 버립니다
      shelterId: shelter && (!region || shelter.region === region) ? shelter.id : null,
      size: pick(sp.get("size"), SIZES),
      difficulty: pick(sp.get("level"), DIFFICULTIES),
      needs: NEEDS.map((n) => n.key).filter((k) => needs.has(k)),
      traits: Array.from(new Set(legacyTraits.filter((t) => (TRAITS as readonly string[]).includes(t)))),
      when:
        pick(
          sp.get("when"),
          WHENS.map((w) => w.key)
        ) ?? (sp.get("today") === "1" ? "today" : null),
    },
    sort:
      pick(
        sortRaw,
        SORTS.map((s) => s.key)
      ) ?? DEFAULT_SORT,
  };
}

/** 기본값은 쓰지 않아 주소가 짧게 유지됩니다. 비어 있으면 "" */
export function toDogQuery(f: DogFilters, sort: SortKey): string {
  const q = new URLSearchParams();
  if (f.when) q.set("when", f.when);
  if (f.region) q.set("region", f.region);
  if (f.shelterId) q.set("shelter", f.shelterId);
  if (f.size) q.set("size", f.size);
  if (f.difficulty) q.set("level", f.difficulty);
  if (f.needs.length) q.set("need", f.needs.join(","));
  if (f.traits.length) q.set("trait", f.traits.join(","));
  if (sort !== DEFAULT_SORT) q.set("sort", sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const isResting = (d: Dog) => d.availability === "unavailable";

const shelterFor = (d: Dog) => getShelter(d.shelterId) ?? { closedDays: [] };

/** 오늘 남은 시간 중 신청할 수 있는 시간이 있는가 */
export const canWalkToday = (d: Dog, ctx: ScheduleContext) =>
  openSlotsOn(d, shelterFor(d), ctx.today, ctx).length > 0;

/** 오늘 포함 7일 안에 신청할 수 있는 날이 있는가 */
export const canWalkThisWeek = (d: Dog, ctx: ScheduleContext) => openDaysThisWeek(d, shelterFor(d), ctx) > 0;

/** 다음 가능한 일정 — 정렬과 카드 표시에 공용 */
export const nextOpeningOf = (d: Dog, ctx: ScheduleContext) => nextOpening(d, shelterFor(d), ctx);

/**
 * 조건 사이는 AND, 성격 태그끼리는 OR(하나라도 있으면) 입니다.
 * 성격을 여러 개 고를수록 결과가 0건으로 줄어드는 것보다 '이런 아이들'로 넓혀 보는 쪽이 자연스럽기 때문입니다.
 * 일정 조건(when)은 시각을 알아야 하므로 ctx 가 없으면(서버 렌더) 적용하지 않습니다.
 */
export function matchesFilters(dog: Dog, f: DogFilters, ctx?: ScheduleContext): boolean {
  if (f.region && getShelter(dog.shelterId)?.region !== f.region) return false;
  if (f.shelterId && dog.shelterId !== f.shelterId) return false;
  if (f.size && dog.size !== f.size) return false;
  if (f.difficulty && dog.difficulty !== f.difficulty) return false;
  for (const key of f.needs) {
    const need = NEEDS.find((n) => n.key === key);
    if (need && !need.test(dog)) return false;
  }
  if (f.traits.length > 0 && !f.traits.some((t) => dog.personality.includes(t))) return false;
  if (ctx && f.when === "today" && !canWalkToday(dog, ctx)) return false;
  if (ctx && f.when === "week" && !canWalkThisWeek(dog, ctx)) return false;
  return true;
}

const openingKey = (d: Dog, ctx?: ScheduleContext) => {
  const o = ctx ? nextOpeningOf(d, ctx) : null;
  return o ? `${o.date} ${o.time}` : "~";
};

/** 쉬는 중인 아이는 어떤 정렬에서도 맨 뒤. 원본 배열은 바꾸지 않습니다 */
export function sortDogs(listIn: readonly Dog[], sort: SortKey, ctx?: ScheduleContext): Dog[] {
  const keys = new Map(listIn.map((d) => [d.id, openingKey(d, ctx)]));
  const bySoon = (a: Dog, b: Dog) => keys.get(a.id)!.localeCompare(keys.get(b.id)!);
  const bySort = (a: Dog, b: Dog): number => {
    switch (sort) {
      case "distance":
        return a.distanceKm - b.distanceKm;
      case "soon":
        return bySoon(a, b) || a.distanceKm - b.distanceKm;
      case "recent":
        return b.registeredAt.localeCompare(a.registeredAt);
      default:
        return Number(b.recommended) - Number(a.recommended) || bySoon(a, b) || a.distanceKm - b.distanceKm;
    }
  };
  return [...listIn].sort((a, b) => Number(isResting(a)) - Number(isResting(b)) || bySort(a, b));
}

export function searchDogs(
  listIn: readonly Dog[],
  f: DogFilters,
  sort: SortKey,
  ctx?: ScheduleContext
): Dog[] {
  return sortDogs(
    listIn.filter((d) => matchesFilters(d, f, ctx)),
    sort,
    ctx
  );
}

/** 적용 중인 조건을 '해제 가능한 칩'으로 — 라벨과 그 조건만 푼 필터 */
export function activeFilterChips(f: DogFilters): { key: string; label: string; without: DogFilters }[] {
  const chips: { key: string; label: string; without: DogFilters }[] = [];
  if (f.when)
    chips.push({
      key: "when",
      label: f.when === "today" ? "오늘 산책 가능" : "이번 주 산책 가능",
      without: { ...f, when: null },
    });
  if (f.region)
    chips.push({ key: "region", label: f.region, without: { ...f, region: null, shelterId: null } });
  if (f.shelterId)
    chips.push({
      key: "shelter",
      label: getShelter(f.shelterId)?.name ?? f.shelterId,
      without: { ...f, shelterId: null },
    });
  if (f.size) chips.push({ key: "size", label: `${f.size}견`, without: { ...f, size: null } });
  if (f.difficulty)
    chips.push({ key: "level", label: `산책 ${f.difficulty}`, without: { ...f, difficulty: null } });
  for (const n of f.needs)
    chips.push({
      key: `need:${n}`,
      label: NEEDS.find((x) => x.key === n)?.label ?? n,
      without: { ...f, needs: f.needs.filter((x) => x !== n) },
    });
  for (const t of f.traits)
    chips.push({ key: `trait:${t}`, label: t, without: { ...f, traits: f.traits.filter((x) => x !== t) } });
  return chips;
}
