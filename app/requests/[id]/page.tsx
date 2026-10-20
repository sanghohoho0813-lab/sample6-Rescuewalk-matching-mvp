"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarPlus,
  Check,
  Clock,
  Loader2,
  MapPin,
  MessageSquareText,
  PawPrint,
  Phone,
} from "lucide-react";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import PrepChecklist from "@/components/PrepChecklist";
import QuickAction from "@/components/QuickAction";
import StatusBadge from "@/components/StatusBadge";
import VisitInfo from "@/components/VisitInfo";
import VisitStages from "@/components/VisitStages";
import DogImage, { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { OBSERVATIONS } from "@/lib/domain/impact";
import { canCancel, currentStageIndex } from "@/lib/domain/requests";
import { useStore } from "@/lib/store";
import { useClock } from "@/lib/useClock";
import { buildIcs, downloadIcs, visitEvent } from "@/lib/calendar";
import { ARRIVE_EARLY_MIN, COMMON_BRING, CONTACT_FLOW, PROVIDED, mapLink, telLink } from "@/lib/visitGuide";
import { cn, formatDateFullKo, formatDateKo, formatTimeKo, relativeDayLabel, withJosa } from "@/lib/utils";

const DURATIONS = [20, 30, 40, 60, 90];

function DemoNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 text-[13px] leading-relaxed text-ink-500">
      <span className="mr-1.5 rounded bg-white px-1.5 py-0.5 text-[13px] font-semibold text-ink-500 ring-1 ring-cream-300">
        데모
      </span>
      {children}
    </p>
  );
}

/**
 * 신청 상세 — "언제, 어디로, 무엇을 들고 가면 되는지"가 한눈에.
 * 지금 단계(접수·승인·방문 예정·산책·완료)에 맞는 안내와 행동 하나를 맨 위에 둡니다.
 */
export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clock = useClock();
  const { requests, activityLogs, hydrated, cancelRequest, confirmRequest, completeWalk, showToast } =
    useStore();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [duration, setDuration] = useState(40);
  const [note, setNote] = useState("");
  const [observations, setObservations] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  if (!hydrated || !clock) {
    return (
      <div className="container-app max-w-3xl py-8" aria-busy="true">
        <div className="h-5 w-24 animate-pulse rounded-full bg-cream-200" />
        <div className="mt-6 flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-2xl bg-cream-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 animate-pulse rounded-full bg-cream-200" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-cream-200" />
          </div>
        </div>
        <div className="mt-8 h-40 animate-pulse rounded-[20px] bg-cream-200" />
      </div>
    );
  }

  const req = requests.find((r) => r.id === params.id);
  const dog = req ? getDog(req.dogId) : undefined;

  if (!req || !dog) {
    return (
      <div className="container-app max-w-lg py-12">
        <EmptyState
          message={"신청 내역을 찾지 못했어요.\n데모 데이터를 초기화했다면 목록에서 다시 확인해주세요."}
          ctaLabel="신청 내역으로"
          ctaHref="/requests"
        />
      </div>
    );
  }

  const shelter = getShelter(dog.shelterId);
  const log = activityLogs.find((l) => l.requestId === req.id);
  const stage = currentStageIndex(req, clock.now);
  const cancellable = canCancel(req);
  const isOpen = req.status === "pending" || req.status === "confirmed";

  const doCancel = () => {
    cancelRequest(req.id);
    setCancelOpen(false);
    showToast("산책 신청을 취소했어요");
  };

  const doConfirm = () => {
    confirmRequest(req.id);
    showToast(`${withJosa(dog.name, "와")}의 방문이 확정됐어요`);
  };

  const doLog = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      const logId = completeWalk(req.id, { durationMin: duration, note, observations });
      if (!logId) {
        setBusy(false);
        showToast("기록할 수 없는 상태예요. 새로고침 후 다시 시도해주세요.");
        return;
      }
      router.push(`/activity?new=${logId}`);
    }, 500);
  };

  /** 방문 일정을 캘린더 파일로 — 하루 전 알림 포함 */
  const addToCalendar = () => {
    if (!shelter) return;
    downloadIcs(`rescuewalk-${req.reservationNo}.ics`, buildIcs(visitEvent(req, dog, shelter)));
    showToast("캘린더 파일을 받았어요. 열면 일정에 추가돼요");
  };

  // 지금 단계의 안내와 단 하나의 주요 행동
  const now = (() => {
    switch (req.status) {
      case "pending":
        return {
          tone: "bg-tangerine-50 border-tangerine-100",
          title: "보호소가 신청을 확인하고 있어요",
          body: "보통 하루 안에 문자로 승인 안내를 드려요. 승인되면 방문 예정으로 바뀌어요.",
        };
      case "confirmed":
        return stage === 3
          ? {
              tone: "bg-sage-50 border-sage-100",
              title: `${withJosa(dog.name, "와")}의 산책은 어땠나요?`,
              body: "걸은 시간과 아이 모습을 남겨주세요. 보호소가 아이 기록에 반영해요.",
            }
          : {
              tone: "bg-sage-50 border-sage-100",
              title: `${relativeDayLabel(req.date, clock.today)}, ${withJosa(dog.name, "를")} 만나러 가요`,
              body: `${formatDateKo(req.date)} ${formatTimeKo(req.time)} · ${ARRIVE_EARLY_MIN}분 전까지 와주세요. 만나는 곳은 아래 방문 정보에 있어요.`,
            };
      case "completed":
        return {
          tone: "bg-sage-50 border-sage-100",
          title: log
            ? `${withJosa(dog.name, "와")} ${log.durationMin}분 함께 걸었어요`
            : `${withJosa(dog.name, "와")}의 산책을 마쳤어요`,
          body: log?.note || "소중한 시간을 내주셔서 고마워요.",
        };
      default:
        return {
          tone: "bg-cream-100 border-cream-300",
          title: "취소된 신청이에요",
          body: "다른 날짜로 다시 신청할 수 있어요.",
        };
    }
  })();

  const reapply =
    dog.availability === "unavailable" ? (
      <Link href="/dogs" className="btn-primary btn-lg w-full">
        다른 아이 둘러보기
      </Link>
    ) : (
      <Link href={`/dogs/${dog.id}/apply`} className="btn-primary btn-lg w-full">
        {withJosa(dog.name, "와")} 다시 산책하기
      </Link>
    );

  const primary = (() => {
    switch (req.status) {
      case "confirmed":
        return (
          <button type="button" onClick={() => setLogOpen(true)} className="btn-primary btn-lg w-full">
            <PawPrint className="h-4 w-4" aria-hidden /> 산책 완료 기록하기
          </button>
        );
      case "completed":
      case "cancelled":
        return reapply;
      default:
        return null;
    }
  })();

  return (
    <div className="container-app max-w-5xl py-6 md:py-10">
      <Link
        href="/requests"
        className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden /> 신청 내역
      </Link>

      <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
        <div className="min-w-0">
          {/* 대상 */}
          <div className="flex items-center gap-4">
            <Link
              href={`/dogs/${dog.id}`}
              className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
              aria-label={`${dog.name} 상세 보기`}
            >
              <DogFace dog={dog} sizes="64px" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-2xl font-bold text-ink-900">{dog.name}</h1>
                <StatusBadge status={req.status} />
              </div>
              <p className="mt-0.5 truncate text-[15px] text-ink-500">
                {shelter?.name} · 예약번호 <span className="tnum font-mono text-sm">{req.reservationNo}</span>
              </p>
            </div>
          </div>

          {/* 진행 단계 + 지금 할 일 */}
          <section aria-label="진행 상황" className={cn("mt-6 rounded-[20px] border p-5", now.tone)}>
            <VisitStages req={req} />
            <div className="mt-5 border-t border-black/5 pt-4">
              <p className="text-[17px] font-bold leading-snug text-ink-900">{now.title}</p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{now.body}</p>
              {req.status === "completed" && log?.observations && log.observations.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="남긴 관찰">
                  {log.observations.map((o) => (
                    <li key={o} className="chip bg-white text-ink-700 ring-1 ring-sage-100">
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              {req.status === "pending" && (
                <>
                  <DemoNote>
                    실제 서비스에서는 보호소가 승인해요. 시연에서는 직접 승인해볼 수 있어요.
                  </DemoNote>
                  <button type="button" onClick={doConfirm} className="btn-secondary mt-3 w-full sm:w-auto">
                    <Check className="h-4 w-4" aria-hidden /> 보호소 승인 처리하기
                  </button>
                </>
              )}
              {req.status === "confirmed" && stage === 2 && (
                <DemoNote>시연에서는 방문일 전에도 산책 완료를 기록할 수 있어요.</DemoNote>
              )}
              {primary && <div className="mt-4 lg:hidden">{primary}</div>}
            </div>
          </section>

          {/* 방문 바로가기 — 가기 전·가는 길에 가장 자주 하는 세 가지 */}
          {isOpen && shelter && (
            <nav aria-label="방문 바로가기" className="mt-4 grid grid-cols-3 gap-2.5">
              <QuickAction icon={MapPin} label="길찾기" href={mapLink(shelter)} />
              <QuickAction icon={Phone} label="보호소 전화" href={telLink(shelter.phone)} />
              <QuickAction icon={CalendarPlus} label="캘린더에 추가" onClick={addToCalendar} />
            </nav>
          )}

          {/* 방문 정보 — 열려 있는 신청에서 가장 중요한 정보 */}
          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink-900">방문 정보</h2>
            <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-cream-300">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage-50 text-sage-700">
                <Clock className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-[17px] font-bold text-ink-900">
                  <span className="tnum">{formatDateFullKo(req.date)}</span>{" "}
                  <span className="tnum">{formatTimeKo(req.time)}</span>
                </span>
                <span className="block text-sm text-ink-500">
                  {isOpen
                    ? `${ARRIVE_EARLY_MIN}분 전 도착 · 산책 ${dog.walkNote.recommendedDuration}`
                    : `산책 ${dog.walkNote.recommendedDuration}`}
                </span>
              </span>
            </div>
            {shelter && (
              <VisitInfo
                shelter={shelter}
                className="mt-3"
                fields={
                  isOpen ? ["meetingPoint", "address", "transit", "parking", "phone"] : ["address", "phone"]
                }
              />
            )}
          </section>

          {isOpen && (
            <>
              <section className="mt-10">
                <h2 className="text-lg font-bold text-ink-900">챙겨 오세요</h2>
                <div className="mt-3">
                  <PrepChecklist requestId={req.id} items={[...COMMON_BRING, ...(dog.bring ?? [])]} />
                </div>
                <p className="mt-2 text-sm text-ink-500">{PROVIDED}</p>
                <p className="mt-2 rounded-xl bg-tangerine-50 px-3.5 py-2.5 text-sm text-ink-900">
                  <strong className="font-semibold">{dog.name}</strong> · {dog.walkNote.caution}
                </p>
              </section>

              <section className="mt-10">
                <h2 className="flex items-center gap-1.5 text-lg font-bold text-ink-900">
                  <MessageSquareText className="h-4 w-4 text-sage-600" aria-hidden /> 연락은 이렇게 와요
                </h2>
                <ol className="mt-3 space-y-2">
                  {CONTACT_FLOW.map((c, i) => (
                    <li key={c} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-700">
                      <span className="tnum mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream-200 text-xs font-bold text-ink-700">
                        {i + 1}
                      </span>
                      {c}
                    </li>
                  ))}
                </ol>
              </section>
            </>
          )}

          {/* 신청자 정보 */}
          <section className="mt-10">
            <h2 className="text-lg font-bold text-ink-900">신청자 정보</h2>
            <dl className="mt-3 divide-y divide-cream-200 border-y border-cream-200 text-[15px]">
              {[
                { label: "이름", value: req.applicant.name },
                { label: "연락처", value: <span className="tnum">{req.applicant.phone}</span> },
                { label: "봉사 경험", value: req.applicant.experienced ? "있어요" : "처음이에요" },
                ...(req.applicant.memo ? [{ label: "남긴 말", value: req.applicant.memo }] : []),
              ].map((row) => (
                <div key={row.label} className="flex gap-4 py-3">
                  <dt className="w-20 shrink-0 text-ink-500">{row.label}</dt>
                  <dd className="text-ink-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {cancellable && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink-500 underline-offset-4 hover:text-red-700 hover:underline"
              >
                신청 취소하기
              </button>
            </div>
          )}
        </div>

        {/* PC: 요약 + 주요 행동 */}
        <aside className="hidden lg:block">
          <div className="card sticky top-24 overflow-hidden">
            <DogImage dog={dog} aspect="aspect-[4/3]" sizes="340px" />
            <div className="p-5">
              <p className="tnum text-sm text-ink-500">
                {formatDateKo(req.date)} · {formatTimeKo(req.time)}
              </p>
              <p className="mt-1 text-lg font-bold text-ink-900">{withJosa(dog.name, "와")}의 산책</p>
              {primary ? (
                <div className="mt-4">{primary}</div>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  보호소가 승인하면 여기에서 산책을 기록할 수 있어요.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={`${withJosa(dog.name, "와")}의 산책 신청을 취소할까요?`}
        description="취소하면 이 시간은 다른 봉사자에게 열려요. 나중에 다시 신청할 수 있어요."
        footer={
          <>
            <button type="button" onClick={() => setCancelOpen(false)} className="btn-secondary flex-1">
              유지하기
            </button>
            <button type="button" onClick={doCancel} className="btn-danger flex-1">
              신청 취소
            </button>
          </>
        }
      />

      <Dialog
        open={logOpen}
        onClose={() => setLogOpen(false)}
        busy={busy}
        title={`${withJosa(dog.name, "와")}의 산책을 기록해요`}
        description="남긴 기록은 활동 기록과 보호소의 아이 기록에 함께 반영돼요."
        footer={
          <>
            <button
              type="button"
              onClick={() => setLogOpen(false)}
              disabled={busy}
              className="btn-secondary flex-1"
            >
              나중에
            </button>
            <button type="button" onClick={doLog} disabled={busy} className="btn-primary flex-[2]">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> 저장하고 있어요
                </>
              ) : (
                "기록 완료"
              )}
            </button>
          </>
        }
      >
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-cream-100/70 p-3">
          <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            <DogFace dog={dog} sizes="48px" />
          </span>
          <span className="min-w-0 text-sm">
            <span className="block font-semibold text-ink-900">{dog.name}</span>
            <span className="tnum block truncate text-ink-500">
              {formatDateKo(req.date)} {formatTimeKo(req.time)} · {shelter?.name}
            </span>
          </span>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold text-ink-700">함께 걸은 시간</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {DURATIONS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setDuration(m)}
                aria-pressed={duration === m}
                className={cn(
                  "tnum min-h-[44px] rounded-xl border text-sm font-semibold transition-colors",
                  duration === m
                    ? "border-sage-600 bg-sage-600 text-white"
                    : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
                )}
              >
                {m}분
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-ink-700">
            {withJosa(dog.name, "는")} 어땠나요?{" "}
            <span className="font-normal text-ink-500">선택 · 여러 개</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {OBSERVATIONS.map((o) => {
              const on = observations.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setObservations((prev) => (on ? prev.filter((x) => x !== o) : [...prev, o]))}
                  className={cn(
                    "min-h-[40px] rounded-full border px-3.5 text-sm transition-colors",
                    on
                      ? "border-sage-600 bg-sage-600 font-semibold text-white"
                      : "border-cream-300 bg-white text-ink-700"
                  )}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label className="mt-5 block">
          <span className="flex items-baseline justify-between text-sm font-semibold text-ink-700">
            오늘의 한 줄 <span className="font-normal text-ink-500">선택 · {note.length}/120</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 120))}
            rows={3}
            placeholder={`${withJosa(dog.name, "와")}의 산책은 어땠나요?`}
            className="input-field mt-2 resize-none"
          />
        </label>
      </Dialog>
    </div>
  );
}
