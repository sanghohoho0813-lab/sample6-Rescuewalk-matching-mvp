import { getShelter } from "@/lib/data/shelters";
import type { Dog } from "@/lib/types";

/**
 * 강아지 찾기의 필터·정렬 규칙.
 * 화면 상태는 URL 쿼리에 두므로(공유·뒤로가기·새로고침에 강함) 파싱/직렬화를 한 곳에서 다룹니다.
 */

export const REGIONS = ["서울", "인천", "경기", "대전", "부산"] as const;
export const SIZES = ["소형", "중형", "대형"] as const;
export const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
/** '초보 가능'은 성격 태그가 아니라 walkNote.beginnerFriendly 로 판정합니다 */
export const BEGINNER_TRAIT = "초보 가능";
export const TRAITS = [
  BEGINNER_TRAIT,
  "사람 좋아함",
  "애교많음",
  "차분해요",
  "온순한 성격",
  "밝고 발랄",
] as const;

export const SORTS = [
  { key: "recommended", label: "추천순" },
  { key: "distance", label: "가까운 순" },
  { key: "today", label: "오늘 가능한 순" },
  { key: "recent", label: "최근 등록순" },
] as const;
export type SortKey = (typeof SORTS)[number]["key"];
export const DEFAULT_SORT: SortKey = "recommended";

export interface DogFilters {
  region: (typeof REGIONS)[number] | null;
  shelterId: string | null;
  size: (typeof SIZES)[number] | null;
  difficulty: (typeof DIFFICULTIES)[number] | null;
  traits: string[];
  todayOnly: boolean;
}

export const EMPTY_FILTERS: DogFilters = {
  region: null,
  shelterId: null,
  size: null,
  difficulty: null,
  traits: [],
  todayOnly: false,
};

const pick = <T extends string>(v: string | null, allowed: readonly T[]): T | null =>
  v !== null && (allowed as readonly string[]).includes(v) ? (v as T) : null;

/** 알 수 없는 값은 조용히 버립니다(오래된 링크·직접 고친 주소에도 화면이 깨지지 않게) */
export function parseDogQuery(sp: URLSearchParams): { filters: DogFilters; sort: SortKey } {
  const shelterId = sp.get("shelter");
  const region = pick(sp.get("region"), REGIONS);
  const shelter = shelterId ? getShelter(shelterId) : undefined;
  return {
    filters: {
      region,
      // 지역과 맞지 않는 보호소 조합은 결과가 항상 0건이므로 보호소 쪽을 버립니다
      shelterId: shelter && (!region || shelter.region === region) ? shelter.id : null,
      size: pick(sp.get("size"), SIZES),
      difficulty: pick(sp.get("level"), DIFFICULTIES),
      traits: Array.from(
        new Set((sp.get("trait") ?? "").split(",").filter((t) => (TRAITS as readonly string[]).includes(t)))
      ),
      todayOnly: sp.get("today") === "1",
    },
    sort:
      pick(
        sp.get("sort"),
        SORTS.map((s) => s.key)
      ) ?? DEFAULT_SORT,
  };
}

/** 기본값은 쓰지 않아 주소가 짧게 유지됩니다. 비어 있으면 "" */
export function toDogQuery(f: DogFilters, sort: SortKey): string {
  const q = new URLSearchParams();
  if (f.todayOnly) q.set("today", "1");
  if (f.region) q.set("region", f.region);
  if (f.shelterId) q.set("shelter", f.shelterId);
  if (f.size) q.set("size", f.size);
  if (f.difficulty) q.set("level", f.difficulty);
  if (f.traits.length) q.set("trait", f.traits.join(","));
  if (sort !== DEFAULT_SORT) q.set("sort", sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const isWalkableToday = (d: Dog) => d.availableToday && d.availability === "available";
export const isResting = (d: Dog) => d.availability === "unavailable";

/**
 * 조건 사이는 AND, 성격 태그끼리는 OR(하나라도 있으면) 입니다.
 * 성격을 여러 개 고를수록 결과가 0건으로 줄어드는 것보다 '이런 아이들'로 넓혀 보는 쪽이 자연스럽기 때문입니다.
 */
export function matchesFilters(dog: Dog, f: DogFilters): boolean {
  if (f.region && getShelter(dog.shelterId)?.region !== f.region) return false;
  if (f.shelterId && dog.shelterId !== f.shelterId) return false;
  if (f.size && dog.size !== f.size) return false;
  if (f.difficulty && dog.difficulty !== f.difficulty) return false;
  if (f.todayOnly && !isWalkableToday(dog)) return false;
  if (f.traits.includes(BEGINNER_TRAIT) && !dog.walkNote.beginnerFriendly) return false;
  const tags = f.traits.filter((t) => t !== BEGINNER_TRAIT);
  if (tags.length > 0 && !tags.some((t) => dog.personality.includes(t))) return false;
  return true;
}

/** 쉬는 중인 아이는 어떤 정렬에서도 맨 뒤. 원본 배열은 바꾸지 않습니다 */
export function sortDogs(list: readonly Dog[], sort: SortKey): Dog[] {
  const bySort = (a: Dog, b: Dog): number => {
    switch (sort) {
      case "distance":
        return a.distanceKm - b.distanceKm;
      case "today":
        return Number(isWalkableToday(b)) - Number(isWalkableToday(a)) || a.distanceKm - b.distanceKm;
      case "recent":
        return b.registeredAt.localeCompare(a.registeredAt);
      default:
        return (
          Number(b.recommended) - Number(a.recommended) ||
          Number(isWalkableToday(b)) - Number(isWalkableToday(a)) ||
          a.distanceKm - b.distanceKm
        );
    }
  };
  return [...list].sort((a, b) => Number(isResting(a)) - Number(isResting(b)) || bySort(a, b));
}

export function searchDogs(list: readonly Dog[], f: DogFilters, sort: SortKey): Dog[] {
  return sortDogs(
    list.filter((d) => matchesFilters(d, f)),
    sort
  );
}

/** 적용 중인 조건을 '해제 가능한 칩'으로 — 라벨과 그 조건만 푼 필터 */
export function activeFilterChips(f: DogFilters): { key: string; label: string; without: DogFilters }[] {
  const chips: { key: string; label: string; without: DogFilters }[] = [];
  if (f.todayOnly) chips.push({ key: "today", label: "오늘 산책 가능", without: { ...f, todayOnly: false } });
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
  for (const t of f.traits)
    chips.push({ key: `trait:${t}`, label: t, without: { ...f, traits: f.traits.filter((x) => x !== t) } });
  return chips;
}
