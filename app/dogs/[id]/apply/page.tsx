"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Loader2,
  MapPin,
  PawPrint,
  UserRound,
} from "lucide-react";
import Stepper from "@/components/Stepper";
import TimeSlotPicker from "@/components/TimeSlotPicker";
import DogAvatar from "@/components/DogAvatar";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import {
  cn,
  formatDateKo,
  formatTimeKo,
  makeReservationNo,
  upcomingDates,
} from "@/lib/utils";
import type { WalkRequest } from "@/lib/types";

const STEP_LABELS = ["날짜", "시간", "정보", "주의사항", "확인"];

const CAUTIONS = [
  "보호소 도착 시간을 꼭 지켜주세요. 10분 전 도착을 권장해요.",
  "산책하기 편한 복장과 운동화를 착용해주세요.",
  "리드줄은 보호소 지침에 따라 항상 두 손으로 잡아주세요.",
  "산책 중 발생하는 상황은 보호소 매니저의 안내에 따라주세요.",
];

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const dog = getDog(params.id);
  const { requests, addRequest, showToast } = useStore();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("김지우");
  const [phone, setPhone] = useState("010-1234-5678");
  const [experienced, setExperienced] = useState<boolean | null>(null);
  const [memo, setMemo] = useState("");
  const [agreed, setAgreed] = useState<boolean[]>(CAUTIONS.map(() => false));
  const [submitting, setSubmitting] = useState(false);

  const dates = useMemo(() => upcomingDates(14), []);

  const bookedTimes = useMemo(() => {
    if (!dog || !date) return [];
    return requests
      .filter((r) => r.dogId === dog.id && r.date === date && r.status !== "cancelled")
      .map((r) => r.time);
  }, [requests, dog, date]);

  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);

  if (dog.availability === "unavailable") {
    return (
      <div className="container-app max-w-lg py-16 text-center">
        <p className="text-lg font-bold text-ink-900">{dog.name}는 지금 잠시 쉬는 중이에요.</p>
        <p className="mt-2 text-sm text-ink-500">건강하게 돌아오면 다시 만나요!</p>
        <Link href="/dogs" className="btn-primary mt-6">다른 아이 둘러보기</Link>
      </div>
    );
  }

  const allAgreed = agreed.every(Boolean);
  const canNext =
    (step === 0 && !!date) ||
    (step === 1 && !!time) ||
    (step === 2 && name.trim().length > 0 && phone.trim().length >= 9 && experienced !== null) ||
    (step === 3 && allAgreed) ||
    step === 4;

  const goNext = () => {
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submit = () => {
    if (!date || !time || submitting) return;
    setSubmitting(true);
    const req: WalkRequest = {
      id: `req-${Date.now()}`,
      reservationNo: makeReservationNo(date),
      dogId: dog.id,
      date,
      time,
      applicant: { name: name.trim(), phone: phone.trim(), experienced: !!experienced, memo: memo.trim() },
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    // 실제 서비스에서는 Supabase walk_requests insert 로 대체되는 지점
    setTimeout(() => {
      addRequest(req);
      showToast(`${dog.name}와의 산책이 신청됐어요!`, "🐾");
      router.push(`/complete/${req.id}`);
    }, 700);
  };

  return (
    <div className="container-app max-w-2xl py-6 md:py-10">
      {/* 상단: 뒤로 + 강아지 요약 */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? router.back() : setStep(step - 1))}
          aria-label="이전으로"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-ink-500 transition-colors hover:bg-cream-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-card">
            <DogAvatar dog={dog} className="h-full w-full" />
          </span>
          <div className="min-w-0 leading-tight">
            <h1 className="truncate text-lg font-extrabold text-ink-900">
              {dog.name}와의 산책 신청
            </h1>
            <p className="truncate text-[13px] text-ink-400">
              {shelter?.name} · {shelter?.region}
            </p>
          </div>
        </div>
      </div>

      <Stepper steps={STEP_LABELS} current={step} />

      <div key={step} className="mt-8 animate-fade-up">
        {/* Step 1: 날짜 */}
        {step === 0 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
              <CalendarDays className="h-5 w-5 text-tangerine-500" />
              언제 함께 걸을까요?
            </h2>
            <p className="mt-1 text-sm text-ink-500">앞으로 2주 안의 날짜를 선택할 수 있어요.</p>
            <div className="mt-5 grid grid-cols-4 gap-2.5 sm:grid-cols-7">
              {dates.map((d) => {
                const selected = date === d.iso;
                const isSunday = d.weekday === "일";
                const isSaturday = d.weekday === "토";
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => { setDate(d.iso); setTime(null); }}
                    aria-pressed={selected}
                    className={cn(
                      "flex min-h-[64px] flex-col items-center justify-center gap-0.5 rounded-2xl border font-semibold transition-all duration-200",
                      selected
                        ? "scale-[1.04] border-tangerine-500 bg-tangerine-500 text-white shadow-cta"
                        : "border-cream-300 bg-white hover:border-tangerine-300 hover:bg-tangerine-50"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px]",
                        selected ? "text-tangerine-100" : isSunday ? "text-tangerine-600" : isSaturday ? "text-sage-600" : "text-ink-400"
                      )}
                    >
                      {d.isToday ? "오늘" : d.weekday}
                    </span>
                    <span className={cn("text-base", selected ? "text-white" : "text-ink-900")}>
                      {d.day}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Step 2: 시간 */}
        {step === 1 && date && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
              <Clock className="h-5 w-5 text-tangerine-500" />
              {formatDateKo(date)}, 몇 시가 좋을까요?
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {dog.name}가 산책할 수 있는 시간만 선택할 수 있어요.
            </p>
            <div className="mt-5">
              <TimeSlotPicker
                availableTimes={dog.availableTimes}
                bookedTimes={bookedTimes}
                value={time}
                onChange={setTime}
              />
            </div>
            <p className="mt-4 rounded-2xl bg-sage-50 p-4 text-[13px] leading-relaxed text-sage-700">
              💡 {dog.name}의 추천 산책 시간은 {dog.walkNote.recommendedDuration}이에요.
              선택한 시간부터 여유 있게 걸어주세요.
            </p>
          </section>
        )}

        {/* Step 3: 참여자 정보 */}
        {step === 2 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
              <UserRound className="h-5 w-5 text-tangerine-500" />
              참여자 정보를 알려주세요
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              보호소에서 확인 연락을 드릴 때 사용돼요. (데모 정보가 미리 입력되어 있어요)
            </p>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">이름</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  className="input-field"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">연락처</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  inputMode="tel"
                  className="input-field"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                  산책 봉사 경험이 있으신가요?
                </span>
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
                        "min-h-[48px] rounded-2xl border text-sm font-semibold transition-all duration-200",
                        experienced === v
                          ? "border-tangerine-500 bg-tangerine-500 text-white shadow-cta"
                          : "border-cream-300 bg-white text-ink-700 hover:border-tangerine-300"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {experienced === false && (
                  <p className="mt-2.5 animate-fade-in rounded-2xl bg-sage-50 p-3.5 text-[13px] text-sage-700">
                    처음 봉사하셔도 괜찮아요. 보호소에서 차근차근 안내해드릴게요. 🌱
                  </p>
                )}
              </div>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-700">
                  간단 메모 <span className="font-normal text-ink-400">(선택)</span>
                </span>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  rows={3}
                  placeholder="보호소에 전하고 싶은 말이 있다면 남겨주세요."
                  className="input-field resize-none"
                />
              </label>
            </div>
          </section>
        )}

        {/* Step 4: 주의사항 */}
        {step === 3 && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
              <AlertCircle className="h-5 w-5 text-tangerine-500" />
              산책 전 꼭 확인해주세요
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              아이들의 안전을 위한 약속이에요. 모두 확인하면 다음으로 넘어갈 수 있어요.
            </p>
            <ul className="mt-5 space-y-2.5">
              {CAUTIONS.map((caution, i) => (
                <li key={caution}>
                  <button
                    type="button"
                    onClick={() =>
                      setAgreed((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                    }
                    aria-pressed={agreed[i]}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all duration-200",
                      agreed[i]
                        ? "border-sage-400 bg-sage-50"
                        : "border-cream-300 bg-white hover:border-sage-300"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                        agreed[i]
                          ? "border-sage-500 bg-sage-500 text-white"
                          : "border-cream-300 bg-white"
                      )}
                    >
                      {agreed[i] && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="text-sm leading-relaxed text-ink-700">{caution}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setAgreed(CAUTIONS.map(() => true))}
              className="mt-3 text-sm font-semibold text-sage-600 hover:text-tangerine-600"
            >
              모두 확인했어요 ✓
            </button>
          </section>
        )}

        {/* Step 5: 최종 확인 */}
        {step === 4 && date && time && (
          <section>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-ink-900">
              <PawPrint className="h-5 w-5 text-tangerine-500" />
              신청 내용을 확인해주세요
            </h2>
            <div className="card mt-5 overflow-hidden">
              <div className="flex items-center gap-4 bg-cream-100 p-5">
                <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white shadow-card">
                  <DogAvatar dog={dog} className="h-full w-full" />
                </span>
                <div className="leading-tight">
                  <p className="text-lg font-extrabold text-ink-900">{dog.name}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {dog.breed} · {dog.age}살 · {dog.gender}
                  </p>
                </div>
              </div>
              <dl className="divide-y divide-cream-200 text-sm">
                {[
                  { label: "보호소", value: `${shelter?.name} (${shelter?.address})` },
                  { label: "날짜", value: formatDateKo(date) },
                  { label: "시간", value: formatTimeKo(time) },
                  { label: "신청자", value: `${name} · ${phone}` },
                  { label: "봉사 경험", value: experienced ? "있어요" : "처음이에요" },
                  ...(memo.trim() ? [{ label: "메모", value: memo.trim() }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4 px-5 py-3.5">
                    <dt className="w-20 shrink-0 font-semibold text-ink-400">{label}</dt>
                    <dd className="font-medium leading-relaxed text-ink-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-sage-50 p-4 text-[13px] leading-relaxed text-sage-700">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              신청이 완료되면 보호소에서 확인 후 방문 안내를 드려요. 예약 시간 10분 전까지
              보호소에 도착해주세요.
            </p>
          </section>
        )}
      </div>

      {/* 하단 내비게이션 버튼 */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="btn-secondary flex-1"
            disabled={submitting}
          >
            이전
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            className="btn-primary flex-[2]"
          >
            다음 <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="btn-primary flex-[2]"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> 신청하고 있어요...
              </>
            ) : (
              <>산책 신청 완료 🐾</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
