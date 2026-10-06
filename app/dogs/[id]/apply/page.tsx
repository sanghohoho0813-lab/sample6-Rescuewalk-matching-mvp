"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Stepper from "@/components/Stepper";
import { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { LAST_STEP, STEP_LABELS } from "@/lib/domain/apply";
import { withJosa } from "@/lib/utils";
import { useApplyFlow } from "./useApplyFlow";
import {
  AppliedNotice,
  ApplySummary,
  DateStep,
  InfoStep,
  PromiseStep,
  ReviewStep,
  TimeStep,
  type InfoFieldRefs,
} from "./steps";

const HINTS = ["산책할 날짜를 선택해주세요", "시간을 선택해주세요", null, "모든 항목을 확인해주세요", null];

const backClass =
  "-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-700 transition-colors hover:bg-cream-200";

function ApplyFlowPage() {
  const params = useParams<{ id: string }>();
  const dog = getDog(params.id);
  const flow = useApplyFlow(dog);
  const fieldRefs: InfoFieldRefs = useRef({});
  const firstStepRender = useRef(true);

  // 단계가 바뀌면 새 단계 제목으로 포커스를 옮겨, 키보드·스크린리더 사용자가 처음부터 읽게 합니다
  useEffect(() => {
    if (!flow.restored) return;
    if (firstStepRender.current) {
      firstStepRender.current = false;
      return;
    }
    document.getElementById("step-title")?.focus({ preventScroll: true });
  }, [flow.step, flow.restored]);

  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);

  if (dog.availability === "unavailable") {
    return (
      <div className="container-app max-w-lg py-16 text-center">
        <h1 className="text-lg font-bold text-ink-900">{withJosa(dog.name, "는")} 지금 잠시 쉬는 중이에요</h1>
        <p className="mt-2 text-[15px] text-ink-500">건강하게 돌아오면 다시 만나요.</p>
        <Link href="/dogs?today=1" className="btn-primary mt-6">
          오늘 산책 가능한 아이 보기
        </Link>
      </div>
    );
  }

  if (flow.appliedRequest) return <AppliedNotice flow={flow} dog={dog} />;

  const { step, restored, stepReady, submitting } = flow;
  const hint = HINTS[step];

  const onNext = () => {
    const firstInvalid = flow.goNext();
    if (firstInvalid) fieldRefs.current[firstInvalid]?.focus();
  };

  return (
    <div className="container-app max-w-2xl pb-32 pt-4 sm:pb-10 md:pt-8 lg:max-w-5xl">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {step === 0 ? (
              <Link href={`/dogs/${dog.id}`} aria-label={`${dog.name} 소개로 돌아가기`} className={backClass}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            ) : (
              <button type="button" onClick={flow.goPrev} aria-label="이전 단계" className={backClass}>
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
              <p className="truncate text-[13px] text-ink-500 lg:hidden">
                {shelter?.name} · {shelter?.region}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <Stepper steps={[...STEP_LABELS]} current={step} />
          </div>

          {!restored ? (
            <div className="mt-8 space-y-4" aria-busy="true" aria-label="신청서를 불러오는 중">
              <div className="h-7 w-48 animate-pulse rounded-lg bg-cream-200" />
              <div className="h-5 w-64 animate-pulse rounded-lg bg-cream-200" />
              <div className="mt-5 h-40 animate-pulse rounded-2xl bg-cream-200" />
            </div>
          ) : (
            <div key={step} className="mt-8 animate-fade-up motion-reduce:animate-none">
              {step === 0 && <DateStep flow={flow} />}
              {step === 1 && <TimeStep flow={flow} dog={dog} />}
              {step === 2 && <InfoStep flow={flow} fieldRefs={fieldRefs} />}
              {step === 3 && <PromiseStep flow={flow} />}
              {step === 4 && <ReviewStep flow={flow} dog={dog} shelter={shelter} />}
            </div>
          )}

          {/* 진행 버튼 — 모바일은 화면 하단 고정, PC는 흐름 아래에 붙어 따라옴 */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-cream-300/70 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md sm:sticky sm:inset-x-auto sm:-mx-6 sm:mt-10 sm:rounded-t-2xl sm:px-6">
            {restored && !stepReady && hint && (
              <p className="mb-2 text-center text-[13px] text-ink-500" aria-live="polite">
                {hint}
              </p>
            )}
            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={flow.goPrev}
                  disabled={submitting}
                  className="btn-secondary btn-lg flex-1"
                >
                  이전
                </button>
              )}
              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={onNext}
                  disabled={!restored || !stepReady}
                  className="btn-primary btn-lg flex-[2]"
                >
                  다음
                </button>
              ) : (
                <button
                  type="button"
                  onClick={flow.submit}
                  disabled={submitting}
                  aria-busy={submitting}
                  className="btn-primary btn-lg flex-[2]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> 신청하고 있어요
                    </>
                  ) : (
                    "산책 신청하기"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <ApplySummary flow={flow} dog={dog} shelter={shelter} />
      </div>
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="container-app max-w-2xl py-10" />}>
      <ApplyFlowPage />
    </Suspense>
  );
}
