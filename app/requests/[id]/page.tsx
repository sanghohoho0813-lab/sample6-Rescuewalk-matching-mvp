"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  PawPrint,
} from "lucide-react";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import DogImage, { DogFace } from "@/components/DogImage";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import {
  cn,
  formatDateFullKo,
  formatDateKo,
  formatTimeKo,
  relativeDayLabel,
  todayISO,
} from "@/lib/utils";
import type { WalkRequest } from "@/lib/types";

const DURATIONS = [20, 30, 40, 60, 90];

function formatStamp(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

function Timeline({ req }: { req: WalkRequest }) {
  const cancelled = req.status === "cancelled";
  const steps = [
    { label: "신청", at: req.createdAt, done: true },
    { label: "보호소 확인", at: req.confirmedAt, done: !!req.confirmedAt },
    { label: "산책·기록", at: req.completedAt, done: !!req.completedAt },
  ];
  return (
    <ol className="grid grid-cols-3" aria-label="진행 상황">
      {steps.map((s, i) => {
        const current = !cancelled && !s.done && (i === 0 || steps[i - 1].done);
        return (
          <li key={s.label} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={cn(
                  "absolute right-1/2 top-3 h-0.5 w-full -translate-y-1/2",
                  s.done ? "bg-sage-400" : "bg-cream-300"
                )}
              />
            )}
            <span
              className={cn(
                "relative flex h-6 w-6 items-center justify-center rounded-full border-2",
                s.done && "border-sage-500 bg-sage-500 text-white",
                current && "border-tangerine-400 bg-white",
                !s.done && !current && "border-cream-300 bg-white"
              )}
            >
              {s.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              {current && <span className="h-2 w-2 rounded-full bg-tangerine-400" />}
            </span>
            <span
              className={cn(
                "mt-2 text-[13px] font-semibold",
                s.done ? "text-ink-900" : current ? "text-tangerine-700" : "text-ink-400"
              )}
            >
              {s.label}
            </span>
            <span className="tnum mt-0.5 text-xs text-ink-400">
              {formatStamp(s.at) ?? (current ? "진행 중" : "–")}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { requests, activityLogs, hydrated, cancelRequest, confirmRequest, completeWalk, showToast } =
    useStore();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [duration, setDuration] = useState(40);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!hydrated) {
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
  const today = todayISO();
  const isPast = req.date < today;
  const canCancel = req.status === "pending" || req.status === "confirmed";

  const doCancel = () => {
    cancelRequest(req.id);
    setCancelOpen(false);
    showToast("산책 신청을 취소했어요.");
  };

  const doConfirm = () => {
    confirmRequest(req.id);
    showToast(`${dog.name}와의 방문이 확정됐어요!`, "✅");
  };

  const doLog = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      const logId = completeWalk(req.id, { durationMin: duration, note });
      if (!logId) {
        setBusy(false);
        showToast("기록할 수 없는 상태예요. 새로고침 후 다시 시도해주세요.");
        return;
      }
      router.push(`/activity?new=${logId}`);
    }, 500);
  };

  // 상태별 안내와 단 하나의 주요 행동
  const callout = (() => {
    switch (req.status) {
      case "pending":
        return {
          tone: "bg-tangerine-50 border-tangerine-100",
          title: "보호소가 신청을 확인하고 있어요",
          body: "보통 하루 안에 확정 연락을 드려요. 확정되면 방문예정으로 바뀌어요.",
        };
      case "confirmed":
        return {
          tone: "bg-sage-50 border-sage-100",
          title: isPast
            ? "방문일이 지났어요. 산책을 마쳤다면 기록을 남겨주세요"
            : `${relativeDayLabel(req.date, today)}, ${dog.name}를 만나러 가요`,
          body: `${formatDateKo(req.date)} ${formatTimeKo(req.time)} · ${shelter?.name}. 10분 전까지 도착해주세요.`,
        };
      case "completed":
        return {
          tone: "bg-sage-50 border-sage-100",
          title: log
            ? `${dog.name}와 ${log.durationMin}분 함께 걸었어요`
            : `${dog.name}와의 산책을 마쳤어요`,
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

  const primary = (() => {
    switch (req.status) {
      case "confirmed":
        return (
          <button type="button" onClick={() => setLogOpen(true)} className="btn-primary btn-lg w-full">
            <PawPrint className="h-4 w-4" /> 산책 완료 기록하기
          </button>
        );
      case "completed":
        return (
          <Link href="/activity" className="btn-primary btn-lg w-full">
            활동 기록 보기
          </Link>
        );
      case "cancelled":
        return dog.availability === "unavailable" ? (
          <Link href="/dogs" className="btn-primary btn-lg w-full">
            다른 아이 둘러보기
          </Link>
        ) : (
          <Link href={`/dogs/${dog.id}/apply`} className="btn-primary btn-lg w-full">
            {dog.name}와 다시 신청하기
          </Link>
        );
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
        <ArrowLeft className="h-4 w-4" /> 신청 내역
      </Link>

      <div className="mt-2 grid gap-8 lg:grid-cols-[1fr_340px] lg:gap-12">
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
                {dog.breed} · {shelter?.name}
              </p>
            </div>
          </div>

          {/* 지금 상태 + 할 일 */}
          <div className={cn("mt-6 rounded-[20px] border p-5", callout.tone)}>
            <p className="text-[17px] font-bold leading-snug text-ink-900">{callout.title}</p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{callout.body}</p>

            {req.status === "pending" && (
              <div className="mt-4 border-t border-tangerine-100 pt-4">
                <p className="text-[13px] leading-relaxed text-ink-500">
                  <span className="mr-1.5 rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-ink-500">
                    데모
                  </span>
                  실제 서비스에서는 보호소가 승인해요. 시연에서는 직접 승인해볼 수 있어요.
                </p>
                <button type="button" onClick={doConfirm} className="btn-secondary mt-3 w-full sm:w-auto">
                  <Check className="h-4 w-4" /> 보호소 승인 처리하기
                </button>
              </div>
            )}
            {req.status === "confirmed" && !isPast && (
              <p className="mt-3 text-[13px] text-ink-500">
                <span className="mr-1.5 rounded bg-white px-1.5 py-0.5 text-xs font-semibold text-ink-500">
                  데모
                </span>
                시연에서는 방문일 전에도 산책 완료를 기록할 수 있어요.
              </p>
            )}
            {primary && <div className="mt-4 lg:hidden">{primary}</div>}
          </div>

          <div className="mt-8">
            <Timeline req={req} />
          </div>

          {/* 방문 정보 */}
          <section className="mt-10">
            <h2 className="text-base font-bold text-ink-900">방문 정보</h2>
            <dl className="mt-3 divide-y divide-cream-200 border-y border-cream-200 text-[15px]">
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">방문일</dt>
                <dd className="flex items-center gap-1.5 font-medium text-ink-900">
                  <CalendarDays className="h-4 w-4 text-sage-500" aria-hidden />
                  <span className="tnum">{formatDateFullKo(req.date)}</span>
                </dd>
              </div>
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">시간</dt>
                <dd className="flex items-center gap-1.5 font-medium text-ink-900">
                  <Clock className="h-4 w-4 text-sage-500" aria-hidden />
                  <span className="tnum">{formatTimeKo(req.time)}</span>
                </dd>
              </div>
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">장소</dt>
                <dd className="min-w-0 text-ink-900">
                  <Link href={`/shelters/${shelter?.id}`} className="font-medium hover:underline">
                    {shelter?.name}
                  </Link>
                  <p className="mt-0.5 flex items-start gap-1 text-sm text-ink-500">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {shelter?.address}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">{shelter?.hours}</p>
                </dd>
              </div>
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">예약번호</dt>
                <dd className="tnum font-mono text-sm text-ink-700">{req.reservationNo}</dd>
              </div>
            </dl>
          </section>

          {/* 신청자 정보 */}
          <section className="mt-8">
            <h2 className="text-base font-bold text-ink-900">신청자 정보</h2>
            <dl className="mt-3 divide-y divide-cream-200 border-y border-cream-200 text-[15px]">
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">이름</dt>
                <dd className="text-ink-900">{req.applicant.name}</dd>
              </div>
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">연락처</dt>
                <dd className="tnum text-ink-900">{req.applicant.phone}</dd>
              </div>
              <div className="flex gap-4 py-3.5">
                <dt className="w-20 shrink-0 text-ink-400">봉사 경험</dt>
                <dd className="text-ink-900">{req.applicant.experienced ? "있어요" : "처음이에요"}</dd>
              </div>
              {req.applicant.memo && (
                <div className="flex gap-4 py-3.5">
                  <dt className="w-20 shrink-0 text-ink-400">메모</dt>
                  <dd className="text-ink-900">{req.applicant.memo}</dd>
                </div>
              )}
            </dl>
          </section>

          {canCancel && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-ink-400 underline-offset-4 hover:text-red-600 hover:underline"
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
              <p className="mt-1 text-lg font-bold text-ink-900">{dog.name}와의 산책</p>
              {primary && <div className="mt-4">{primary}</div>}
              {!primary && (
                <p className="mt-3 text-sm leading-relaxed text-ink-500">
                  보호소 확인이 끝나면 여기에서 산책을 기록할 수 있어요.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <Dialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={`${dog.name}와의 산책 신청을 취소할까요?`}
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
        title={`${dog.name}와의 산책을 기록해요`}
        description="기록은 활동 기록과 배지에 바로 반영돼요."
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
                  <Loader2 className="h-4 w-4 animate-spin" /> 저장하고 있어요
                </>
              ) : (
                "기록 완료"
              )}
            </button>
          </>
        }
      >
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
                    ? "border-sage-500 bg-sage-500 text-white"
                    : "border-cream-300 bg-white text-ink-700 hover:border-sage-300"
                )}
              >
                {m}분
              </button>
            ))}
          </div>
        </fieldset>
        <label className="mt-5 block">
          <span className="flex items-baseline justify-between text-sm font-semibold text-ink-700">
            오늘의 한 줄 <span className="font-normal text-ink-400">선택 · {note.length}/120</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 120))}
            rows={3}
            placeholder={`${dog.name}와의 산책은 어땠나요?`}
            className="input-field mt-2 resize-none"
          />
        </label>
      </Dialog>
    </div>
  );
}
