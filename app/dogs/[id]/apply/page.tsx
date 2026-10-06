"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import Stepper from "@/components/Stepper";
import TimeSlotPicker, { ALL_SLOTS } from "@/components/TimeSlotPicker";
import DogImage, { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import {
  cn,
  formatDateKo,
  formatTimeKo,
  makeReservationNo,
  todayISO,
  upcomingDates,
  withJosa,
} from "@/lib/utils";
import type { WalkRequest } from "@/lib/types";

const STEP_LABELS = ["날짜", "시간", "정보", "주의사항", "확인"];

const CAUTIONS = [
  "방문 10분 전까지 보호소에 도착할게요.",
  "산책하기 편한 복장과 운동화를 착용할게요.",
  "리드줄은 보호소 지침에 따라 두 손으로 잡을게요.",
  "산책 중 상황은 보호소 매니저의 안내를 따를게요.",
];

/** 오늘 신청이라면 시작까지 30분 이상 남은 시간만 고를 수 있습니다 */
function pastSlotsFor(dateISO: string): string[] {
  if (dateISO !== todayISO()) return [];
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes() + 30;
  return ALL_SLOTS.filter((s) => {
    const [h, m] = s.split(":").map(Number);
    return h * 60 + m <= nowMin;
  });
}

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;

interface Draft {
  date: string | null;
  time: string | null;
  name: string;
  phone: string;
  experienced: boolean | null;
  memo: string;
  agreed: boolean[];
}

const draftKey = (dogId: string) => `rw:apply:${dogId}`;

function readDraft(dogId: string): Partial<Draft> | null {
  try {
    const raw = sessionStorage.getItem(draftKey(dogId));
    return raw ? (JSON.parse(raw) as Partial<Draft>) : null;
  } catch {
    return null;
  }
}

/**
 * 산책 신청 5단계.
 * - 단계는 URL(?step=)에 있어 브라우저 뒤로가기가 '이전 단계'로 동작합니다.
 * - 입력값은 이 탭에서만 임시 저장되어, 새로고침해도 처음부터 다시 쓰지 않아도 됩니다.
 */
function ApplyFlow() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dog = getDog(params.id);
  const { requests, addRequest, showToast, hydrated } = useStore();

  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("김지우");
  const [phone, setPhone] = useState("010-1234-5678");
  const [experienced, setExperienced] = useState<boolean | null>(null);
  const [memo, setMemo] = useState("");
  const [agreed, setAgreed] = useState<boolean[]>(CAUTIONS.map(() => false));
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [restored, setRestored] = useState(false);
  const submittedRef = useRef(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);

  const dates = useMemo(() => upcomingDates(14), []);

  // 같은 아이의 같은 날·시간에 이미 신청해 둔 슬롯
  const bookedByDate = useMemo(() => {
    const map = new Map<string, string[]>();
    if (!dog) return map;
    for (const r of requests) {
      if (r.dogId !== dog.id || r.status === "cancelled") continue;
      map.set(r.date, [...(map.get(r.date) ?? []), r.time]);
    }
    return map;
  }, [requests, dog]);

  const openSlotsOn = (iso: string) => {
    if (!dog) return [];
    const blocked = new Set([...(bookedByDate.get(iso) ?? []), ...pastSlotsFor(iso)]);
    return dog.availableTimes.filter((t) => !blocked.has(t));
  };

  // 임시 저장값 복원 — 신청 내역을 읽은 뒤에 해야 이미 찬 시간을 걸러낼 수 있습니다
  useEffect(() => {
    if (!dog || !hydrated || restored) return;
    const d = readDraft(dog.id);
    if (d) {
      const dateOk =
        typeof d.date === "string" && dates.some((x) => x.iso === d.date) && openSlotsOn(d.date).length > 0;
      const timeOk = dateOk && typeof d.time === "string" && openSlotsOn(d.date as string).includes(d.time);
      if (dateOk) setDate(d.date as string);
      if (timeOk) setTime(d.time as string);
      if (typeof d.name === "string") setName(d.name.slice(0, 20));
      if (typeof d.phone === "string") setPhone(formatPhone(d.phone));
      if (typeof d.experienced === "boolean") setExperienced(d.experienced);
      if (typeof d.memo === "string") setMemo(d.memo.slice(0, 100));
      if (Array.isArray(d.agreed) && d.agreed.length === CAUTIONS.length) setAgreed(d.agreed.map(Boolean));
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dog, hydrated, restored]);

  useEffect(() => {
    if (!dog || !restored || submittedRef.current) return;
    try {
      const draft: Draft = { date, time, name, phone, experienced, memo, agreed };
      sessionStorage.setItem(draftKey(dog.id), JSON.stringify(draft));
    } catch {
      /* 저장소가 막혀 있어도 신청은 그대로 진행됩니다 */
    }
  }, [dog, restored, date, time, name, phone, experienced, memo, agreed]);

  const nameError = name.trim().length === 0 ? "이름을 입력해주세요." : null;
  const phoneError = !PHONE_RE.test(phone) ? "010-0000-0000 형식으로 입력해주세요." : null;
  const expError = experienced === null ? "봉사 경험 여부를 선택해주세요." : null;
  const infoValid = !nameError && !phoneError && !expError;
  const allAgreed = agreed.every(Boolean);

  // URL 의 단계는 앞 단계를 다 채운 만큼까지만 인정합니다(주소를 직접 바꾸거나 새로고침해도 빈 확인 화면이 뜨지 않게)
  const maxStep = !date ? 0 : !time ? 1 : !infoValid ? 2 : !allAgreed ? 3 : 4;
  const urlStep = Math.min(Math.max((Number(searchParams.get("step")) || 1) - 1, 0), 4);
  const step = restored ? Math.min(urlStep, maxStep) : 0;

  useEffect(() => {
    if (restored && urlStep > maxStep) {
      window.history.replaceState(window.history.state, "", `${pathname}?step=${maxStep + 1}`);
    }
  }, [restored, urlStep, maxStep, pathname]);

  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);

  if (dog.availability === "unavailable") {
    return (
      <div className="container-app max-w-lg py-16 text-center">
        <p className="text-lg font-bold text-ink-900">{withJosa(dog.name, "는")} 지금 잠시 쉬는 중이에요.</p>
        <p className="mt-2 text-[15px] text-ink-500">건강하게 돌아오면 다시 만나요!</p>
        <Link href="/dogs" className="btn-primary mt-6">
          다른 아이 둘러보기
        </Link>
      </div>
    );
  }

  const stepReady = [!!date, !!time, true, allAgreed, true][step];
  const hint = ["산책할 날짜를 선택해주세요", "시간을 선택해주세요", null, "모든 항목을 확인해주세요", null][
    step
  ];

  // 앞으로 가는 이동은 기록을 쌓고(rwPrev = 직전 단계), '이전'은 그 기록을 되돌립니다
  const goTo = (n: number) => {
    window.history.pushState({ rwPrev: step }, "", `${pathname}?step=${n + 1}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goPrev = () => {
    if (step === 0) return;
    if (window.history.state?.rwPrev === step - 1) {
      window.history.back();
    } else {
      // 새로고침 등으로 직전 기록이 없으면 현재 기록을 이전 단계로 바꿉니다
      window.history.replaceState(window.history.state, "", `${pathname}?step=${step}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goNext = () => {
    if (step === 2 && !infoValid) {
      setShowErrors(true);
      (nameError ? nameRef : phoneError ? phoneRef : null)?.current?.focus();
      return;
    }
    if (step < 4) goTo(step + 1);
  };

  const submit = () => {
    if (!date || !time || submitting) return;
    setSubmitting(true);
    submittedRef.current = true;
    const req: WalkRequest = {
      id: `req-${Date.now()}`,
      reservationNo: makeReservationNo(date),
      dogId: dog.id,
      date,
      time,
      applicant: {
        name: name.trim(),
        phone: phone.trim(),
        experienced: !!experienced,
        memo: memo.trim(),
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    // 실제 서비스에서는 Supabase walk_requests insert 로 대체되는 지점
    setTimeout(() => {
      addRequest(req);
      try {
        sessionStorage.removeItem(draftKey(dog.id));
      } catch {
        /* 무시 */
      }
      showToast(`${withJosa(dog.name, "와")}의 산책을 신청했어요`);
      router.push(`/complete/${req.id}`);
    }, 600);
  };

  const summary =
    date && time
      ? [
          { label: "날짜", value: formatDateKo(date), step: 0 },
          { label: "시간", value: formatTimeKo(time), step: 1 },
          { label: "신청자", value: name.trim(), step: 2 },
          { label: "연락처", value: phone, step: 2 },
          { label: "봉사 경험", value: experienced ? "있어요" : "처음이에요", step: 2 },
          ...(memo.trim() ? [{ label: "메모", value: memo.trim(), step: 2 }] : []),
        ]
      : [];

  const backClass =
    "-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-cream-200";

  return (
    <div className="container-app max-w-2xl pb-32 pt-4 sm:pb-10 md:pt-8 lg:max-w-5xl">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div className="min-w-0">
          {/* 상단: 뒤로 + 대상 */}
          <div className="flex items-center gap-3">
            {step === 0 ? (
              <Link href={`/dogs/${dog.id}`} aria-label={`${dog.name} 소개로 돌아가기`} className={backClass}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : (
              <button type="button" onClick={goPrev} aria-label="이전 단계" className={backClass}>
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full lg:hidden">
              <DogFace dog={dog} sizes="40px" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-[17px] font-bold text-ink-900 lg:text-xl">
                {withJosa(dog.name, "와")}의 산책 신청
              </h1>
              <p className="truncate text-[13px] text-ink-400 lg:hidden">
                {shelter?.name} · {shelter?.region}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Stepper steps={STEP_LABELS} current={step} />
          </div>

          {!restored ? (
            <div className="mt-8 space-y-4" aria-hidden>
              <div className="h-7 w-48 animate-pulse rounded-lg bg-cream-200" />
              <div className="h-5 w-64 animate-pulse rounded-lg bg-cream-200" />
              <div className="mt-5 h-40 animate-pulse rounded-2xl bg-cream-200" />
            </div>
          ) : (
            <div key={step} className="mt-8 animate-fade-up motion-reduce:animate-none">
              {step === 0 && (
                <section aria-labelledby="step-title">
                  <h2 id="step-title" className="text-xl font-bold text-ink-900">
                    언제 함께 걸을까요?
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-500">앞으로 2주 안에서 고를 수 있어요.</p>
                  <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {dates.map((d) => {
                      const full = openSlotsOn(d.iso).length === 0;
                      const selected = date === d.iso;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          disabled={full}
                          onClick={() => {
                            setDate(d.iso);
                            if (date !== d.iso) setTime(null);
                          }}
                          aria-pressed={selected}
                          aria-label={`${formatDateKo(d.iso)}${full ? " (마감)" : ""}`}
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
                                  : d.weekday === "일"
                                    ? "text-red-500"
                                    : d.weekday === "토"
                                      ? "text-sage-600"
                                      : "text-ink-400"
                            )}
                          >
                            {d.isToday ? "오늘" : d.weekday}
                          </span>
                          <span
                            className={cn(
                              "tnum text-base font-semibold",
                              !selected && !full && "text-ink-900"
                            )}
                          >
                            {d.day}
                          </span>
                          {full && <span className="text-xs">마감</span>}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 1 && date && (
                <section aria-labelledby="step-title">
                  <h2 id="step-title" className="text-xl font-bold text-ink-900">
                    {formatDateKo(date)}, 몇 시가 좋을까요?
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-500">
                    {withJosa(dog.name, "가")} 산책할 수 있는 시간만 고를 수 있어요. 추천 산책 시간은{" "}
                    {dog.walkNote.recommendedDuration}이에요.
                  </p>
                  <div className="mt-5">
                    <TimeSlotPicker
                      availableTimes={dog.availableTimes}
                      bookedTimes={bookedByDate.get(date) ?? []}
                      pastTimes={pastSlotsFor(date)}
                      value={time}
                      onChange={setTime}
                    />
                  </div>
                </section>
              )}

              {step === 2 && (
                <section aria-labelledby="step-title">
                  <h2 id="step-title" className="text-xl font-bold text-ink-900">
                    참여자 정보를 알려주세요
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-500">
                    보호소가 확인 연락을 드릴 때 사용해요. 데모 계정 정보가 미리 입력되어 있어요.
                  </p>
                  <div className="mt-6 space-y-5">
                    <div>
                      <label htmlFor="f-name" className="mb-1.5 block text-sm font-semibold text-ink-700">
                        이름
                      </label>
                      <input
                        id="f-name"
                        ref={nameRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={20}
                        autoComplete="name"
                        aria-invalid={showErrors && !!nameError}
                        aria-describedby={showErrors && nameError ? "e-name" : undefined}
                        className={cn("input-field", showErrors && nameError && "input-error")}
                      />
                      {showErrors && nameError && (
                        <p id="e-name" className="mt-1.5 text-sm text-red-600">
                          {nameError}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="f-phone" className="mb-1.5 block text-sm font-semibold text-ink-700">
                        연락처
                      </label>
                      <input
                        id="f-phone"
                        ref={phoneRef}
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="010-0000-0000"
                        aria-invalid={showErrors && !!phoneError}
                        aria-describedby={showErrors && phoneError ? "e-phone" : undefined}
                        className={cn("input-field tnum", showErrors && phoneError && "input-error")}
                      />
                      {showErrors && phoneError && (
                        <p id="e-phone" className="mt-1.5 text-sm text-red-600">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <fieldset>
                      <legend className="mb-1.5 block text-sm font-semibold text-ink-700">
                        산책 봉사 경험이 있나요?
                      </legend>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { v: true, label: "네, 있어요" },
                          { v: false, label: "처음이에요" },
                        ].map(({ v, label }) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => setExperienced(v)}
                            aria-pressed={experienced === v}
                            className={cn(
                              "min-h-[52px] rounded-2xl border text-[15px] font-semibold transition-colors duration-150",
                              experienced === v
                                ? "border-sage-600 bg-sage-600 text-white"
                                : cn(
                                    "bg-white text-ink-700 hover:border-sage-400",
                                    showErrors && expError ? "border-red-400" : "border-cream-300"
                                  )
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {showErrors && expError && <p className="mt-1.5 text-sm text-red-600">{expError}</p>}
                      {experienced === false && (
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
                        <span className="font-normal text-ink-400">선택 · {memo.length}/100</span>
                      </label>
                      <textarea
                        id="f-memo"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value.slice(0, 100))}
                        rows={3}
                        placeholder="궁금한 점이나 전하고 싶은 말이 있다면 적어주세요."
                        className="input-field resize-none"
                      />
                    </div>
                  </div>
                </section>
              )}

              {step === 3 && (
                <section aria-labelledby="step-title">
                  <h2 id="step-title" className="text-xl font-bold text-ink-900">
                    산책 전에 약속해주세요
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-500">아이들의 안전을 위한 약속이에요.</p>
                  <button
                    type="button"
                    onClick={() => setAgreed(CAUTIONS.map(() => !allAgreed))}
                    aria-pressed={allAgreed}
                    className="mt-5 flex min-h-[56px] w-full items-center gap-3 rounded-2xl border border-cream-300 bg-white px-4 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors",
                        allAgreed ? "border-sage-600 bg-sage-600 text-white" : "border-cream-300"
                      )}
                    >
                      {allAgreed && <Check className="h-4 w-4" strokeWidth={3} />}
                    </span>
                    <span className="text-base font-semibold text-ink-900">모두 확인했어요</span>
                  </button>
                  <ul className="mt-2 divide-y divide-cream-200">
                    {CAUTIONS.map((caution, i) => (
                      <li key={caution}>
                        <button
                          type="button"
                          onClick={() => setAgreed((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                          aria-pressed={agreed[i]}
                          className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left"
                        >
                          <Check
                            className={cn("h-5 w-5 shrink-0", agreed[i] ? "text-sage-600" : "text-cream-300")}
                            strokeWidth={3}
                          />
                          <span className="text-[15px] leading-relaxed text-ink-700">{caution}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {step === 4 && date && time && (
                <section aria-labelledby="step-title">
                  <h2 id="step-title" className="text-xl font-bold text-ink-900">
                    이대로 신청할까요?
                  </h2>
                  <p className="mt-1 text-[15px] text-ink-500">
                    신청 후 보호소가 확인하면 방문예정으로 바뀌어요.
                  </p>
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
                      {summary.map(({ label, value, step: s }) => (
                        <div key={label} className="flex items-center gap-4 px-5 py-3">
                          <dt className="w-20 shrink-0 text-ink-400">{label}</dt>
                          <dd className="min-w-0 flex-1 font-medium tabular-nums text-ink-900">{value}</dd>
                          <button
                            type="button"
                            onClick={() => goTo(s)}
                            className="-mr-2 min-h-[40px] shrink-0 rounded-full px-3 text-sm font-medium text-ink-400 hover:bg-cream-100 hover:text-ink-900"
                            aria-label={`${label} 변경`}
                          >
                            변경
                          </button>
                        </div>
                      ))}
                    </dl>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* 진행 버튼 — 모바일은 화면 하단 고정, PC는 흐름 아래에 붙어 따라옴 */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300/70 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:sticky sm:inset-x-auto sm:-mx-6 sm:mt-10 sm:rounded-t-2xl sm:px-6">
            {restored && !stepReady && hint && (
              <p className="mb-2 text-center text-[13px] text-ink-400" aria-live="polite">
                {hint}
              </p>
            )}
            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goPrev}
                  disabled={submitting}
                  className="btn-secondary btn-lg flex-1"
                >
                  이전
                </button>
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!restored || !stepReady}
                  className="btn-primary btn-lg flex-[2]"
                >
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="btn-primary btn-lg flex-[2]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 신청하고 있어요
                    </>
                  ) : (
                    "산책 신청하기"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PC: 지금까지 고른 내용 — 넓은 화면의 빈 옆자리를 '무엇을 신청 중인지'로 채웁니다 */}
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
                { label: "날짜", value: date ? formatDateKo(date) : null },
                { label: "시간", value: time ? formatTimeKo(time) : null },
                { label: "추천 산책", value: dog.walkNote.recommendedDuration },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-ink-400">{label}</dt>
                  <dd className={cn("tabular-nums", value ? "font-semibold text-ink-900" : "text-ink-300")}>
                    {value ?? "선택 전"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="container-app max-w-2xl py-10" />}>
      <ApplyFlow />
    </Suspense>
  );
}
