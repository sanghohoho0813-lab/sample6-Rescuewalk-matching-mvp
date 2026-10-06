import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import DogImage from "@/components/DogImage";
import FeaturedDogs from "@/components/FeaturedDogs";
import HeroStatus from "@/components/HeroStatus";
import { dogs, getDog } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import { testimonials } from "@/lib/data/testimonials";
import { withJosa } from "@/lib/utils";

const STEPS = [
  { image: "guide-01-choose.webp", title: "아이 고르기", desc: "성격과 산책 난이도를 보고 나와 맞는 아이를 골라요." },
  { image: "guide-02-datetime.webp", title: "날짜·시간 신청", desc: "가능한 시간 중에 고르고 간단한 정보만 남기면 돼요." },
  { image: "guide-03-checkin.webp", title: "보호소 방문", desc: "예약 시간에 맞춰 가면 매니저가 아이를 소개해줘요." },
  { image: "guide-04-walk.webp", title: "함께 걷기", desc: "산책을 마치고 기록을 남기면 활동 기록에 쌓여요." },
];

const REASONS = [
  { title: "스트레스가 줄어요", desc: "좁은 견사를 벗어난 한 시간이 아이의 하루를 바꿔요." },
  { title: "사람과 친해져요", desc: "여러 사람을 만나며 세상에 적응하는 연습을 해요." },
  { title: "입양 가능성이 높아져요", desc: "산책으로 안정된 아이는 새 가족을 만나기 쉬워요." },
];

export default function HomePage() {
  const heroDog = getDog("dog-bori")!;
  const waiting = dogs.filter((d) => d.availability !== "unavailable").length;
  const today = dogs.filter((d) => d.availability === "available" && d.availableToday).length;
  const beginner = dogs.filter(
    (d) => d.availability !== "unavailable" && d.walkNote.beginnerFriendly
  ).length;

  return (
    <>
      {/* Hero */}
      <section className="bg-cream-100">
        <div className="container-app grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14 md:py-20">
          <div>
            <p className="section-label">유기견 산책 봉사 매칭</p>
            <h1 className="text-[32px] font-extrabold leading-[1.25] tracking-tight text-ink-900 sm:text-[40px] lg:text-[46px]">
              산책이 필요한 아이와,
              <br />
              함께 걸어줄 당신을
              <br className="hidden sm:block" /> 연결합니다
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-500 sm:text-[17px]">
              가까운 보호소의 유기견과 산책 봉사를 신청해보세요. 처음이어도 보호소가 차근차근
              안내해드려요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link href="/dogs" className="btn-primary btn-lg">
                산책 가능한 아이들 보기
              </Link>
              <Link
                href="/guide"
                className="inline-flex min-h-[44px] items-center gap-1 text-[15px] font-semibold text-ink-700 hover:text-ink-900"
              >
                처음이라면 봉사 가이드 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <HeroStatus todayCount={today} shelterCount={shelters.length} />
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-[24px]">
              <DogImage
                dog={heroDog}
                aspect="aspect-[4/3] md:aspect-[5/4]"
                objectPosition="50% 38%"
                sizes="(max-width: 768px) 100vw, 560px"
                priority
              />
            </div>
            <Link
              href={`/dogs/${heroDog.id}`}
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-card backdrop-blur transition-shadow hover:shadow-card-hover sm:right-auto"
            >
              <span>
                <span className="block text-[15px] font-bold text-ink-900">
                  {heroDog.name} · {heroDog.age}살 {heroDog.breed}
                </span>
                <span className="block text-[13px] text-ink-500">오늘 산책 친구를 기다리고 있어요</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-400" />
            </Link>
          </div>
        </div>
      </section>

      <FeaturedDogs />

      {/* 참여 방법 — 가이드 사진으로 흐름을 보여줌 */}
      <section className="border-t border-cream-300/70 bg-white py-14 md:py-20">
        <div className="container-app">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="section-title">이렇게 참여해요</h2>
              <p className="mt-1.5 text-[15px] text-ink-500">신청까지 5분이면 충분해요.</p>
            </div>
            <Link
              href="/guide"
              className="hidden shrink-0 items-center gap-1 text-[15px] font-semibold text-ink-700 hover:text-ink-900 sm:flex"
            >
              봉사 가이드 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-cream-200">
                  <Image
                    src={`/images/guide/${s.image}`}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 280px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-3 text-[13px] font-semibold text-sage-600">
                  <span className="tnum">STEP {i + 1}</span>
                </p>
                <h3 className="mt-0.5 text-[17px] font-bold text-ink-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-500">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 왜 산책인가 + 데이터 */}
      <section className="bg-sage-800 py-14 text-white md:py-20">
        <div className="container-app grid gap-12 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="text-2xl font-bold leading-snug tracking-tight sm:text-[28px]">
              한 번의 산책이
              <br />
              아이의 내일을 바꿔요
            </h2>
            <ul className="mt-8 space-y-5">
              {REASONS.map((r) => (
                <li key={r.title} className="border-l-2 border-sage-400 pl-4">
                  <p className="text-[17px] font-semibold">{r.title}</p>
                  <p className="mt-0.5 text-[15px] leading-relaxed text-sage-100/80">{r.desc}</p>
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-8 md:grid-cols-1 md:gap-7 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            {[
              { value: `${waiting}`, unit: "마리", label: "산책을 기다리는 아이" },
              { value: `${beginner}`, unit: "마리", label: "초보 봉사자와 걷기 좋은 아이" },
              { value: `${shelters.length}`, unit: "곳", label: "함께하는 보호소" },
            ].map((m) => (
              <div key={m.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-[13px] leading-snug text-sage-100/75 sm:text-sm">{m.label}</dt>
                <dd className="tnum text-3xl font-bold md:text-4xl">
                  {m.value}
                  <span className="ml-0.5 text-lg font-semibold text-sage-200">{m.unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* 후기 */}
      <section className="container-app py-14 md:py-20">
        <h2 className="section-title">먼저 걸어본 봉사자들</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          {testimonials.slice(0, 3).map((t) => {
            const dog = dogs.find((d) => d.name === t.dogName);
            return (
              <figure key={t.id} className="flex flex-col">
                <blockquote className="text-[17px] leading-relaxed text-ink-900">“{t.content}”</blockquote>
                <figcaption className="mt-4 text-sm text-ink-400">
                  <span className="font-semibold text-ink-700">{t.author}</span> ·{" "}
                  {dog ? (
                    <Link href={`/dogs/${dog.id}`} className="underline-offset-4 hover:underline">
                      {withJosa(t.dogName, "와")} 산책
                    </Link>
                  ) : (
                    `${withJosa(t.dogName, "와")} 산책`
                  )}{" "}
                  · {t.region}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>
    </>
  );
}
