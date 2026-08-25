"use client";

import { useMemo, useState } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import DogCard from "@/components/DogCard";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import { cn } from "@/lib/utils";
import type { Dog } from "@/lib/types";

const REGIONS = ["서울", "인천", "경기", "대전", "부산"] as const;
const SIZES = ["소형", "중형", "대형"] as const;
const DIFFICULTIES = ["쉬움", "보통", "어려움"] as const;
const PERSONALITY_FILTERS = [
  "사람 좋아함",
  "애교많음",
  "차분해요",
  "온순한 성격",
  "밝고 발랄",
  "초보 가능",
] as const;

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
  personality: string[];
  todayOnly: boolean;
}

const EMPTY_FILTERS: Filters = {
  region: null,
  shelterId: null,
  size: null,
  difficulty: null,
  personality: [],
  todayOnly: false,
};

function matches(dog: Dog, f: Filters): boolean {
  const shelter = shelters.find((s) => s.id === dog.shelterId);
  if (f.region && shelter?.region !== f.region) return false;
  if (f.shelterId && dog.shelterId !== f.shelterId) return false;
  if (f.size && dog.size !== f.size) return false;
  if (f.difficulty && dog.difficulty !== f.difficulty) return false;
  if (f.todayOnly && !(dog.availableToday && dog.availability === "available")) return false;
  if (f.personality.length > 0) {
    const beginner = f.personality.includes("초보 가능");
    const rest = f.personality.filter((p) => p !== "초보 가능");
    if (beginner && !dog.walkNote.beginnerFriendly) return false;
    if (rest.length > 0 && !rest.some((p) => dog.personality.includes(p))) return false;
  }
  return true;
}

function sortDogs(list: Dog[], sort: SortKey): Dog[] {
  const arr = [...list];
  switch (sort) {
    case "distance":
      return arr.sort((a, b) => a.distanceKm - b.distanceKm);
    case "today":
      return arr.sort(
        (a, b) =>
          Number(b.availableToday && b.availability === "available") -
          Number(a.availableToday && a.availability === "available")
      );
    case "recent":
      return arr.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    default:
      return arr.sort(
        (a, b) =>
          Number(b.recommended) - Number(a.recommended) ||
          Number(b.availableToday) - Number(a.availableToday) ||
          a.distanceKm - b.distanceKm
      );
  }
}

function FilterChip({
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
        "min-h-[38px] rounded-full border px-3.5 text-[13px] font-medium transition-all duration-200",
        active
          ? "border-tangerine-500 bg-tangerine-500 text-white shadow-cta"
          : "border-cream-300 bg-white text-ink-500 hover:border-tangerine-300 hover:text-ink-900"
      )}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}) {
  const toggle = <K extends "region" | "shelterId" | "size" | "difficulty">(
    key: K,
    value: string
  ) =>
    setFilters((f) => ({ ...f, [key]: f[key] === value ? null : value }));

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">오늘 가능 여부</h3>
        <FilterChip
          active={filters.todayOnly}
          onClick={() => setFilters((f) => ({ ...f, todayOnly: !f.todayOnly }))}
        >
          ☀️ 오늘 산책 가능한 아이만
        </FilterChip>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">지역</h3>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <FilterChip key={r} active={filters.region === r} onClick={() => toggle("region", r)}>
              {r}
            </FilterChip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">보호소</h3>
        <div className="flex flex-wrap gap-2">
          {shelters.map((s) => (
            <FilterChip
              key={s.id}
              active={filters.shelterId === s.id}
              onClick={() => toggle("shelterId", s.id)}
            >
              {s.name}
            </FilterChip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">크기</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <FilterChip key={s} active={filters.size === s} onClick={() => toggle("size", s)}>
              {s}견
            </FilterChip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">산책 난이도</h3>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <FilterChip
              key={d}
              active={filters.difficulty === d}
              onClick={() => toggle("difficulty", d)}
            >
              {d}
            </FilterChip>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2.5 text-sm font-bold text-ink-700">성격</h3>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_FILTERS.map((p) => (
            <FilterChip
              key={p}
              active={filters.personality.includes(p)}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  personality: f.personality.includes(p)
                    ? f.personality.filter((x) => x !== p)
                    : [...f.personality, p],
                }))
              }
            >
              {p}
            </FilterChip>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function DogsPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("recommended");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCount =
    (filters.region ? 1 : 0) +
    (filters.shelterId ? 1 : 0) +
    (filters.size ? 1 : 0) +
    (filters.difficulty ? 1 : 0) +
    filters.personality.length +
    (filters.todayOnly ? 1 : 0);

  const result = useMemo(
    () => sortDogs(dogs.filter((d) => matches(d, filters)), sort),
    [filters, sort]
  );

  return (
    <div className="container-app py-8 md:py-10">
      <header className="mb-6">
        <p className="section-label">산책을 기다리는 아이들이 있어요</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          강아지 찾기
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          총 <strong className="text-tangerine-600">{result.length}마리</strong>의 아이들이
          산책 친구를 기다리고 있어요.
        </p>
      </header>

      {/* 모바일: 필터 버튼 + 정렬 */}
      <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="btn-secondary text-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          필터
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tangerine-500 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="정렬"
          className="min-h-[44px] rounded-full border border-cream-300 bg-white px-4 text-sm font-medium text-ink-700 focus:border-tangerine-400 focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-8">
        {/* PC 필터 사이드바 */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="card sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-ink-900">필터</h2>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="flex items-center gap-1 text-xs font-semibold text-ink-400 hover:text-tangerine-600"
                >
                  <RotateCcw className="h-3 w-3" /> 초기화
                </button>
              )}
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* PC 정렬 탭 */}
          <div className="mb-5 hidden items-center gap-2 lg:flex">
            {SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSort(s.key)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200",
                  sort === s.key
                    ? "bg-sage-600 text-white"
                    : "bg-white text-ink-500 hover:bg-cream-200"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          {result.length === 0 ? (
            <EmptyState
              message={"조건에 맞는 아이를 찾지 못했어요.\n필터를 조금만 넓혀볼까요?"}
              ctaLabel="필터 초기화"
              ctaHref="/dogs"
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.map((dog) => (
                <DogCard key={dog.id} dog={dog} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 모바일 필터 드로어 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="필터">
          <button
            type="button"
            aria-label="필터 닫기"
            className="absolute inset-0 animate-fade-in bg-ink-900/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] animate-slide-up overflow-y-auto rounded-t-[24px] bg-cream-50 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-cream-300" />
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink-900">필터</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="닫기"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-cream-200"
              >
                <X className="h-5 w-5 text-ink-500" />
              </button>
            </div>
            <FilterPanel filters={filters} setFilters={setFilters} />
            <div className="sticky bottom-0 mt-6 flex gap-3 bg-cream-50 pt-3">
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="btn-secondary flex-1"
              >
                초기화
              </button>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="btn-primary flex-[2]"
              >
                {result.length}마리 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
