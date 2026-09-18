import { ArrowRight, ArrowUpRight, LayoutGrid, Sparkles } from "lucide-react";
import { MIRAE_CTA_COPY, MIRAE_LINKS, SAMPLE_META } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * 샘플 페이지 공통 CTA 브릿지.
 *
 * 샘플을 다 본 사용자를 (1) 제작사 인지 → (2) 상담 전환 → (3) 다른 샘플·홈페이지로
 * 이어주는 하단 섹션입니다. 다른 샘플 프로젝트에도 이 파일과 lib/brand.ts 두 개만
 * 복사하면 그대로 동작합니다.
 *
 * 디자인 의도
 * - 샘플 본문(따뜻한 크림 톤)과 명확히 구분되는 딥네이비 AX 톤 밴드로,
 *   "여기서부터는 제작사가 말하는 영역"임이 한눈에 읽히게 했습니다.
 * - 로고 이미지는 넣지 않습니다(푸터에 이미 노출). 브랜드명과 소개 문구만 텍스트로 전달합니다.
 * - 애니메이션은 메인 CTA의 light sweep(6초 주기, 실제 발광 1.5초)과
 *   배지의 느린 점 호흡 두 개뿐이며, prefers-reduced-motion 에서는 모두 정지합니다.
 */
export default function SampleBridgeCTA({
  consultHref = MIRAE_LINKS.consult,
  samplesHref = MIRAE_LINKS.samples,
  homeHref = MIRAE_LINKS.home,
  eyebrow = MIRAE_CTA_COPY.eyebrow,
  kicker = MIRAE_CTA_COPY.kicker,
  title = MIRAE_CTA_COPY.title,
  description = MIRAE_CTA_COPY.description,
  note = MIRAE_CTA_COPY.note,
  consultLabel = MIRAE_CTA_COPY.consultLabel,
  samplesLabel = MIRAE_CTA_COPY.samplesLabel,
  homeLabel = MIRAE_CTA_COPY.homeLabel,
  sampleName = SAMPLE_META.name,
  sampleTagline = SAMPLE_META.tagline,
  className,
}: {
  consultHref?: string;
  samplesHref?: string;
  homeHref?: string;
  eyebrow?: string;
  kicker?: string;
  title?: string;
  description?: string;
  note?: string;
  consultLabel?: string;
  samplesLabel?: string;
  homeLabel?: string;
  sampleName?: string;
  sampleTagline?: string;
  className?: string;
}) {
  return (
    <section
      aria-labelledby="mirae-bridge-title"
      className={cn(
        "relative isolate overflow-hidden bg-mirae-900 text-white",
        // 이 섹션이 있을 때는 푸터가 바로 맞붙게 해서 밴드가 깔끔하게 쌓이도록
        // (CTA가 숨는 경로에서는 푸터의 기본 mt-16 여백이 그대로 유지됩니다)
        "[&+footer]:mt-0",
        className
      )}
    >
      {/* 배경 디테일 — 은은한 광원 2개와 미세한 그리드 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-mirae-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-mirae-400/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="container-app relative py-14 md:py-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-14">
          {/* 좌: 제작사 소개 */}
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-2.5 pr-3.5 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inset-0 animate-soft-pulse rounded-full bg-mirae-300 motion-reduce:animate-none" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-mirae-300" />
              </span>
              <span className="text-[11px] font-bold tracking-[0.18em] text-mirae-100">
                {eyebrow}
              </span>
            </span>

            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-mirae-200">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              {kicker}
            </p>

            <h2
              id="mirae-bridge-title"
              className="mt-3 whitespace-pre-line text-[26px] font-extrabold leading-[1.35] tracking-tight sm:text-3xl lg:text-[34px]"
            >
              {title}
            </h2>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base">
              {description}
            </p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-white/60">
              <span className="font-semibold text-white/80">{sampleName}</span>
              <span aria-hidden className="text-white/25">
                |
              </span>
              {sampleTagline}
            </p>
          </div>

          {/* 우: 액션 */}
          <div className="w-full shrink-0 lg:w-[336px]">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_18px_44px_rgba(6,23,38,0.45)] backdrop-blur sm:p-6">
              {/* 메인 CTA */}
              <a
                href={consultHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex min-h-[56px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-mirae-500 via-mirae-400 to-mirae-500 px-6 text-base font-bold text-white shadow-[0_10px_28px_rgba(26,155,201,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(53,180,222,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mirae-200 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                {/* light sweep — 6초에 한 번 은은하게 스침 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 animate-light-sweep bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden"
                />
                <span className="relative">{consultLabel}</span>
                <ArrowRight
                  aria-hidden
                  className="relative h-[18px] w-[18px] transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
              </a>

              <p className="mt-3 text-center text-xs leading-relaxed text-white/50">
                {note}
              </p>

              <div className="my-5 h-px bg-white/10" />

              {/* 서브 액션 — 메인보다 확실히 낮은 위계 */}
              <div className="space-y-2.5">
                <a
                  href={samplesHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl border border-white/12 px-4 text-sm font-semibold text-white/85 transition-colors duration-200 hover:border-white/25 hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mirae-200"
                >
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-mirae-300" aria-hidden />
                    {samplesLabel}
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40" aria-hidden />
                </a>
                <a
                  href={homeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[48px] items-center justify-between gap-3 rounded-xl px-4 text-sm font-medium text-white/60 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mirae-200"
                >
                  {homeLabel}
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-white/35" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
