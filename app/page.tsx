import Link from "next/link";
import { ArrowRight, ClipboardList, ShieldCheck, UserCheck, Users } from "lucide-react";
import FeaturedDogs from "@/components/FeaturedDogs";
import HomeContext from "@/components/HomeContext";
import ShelterImage from "@/components/ShelterImage";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import { testimonials } from "@/lib/data/testimonials";
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

export default function HomePage() {
  const waiting = dogs.filter((d) => d.availability === "available").length;
  const beginner = dogs.filter(
    (d) => d.availability === "available" && d.match.experience === "beginner"
  ).length;

  return (
    <>
      {/* 첫 화면 — 무엇을 하는 서비스인지 + 지금 나에게 필요한 것 */}
      <section className="bg-cream-100">
        <div className="container-app grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-14 md:py-16">
          <div>
            <p className="section-label">보호소 승인제 산책 봉사 매칭</p>
            <h1 className="text-[30px] font-extrabold leading-[1.25] tracking-tight text-ink-900 sm:text-[38px] lg:text-[44px]">
              산책이 필요한 아이와,
              <br />
              함께 걸어줄 당신을 연결해요
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-500 sm:text-[17px]">
              아이의 성향과 가능한 일정을 보고 고르면, 보호소가 확인해 방문을 확정해요. 처음이어도 현장에서
              안내해드려요.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/dogs" className="btn-primary btn-lg">
                산책 가능한 아이 보기
              </Link>
              <Link
                href="/guide"
                className="inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-ink-700 hover:text-ink-900"
              >
                봉사 가이드 <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <dl className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              {[
                { label: "산책을 기다리는 아이", value: `${waiting}마리` },
                { label: "초보 가능", value: `${beginner}마리` },
                { label: "함께하는 보호소", value: `${shelters.length}곳` },
              ].map((m) => (
                <div key={m.label} className="flex items-baseline gap-1.5">
                  <dt>{m.label}</dt>
                  <dd className="tnum font-semibold text-ink-900">{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HomeContext />
        </div>
      </section>

      <FeaturedDogs />

      {/* 신뢰 — 어떻게 안전을 지키는지 */}
      <section className="border-t border-cream-300/70 bg-white py-12 md:py-16" aria-labelledby="trust-title">
        <div className="container-app">
          <h2 id="trust-title" className="section-title">
            안심하고 걸을 수 있게
          </h2>
          <p className="mt-1.5 text-[15px] text-ink-500">신청부터 산책까지, 보호소와 함께 이렇게 운영해요.</p>
          <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <li key={title}>
                <Icon className="h-6 w-6 text-sage-600" aria-hidden />
                <h3 className="mt-3 text-[17px] font-bold text-ink-900">{title}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{desc}</p>
              </li>
            ))}
          </ul>
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
            className="hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ink-700 hover:text-ink-900 sm:flex"
          >
            전체 보기 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shelters.map((s) => {
            const count = dogs.filter((d) => d.shelterId === s.id && d.availability === "available").length;
            return (
              <li key={s.id}>
                <Link
                  href={`/shelters/${s.id}`}
                  className="group flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-cream-300 transition-shadow hover:shadow-card"
                >
                  <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-200">
                    <ShelterImage shelter={s} sizes="80px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-ink-900 group-hover:text-sage-700">{s.name}</span>
                    <span className="block truncate text-sm text-ink-500">
                      {s.address.split(" ").slice(0, 2).join(" ")} · {closedDaysLabel(s)}
                    </span>
                    <span className="tnum block text-sm font-semibold text-sage-700">
                      산책 가능 {count}마리
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 후기 — 짧게 */}
      <section
        className="border-t border-cream-300/70 bg-white py-12 md:py-16"
        aria-labelledby="reviews-title"
      >
        <div className="container-app">
          <h2 id="reviews-title" className="section-title">
            먼저 걸어본 봉사자들
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => {
              const dog = dogs.find((d) => d.name === t.dogName);
              return (
                <li key={t.id} className="rounded-2xl bg-cream-50 p-5 ring-1 ring-cream-300">
                  <p className="text-[15px] leading-relaxed text-ink-900">“{t.content}”</p>
                  <p className="mt-3 text-sm text-ink-500">
                    <span className="font-semibold text-ink-700">{t.author}</span> ·{" "}
                    {dog ? (
                      <Link href={`/dogs/${dog.id}`} className="underline-offset-4 hover:underline">
                        {withJosa(t.dogName, "와")} 산책
                      </Link>
                    ) : (
                      `${withJosa(t.dogName, "와")} 산책`
                    )}{" "}
                    · {t.region}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
