"use client";

import { useRef, type MutableRefObject, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Check, MapPin } from "lucide-react";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import DogImage, { DogFace } from "@/components/DogImage";
import { MEMO_MAX, NAME_MAX, SAFETY_PROMISES, formatPhone } from "@/lib/domain/apply";
import { pastSlots, scheduledSlots, weekdayOf } from "@/lib/domain/schedule";
import { EXPERIENCE } from "@/lib/labels";
import { ARRIVE_EARLY_MIN } from "@/lib/visitGuide";
import { cn, formatDateKo, formatTimeKo, withJosa } from "@/lib/utils";
import type { Dog, Shelter } from "@/lib/types";
import type { ApplyFlow } from "./useApplyFlow";

/** 각 단계의 제목·설명 — 스크린리더가 단계가 바뀔 때 제목부터 읽도록 같은 id 를 씁니다 */
function StepSection({ title, desc, children }: { title: ReactNode; desc?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby="step-title">
      <h2 id="step-title" tabIndex={-1} className="text-xl font-bold text-ink-900 focus:outline-none">
        {title}
      </h2>
      {desc && <p className="mt-1 text-[15px] text-ink-500">{desc}</p>}
      {children}
    </section>
  );
}

/** 입력 칸 아래 '왜 필요한지' 한 줄 */
function Why({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-[13px] text-ink-500">{children}</p>;
}

const DAY = ["일", "월", "화", "수", "목", "금", "토"];
const WEEKDAY_TONE: Record<number, string> = { 0: "text-red-600", 6: "text-sage-700" };

/** 1단계 — 날짜와 시간을 한 화면에서 */
export function ScheduleStep({ flow, dog, shelter }: { flow: ApplyFlow; dog: Dog; shelter?: Shelter }) {
  const { days, draft, pickDate, pickTime, booked, notice, today } = flow;
  const selected = days.find((d) => d.date === draft.date);
  const timesRef = useRef<HTMLDivElement>(null);
  // 모바일에서는 날짜 칸이 화면을 채우므로, 날짜를 고르면 시간 목록이 보이도록 내려줍니다
  const onPickDate = (iso: string) => {
    pickDate(iso);
    requestAnimationFrame(() => {
      const el = timesRef.current;
      if (el && el.getBoundingClientRect().bottom > window.innerHeight - 120) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  };
  return (
    <StepSection
      title="언제 함께 걸을까요?"
      desc={`${withJosa(dog.name, "가")} 산책하는 날만 고를 수 있어요. 보호소 휴무일은 빠져 있어요.`}
    >
      {notice && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl bg-tangerine-50 p-3.5 text-[15px] text-ink-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-700" aria-hidden />
          {notice}
        </p>
      )}
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {days.map((d) => {
          const [, , dd] = d.date.split("-").map(Number);
          const wd = weekdayOf(d.date);
          const full = d.open.length === 0;
          const isSel = draft.date === d.date;
          const reason = d.closed
            ? "휴무"
            : full
              ? shelter && scheduledSlots(dog, shelter, d.date).length > 0
                ? "마감"
                : "쉬는 날"
              : null;
          return (
            <button
              key={d.date}
              type="button"
              disabled={full}
              onClick={() => onPickDate(d.date)}
              aria-pressed={isSel}
              aria-label={`${formatDateKo(d.date)}${d.date === today ? " 오늘" : ""}${reason ? ` (${reason})` : ` ${d.open.length}개 시간 가능`}`}
              className={cn(
                "flex min-h-[68px] flex-col items-center justify-center rounded-2xl border transition-colors duration-150",
                isSel && "border-sage-600 bg-sage-600 text-white",
                !isSel && !full && "border-cream-300 bg-white hover:border-sage-400",
                full && "cursor-not-allowed border-transparent bg-cream-100 text-ink-400"
              )}
            >
              <span
                className={cn(
                  "text-[13px]",
                  isSel ? "text-white" : full ? "text-ink-400" : (WEEKDAY_TONE[wd] ?? "text-ink-500")
                )}
              >
                {d.date === today ? "오늘" : DAY[wd]}
              </span>
              <span className={cn("tnum text-base font-semibold", !isSel && !full && "text-ink-900")}>
                {dd}
              </span>
              <span
                className={cn("text-[13px]", isSel ? "text-white" : full ? "text-ink-400" : "text-sage-700")}
              >
                {reason ?? `${d.open.length}타임`}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={timesRef} className="mt-7 scroll-mb-32" aria-live="polite">
        {selected ? (
          <>
            <h3 className="text-[15px] font-semibold text-ink-900">
              {formatDateKo(selected.date)} · 시간을 골라주세요
            </h3>
            <p className="mt-0.5 text-sm text-ink-500">
              추천 산책 시간은 {dog.walkNote.recommendedDuration}이에요.
            </p>
            <div className="mt-3">
              <TimeSlotPicker
                availableTimes={shelter ? scheduledSlots(dog, shelter, selected.date) : []}
                bookedTimes={booked.get(selected.date) ?? []}
                pastTimes={
                  today && shelter
                    ? pastSlots(scheduledSlots(dog, shelter, selected.date), selected.date, new Date(), today)
                    : []
                }
                value={draft.time}
                onChange={pickTime}
              />
            </div>
          </>
        ) : (
          <p className="rounded-2xl bg-cream-100 p-4 text-[15px] text-ink-500">
            날짜를 고르면 가능한 시간이 보여요.
          </p>
        )}
      </div>
    </StepSection>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-sm text-red-700">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {children}
    </p>
  );
}

/** 오류가 난 첫 칸으로 포커스를 옮기기 위해 화면 쪽에서 들고 있는 요소들 */
export type InfoFieldRefs = MutableRefObject<{
  name?: HTMLInputElement | null;
  phone?: HTMLInputElement | null;
  experienced?: HTMLButtonElement | null;
}>;

/** 2단계 — 보호소가 실제로 쓰는 정보만, 왜 필요한지와 함께 */
export function InfoStep({ flow, dog, fieldRefs }: { flow: ApplyFlow; dog: Dog; fieldRefs: InfoFieldRefs }) {
  const { draft, update, errors, showErrors, gate } = flow;
  const err = showErrors ? errors : {};
  const refs = fieldRefs.current;
  // 경험 제한은 고르는 즉시 알려줍니다(다음을 눌러 보고 나서야 알면 늦으니까)
  const expError = err.experienced ?? (gate === "block" ? errors.experienced : undefined);

  return (
    <StepSection
      title="누가 함께 걷나요?"
      desc="보호소가 확인 연락과 첫 안내를 준비하는 데 쓰여요. 데모 계정 정보가 미리 들어 있어요."
    >
      <div className="mt-6 space-y-6">
        <div>
          <label htmlFor="f-name" className="mb-1.5 block text-sm font-semibold text-ink-700">
            이름
          </label>
          <input
            id="f-name"
            ref={(el) => {
              refs.name = el;
            }}
            value={draft.name}
            onChange={(e) => update({ name: e.target.value })}
            maxLength={NAME_MAX}
            autoComplete="name"
            enterKeyHint="next"
            aria-invalid={!!err.name}
            aria-describedby={err.name ? "e-name" : "w-name"}
            className={cn("input-field", err.name && "input-error")}
          />
          <FieldError id="e-name">{err.name}</FieldError>
          {!err.name && (
            <Why>
              <span id="w-name">현장에서 봉사자 명단과 맞춰봐요.</span>
            </Why>
          )}
        </div>
        <div>
          <label htmlFor="f-phone" className="mb-1.5 block text-sm font-semibold text-ink-700">
            연락처
          </label>
          <input
            id="f-phone"
            ref={(el) => {
              refs.phone = el;
            }}
            type="tel"
            value={draft.phone}
            onChange={(e) => update({ phone: formatPhone(e.target.value) })}
            inputMode="tel"
            autoComplete="tel-national"
            enterKeyHint="done"
            placeholder="010-0000-0000"
            aria-invalid={!!err.phone}
            aria-describedby={err.phone ? "e-phone" : "w-phone"}
            className={cn("input-field tnum", err.phone && "input-error")}
          />
          <FieldError id="e-phone">{err.phone}</FieldError>
          {!err.phone && (
            <Why>
              <span id="w-phone">승인 문자와 방문 전날 안내를 이 번호로 보내요.</span>
            </Why>
          )}
        </div>
        <fieldset aria-describedby={expError ? "e-exp" : "w-exp"}>
          <legend className="mb-1.5 block text-sm font-semibold text-ink-700">
            산책 봉사를 해본 적이 있나요?
          </legend>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { v: true, label: "네, 있어요" },
              { v: false, label: "처음이에요" },
            ].map(({ v, label }, i) => (
              <button
                key={label}
                ref={(el) => {
                  if (i === 0) refs.experienced = el;
                }}
                type="button"
                onClick={() => update({ experienced: v })}
                aria-pressed={draft.experienced === v}
                className={cn(
                  "min-h-[52px] rounded-2xl border text-[15px] font-semibold transition-colors duration-150",
                  draft.experienced === v
                    ? "border-sage-600 bg-sage-600 text-white"
                    : cn(
                        "bg-white text-ink-700 hover:border-sage-400",
                        expError ? "border-red-400" : "border-cream-300"
                      )
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {gate === "block" ? (
            <div
              id="e-exp"
              role="alert"
              className="mt-3 rounded-2xl bg-tangerine-50 p-4 text-[15px] leading-relaxed text-ink-900"
            >
              <p className="flex items-start gap-2 font-semibold">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-700" aria-hidden />
                {withJosa(dog.name, "는")} 경험이 있는 분만 산책할 수 있어요
              </p>
              <p className="mt-1 pl-6 text-ink-700">
                힘이 세서 처음이면 놓칠 위험이 있어요. 처음 봉사라면 초보도 편하게 걸을 수 있는 아이부터
                만나보세요.
              </p>
              <Link
                href="/dogs?need=beginner"
                className="btn-secondary mt-3 ml-6 !min-h-[40px] !px-4 text-sm"
              >
                초보 가능한 아이 보기
              </Link>
            </div>
          ) : (
            <FieldError id="e-exp">{err.experienced}</FieldError>
          )}
          {gate === "caution" && (
            <p className="mt-2.5 text-sm text-tangerine-700">
              {EXPERIENCE[dog.match.experience].long}. 처음이라면 매니저가 첫 10분을 함께 걸어요.
            </p>
          )}
          {gate === "ok" && draft.experienced === false && (
            <p className="mt-2.5 text-sm text-sage-700">
              처음이어도 괜찮아요. 보호소에서 리드줄 잡는 법부터 안내해드려요.
            </p>
          )}
          {!expError && draft.experienced === null && (
            <Why>
              <span id="w-exp">경험에 맞춰 매니저가 첫 안내를 준비해요.</span>
            </Why>
          )}
        </fieldset>
        <div>
          <label
            htmlFor="f-memo"
            className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-ink-700"
          >
            보호소에 남길 말
            <span className="font-normal text-ink-500" aria-live="polite">
              선택 · {draft.memo.length}/{MEMO_MAX}
            </span>
          </label>
          <textarea
            id="f-memo"
            value={draft.memo}
            onChange={(e) => update({ memo: e.target.value.slice(0, MEMO_MAX) })}
            rows={3}
            placeholder="예: 아이와 함께 가요, 조금 늦을 수 있어요"
            className="input-field resize-none"
          />
        </div>
      </div>
    </StepSection>
  );
}

/** 3단계 — 내용 확인 + 현장에서 꼭 지킬 세 가지 */
export function ReviewStep({ flow, dog, shelter }: { flow: ApplyFlow; dog: Dog; shelter?: Shelter }) {
  const { draft, goTo, update, showErrors } = flow;
  if (!draft.date || !draft.time) return null;
  // 날짜·시간·전화번호는 줄 끝에서 갈라지지 않게 덩어리로
  const rows: { label: string; value: ReactNode; step: number }[] = [
    {
      label: "일정",
      value: (
        <>
          <span className="tnum">{formatDateKo(draft.date)}</span>{" "}
          <span className="tnum">{formatTimeKo(draft.time)}</span>
        </>
      ),
      step: 0,
    },
    {
      label: "신청자",
      value: (
        <>
          {draft.name.trim()} · <span className="tnum">{draft.phone}</span>
        </>
      ),
      step: 1,
    },
    { label: "봉사 경험", value: draft.experienced ? "있어요" : "처음이에요", step: 1 },
    ...(draft.memo.trim() ? [{ label: "남길 말", value: draft.memo.trim(), step: 1 }] : []),
  ];
  return (
    <StepSection
      title="이대로 신청할까요?"
      desc="보호소가 확인하면 문자로 승인 안내를 드려요. 보통 하루 안이에요."
    >
      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-cream-200 p-5">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <DogFace dog={dog} sizes="56px" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-900">{dog.name}</p>
            <p className="flex items-center gap-1 truncate text-sm text-ink-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {shelter?.name} · {shelter?.visit.meetingPoint.split(" — ")[0]}
            </p>
          </div>
        </div>
        <dl className="divide-y divide-cream-200 text-[15px]">
          {rows.map(({ label, value, step }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3">
              <dt className="w-[72px] shrink-0 text-ink-500">{label}</dt>
              <dd className="min-w-0 flex-1 break-words font-medium tabular-nums text-ink-900">{value}</dd>
              <button
                type="button"
                onClick={() => goTo(step)}
                className="-mr-2 min-h-[40px] shrink-0 rounded-full px-3 text-sm font-medium text-ink-500 hover:bg-cream-100 hover:text-ink-900"
                aria-label={`${label} 변경`}
              >
                변경
              </button>
            </div>
          ))}
        </dl>
        <p className="border-t border-cream-200 bg-cream-100/60 px-5 py-3 text-sm text-ink-700">
          방문 <strong className="font-semibold">{ARRIVE_EARLY_MIN}분 전</strong>까지 도착해 주세요 ·{" "}
          {dog.walkNote.caution}
        </p>
      </div>

      <h3 className="mt-8 text-[15px] font-semibold text-ink-900">현장에서 꼭 지켜주세요</h3>
      <ol className="mt-3 space-y-3">
        {SAFETY_PROMISES.map((p, i) => (
          <li key={p.title} className="flex gap-3">
            <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-100 text-[13px] font-bold text-sage-800">
              {i + 1}
            </span>
            <span>
              <span className="block text-[15px] font-semibold text-ink-900">{p.title}</span>
              <span className="block text-sm leading-relaxed text-ink-500">{p.why}</span>
            </span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => update({ agreed: !draft.agreed })}
        aria-pressed={draft.agreed}
        className={cn(
          "mt-5 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border px-4 text-left transition-colors",
          draft.agreed
            ? "border-sage-600 bg-sage-50"
            : showErrors
              ? "border-red-400 bg-white"
              : "border-cream-300 bg-white"
        )}
      >
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            draft.agreed ? "border-sage-600 bg-sage-600 text-white" : "border-cream-300"
          )}
        >
          {draft.agreed && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="text-base font-semibold text-ink-900">세 가지를 지킬게요</span>
      </button>
    </StepSection>
  );
}

/** PC 오른쪽 — 지금 무엇을 신청 중인지 */
export function ApplySummary({ flow, dog, shelter }: { flow: ApplyFlow; dog: Dog; shelter?: Shelter }) {
  const { draft } = flow;
  return (
    <aside className="hidden lg:block" aria-label="신청 요약">
      <div className="sticky top-24">
        <div className="overflow-hidden rounded-[20px]">
          <DogImage dog={dog} aspect="aspect-[4/3]" objectPosition="50% 34%" sizes="300px" />
        </div>
        <p className="mt-4 text-lg font-bold text-ink-900">{dog.name}</p>
        <p className="mt-0.5 text-sm text-ink-500">{dog.headline}</p>
        <dl className="mt-5 divide-y divide-cream-200 border-y border-cream-200 text-[15px]">
          {[
            { label: "날짜", value: draft.date ? formatDateKo(draft.date) : null },
            { label: "시간", value: draft.time ? formatTimeKo(draft.time) : null },
            { label: "보호소", value: shelter?.name ?? null },
            { label: "추천 산책", value: dog.walkNote.recommendedDuration },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-ink-500">{label}</dt>
              <dd className={cn("tabular-nums", value ? "font-semibold text-ink-900" : "text-ink-400")}>
                {value ?? "선택 전"}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}

/** 접수 후 뒤로가기로 돌아온 경우 */
export function AppliedNotice({ flow, dog }: { flow: ApplyFlow; dog: Dog }) {
  const req = flow.appliedRequest;
  if (!req) return null;
  return (
    <div className="container-app max-w-lg py-14 text-center md:py-20">
      <span className="mx-auto block h-16 w-16 overflow-hidden rounded-full">
        <DogFace dog={dog} sizes="64px" />
      </span>
      <h1 className="mt-5 text-xl font-bold text-ink-900">
        {withJosa(dog.name, "와")}의 산책은 이미 신청했어요
      </h1>
      <p className="mt-2 text-[15px] text-ink-500">
        <span className="tnum">{formatDateKo(req.date)}</span>{" "}
        <span className="tnum">{formatTimeKo(req.time)}</span>
      </p>
      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-2.5">
        <Link href={`/requests/${req.id}`} className="btn-primary btn-lg w-full">
          신청 내역 보기
        </Link>
        <button type="button" onClick={flow.startOver} className="btn-secondary btn-lg w-full">
          다른 날짜로 또 신청하기
        </button>
      </div>
    </div>
  );
}
