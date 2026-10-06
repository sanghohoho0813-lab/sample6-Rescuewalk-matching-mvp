"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  CAUTIONS,
  LAST_STEP,
  bookedSlotsByDate,
  maxReachableStep,
  openSlotsOn,
  parseStepParam,
  pastSlotsFor,
  restoreDraft,
  validateApplicant,
  type ApplyDraft,
} from "@/lib/domain/apply";
import { useStore } from "@/lib/store";
import { appliedMarkerKey, applyDraftKey, safeSession } from "@/lib/storageKeys";
import { makeReservationNo, todayISO, upcomingDates } from "@/lib/utils";
import type { Dog, WalkRequest } from "@/lib/types";

/** 데모 계정 기본값 — 실제 서비스에서는 로그인 사용자 프로필 */
const DEFAULT_DRAFT: ApplyDraft = {
  date: null,
  time: null,
  name: "김지우",
  phone: "010-1234-5678",
  experienced: null,
  memo: "",
  agreed: CAUTIONS.map(() => false),
};

/** 날짜·시간을 고른 뒤 다음 단계로 넘어가기 전, 고른 표시를 보여주는 시간 */
const AUTO_ADVANCE_MS = 260;
/** 네트워크 요청이 있는 것처럼 보이는 제출 지연(실서비스에서는 API 응답 시간) */
const SUBMIT_DELAY_MS = 600;

/**
 * 산책 신청 흐름의 상태와 이동.
 * - 단계는 URL(?step=, 1부터)에 둬서 브라우저 뒤로/앞으로가 이전/다음 단계로 동작합니다.
 *   앞으로 갈 때만 기록을 쌓고(history.state.rwPrev = 직전 단계), '이전'은 그 기록을 되돌립니다.
 * - 입력값은 탭 단위(sessionStorage)로 임시 저장되어 새로고침해도 이어서 쓸 수 있습니다.
 * - 접수 후 뒤로가기로 돌아오면 빈 신청서 대신 '이미 신청했어요'를 보여 중복 신청을 막습니다.
 */
export function useApplyFlow(dog: Dog | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { requests, addRequest, hydrated, newId } = useStore();

  const [draft, setDraft] = useState<ApplyDraft>(DEFAULT_DRAFT);
  const [restored, setRestored] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const submittedRef = useRef(false);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = todayISO();
  const dates = useMemo(() => upcomingDates(14), []);
  const booked = useMemo(() => (dog ? bookedSlotsByDate(requests, dog.id) : new Map()), [requests, dog]);
  const openSlots = useCallback(
    (iso: string) => (dog ? openSlotsOn(dog, iso, booked, new Date(), todayISO()) : []),
    [dog, booked]
  );
  const pastSlots = useCallback((iso: string) => pastSlotsFor(iso, new Date(), todayISO()), []);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    []
  );

  // 복원은 신청 내역을 읽은 뒤에 — 그새 찬 시간을 걸러내야 하므로
  useEffect(() => {
    if (!dog || !hydrated || restored) return;
    const marker = safeSession.get(appliedMarkerKey(dog.id));
    const midFlow = parseStepParam(searchParams.get("step")) > 0;
    if (marker && midFlow && requests.some((r) => r.id === marker && r.status !== "cancelled")) {
      setAppliedId(marker);
    } else if (marker) {
      safeSession.remove(appliedMarkerKey(dog.id));
    }
    let raw: unknown = null;
    try {
      raw = JSON.parse(safeSession.get(applyDraftKey(dog.id)) ?? "null");
    } catch {
      raw = null;
    }
    setDraft(restoreDraft(raw, { selectableDates: dates.map((d) => d.iso), openSlots }, DEFAULT_DRAFT));
    setRestored(true);
  }, [dog, hydrated, restored, requests, searchParams, dates, openSlots]);

  useEffect(() => {
    if (!dog || !restored || submittedRef.current) return;
    safeSession.set(applyDraftKey(dog.id), JSON.stringify(draft));
  }, [dog, restored, draft]);

  const errors = validateApplicant(draft);
  const maxStep = maxReachableStep(draft);
  const urlStep = parseStepParam(searchParams.get("step"));
  const step = restored ? Math.min(urlStep, maxStep) : 0;

  // 주소의 단계가 채운 단계보다 앞서 있으면 주소를 바로잡습니다
  useEffect(() => {
    if (restored && !appliedId && urlStep > maxStep) {
      window.history.replaceState(window.history.state, "", `${pathname}?step=${maxStep + 1}`);
    }
  }, [restored, appliedId, urlStep, maxStep, pathname]);

  const update = useCallback((patch: Partial<ApplyDraft>) => setDraft((d) => ({ ...d, ...patch })), []);

  const pushStep = useCallback(
    (to: number, from: number) => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      window.history.pushState({ rwPrev: from }, "", `${pathname}?step=${to + 1}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [pathname]
  );

  const goTo = (to: number) => pushStep(to, step);

  const advanceSoon = (from: number) => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => pushStep(from + 1, from), AUTO_ADVANCE_MS);
  };

  const goPrev = () => {
    if (step === 0) return;
    if (window.history.state?.rwPrev === step - 1) {
      window.history.back();
    } else {
      // 새로고침 등으로 직전 단계 기록이 없으면 현재 기록을 이전 단계로 바꿉니다
      window.history.replaceState(window.history.state, "", `${pathname}?step=${step}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /** 다음 단계로. 정보 단계에서 막히면 오류를 보여주고 첫 오류 칸 이름을 돌려줍니다(포커스용) */
  const goNext = (): keyof typeof errors | null => {
    if (step === 2 && Object.keys(errors).length > 0) {
      setShowErrors(true);
      return (["name", "phone", "experienced"] as const).find((k) => errors[k]) ?? null;
    }
    if (step < LAST_STEP) goTo(step + 1);
    return null;
  };

  const pickDate = (iso: string) => {
    setNotice(null);
    update({ date: iso, time: draft.date === iso ? draft.time : null });
    advanceSoon(0);
  };

  const pickTime = (t: string) => {
    setNotice(null);
    update({ time: t });
    advanceSoon(1);
  };

  const submit = () => {
    if (!dog || !draft.date || !draft.time || submitting) return;
    // 확인 화면에 오래 머무는 사이 시간이 지났거나(당일) 다른 탭에서 같은 시간을 신청했을 수 있습니다
    if (!openSlots(draft.date).includes(draft.time)) {
      update({ time: null });
      setNotice("고른 시간은 이제 신청할 수 없어요. 다른 시간을 골라주세요.");
      window.history.replaceState(window.history.state, "", `${pathname}?step=2`);
      return;
    }
    setSubmitting(true);
    submittedRef.current = true;
    const req: WalkRequest = {
      id: newId("req"),
      reservationNo: makeReservationNo(draft.date),
      dogId: dog.id,
      date: draft.date,
      time: draft.time,
      applicant: {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        experienced: !!draft.experienced,
        memo: draft.memo.trim(),
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    // 실제 서비스에서는 walk_requests insert 로 대체되는 지점
    setTimeout(() => {
      addRequest(req);
      safeSession.remove(applyDraftKey(dog.id));
      safeSession.set(appliedMarkerKey(dog.id), req.id);
      router.push(`/complete/${req.id}`);
    }, SUBMIT_DELAY_MS);
  };

  const appliedRequest = appliedId ? requests.find((r) => r.id === appliedId) : undefined;
  const startOver = () => {
    if (dog) safeSession.remove(appliedMarkerKey(dog.id));
    setAppliedId(null);
    window.history.replaceState(window.history.state, "", `${pathname}?step=1`);
  };

  const stepReady = [!!draft.date, !!draft.time, true, draft.agreed.every(Boolean), true][step];

  return {
    draft,
    update,
    restored,
    step,
    stepReady,
    errors,
    showErrors,
    notice,
    submitting,
    dates,
    today,
    booked,
    openSlots,
    pastSlots,
    goTo,
    goPrev,
    goNext,
    pickDate,
    pickTime,
    submit,
    appliedRequest,
    startOver,
  };
}

export type ApplyFlow = ReturnType<typeof useApplyFlow>;
