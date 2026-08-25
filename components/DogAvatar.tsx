import type { Dog } from "@/lib/types";

/**
 * 강아지 사진이 아직 없을 때 사용하는 일러스트 플레이스홀더.
 * 실제 사진이 준비되면 /public/images/dogs/ 에 넣고 dog.image 를 지정하면
 * DogImage 가 자동으로 사진을 우선 사용합니다.
 */
export default function DogAvatar({
  dog,
  className,
}: {
  dog: Pick<Dog, "name" | "art">;
  className?: string;
}) {
  const { bg, body, ear } = dog.art;
  return (
    <svg
      viewBox="0 0 240 180"
      role="img"
      aria-label={`${dog.name} 일러스트`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="240" height="180" fill={bg} />
      {/* 배경 발자국 패턴 */}
      <g fill="#ffffff" opacity="0.35">
        <circle cx="30" cy="34" r="5" />
        <circle cx="42" cy="26" r="3.4" />
        <circle cx="20" cy="26" r="3.4" />
        <circle cx="206" cy="146" r="5" />
        <circle cx="218" cy="138" r="3.4" />
        <circle cx="196" cy="138" r="3.4" />
        <circle cx="208" cy="30" r="4" />
        <circle cx="34" cy="150" r="4" />
      </g>
      {/* 귀 */}
      <ellipse cx="76" cy="66" rx="22" ry="34" fill={ear} transform="rotate(-24 76 66)" />
      <ellipse cx="164" cy="66" rx="22" ry="34" fill={ear} transform="rotate(24 164 66)" />
      {/* 얼굴 */}
      <ellipse cx="120" cy="102" rx="58" ry="52" fill={body} />
      {/* 주둥이 */}
      <ellipse cx="120" cy="122" rx="30" ry="22" fill="#ffffff" opacity="0.82" />
      {/* 눈 */}
      <circle cx="98" cy="94" r="6.5" fill="#2B2622" />
      <circle cx="142" cy="94" r="6.5" fill="#2B2622" />
      <circle cx="100.4" cy="91.6" r="2" fill="#ffffff" />
      <circle cx="144.4" cy="91.6" r="2" fill="#ffffff" />
      {/* 볼터치 */}
      <circle cx="82" cy="112" r="8" fill="#F49E42" opacity="0.28" />
      <circle cx="158" cy="112" r="8" fill="#F49E42" opacity="0.28" />
      {/* 코 */}
      <path
        d="M112 114 h16 a4 4 0 0 1 3 6.6 l-8 8.6 a4 4 0 0 1 -6 0 l-8 -8.6 a4 4 0 0 1 3 -6.6 z"
        fill="#3A3530"
      />
      {/* 입 */}
      <path
        d="M120 130 v6 m0 0 c-3 5 -9 5.6 -12 2.4 m12 -2.4 c3 5 9 5.6 12 2.4"
        stroke="#3A3530"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      {/* 혀 */}
      <path d="M114 141 q6 9 12 0 q-2 8 -6 8 q-4 0 -6 -8 z" fill="#F0813C" opacity="0.85" />
    </svg>
  );
}
