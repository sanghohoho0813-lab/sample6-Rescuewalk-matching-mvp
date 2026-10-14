import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Check, ChevronRight, ShieldCheck } from "lucide-react";
import DogImage from "@/components/DogImage";
import FavoriteButton from "@/components/FavoriteButton";
import DogCard from "@/components/DogCard";
import BackToDogs from "@/components/BackToDogs";
import DogRail from "@/components/DogRail";
import DogSchedule from "@/components/DogSchedule";
import NextWalk from "@/components/NextWalk";
import VisitInfo from "@/components/VisitInfo";
import StickyApplyBar from "./StickyApplyBar";
import { dogs, getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { DOGS, EXPERIENCE, PEOPLE, PULLING, REACTION, TONE_TEXT } from "@/lib/labels";
import { COMMON_BRING, PROVIDED } from "@/lib/visitGuide";
import { cn, withJosa } from "@/lib/utils";

export function generateStaticParams() {
  return dogs.map((d) => ({ id: d.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const dog = getDog(params.id);
  if (!dog) return {};
  const title = `${dog.name} · ${dog.breed}`;
  return {
    title,
    description: `${dog.headline}. ${dog.story}`,
    openGraph: {
      title: `${title} | RescueWalk`,
      description: dog.headline,
      images: dog.image ? [{ url: `/images/dogs/${dog.image}`, alt: `${dog.name} 사진` }] : undefined,
    },
  };
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-10", className)}>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

/**
 * 강아지 상세 — "내가 이 아이를 안전하게 산책시킬 수 있을까?"에 답하는 순서로 배치합니다.
 *  1) 누구에게 맞는지(추천 산책자·필요한 경험·힘·사람/강아지)  2) 언제 가능한지
 *  3) 어떤 아이인지(성격·이야기)  4) 걸을 때 모습·반응·주의사항  5) 준비물·보호소 안내
 */
export default function DogDetailPage({ params }: { params: { id: string } }) {
  const dog = getDog(params.id);
  if (!dog) notFound();
  const shelter = getShelter(dog.shelterId);
  const resting = dog.availability === "unavailable";
  const friends = dogs.filter((d) => d.shelterId === dog.shelterId && d.id !== dog.id).slice(0, 3);
  const experience = EXPERIENCE[dog.match.experience];

  const fit = [
    { label: "필요한 경험", ...experience },
    { label: "리드줄 힘", ...PULLING[dog.match.pulling] },
    { label: "사람", ...PEOPLE[dog.match.people] },
    { label: "다른 강아지", ...DOGS[dog.match.dogs] },
  ];

  return (
    <>
      <div className="container-app pb-40 pt-4 md:pt-8 lg:pb-10">
        <BackToDogs />

        <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[24px]">
              <DogImage
                dog={dog}
                aspect="aspect-[4/3] sm:aspect-[16/10]"
                objectPosition="50% 34%"
                sizes="(max-width: 1024px) 100vw, 720px"
                priority
                className={resting ? "grayscale-[35%]" : undefined}
              />
              <NextWalk dog={dog} variant="badge" className="absolute left-4 top-4" />
              <FavoriteButton dogId={dog.id} dogName={dog.name} className="absolute right-4 top-4" />
            </div>

            {/* 이름 · 한 줄 성격 · 기본 정보 */}
            <header className="mt-6">
              <h1 className="text-[28px] font-bold tracking-tight text-ink-900 sm:text-[32px]">{dog.name}</h1>
              <p className="mt-1 text-[17px] text-ink-700">{dog.headline}</p>
              <p className="mt-2 text-[15px] text-ink-500">
                {dog.breed} · {dog.age}살 · {dog.gender}
                {dog.neutered ? "(중성화)" : ""} · {dog.size} <span className="tnum">{dog.weightKg}kg</span>
              </p>
              <p className="mt-0.5 text-[15px] text-ink-500">
                <Link
                  href={`/shelters/${shelter?.id}`}
                  className="underline-offset-4 hover:text-ink-900 hover:underline"
                >
                  {shelter?.name}
                </Link>{" "}
                · {shelter?.address.split(" ").slice(0, 2).join(" ")}{" "}
                <span className="tnum">{dog.distanceKm}km</span>
              </p>
            </header>

            {/* 1. 누구에게 맞는지 — 신청 전 가장 먼저 판단할 것 */}
            <section
              aria-labelledby="fit-title"
              className="mt-6 rounded-[20px] border border-cream-300 bg-white p-5 sm:p-6"
            >
              <p id="fit-title" className="flex items-center gap-1.5 text-sm font-semibold text-sage-700">
                <ShieldCheck className="h-4 w-4" aria-hidden /> 이런 분께 추천해요
              </p>
              <p className="mt-1.5 text-[17px] font-bold leading-snug text-ink-900">{dog.recommendedFor}</p>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {fit.map((f) => (
                  <div key={f.label} className="flex gap-3">
                    <dt className="w-[76px] shrink-0 pt-px text-sm text-ink-500">{f.label}</dt>
                    <dd className={cn("text-[15px] font-medium leading-snug", TONE_TEXT[f.tone])}>
                      {f.long}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 border-t border-cream-200 pt-3 text-sm text-ink-500">
                산책 난이도 <strong className="font-semibold text-ink-900">{dog.difficulty}</strong> · 추천
                산책{" "}
                <strong className="font-semibold text-ink-900">{dog.walkNote.recommendedDuration}</strong> ·{" "}
                {dog.walkNote.kidFriendly ? "아이 동반 가능" : "성인 봉사자 추천"}
              </p>
              {dog.match.experience === "experienced" && (
                <p className="mt-3 flex gap-2 rounded-xl bg-tangerine-50 p-3 text-sm leading-relaxed text-ink-900">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-tangerine-700" aria-hidden />
                  안전을 위해 산책 봉사 경험이 있는 분만 신청할 수 있어요. 처음이라면 초보 가능한 아이부터
                  만나보세요.
                </p>
              )}
            </section>

            {/* 2. 언제 — 모바일은 본문에, PC 는 오른쪽 패널에 */}
            <Section title="가능한 일정" className="lg:hidden">
              <DogSchedule dog={dog} />
            </Section>

            {/* 3. 어떤 아이인지 */}
            <Section title={`${withJosa(dog.name, "는")} 이런 아이예요`}>
              <p className="text-[17px] leading-[1.75] text-ink-700">{dog.story}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="성격">
                {dog.personality.map((p) => (
                  <li key={p} className="chip bg-cream-200/80 text-ink-700">
                    {p}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 4. 걸을 때 */}
            <Section title="산책할 때 모습">
              <ul className="space-y-2">
                {dog.habits.map((h) => (
                  <li key={h} className="flex gap-2.5 text-[15px] leading-relaxed text-ink-900">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-sage-600" strokeWidth={3} aria-hidden />
                    {h}
                  </li>
                ))}
                <li className="flex gap-2.5 text-[15px] leading-relaxed text-ink-900">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-sage-600" strokeWidth={3} aria-hidden />
                  {dog.walkNote.leashTrained ? "리드줄에 잘 적응했어요" : "리드줄 훈련을 하고 있어요"} ·{" "}
                  {dog.walkNote.walkExperience}
                </li>
              </ul>
            </Section>

            <Section title="사람·동물을 만나면">
              <dl className="divide-y divide-cream-200 border-y border-cream-200">
                {dog.reactions.map((r) => (
                  <div
                    key={r.target}
                    className="grid grid-cols-[96px_1fr] gap-x-3 py-3 sm:grid-cols-[120px_1fr]"
                  >
                    <dt className="text-[15px] text-ink-500">{r.target}</dt>
                    <dd className="text-[15px] leading-relaxed text-ink-900">
                      <span className={cn("mr-1.5 font-semibold", TONE_TEXT[REACTION[r.level].tone])}>
                        {REACTION[r.level].label}
                      </span>
                      {r.text}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="꼭 지켜주세요">
              <p className="flex gap-2.5 rounded-2xl bg-tangerine-50 p-4 text-[15px] leading-relaxed text-ink-900">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-tangerine-700" aria-hidden />
                {dog.walkNote.caution}
              </p>
            </Section>

            {/* 5. 준비물 · 보호소 */}
            <Section title="챙겨 오세요">
              <ul className="flex flex-wrap gap-2">
                {[...COMMON_BRING, ...(dog.bring ?? [])].map((b) => (
                  <li
                    key={b}
                    className="rounded-xl bg-white px-3 py-2 text-[15px] text-ink-900 ring-1 ring-cream-300"
                  >
                    {b}
                  </li>
                ))}
              </ul>
              <p className="mt-2.5 text-sm text-ink-500">{PROVIDED}</p>
            </Section>

            {shelter && (
              <Section title="보호소 안내">
                <Link
                  href={`/shelters/${shelter.id}`}
                  className="mb-1 flex items-center justify-between gap-3 py-1 text-base font-semibold text-ink-900 hover:text-sage-700"
                >
                  {shelter.name}
                  <span className="flex items-center gap-0.5 text-sm font-medium text-ink-500">
                    보호소 보기 <ChevronRight className="h-4 w-4" aria-hidden />
                  </span>
                </Link>
                <VisitInfo
                  shelter={shelter}
                  fields={["address", "hours", "meetingPoint", "parking", "phone"]}
                />
                <p className="mt-2.5 text-sm text-ink-500">{shelter.visit.firstVisit}</p>
              </Section>
            )}

            {friends.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-bold text-ink-900">{shelter?.name}의 다른 친구들</h2>
                <div className="mt-5">
                  <DogRail wideCols="xl:grid-cols-3" label={`${shelter?.name}의 다른 친구들`}>
                    {friends.map((f) => (
                      <DogCard key={f.id} dog={f} />
                    ))}
                  </DogRail>
                </div>
              </section>
            )}
          </div>

          {/* PC: 일정 고르기 */}
          <aside className="hidden lg:block" aria-label="산책 신청">
            <div className="card sticky top-24 p-6">
              <p className="text-lg font-bold text-ink-900">{withJosa(dog.name, "와")} 산책하기</p>
              <p className="mt-1 text-sm text-ink-500">
                {experience.short} · 추천 산책 {dog.walkNote.recommendedDuration}
              </p>
              <div className="mt-5 border-t border-cream-200 pt-5">
                <DogSchedule dog={dog} compact />
              </div>
              {!resting && (
                <Link href={`/dogs/${dog.id}/apply`} className="btn-secondary mt-5 w-full">
                  다른 날짜 보기
                </Link>
              )}
              <p className="mt-3 text-center text-[13px] text-ink-500">
                보호소가 확인한 뒤 확정돼요 · 보통 하루 안
              </p>
            </div>
          </aside>
        </div>
      </div>

      <StickyApplyBar dog={dog} />
    </>
  );
}
