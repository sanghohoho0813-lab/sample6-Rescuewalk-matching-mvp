import Link from "next/link";
import {
  CalendarCheck,
  ClipboardCheck,
  Dog as DogIcon,
  Footprints,
  HandHeart,
  Heart,
  HeartHandshake,
  Home as HomeIcon,
  MapPin,
  PawPrint,
  Smile,
  Sparkles,
  Star,
  Sun,
  Users,
} from "lucide-react";
import DogCard from "@/components/DogCard";
import DogAvatar from "@/components/DogAvatar";
import SectionHeading from "@/components/SectionHeading";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";
import { testimonials } from "@/lib/data/testimonials";
import { getDog } from "@/lib/data/dogs";

const STEPS = [
  { icon: DogIcon, title: "아이 선택", desc: "마음이 가는 아이를 골라요" },
  { icon: CalendarCheck, title: "시간 선택", desc: "가능한 날짜와 시간을 정해요" },
  { icon: ClipboardCheck, title: "신청 완료", desc: "간단한 정보만 남기면 끝" },
  { icon: MapPin, title: "보호소 방문", desc: "예약 시간에 맞춰 방문해요" },
  { icon: Footprints, title: "산책 활동", desc: "아이와 행복한 한 걸음" },
];

const REASONS = [
  {
    icon: Smile,
    title: "스트레스 완화",
    desc: "좁은 견사를 벗어난 산책 한 번이 아이의 하루를 바꿔요.",
  },
  {
    icon: Users,
    title: "사회화 연습",
    desc: "다양한 사람을 만나며 세상과 친해지는 연습을 해요.",
  },
  {
    icon: Sun,
    title: "건강한 운동",
    desc: "햇볕 아래 걷는 시간은 아이의 몸과 마음을 튼튼하게 해요.",
  },
  {
    icon: HomeIcon,
    title: "입양 가능성 향상",
    desc: "산책으로 안정된 아이는 새 가족을 만날 확률이 높아져요.",
  },
];

const METRICS = [
  { icon: HeartHandshake, value: "128", label: "이번 주 산책 매칭" },
  { icon: Users, value: "1,240+", label: "함께한 봉사자" },
  { icon: HomeIcon, value: String(shelters.length), label: "참여 보호소" },
  { icon: Footprints, value: "3,580", label: "누적 산책 완료" },
];

export default function HomePage() {
  const featured = dogs
    .filter((d) => d.availability === "available")
    .sort((a, b) => Number(b.availableToday) - Number(a.availableToday) || Number(b.recommended) - Number(a.recommended))
    .slice(0, 6);
  const heroDog = getDog("dog-bori")!;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sage-50 via-cream-100 to-cream-50">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-tangerine-100/60 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-sage-100/80 blur-3xl"
        />
        <div className="container-app relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
          <div className="animate-fade-up">
            <p className="section-label">
              <PawPrint className="h-4 w-4" /> 유기견 산책 매칭 서비스
            </p>
            <h1 className="text-3xl font-extrabold leading-[1.25] tracking-tight text-ink-900 sm:text-4xl lg:text-[2.75rem]">
              산책이 필요한 아이와,
              <br />
              함께 걸어줄 <span className="text-tangerine-600">당신</span>을
              <br />
              연결합니다
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-500 sm:text-base">
              가까운 보호소의 유기견과 산책 봉사에 참여해보세요.
              <br className="hidden sm:block" />
              당신의 한 번의 산책이 아이에게 큰 하루가 됩니다.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/dogs" className="btn-primary">
                <PawPrint className="h-4 w-4" />
                산책 가능한 아이들 보기
              </Link>
              <Link href="/guide" className="btn-secondary">
                봉사 가이드 보기
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-ink-400">
              <HandHeart className="h-4 w-4 text-sage-500" />
              처음 봉사하셔도 괜찮아요. 차근차근 안내해드릴게요.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md animate-fade-up md:max-w-none">
            <div className="relative overflow-hidden rounded-[28px] border-4 border-white shadow-card-hover">
              <DogAvatar dog={heroDog} className="aspect-[16/11] w-full" />
            </div>
            {/* 플로팅 카드 */}
            <div className="absolute -bottom-4 left-3 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3 shadow-card-hover backdrop-blur sm:left-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-tangerine-100 text-tangerine-600">
                <Heart className="h-4 w-4 fill-tangerine-500 text-tangerine-500" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-bold text-ink-900">보리 · 3살 믹스견</p>
                <p className="text-xs text-ink-400">오늘 산책 친구를 기다려요</p>
              </div>
            </div>
            <div className="absolute -top-3 right-3 hidden items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-card backdrop-blur sm:flex">
              <Sparkles className="h-4 w-4 text-tangerine-500" />
              <span className="text-xs font-bold text-ink-700">이번 주 128건 매칭 완료</span>
            </div>
          </div>
        </div>
      </section>

      {/* 오늘 산책 가능한 아이들 */}
      <section className="container-app py-14 md:py-16">
        <SectionHeading
          label="🐾 산책 친구 추천"
          title="오늘 산책 가능한 아이들"
          subtitle="성격, 크기, 에너지 레벨을 고려해 추천했어요!"
          moreHref="/dogs"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      </section>

      {/* 참여 방법 */}
      <section className="bg-sage-50/70 py-14 md:py-16">
        <div className="container-app">
          <SectionHeading
            label="참여 방법"
            title="산책 봉사, 이렇게 참여해요"
            subtitle="복잡한 절차 없이 5분이면 신청까지 끝나요."
          />
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} className="card relative flex flex-col gap-3 p-5">
                <span className="absolute right-4 top-4 text-2xl font-extrabold text-cream-300">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tangerine-100 text-tangerine-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-bold text-ink-900">{title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-500">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 산책이 필요한 이유 */}
      <section className="container-app py-14 md:py-16">
        <SectionHeading
          label="왜 산책일까요?"
          title="한 번의 산책이 아이의 내일을 바꿔요"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card card-hover flex flex-col gap-3 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-bold text-ink-900">{title}</h3>
              <p className="text-sm leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 활동 지표 */}
      <section className="bg-gradient-to-r from-sage-600 to-sage-500 py-12 text-white">
        <div className="container-app grid grid-cols-2 gap-8 lg:grid-cols-4">
          {METRICS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="h-6 w-6 text-sage-100" />
              <p className="text-3xl font-extrabold tracking-tight">{value}</p>
              <p className="text-sm text-sage-100">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 후기 */}
      <section className="container-app py-14 md:py-16">
        <SectionHeading
          label="따뜻한 후기"
          title="먼저 걸어본 봉사자들의 이야기"
          moreHref="/guide#faq"
          moreLabel="봉사 가이드"
        />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <figure key={t.id} className="card flex flex-col gap-3 p-5">
              <div className="flex items-center gap-1 text-tangerine-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={
                      i < t.rating
                        ? "h-4 w-4 fill-tangerine-400"
                        : "h-4 w-4 text-cream-300"
                    }
                  />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-ink-700">
                “{t.content}”
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2 pt-2 text-[13px] text-ink-400">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-xs font-bold text-sage-600">
                  {t.author[0]}
                </span>
                {t.author}님 · {t.dogName}와의 산책 · {t.region}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA 배너 */}
      <section className="container-app pb-4">
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-tangerine-500 to-tangerine-400 px-6 py-10 text-white sm:px-10">
          <PawPrint
            aria-hidden
            className="absolute -right-6 -top-6 h-32 w-32 rotate-12 text-white/15"
          />
          <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                오늘, 한 아이의 산책 친구가 되어주세요.
              </h2>
              <p className="mt-1.5 text-sm text-tangerine-50">
                작은 나눔이 모여 큰 변화를 만듭니다. 지금 산책을 기다리는 아이들이 있어요.
              </p>
            </div>
            <Link
              href="/dogs"
              className="btn shrink-0 bg-white text-tangerine-600 hover:bg-cream-100"
            >
              산책 신청해보기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
