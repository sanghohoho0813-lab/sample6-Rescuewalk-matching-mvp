"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { DogFace } from "@/components/DogImage";
import EmptyState from "@/components/EmptyState";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { useStore } from "@/lib/store";
import { formatDateFullKo, formatTimeKo, withJosa } from "@/lib/utils";

const PREPARATIONS = ["편한 운동화", "물과 물그릇", "신분증"];

export default function CompletePage() {
  const params = useParams<{ rid: string }>();
  const router = useRouter();
  const { requests, hydrated } = useStore();
  const request = requests.find((r) => r.id === params.rid);

  // 신청 직후가 아닌(승인·완료·취소된) 신청이라면 축하 화면 대신 상세로 보냅니다
  useEffect(() => {
    if (hydrated && request && request.status !== "pending") {
      router.replace(`/requests/${request.id}`);
    }
  }, [hydrated, request, router]);

  if (!hydrated || (request && request.status !== "pending")) {
    return (
      <div className="container-app max-w-lg py-14" aria-busy="true">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-cream-200" />
        <div className="mx-auto mt-5 h-6 w-2/3 animate-pulse rounded-full bg-cream-200" />
        <div className="mt-8 h-44 animate-pulse rounded-[20px] bg-cream-200" />
      </div>
    );
  }

  const dog = request ? getDog(request.dogId) : undefined;
  if (!request || !dog) {
    return (
      <div className="container-app max-w-lg py-12">
        <EmptyState
          message={"신청 내역을 찾지 못했어요.\n신청 내역에서 다시 확인해주세요."}
          ctaLabel="신청 내역으로"
          ctaHref="/requests"
        />
      </div>
    );
  }
  const shelter = getShelter(dog.shelterId);

  return (
    <div className="container-app max-w-lg py-10 md:py-14">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-sage-500 text-white motion-reduce:animate-none">
          <Check className="h-8 w-8" strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink-900">산책 신청이 접수됐어요</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
          보호소가 확인하면 방문예정으로 바뀌어요.
          <br />
          {withJosa(dog.name, "가")} {request.applicant.name}님을 기다릴게요.
        </p>
      </div>

      <div className="card mt-8 overflow-hidden">
        <div className="flex items-center gap-4 p-5">
          <span className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
            <DogFace dog={dog} sizes="56px" />
          </span>
          <div className="min-w-0">
            <p className="text-lg font-bold text-ink-900">{dog.name}</p>
            <p className="truncate text-sm text-ink-500">
              {dog.breed} · {dog.age}살 · {dog.gender}
            </p>
          </div>
        </div>
        <dl className="divide-y divide-cream-200 border-t border-cream-200 text-[15px]">
          <div className="flex gap-4 px-5 py-3">
            <dt className="w-16 shrink-0 text-ink-400">방문일</dt>
            <dd className="tnum font-medium text-ink-900">{formatDateFullKo(request.date)}</dd>
          </div>
          <div className="flex gap-4 px-5 py-3">
            <dt className="w-16 shrink-0 text-ink-400">시간</dt>
            <dd className="tnum font-medium text-ink-900">{formatTimeKo(request.time)}</dd>
          </div>
          <div className="flex gap-4 px-5 py-3">
            <dt className="w-16 shrink-0 text-ink-400">장소</dt>
            <dd className="text-ink-900">
              <span className="font-medium">{shelter?.name}</span>
              <span className="mt-0.5 block text-sm text-ink-500">{shelter?.address}</span>
            </dd>
          </div>
          <div className="flex gap-4 px-5 py-3">
            <dt className="w-16 shrink-0 text-ink-400">예약번호</dt>
            <dd className="tnum font-mono text-sm text-ink-700">{request.reservationNo}</dd>
          </div>
        </dl>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-ink-500">
        <span className="font-semibold text-ink-700">준비물</span> · {PREPARATIONS.join(" · ")}
        <br />
        방문 10분 전까지 도착해주시고, 현장에서는 보호소 매니저의 안내에 따라주세요.
      </p>

      <Link href={`/requests/${request.id}`} className="btn-primary btn-lg mt-8 w-full">
        내 신청 확인하기
      </Link>
      <Link
        href="/dogs"
        className="mt-2 flex min-h-[44px] items-center justify-center text-[15px] font-medium text-ink-500 hover:text-ink-900"
      >
        다른 아이 둘러보기
      </Link>
    </div>
  );
}
