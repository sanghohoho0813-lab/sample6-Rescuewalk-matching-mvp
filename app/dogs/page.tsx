"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import DogCard from "@/components/DogCard";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import {
  DIFFICULTIES,
  EMPTY_FILTERS,
  NEEDS,
  QUERY_MAX,
  REGIONS,
  SIZES,
  SORTS,
  TRAITS,
  WHENS,
  type NeedKey,
  activeFilterChips,
  parseDogQuery,
  searchDogs,
  toDogQuery,
  type DogFilters,
  type SortKey,
} from "@/lib/domain/dogSearch";
import { DOGS_LIST_HREF_KEY, safeSession } from "@/lib/storageKeys";
import { useClock } from "@/lib/useClock";
import { cn } from "@/lib/utils";

const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
/** 모바일 상단에서 바로 누르는 조건 — 시트를 열지 않아도 가장 많이 쓰는 것 */
const QUICK_NEEDS: NeedKey[] = ["beginner", "gentle"];

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

function QuickChip({
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
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "btn shrink-0 whitespace-nowrap border !px-4",
        active ? "border-sage-600 bg-sage-600 text-white" : "border-cream-300 bg-white text-ink-700"
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-[15px] font-semibold text-ink-900">{title}</legend>
      {hint && <p className="-mt-1.5 mb-2.5 text-[13px] text-ink-500">{hint}</p>}
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
      <FilterGroup title="언제 걸을까요">
        <div className="flex flex-wrap gap-2">
          {WHENS.map((w) => (
            <Chip
              key={w.key}
              active={filters.when === w.key}
              onClick={() => update((f) => ({ ...f, when: toggle(f.when, w.key) }))}
            >
              {w.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="나에게 맞는 조건" hint="고른 조건을 모두 만족하는 아이만 보여요">
        <div className="flex flex-wrap gap-2">
          {NEEDS.map((n) => (
            <Chip
              key={n.key}
              active={filters.needs.includes(n.key)}
              onClick={() => update((f) => ({ ...f, needs: toggleIn(f.needs, n.key) }))}
            >
              {n.label}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="지역 · 보호소">
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((r) => (
            <Chip
              key={r}
              active={filters.region === r}
              onClick={() => update((f) => ({ ...f, region: toggle(f.region, r), shelterId: null }))}
            >
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
            <Chip
              key={s}
              active={filters.size === s}
              onClick={() => update((f) => ({ ...f, size: toggle(f.size, s) }))}
            >
              {s}견
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="산책 난이도">
        <div className="flex flex-wrap gap-2">
          {DIFFICULTIES.map((d) => (
            <Chip
              key={d}
              active={filters.difficulty === d}
              onClick={() => update((f) => ({ ...f, difficulty: toggle(f.difficulty, d) }))}
            >
              {d}
            </Chip>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="성격" hint="하나라도 해당하면 보여요">
        <div className="flex flex-wrap gap-2">
          {TRAITS.map((t) => (
            <Chip
              key={t}
              active={filters.traits.includes(t)}
              onClick={() => update((f) => ({ ...f, traits: toggleIn(f.traits, t) }))}
            >
              {t}
            </Chip>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}

/**
 * 이름·품종·보호소 검색.
 * 입력 중인 글자는 이 칸이 들고 있고(한글 조합 중에 주소가 끼어들지 않게), 잠깐 멈추면 주소에 반영합니다.
 * 칩·'모두 해제'로 주소의 검색어가 바뀌면 칸도 따라갑니다.
 */
function SearchField({ value, onCommit }: { value: string; onCommit: (q: string) => void }) {
  const [text, setText] = useState(value);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;

  useEffect(() => {
    setText((t) => (t.trim() === value ? t : value));
  }, [value]);

  useEffect(() => {
    const q = text.trim().slice(0, QUERY_MAX);
    if (q === value) return;
    const timer = setTimeout(() => commitRef.current(q), 250);
    return () => clearTimeout(timer);
  }, [text, value]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        commitRef.current(text.trim().slice(0, QUERY_MAX));
        (document.activeElement as HTMLElement | null)?.blur();
      }}
      className="relative"
    >
      <Search
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-400"
      />
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={QUERY_MAX}
        enterKeyHint="search"
        aria-label="이름·품종·보호소로 찾기"
        placeholder="이름, 품종, 보호소로 찾기"
        className="input-field !rounded-full pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            commitRef.current("");
          }}
          aria-label="검색어 지우기"
          className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 hover:bg-cream-100 hover:text-ink-900"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
    </form>
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

  // 일정 조건·빠른 일정 순은 방문자의 지금 시각으로 계산합니다
  const clock = useClock();
  const needsClock = !!filters.when || sort === "soon";
  const result = useMemo(() => searchDogs(dogs, filters, sort, clock ?? undefined), [filters, sort, clock]);
  const active = activeFilterChips(filters);
  const ready = !needsClock || !!clock;

  return (
    <div className="container-app pb-8 pt-6 md:pb-10 md:pt-10">
      <header className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 lg:mb-8 lg:flex-nowrap">
        <div>
          <h1 className="page-title">강아지 찾기</h1>
          <p className="mt-1.5 text-[15px] text-ink-500" aria-live="polite">
            {active.length > 0 ? "조건에 맞는 아이 " : "산책 친구를 기다리는 아이 "}
            <strong className="tnum font-semibold text-ink-900">
              {ready ? `${result.length}마리` : "–"}
            </strong>
          </p>
        </div>
        <label className="flex items-center gap-2 text-[15px] text-ink-500 lg:order-2">
          <span className="hidden lg:inline">정렬</span>
          <select
            aria-label="정렬"
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
        {/* 모바일: 제목·정렬 아래 한 줄 전체 / PC: 제목과 정렬 사이 */}
        <div className="order-last w-full lg:order-1 lg:ml-auto lg:w-[360px]">
          <SearchField value={filters.q} onCommit={(q) => update((f) => ({ ...f, q }))} />
        </div>
      </header>

      {/* 모바일 · 태블릿 — 필터 시트 + 자주 쓰는 조건은 바로. 목록을 내려도 헤더 아래에 붙어 있음 */}
      <div className="no-scrollbar sticky top-16 z-20 -mx-4 mb-5 flex items-center gap-2 overflow-x-auto border-b border-cream-300/60 bg-cream-50/95 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="btn-secondary shrink-0 whitespace-nowrap !px-4"
        >
          <SlidersHorizontal className="h-4 w-4" />
          필터
          {active.length > 0 && (
            <span className="tnum flex h-5 min-w-5 items-center justify-center rounded-full bg-ink-900 px-1 text-xs font-bold text-white">
              {active.length}
            </span>
          )}
        </button>
        {WHENS.map((w) => (
          <QuickChip
            key={w.key}
            active={filters.when === w.key}
            onClick={() => update((f) => ({ ...f, when: f.when === w.key ? null : w.key }))}
          >
            {w.label}
          </QuickChip>
        ))}
        {QUICK_NEEDS.map((k) => (
          <QuickChip
            key={k}
            active={filters.needs.includes(k)}
            onClick={() => update((f) => ({ ...f, needs: toggleIn(f.needs, k) }))}
          >
            {NEEDS.find((n) => n.key === k)!.label}
          </QuickChip>
        ))}
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
          {!ready ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-40 animate-pulse rounded-[20px] bg-cream-200/70 sm:h-80" />
              ))}
            </div>
          ) : result.length === 0 ? (
            <EmptyState
              message={
                filters.q && active.length === 1
                  ? `‘${filters.q}’에 맞는 아이를 찾지 못했어요.\n이름·품종·보호소 이름으로 다시 찾아볼까요?`
                  : "조건에 맞는 아이를 찾지 못했어요.\n조건을 조금만 넓혀볼까요?"
              }
              ctaLabel="필터 모두 해제"
              onAction={() => commit(EMPTY_FILTERS, sort)}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 xl:grid-cols-3">
              {result.map((dog, i) => (
                <li key={dog.id}>
                  <DogCard dog={dog} priority={i < 2} rowOnMobile />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="필터"
        footer={
          <>
            <button
              type="button"
              onClick={() => commit(EMPTY_FILTERS, sort)}
              className="btn-secondary flex-1"
            >
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
