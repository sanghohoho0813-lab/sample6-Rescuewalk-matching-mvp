"use client";

import type { MutableRefObject, ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, Check } from "lucide-react";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import DogImage, { DogFace } from "@/components/DogImage";
import { CAUTIONS, MEMO_MAX, NAME_MAX, formatPhone } from "@/lib/domain/apply";
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

const WEEKDAY_TONE: Record<string, string> = { 일: "text-red-500", 토: "text-sage-600" };

export function DateStep({ flow }: { flow: ApplyFlow }) {
  const { dates, draft, openSlots, pickDate } = flow;
  return (
    <StepSection title="언제 함께 걸을까요?" desc="앞으로 2주 안에서 고를 수 있어요.">
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
        {dates.map((d) => {
          const full = openSlots(d.iso).length === 0;
          const selected = draft.date === d.iso;
          return (
            <button
              key={d.iso}
              type="button"
              disabled={full}
              onClick={() => pickDate(d.iso)}
              aria-pressed={selected}
              aria-label={`${formatDateKo(d.iso)}${d.isToday ? " 오늘" : ""}${full ? " (마감)" : ""}`}
              className={cn(
                "flex min-h-[64px] flex-col items-center justify-center rounded-2xl border transition-colors duration-150",
                selected && "border-sage-600 bg-sage-600 text-white",
                !selected && !full && "border-cream-300 bg-white hover:border-sage-400",
                full && "cursor-not-allowed border-transparent bg-cream-100 text-ink-300"
              )}
            >
              <span
                className={cn(
                  "text-[13px]",
                  selected
                    ? "text-white/80"
                    : full
                      ? "text-ink-300"
                      : (WEEKDAY_TONE[d.weekday] ?? "text-ink-400")
                )}
              >
                {d.isToday ? "오늘" : d.weekday}
              </span>
              <span className={cn("tnum text-base font-semibold", !selected && !full && "text-ink-900")}>
                {d.day}
              </span>
              {full && <span className="text-xs">마감</span>}
            </button>
          );
        })}
      </div>
    </StepSection>
  );
}

export function TimeStep({ flow, dog }: { flow: ApplyFlow; dog: Dog }) {
  const { draft, booked, pastSlots, pickTime, notice } = flow;
  if (!draft.date) return null;
  return (
    <StepSection
      title={`${formatDateKo(draft.date)}, 몇 시가 좋을까요?`}
      desc={`${withJosa(dog.name, "가")} 산책하는 시간이에요. 추천 산책 시간은 ${dog.walkNote.recommendedDuration}이에요.`}
    >
      {notice && (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-2xl bg-tangerine-50 p-3.5 text-[15px] text-ink-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-600" aria-hidden />
          {notice}
        </p>
      )}
      <div className="mt-5">
        <TimeSlotPicker
          availableTimes={dog.availableTimes}
          bookedTimes={booked.get(draft.date) ?? []}
          pastTimes={pastSlots(draft.date)}
          value={draft.time}
          onChange={pickTime}
        />
      </div>
    </StepSection>
  );
}

function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-sm text-red-600">
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

export function InfoStep({ flow, fieldRefs }: { flow: ApplyFlow; fieldRefs: InfoFieldRefs }) {
  const { draft, update, errors, showErrors } = flow;
  const err = showErrors ? errors : {};
  const refs = fieldRefs.current;

  return (
    <StepSection
      title="참여자 정보를 알려주세요"
      desc="보호소가 확인 연락을 드릴 때 사용해요. 데모 계정 정보가 미리 입력되어 있어요."
    >
      <div className="mt-6 space-y-5">
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
            aria-describedby={err.name ? "e-name" : undefined}
            className={cn("input-field", err.name && "input-error")}
          />
          <FieldError id="e-name">{err.name}</FieldError>
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
            aria-describedby={err.phone ? "e-phone" : undefined}
            className={cn("input-field tnum", err.phone && "input-error")}
          />
          <FieldError id="e-phone">{err.phone}</FieldError>
        </div>
        <fieldset aria-describedby={err.experienced ? "e-exp" : undefined}>
          <legend className="mb-1.5 block text-sm font-semibold text-ink-700">
            산책 봉사 경험이 있나요?
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
                        err.experienced ? "border-red-400" : "border-cream-300"
                      )
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <FieldError id="e-exp">{err.experienced}</FieldError>
          {draft.experienced === false && (
            <p className="mt-2.5 text-sm text-sage-700">
              처음이어도 괜찮아요. 보호소에서 리드줄 잡는 법부터 안내해드려요.
            </p>
          )}
        </fieldset>
        <div>
          <label
            htmlFor="f-memo"
            className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-ink-700"
          >
            보호소에 남길 말
            <span className="font-normal text-ink-400" aria-live="polite">
              선택 · {draft.memo.length}/{MEMO_MAX}
            </span>
          </label>
          <textarea
            id="f-memo"
            value={draft.memo}
            onChange={(e) => update({ memo: e.target.value.slice(0, MEMO_MAX) })}
            rows={3}
            placeholder="궁금한 점이나 전하고 싶은 말이 있다면 적어주세요."
            className="input-field resize-none"
          />
        </div>
      </div>
    </StepSection>
  );
}

export function PromiseStep({ flow }: { flow: ApplyFlow }) {
  const { draft, update } = flow;
  const all = draft.agreed.every(Boolean);
  return (
    <StepSection title="산책 전에 약속해주세요" desc="아이들의 안전을 위한 약속이에요.">
      <button
        type="button"
        onClick={() => update({ agreed: CAUTIONS.map(() => !all) })}
        aria-pressed={all}
        className="mt-5 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-cream-300 bg-white px-4 text-left"
      >
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
            all ? "border-sage-600 bg-sage-600 text-white" : "border-cream-300"
          )}
        >
          {all && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
        <span className="text-base font-semibold text-ink-900">모두 확인했어요</span>
      </button>
      <ul className="mt-2 divide-y divide-cream-200">
        {CAUTIONS.map((caution, i) => (
          <li key={caution}>
            <button
              type="button"
              onClick={() => update({ agreed: draft.agreed.map((v, idx) => (idx === i ? !v : v)) })}
              aria-pressed={draft.agreed[i]}
              className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left"
            >
              <Check
                aria-hidden
                className={cn("h-5 w-5 shrink-0", draft.agreed[i] ? "text-sage-600" : "text-cream-300")}
                strokeWidth={3}
              />
              <span className="text-[15px] leading-relaxed text-ink-700">{caution}</span>
            </button>
          </li>
        ))}
      </ul>
    </StepSection>
  );
}

export function ReviewStep({ flow, dog, shelter }: { flow: ApplyFlow; dog: Dog; shelter?: Shelter }) {
  const { draft, goTo } = flow;
  if (!draft.date || !draft.time) return null;
  const rows = [
    { label: "날짜", value: formatDateKo(draft.date), step: 0 },
    { label: "시간", value: formatTimeKo(draft.time), step: 1 },
    { label: "신청자", value: draft.name.trim(), step: 2 },
    { label: "연락처", value: draft.phone, step: 2 },
    { label: "봉사 경험", value: draft.experienced ? "있어요" : "처음이에요", step: 2 },
    ...(draft.memo.trim() ? [{ label: "메모", value: draft.memo.trim(), step: 2 }] : []),
  ];
  return (
    <StepSection title="이대로 신청할까요?" desc="신청 후 보호소가 확인하면 방문예정으로 바뀌어요.">
      <div className="card mt-5 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-cream-200 p-5">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <DogFace dog={dog} sizes="56px" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-900">{dog.name}</p>
            <p className="truncate text-sm text-ink-500">
              {shelter?.name} · {shelter?.address}
            </p>
          </div>
        </div>
        <dl className="divide-y divide-cream-200 text-[15px]">
          {rows.map(({ label, value, step }) => (
            <div key={label} className="flex items-center gap-4 px-5 py-3">
              <dt className="w-20 shrink-0 text-ink-400">{label}</dt>
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
      </div>
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
        <p className="mt-0.5 text-sm text-ink-500">
          {shelter?.name} · {shelter?.region}
        </p>
        <dl className="mt-5 divide-y divide-cream-200 border-y border-cream-200 text-[15px]">
          {[
            { label: "날짜", value: draft.date ? formatDateKo(draft.date) : null },
            { label: "시간", value: draft.time ? formatTimeKo(draft.time) : null },
            { label: "추천 산책", value: dog.walkNote.recommendedDuration },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3">
              <dt className="text-ink-400">{label}</dt>
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
