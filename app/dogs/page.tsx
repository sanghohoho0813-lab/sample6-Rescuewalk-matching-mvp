"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import DogCard from "@/components/DogCard";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { shelters, getShelter } from "@/lib/data/shelters";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

const REGIONS = ["서울", "인천", "경기", "대전", "부산"] as const;
const SIZES = ["소형", "중형", "대형"] as const;
const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
const TRAITS = ["초보 가능", "사람 좋아함", "애교많음", "차분해요", "온순한 성격", "밝고 발랄"] as const;

const SORTS = [
  { key: "recommended", label: "추천순" },
  { key: "distance", label: "가까운 순" },
  { key: "today", label: "오늘 가능한 순" },
  { key: "recent", label: "최근 등록순" },
] as const;
type SortKey = (typeof SORTS)[number]["key"];

interface Filters {
  region: string | null;
  shelterId: string | null;
  size: string | null;
  difficulty: string | null;
  traits: string[];
  todayOnly: boolean;
}

const EMPTY: Filters = {
  region: null,
  shelterId: null,
  size: null,
  difficulty: null,
  traits: [],
  todayOnly: false,
};

/**
 * 필터·정렬은 URL 에 둡니다.
 * - 상세로 갔다가 뒤로 오면 같은 조건 그대로
 * - 홈의 "오늘 가능한 N마리 모두 보기" 처럼 조건이 걸린 링크로 바로 열 수 있음
 */
function readParams(sp: URLSearchParams): { filters: Filters; sort: SortKey } {
  const pick = <T extends string>(v: string | null, allowed: readonly T[]) =>
    v && (allowed as readonly string[]).includes(v) ? (v as T) : null;
  const shelterId = sp.get("shelter");
  return {
    filters: {
      region: pick(sp.get("region"), REGIONS),
      shelterId: shelterId && getShelter(shelterId) ? shelterId : null,
      size: pick(sp.get("size"), SIZES),
      difficulty: pick(sp.get("level"), DIFFICULTIES),
      traits: (sp.get("trait") ?? "").split(",").filter((t) => (TRAITS as readonly string[]).includes(t)),
      todayOnly: sp.get("today") === "1",
    },
    sort:
      pick(
        sp.get("sort"),
        SORTS.map((s) => s.key)
      ) ?? "recommended",
  };
}

function toQuery(f: Filters, sort: SortKey): string {
  const q = new URLSearchParams();
  if (f.todayOnly) q.set("today", "1");
  if (f.region) q.set("region", f.region);
  if (f.shelterId) q.set("shelter", f.shelterId);
  if (f.size) q.set("size", f.size);
  if (f.difficulty) q.set("level", f.difficulty);
  if (f.traits.length) q.set("trait", f.traits.join(","));
  if (sort !== "recommended") q.set("sort", sort);
  const s = q.toString();
  return s ? `?${s}` : "";
}

const isWalkableToday = (d: Dog) => d.availableToday && d.availability === "available";

function matches(dog: Dog, f: Filters): boolean {
  const shelter = getShelter(dog.shelterId);
  if (f.region && shelter?.region !== f.region) return false;
  if (f.shelterId && dog.shelterId !== f.shelterId) return false;
  if (f.size && dog.size !== f.size) return false;
  if (f.difficulty && dog.difficulty !== f.difficulty) return false;
  if (f.todayOnly && !isWalkableToday(dog)) return false;
  if (f.traits.length > 0) {
    const beginner = f.traits.includes("초보 가능");
    const rest = f.traits.filter((t) => t !== "초보 가능");
    if (beginner && !dog.walkNote.beginnerFriendly) return false;
    if (rest.length > 0 && !rest.some((t) => dog.personality.includes(t))) return false;
  }
  return true;
}

function sortDogs(list: Dog[], sort: SortKey): Dog[] {
  const bySort = (a: Dog, b: Dog) => {
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
  // 지금 신청할 수 없는(쉬는 중) 아이는 어떤 정렬에서도 맨 뒤로
  const resting = (d: Dog) => Number(d.availability === "unavailable");
  return [...list].sort((a, b) => resting(a) - resting(b) || bySort(a, b));
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-[40px] rounded-full border px-4 text-[15px] transition-colors duration-150",
        active
          ? "border-sage-600 bg-sage-600 font-semibold text-white"
          : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[15px] font-semibold text-ink-900">{title}</legend>
      {children}
    </fieldset>
  );
}

function FilterPanel({
  filters,
  update,
}: {
  filters: Filters;
  update: (fn: (f: Filters) => Filters) => void;
}) {
  const one = (key: "region" | "size" | "difficulty", value: string) =>
    update((f) => ({
      ...f,
      [key]: f[key] === value ? null : value,
      // 지역이 바뀌면 다른 지역의 보호소 선택은 풀어줍니다
      ...(key === "region" ? { shelterId: null } : {}),
    }));
  const shelterOptions = filters.region ? shelters.filter((s) => s.region === filters.region) : shelters;

  return (
    <div className="space-y-7">
      <FilterGroup title="날짜">
        <Chip active={filters.todayOnly} onClick={() => update((f) => ({ ...f, todayOnly: !f.todayOnly }))}>
          오늘 산책 가능
        </Chip>
      </FilterGroup>

      <FilterGroup title="지역 · 보호소">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Chip key={r} active={filters.region === r} onClick={() => one("region", r)}>
              {r}
            </Chip>
          ))}
        </div>
        <label className="relative mt-3 block">
          <span className="sr-only">보호소</span>
          <select
            value={filters.shelterId ?? ""}
            onChange={(e) => update((f) => ({ ...f, shelterId: e.target.value || null }))}
            className="input-field cursor-pointer appearance-none pr-11"
          >
            <option value="">{filters.region ? `${filters.region}의 모든 보호소` : "모든 보호소"}</option>
            {shelterOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          />
        </label>
      </FilterGroup>

      <FilterGroup title="크기">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <Chip key={s} active={filters.size === s} onClick={() => one("size", s)}>
              {s}견
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="산책 난이도">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} active={filters.difficulty === d} onClick={() => one("difficulty", d)}>
              {d}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="성격">
        <div className="flex flex-wrap gap-2">
          {TRAITS.map((t) => (
            <Chip
              key={t}
              active={filters.traits.includes(t)}
              onClick={() =>
                update((f) => ({
                  ...f,
                  traits: f.traits.includes(t) ? f.traits.filter((x) => x !== t) : [...f.traits, t],
                }))
              }
            >
              {t}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

function DogsBrowser() {
  const sp = useSearchParams();
  const { filters, sort } = useMemo(() => readParams(new URLSearchParams(sp.toString())), [sp]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL 만 바꿉니다(서버 왕복 없이). Next 14.1+ 는 history API 변경을 useSearchParams 와 동기화합니다.
  const commit = useCallback((f: Filters, s: SortKey) => {
    window.history.replaceState(null, "", `/dogs${toQuery(f, s)}`);
  }, []);
  const update = useCallback(
    (fn: (f: Filters) => Filters) => commit(fn(filters), sort),
    [commit, filters, sort]
  );

  // 상세의 "← 강아지 찾기" 가 이 조건 그대로 돌아올 수 있게 기억
  useEffect(() => {
    try {
      sessionStorage.setItem("rw:dogsHref", `/dogs${toQuery(filters, sort)}`);
    } catch {
      /* 저장소가 막혀 있으면 기본 목록으로 돌아감 */
    }
  }, [filters, sort]);

  const result = useMemo(
    () =>
      sortDogs(
        dogs.filter((d) => matches(d, filters)),
        sort
      ),
    [filters, sort]
  );

  const active: { label: string; clear: (f: Filters) => Filters }[] = [
    ...(filters.todayOnly
      ? [{ label: "오늘 산책 가능", clear: (f: Filters) => ({ ...f, todayOnly: false }) }]
      : []),
    ...(filters.region
      ? [{ label: filters.region, clear: (f: Filters) => ({ ...f, region: null, shelterId: null }) }]
      : []),
    ...(filters.shelterId
      ? [
          {
            label: getShelter(filters.shelterId)?.name ?? "",
            clear: (f: Filters) => ({ ...f, shelterId: null }),
          },
        ]
      : []),
    ...(filters.size ? [{ label: `${filters.size}견`, clear: (f: Filters) => ({ ...f, size: null }) }] : []),
    ...(filters.difficulty
      ? [{ label: `산책 ${filters.difficulty}`, clear: (f: Filters) => ({ ...f, difficulty: null }) }]
      : []),
    ...filters.traits.map((t) => ({
      label: t,
      clear: (f: Filters) => ({ ...f, traits: f.traits.filter((x) => x !== t) }),
    })),
  ];
  // 모바일 상단의 '오늘 가능' 빠른 토글과 별개로, 시트 안에서만 바꿀 수 있는 조건 수
  const sheetCount = active.length - (filters.todayOnly ? 1 : 0);

  return (
    <div className="container-app py-8 md:py-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h1 className="page-title">강아지 찾기</h1>
          <p className="mt-1.5 text-[15px] text-ink-500" aria-live="polite">
            {active.length > 0 ? "조건에 맞는 아이 " : "산책 친구를 기다리는 아이 "}
            <strong className="tnum font-semibold text-ink-900">{result.length}마리</strong>
          </p>
        </div>
        <label className="hidden items-center gap-2 text-[15px] text-ink-500 lg:flex">
          정렬
          <select
            value={sort}
            onChange={(e) => commit(filters, e.target.value as SortKey)}
            className="min-h-[44px] rounded-full border border-cream-300 bg-white px-4 text-[15px] font-medium text-ink-900 focus:border-sage-400 focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      {/* 모바일 · 태블릿 */}
      <div className="mb-5 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="btn-secondary shrink-0 whitespace-nowrap !px-4"
        >
          <SlidersHorizontal className="h-4 w-4" />
          필터
          {sheetCount > 0 && (
            <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-xs font-bold text-white">
              {sheetCount}
            </span>
          )}
        </button>
        <button
          type="button"
          aria-pressed={filters.todayOnly}
          onClick={() => update((f) => ({ ...f, todayOnly: !f.todayOnly }))}
          className={cn(
            "btn shrink-0 whitespace-nowrap border !px-4",
            filters.todayOnly
              ? "border-sage-600 bg-sage-600 text-white"
              : "border-cream-300 bg-white text-ink-700"
          )}
        >
          오늘 가능
        </button>
        <span className="flex-1" />
        <select
          value={sort}
          onChange={(e) => commit(filters, e.target.value as SortKey)}
          aria-label="정렬"
          className="min-h-[44px] min-w-0 rounded-full border border-cream-300 bg-white px-3 text-[15px] font-medium text-ink-700 focus:border-sage-400 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-56 shrink-0 lg:block" aria-label="필터">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pr-1">
            <FilterPanel filters={filters} update={update} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {active.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {active.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => update(a.clear)}
                  aria-label={`${a.label} 조건 해제`}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-sage-100 pl-3.5 pr-2.5 text-sm font-medium text-sage-800 hover:bg-sage-200"
                >
                  {a.label}
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={() => commit(EMPTY, sort)}
                className="min-h-[36px] px-2 text-sm font-medium text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
              >
                모두 해제
              </button>
            </div>
          )}

          {result.length === 0 ? (
            <EmptyState
              message={"조건에 맞는 아이를 찾지 못했어요.\n조건을 조금만 넓혀볼까요?"}
              ctaLabel="필터 모두 해제"
              onAction={() => commit(EMPTY, sort)}
            />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {result.map((dog, i) => (
                <DogCard key={dog.id} dog={dog} priority={i < 2} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="필터"
        footer={
          <>
            <button type="button" onClick={() => commit(EMPTY, sort)} className="btn-secondary flex-1">
              모두 해제
            </button>
            <button type="button" onClick={() => setSheetOpen(false)} className="btn-primary flex-[2]">
              <span className="tnum">{result.length}마리 보기</span>
            </button>
          </>
        }
      >
        <FilterPanel filters={filters} update={update} />
      </Dialog>
    </div>
  );
}

export default function DogsPage() {
  return (
    <Suspense
      fallback={
        <div className="container-app py-10">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-cream-200" />
        </div>
      }
    >
      <DogsBrowser />
    </Suspense>
  );
}
