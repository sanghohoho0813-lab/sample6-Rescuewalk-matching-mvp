import Link from "next/link";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";

export const metadata = { title: "봉사 가이드" };

const START_STEPS = [
  {
    title: "마음이 가는 아이를 찾아요",
    desc: "강아지 찾기에서 성격, 산책 난이도, 지역을 보고 나와 잘 맞는 아이를 골라요. '초보 가능' 태그가 있는 아이부터 시작하면 좋아요.",
    image: "guide-01-choose.webp",
    alt: "태블릿으로 산책 가능한 강아지 목록을 살펴보는 모습",
  },
  {
    title: "날짜와 시간을 선택해요",
    desc: "아이마다 산책 가능한 시간이 달라요. 내 일정과 맞는 시간을 선택하고 간단한 정보를 입력하면 신청이 끝나요.",
    image: "guide-02-datetime.webp",
    alt: "휴대폰으로 산책 날짜와 시간을 선택하는 모습",
  },
  {
    title: "보호소에 방문해요",
    desc: "예약 시간 10분 전까지 도착해서 매니저에게 예약번호를 보여주세요. 아이와 인사하는 법을 안내받아요.",
    image: "guide-03-checkin.webp",
    alt: "보호소에서 예약을 확인하고 리드줄을 건네받는 모습",
  },
  {
    title: "함께 걸어요",
    desc: "보호소가 안내하는 산책 코스를 따라 아이의 속도에 맞춰 걸어요. 산책 후에는 활동 기록에 오늘의 이야기가 남아요.",
    image: "guide-04-walk.webp",
    alt: "봉사자와 강아지가 나란히 산책하는 모습",
  },
];

const PREPARATIONS = [
  {
    title: "복장",
    desc: "활동하기 편한 옷과 운동화. 밝은 색 옷이면 아이들이 덜 긴장해요.",
    image: "guide-prep-clothes.webp",
    alt: "산책 전 운동화를 신는 모습",
  },
  {
    title: "준비물",
    desc: "물과 물그릇, 신분증. 배변봉투와 간식은 보호소에서 제공해요.",
    image: "guide-prep-supplies.webp",
    alt: "물병, 접이식 물그릇, 간식 파우치, 배변봉투와 리드줄",
  },
  {
    title: "마음가짐",
    desc: "아이의 속도를 존중하는 마음이면 충분해요. 잘 걷지 않아도 괜찮아요.",
    image: "guide-prep-mindset.webp",
    alt: "강아지에게 천천히 손을 내밀어 인사하는 봉사자",
  },
];

const FIELD_RULES = [
  "리드줄은 항상 두 손으로, 손목에 감아 잡아주세요.",
  "다른 강아지나 사람과 마주치면 잠시 길 가장자리로 비켜주세요.",
  "아이가 걷기 싫어하면 억지로 끌지 말고 잠시 기다려주세요.",
  "간식은 보호소에서 허용한 것만, 정해진 양만 급여해주세요.",
  "사진 촬영은 좋지만, 플래시는 아이들을 놀라게 할 수 있어요.",
  "산책 중 특이사항은 돌아와서 매니저에게 꼭 알려주세요.",
];

const FAQS = [
  {
    q: "산책 봉사가 처음인데 괜찮을까요?",
    a: "괜찮아요. '초보 가능' 태그가 있는 아이들은 리드줄 적응이 잘 되어 있고 성격이 순한 아이들이에요. 첫 방문 시 보호소 매니저가 리드줄 잡는 법부터 차근차근 안내해드려요.",
  },
  {
    q: "비용이 드나요?",
    a: "아니요, 산책 봉사는 무료예요. 아이들에게 필요한 건 당신의 시간과 마음뿐이에요.",
  },
  {
    q: "신청을 취소하고 싶으면 어떻게 하나요?",
    a: "신청 내역 페이지에서 언제든 취소할 수 있어요. 다만 아이가 기다리지 않도록 가급적 하루 전에는 취소해주세요.",
  },
  {
    q: "아이와 함께 가도 되나요?",
    a: "'아이 동반 가능' 표시가 있는 강아지라면 가능해요. 안전을 위해 보호자 1명당 어린이 1명까지 동반할 수 있어요.",
  },
  {
    q: "산책 시간은 얼마나 되나요?",
    a: "아이마다 달라요. 보통 30분에서 1시간 정도이며, 각 아이의 상세페이지에서 추천 산책 시간을 확인할 수 있어요.",
  },
];

export default function GuidePage() {
  return (
    <div className="container-app max-w-4xl py-8 md:py-10">
      <header className="mb-10">
        <h1 className="page-title">봉사 가이드</h1>
        <p className="mt-1.5 text-[15px] text-ink-500">처음 봉사하셔도 괜찮아요. 차근차근 안내해드릴게요.</p>
        <nav aria-label="가이드 목차" className="mt-5 flex flex-wrap gap-2">
          {[
            { href: "#start", label: "참여 방법" },
            { href: "#prepare", label: "준비물" },
            { href: "#rules", label: "현장 약속" },
            { href: "#faq", label: "자주 묻는 질문" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="inline-flex min-h-[40px] items-center rounded-full border border-cream-300 bg-white px-4 text-[15px] text-ink-700 hover:border-sage-300"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </header>

      {/* 처음 참여하는 법 */}
      <section id="start" className="scroll-mt-24">
        <h2 className="section-title">처음 참여하는 법</h2>
        <ol className="mt-6 grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {START_STEPS.map(({ title, desc, image, alt }, i) => (
            <li key={title}>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-cream-200">
                <Image
                  src={`/images/guide/${image}`}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 430px"
                  priority={i === 0}
                  className="object-cover"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <span
                  aria-hidden
                  className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage-600 text-sm font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[17px] font-bold text-ink-900">{title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{desc}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 준비물 & 복장 */}
      <section id="prepare" className="mt-16 scroll-mt-24">
        <h2 className="section-title">준비물과 복장</h2>
        <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-3">
          {PREPARATIONS.map(({ title, desc, image, alt }) => (
            <div key={title}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-cream-200">
                <Image
                  src={`/images/guide/${image}`}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 280px"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-4 text-[17px] font-bold text-ink-900">{title}</h3>
              <p className="mt-1 text-[15px] leading-relaxed text-ink-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 현장 행동 가이드 */}
      <section id="rules" className="mt-16 scroll-mt-24">
        <h2 className="section-title">산책할 때 이것만은 지켜주세요</h2>
        <ul className="mt-5 divide-y divide-cream-200 border-y border-cream-200">
          {FIELD_RULES.map((rule) => (
            <li key={rule} className="flex items-start gap-3 py-4 text-[15px] leading-relaxed text-ink-700">
              <Check className="mt-1 h-4 w-4 shrink-0 text-sage-600" strokeWidth={3} aria-hidden />
              {rule}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-16 scroll-mt-24">
        <h2 className="section-title">자주 묻는 질문</h2>
        <div className="mt-5 divide-y divide-cream-200 border-y border-cream-200">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-4 text-base font-semibold text-ink-900 [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="pb-5 pr-9 text-[15px] leading-relaxed text-ink-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-16 rounded-3xl bg-sage-50 px-6 py-10 text-center">
        <p className="text-lg font-bold leading-snug text-ink-900">
          이제 준비는 끝났어요.
          <br />
          산책을 기다리는 아이들을 만나러 가요.
        </p>
        <Link href="/dogs" className="btn-primary btn-lg mt-6">
          산책 가능한 아이들 보기
        </Link>
      </div>
    </div>
  );
}
