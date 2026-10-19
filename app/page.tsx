import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ClipboardList, ShieldCheck, UserCheck, Users } from "lucide-react";
import FeaturedDogs from "@/components/FeaturedDogs";
import HomeContext from "@/components/HomeContext";
import ShelterImage from "@/components/ShelterImage";
import { DogFace } from "@/components/DogImage";
import { dogs, getDog } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import { testimonials } from "@/lib/data/testimonials";
import { EMPTY_FILTERS, matchesFilters, toDogQuery, type DogFilters } from "@/lib/domain/dogSearch";
import { closedDaysLabel } from "@/lib/domain/schedule";
import { withJosa } from "@/lib/utils";

/** 신청부터 산책까지 안전을 지키는 방식 — 문구가 아니라 실제 동작하는 규칙만 */
const TRUST = [
  {
    icon: ShieldCheck,
    title: "보호소가 직접 승인해요",
    desc: "신청은 보호소 매니저가 아이 컨디션과 일정을 보고 확정해요.",
  },
  {
    icon: ClipboardList,
    title: "성향과 주의사항을 미리 알려요",
    desc: "사람·강아지 반응, 리드줄 힘, 걷는 습관까지 신청 전에 확인할 수 있어요.",
  },
  {
    icon: UserCheck,
    title: "경험에 맞는 아이만 연결해요",
    desc: "힘이 센 아이는 산책 경험이 있는 봉사자만 신청할 수 있어요.",
  },
  {
    icon: Users,
    title: "첫 방문은 매니저가 함께해요",
    desc: "리드줄 잡는 법과 산책 코스를 안내받고 시작해요.",
  },
];

/**
 * 조건으로 바로 찾기 — 목록 화면의 실제 필터로 이어지는 바로가기.
 * 얼굴 사진은 그 조건에 맞는 아이 중 한 마리(데이터와 어긋나지 않게 아래에서 검증).
 */
const PICKS: { label: string; filters: Partial<DogFilters>; face: string }[] = [
  { label: "초보 환영", filters: { needs: ["beginner"] }, face: "dog-songi" },
  { label: "힘이 약한 편", filters: { needs: ["gentle"] }, face: "dog-dani" },
  { label: "아이와 함께", filters: { needs: ["kids"] }, face: "dog-kong" },
  { label: "소형견", filters: { size: "소형" }, face: "dog-dubu" },
  { label: "중형견", filters: { size: "중형" }, face: "dog-tori" },
  { label: "대형견", filters: { size: "대형" }, face: "dog-gureum" },
];

const available = dogs.filter((d) => d.availability === "available");

export default function HomePage() {
  const beginner = available.filter((d) => d.match.experience === "beginner").length;
  const picks = PICKS.map((p) => {
    const filters = { ...EMPTY_FILTERS, ...p.filters };
    const face = getDog(p.face);
    return {
      ...p,
      face: face && matchesFilters(face, filters) ? face : available.find((d) => matchesFilters(d, filters)),
      count: available.filter((d) => matchesFilters(d, filters)).length,
      href: `/dogs${toDogQuery(filters, "recommended")}`,
    };
  });

  return (
    <>
      {/*
        첫 화면 — 사진이 서비스의 장면(보호소 아이와 함께 걷는 모습)을 먼저 보여주고,
        바로 아래에서 '지금 나에게 필요한 것'(다가오는 산책 / 다시 만나기 / 시작 방법)으로 이어집니다.
        모바일: 사진 위에 문구를 얹은 한 장 → 지표 → 내 상황
        PC: 왼쪽 문구·내 상황 / 오른쪽 사진(지표는 사진 하단에)
      */}
      <section className="container-app pt-3 md:pt-10 lg:pt-14" aria-labelledby="hero-title">
        <div className="grid grid-cols-1 gap-y-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-x-10 md:gap-y-8 lg:gap-x-16">
          <div className="relative col-start-1 row-start-1 h-[468px] overflow-hidden rounded-[28px] bg-cream-200 md:col-start-2 md:row-end-3 md:h-auto md:min-h-[540px] md:rounded-[32px]">
            <Image
              src="/images/guide/guide-04-walk.webp"
              alt="숲길에서 봉사자와 함께 걷는 보호소 강아지"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover object-[70%_50%] md:object-[62%_50%]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-[#1c170f]/90 via-[#1c170f]/35 via-55% to-transparent md:hidden"
            />
          </div>

          <div className="relative col-start-1 row-start-1 self-end px-5 pb-5 text-white md:self-end md:px-0 md:pb-0 md:text-ink-900">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[13px] font-semibold ring-1 ring-white/25 backdrop-blur-sm md:bg-sage-100 md:text-sage-800 md:ring-0">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
              보호소 승인제 산책 봉사 매칭
            </p>
            <h1
              id="hero-title"
              className="mt-3 text-[28px] font-extrabold leading-[1.28] tracking-[-0.02em] md:mt-5 md:text-[36px] md:leading-[1.22] md:tracking-[-0.03em] lg:text-[42px]"
            >
              산책이 필요한 아이와,
              <br />
              함께 걸어줄 당신을 연결해요
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/90 md:mt-4 md:text-[17px] md:text-ink-500">
              아이의 성향과 가능한 일정을 보고 고르면, 보호소가 확인해 방문을 확정해요. 처음이어도 현장에서
              안내해드려요.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 md:mt-7 md:gap-5">
              <Link
                href="/dogs"
                className="btn-primary btn-lg flex-1 basis-[190px] whitespace-nowrap md:flex-none md:basis-auto"
              >
                산책 가능한 아이 보기
              </Link>
              <Link
                href="/guide"
                className="btn btn-lg flex-1 basis-[110px] bg-white/15 !px-5 text-white ring-1 ring-white/25 backdrop-blur-sm hover:bg-white/25 md:flex-none md:basis-auto md:bg-transparent md:!px-0 md:text-ink-700 md:ring-0 md:backdrop-blur-none md:hover:bg-transparent md:hover:text-ink-900"
              >
                봉사 가이드 <ArrowRight className="hidden h-4 w-4 md:block" aria-hidden />
              </Link>
            </div>
          </div>

          <dl className="col-start-1 row-start-2 grid grid-cols-3 divide-x divide-cream-200 rounded-2xl bg-white py-3.5 shadow-card ring-1 ring-cream-300/60 md:z-[1] md:col-start-2 md:row-start-2 md:mx-5 md:mb-5 md:self-end md:bg-white/95 md:py-4 md:backdrop-blur">
            {[
              { label: "기다리는 아이", value: available.length, unit: "마리" },
              { label: "초보 가능", value: beginner, unit: "마리" },
              { label: "함께하는 보호소", value: shelters.length, unit: "곳" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col-reverse items-center gap-0.5 px-2 text-center">
                <dt className="text-[13px] text-ink-500">{m.label}</dt>
                <dd className="tnum text-xl font-bold tracking-tight text-ink-900 md:text-2xl">
                  {m.value}
                  <span className="ml-0.5 text-sm font-semibold text-ink-500">{m.unit}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="col-start-1 row-start-3 mt-3 md:row-start-2 md:mt-0">
            <HomeContext />
          </div>
        </div>
      </section>

      <FeaturedDogs />

      {/* 조건으로 찾기 — 목록 화면의 필터로 바로 */}
      <section className="container-app pb-12 md:pb-16" aria-labelledby="picks-title">
        <h2 id="picks-title" className="section-title">
          나에게 맞는 아이 찾기
        </h2>
        <p className="mt-1.5 text-[15px] text-ink-500">경험과 함께 오는 사람에 맞춰 골라보세요.</p>
        <ul className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-6">
          {picks.map((p) => (
            <li key={p.label}>
              <Link
                href={p.href}
                className="group flex h-full flex-col items-center rounded-[20px] bg-white px-2 pb-3.5 pt-4 text-center ring-1 ring-cream-300/70 transition-[box-shadow,transform] duration-200 hover:shadow-card-hover active:scale-[0.98]"
              >
                {p.face && (
                  <span className="h-14 w-14 overflow-hidden rounded-full ring-4 ring-cream-100 transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                    <DogFace dog={p.face} sizes="64px" />
                  </span>
                )}
                <span className="mt-2.5 text-[15px] font-semibold text-ink-900">{p.label}</span>
                <span className="tnum text-[13px] text-ink-500">{p.count}마리</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 신뢰 — 어떻게 안전을 지키는지 */}
      <section className="bg-white py-12 md:py-20" aria-labelledby="trust-title">
        <div className="container-app grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] md:items-center md:gap-14">
          <div className="relative h-[200px] overflow-hidden rounded-[24px] bg-cream-200 sm:h-[280px] md:h-auto md:aspect-[4/3.2] md:rounded-[28px]">
            <Image
              src="/images/guide/guide-03-checkin.webp"
              alt="보호소에서 산책 신청을 확인받는 모습"
              fill
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
            <p className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-sm font-semibold text-sage-800 shadow-card">
              <ShieldCheck className="h-4 w-4" aria-hidden /> 방문 전 보호소 확인
            </p>
          </div>
          <div>
            <h2 id="trust-title" className="section-title">
              안심하고 걸을 수 있게
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-500">
              신청부터 산책까지, 보호소와 함께 이렇게 운영해요.
            </p>
            <ul className="mt-7 space-y-6">
              {TRUST.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-700 ring-1 ring-sage-100">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-bold text-ink-900">{title}</span>
                    <span className="mt-0.5 block text-[15px] leading-relaxed text-ink-500">{desc}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 보호소 — 어디로 가게 되는지 */}
      <section className="container-app py-12 md:py-16" aria-labelledby="shelters-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="shelters-title" className="section-title">
              함께하는 보호소
            </h2>
            <p className="mt-1.5 text-[15px] text-ink-500">가까운 보호소에서 산책을 시작해 보세요.</p>
          </div>
          <Link
            href="/shelters"
            className="flex min-h-[44px] shrink-0 items-center gap-0.5 text-[15px] font-semibold text-ink-700 hover:text-ink-900"
          >
            전체 보기 <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul
          aria-label="함께하는 보호소"
          className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-3"
        >
          {shelters.map((s) => {
            const count = available.filter((d) => d.shelterId === s.id).length;
            return (
              <li key={s.id} className="w-[62%] max-w-[260px] shrink-0 snap-start sm:w-auto sm:max-w-none">
                <Link href={`/shelters/${s.id}`} className="group block">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[20px] bg-cream-200">
                    <ShelterImage shelter={s} sizes="(max-width: 640px) 62vw, 380px" zoomOnHover />
                    <span className="tnum absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[13px] font-semibold text-sage-800 shadow-card">
                      산책 가능 {count}마리
                    </span>
                  </span>
                  <span className="mt-3 block px-0.5 text-base font-bold text-ink-900 group-hover:text-sage-700">
                    {s.name}
                  </span>
                  <span className="block truncate px-0.5 text-sm text-ink-500">
                    {s.address.split(" ").slice(0, 2).join(" ")} · {closedDaysLabel(s)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 후기 — 짧게 */}
      <section className="bg-white py-12 md:py-16" aria-labelledby="reviews-title">
        <div className="container-app">
          <h2 id="reviews-title" className="section-title">
            먼저 걸어본 봉사자들
          </h2>
          <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0">
            {testimonials.slice(0, 3).map((t) => {
              const dog = dogs.find((d) => d.name === t.dogName);
              return (
                <li
                  key={t.id}
                  className="flex w-[84%] shrink-0 snap-start flex-col rounded-[20px] bg-cream-50 p-5 ring-1 ring-cream-300/70 md:w-auto"
                >
                  <p className="flex-1 text-[15px] leading-relaxed text-ink-900">“{t.content}”</p>
                  <div className="mt-4 flex items-center gap-3 border-t border-cream-200 pt-4">
                    {dog && (
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <DogFace dog={dog} sizes="40px" />
                      </span>
                    )}
                    <p className="min-w-0 text-sm text-ink-500">
                      <span className="block font-semibold text-ink-900">{t.author}</span>
                      {dog ? (
                        <Link href={`/dogs/${dog.id}`} className="underline-offset-4 hover:underline">
                          {withJosa(t.dogName, "와")} 산책
                        </Link>
                      ) : (
                        `${withJosa(t.dogName, "와")} 산책`
                      )}{" "}
                      · {t.region}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
