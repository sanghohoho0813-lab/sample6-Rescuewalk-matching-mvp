"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import DogCard from "@/components/DogCard";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import {
  DIFFICULTIES,
  EMPTY_FILTERS,
  REGIONS,
  SIZES,
  SORTS,
  TRAITS,
  activeFilterChips,
  parseDogQuery,
  searchDogs,
  toDogQuery,
  type DogFilters,
  type SortKey,
} from "@/lib/domain/dogSearch";
import { DOGS_LIST_HREF_KEY, safeSession } from "@/lib/storageKeys";
import { cn } from "@/lib/utils";


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
  filters: DogFilters;
  update: (fn: (f: DogFilters) => DogFilters) => void;
}) {
  // 단일 선택: 같은 값을 다시 누르면 해제
  const toggle = <T,>(current: T | null, value: T) => (current === value ? null : value);
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
            <Chip key={r} active={filters.region === r} onClick={() => update((f) => ({ ...f, region: toggle(f.region, r), shelterId: null }))}>
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
            <Chip key={s} active={filters.size === s} onClick={() => update((f) => ({ ...f, size: toggle(f.size, s) }))}>
              {s}견
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="산책 난이도">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip key={d} active={filters.difficulty === d} onClick={() => update((f) => ({ ...f, difficulty: toggle(f.difficulty, d) }))}>
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
  const { filters, sort } = useMemo(() => parseDogQuery(new URLSearchParams(sp.toString())), [sp]);
  const [sheetOpen, setSheetOpen] = useState(false);

  // URL 만 바꿉니다(서버 왕복 없이). Next 14.1+ 는 history API 변경을 useSearchParams 와 동기화합니다.
  const commit = useCallback((f: DogFilters, s: SortKey) => {
    window.history.replaceState(null, "", `/dogs${toDogQuery(f, s)}`);
  }, []);
  const update = useCallback(
    (fn: (f: DogFilters) => DogFilters) => commit(fn(filters), sort),
    [commit, filters, sort]
  );

  // 상세의 "← 강아지 찾기" 가 이 조건 그대로 돌아올 수 있게 기억
  useEffect(() => {
    safeSession.set(DOGS_LIST_HREF_KEY, `/dogs${toDogQuery(filters, sort)}`);
  }, [filters, sort]);

  const result = useMemo(() => searchDogs(dogs, filters, sort), [filters, sort]);
  const active = activeFilterChips(filters);
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
                  key={a.key}
                  type="button"
                  onClick={() => commit(a.without, sort)}
                  aria-label={`${a.label} 조건 해제`}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full bg-sage-100 pl-3.5 pr-2.5 text-sm font-medium text-sage-800 hover:bg-sage-200"
                >
                  {a.label}
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={() => commit(EMPTY_FILTERS, sort)}
                className="min-h-[36px] px-2 text-sm font-medium text-ink-500 underline-offset-4 hover:text-ink-900 hover:underline"
              >
                모두 해제
              </button>
            </div>
          )}

          <h2 className="sr-only">검색 결과</h2>
          {result.length === 0 ? (
            <EmptyState
              message={"조건에 맞는 아이를 찾지 못했어요.\n조건을 조금만 넓혀볼까요?"}
              ctaLabel="필터 모두 해제"
              onAction={() => commit(EMPTY_FILTERS, sort)}
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
            <button type="button" onClick={() => commit(EMPTY_FILTERS, sort)} className="btn-secondary flex-1">
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
