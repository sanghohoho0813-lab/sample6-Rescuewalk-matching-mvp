"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarDays,
  Check,
  Clock,
  Footprints,
  MapPin,
  ShoppingBag,
  Ticket,
} from "lucide-react";
import DogAvatar from "@/components/DogAvatar";
import EmptyState from "@/components/EmptyState";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { formatDateFullKo, formatTimeKo } from "@/lib/utils";

const PREPARATIONS = ["편한 운동화", "물과 물그릇", "산책하기 편한 복장", "신분증"];

export default function CompletePage() {
  const params = useParams<{ rid: string }>();
  const { requests, hydrated } = useStore();

  if (!hydrated) {
    return (
      <div className="container-app max-w-lg py-12">
        <div className="card space-y-4 p-6">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-cream-200" />
          <div className="mx-auto h-5 w-2/3 animate-pulse rounded-full bg-cream-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-cream-200" />
        </div>
      </div>
    );
  }

  const request = requests.find((r) => r.id === params.rid);
  const dog = request ? getDog(request.dogId) : undefined;
  const shelter = dog ? getShelter(dog.shelterId) : undefined;

  if (!request || !dog) {
    return (
      <div className="container-app max-w-lg py-12">
        <EmptyState
          message={"신청 내역을 찾지 못했어요.\n다시 한번 시도해볼까요?"}
          ctaLabel="아이들 보러 가기"
          ctaHref="/dogs"
        />
      </div>
    );
  }

  return (
    <div className="container-app max-w-lg py-10 md:py-14">
      {/* 완료 애니메이션 */}
      <div className="text-center">
        <div className="relative mx-auto flex h-20 w-20 animate-pop-in items-center justify-center rounded-full bg-sage-500 text-white shadow-card-hover">
          <Check className="h-10 w-10" strokeWidth={3} />
          <span className="absolute -right-1.5 -top-1.5 animate-wag text-2xl" aria-hidden>
            🐾
          </span>
        </div>
        <h1 className="mt-5 animate-fade-up text-2xl font-extrabold tracking-tight text-ink-900">
          산책 신청이 완료됐어요!
        </h1>
        <p className="mt-2 animate-fade-up text-[15px] leading-relaxed text-ink-500">
          {dog.name}가 {request.applicant.name}님을 기다릴게요.
          <br />
          보호소 확인 후 방문 안내를 드려요.
        </p>
      </div>

      {/* 예약 카드 */}
      <div className="card mt-8 animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-tangerine-500 to-tangerine-400 px-5 py-4 text-white">
          <span className="flex items-center gap-2 text-sm font-bold">
            <Ticket className="h-4 w-4" /> 예약번호
          </span>
          <span className="font-mono text-sm font-extrabold tracking-wider">
            {request.reservationNo}
          </span>
        </div>
        <div className="flex items-center gap-4 border-b border-cream-200 p-5">
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
        <ul className="space-y-3 p-5 text-sm">
          <li className="flex items-center gap-3">
            <CalendarDays className="h-4 w-4 shrink-0 text-sage-500" />
            <span className="font-semibold text-ink-900">{formatDateFullKo(request.date)}</span>
          </li>
          <li className="flex items-center gap-3">
            <Clock className="h-4 w-4 shrink-0 text-sage-500" />
            <span className="font-semibold text-ink-900">{formatTimeKo(request.time)}</span>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" />
            <span className="leading-relaxed text-ink-700">
              <strong className="font-semibold text-ink-900">{shelter?.name}</strong>
              <br />
              {shelter?.address}
            </span>
          </li>
        </ul>
      </div>

      {/* 준비물 */}
      <div className="card mt-4 animate-fade-up p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink-900">
          <ShoppingBag className="h-4 w-4 text-tangerine-500" /> 이런 걸 준비하면 좋아요
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {PREPARATIONS.map((p) => (
            <span key={p} className="chip bg-cream-200 text-ink-700">{p}</span>
          ))}
        </div>
        <p className="mt-4 rounded-2xl bg-sage-50 p-3.5 text-[13px] leading-relaxed text-sage-700">
          예약 시간 10분 전까지 도착해주시고, 현장에서는 보호소 매니저의 안내에 따라주세요.
          일정 변경이 필요하면 신청 내역에서 취소 후 다시 신청할 수 있어요.
        </p>
      </div>

      <div className="mt-6 flex animate-fade-up gap-3">
        <Link href="/requests" className="btn-primary flex-1">
          내 신청 내역 보기
        </Link>
        <Link href="/dogs" className="btn-secondary flex-1">
          <Footprints className="h-4 w-4" /> 다른 아이 둘러보기
        </Link>
      </div>
    </div>
  );
}
