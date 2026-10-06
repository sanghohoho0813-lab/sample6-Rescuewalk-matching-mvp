# RescueWalk — 유기견 산책 매칭 MVP 🐾

> 산책이 필요한 아이와, 함께 걸어줄 당신을 연결합니다.

유기견 보호소의 강아지와 산책 봉사자를 연결하는 반응형 웹앱 MVP입니다.

**Golden Path** — 한 사이클이 끝까지 동작하고, 각 단계가 실제 상태를 바꿉니다.

```
탐색 → 상세 → 신청 5단계 → 접수 완료 → 신청 상세
     → (보호소 승인) → 산책 완료 기록 → 활동 기록·배지 갱신
```

- 신청하면 신청 내역에 생기고, 새로고침해도 유지됩니다.
- 방문예정 신청에서 "산책 완료 기록하기"를 누르면 신청이 산책완료로 바뀌고,
  활동 기록에 일지가 추가되며 통계와 배지가 즉시 다시 계산됩니다.
- 취소는 확인 다이얼로그를 거쳐 상태가 바뀌고, 같은 시간대가 다시 열립니다.

## 기술 스택

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — Soft Green / Cream / Warm White / Orange Accent 디자인 토큰
- **Lucide Icons**
- 상태: React Context + `localStorage` 영속화 (데모 모드)
- 배포: **Vercel** 바로 배포 가능 (`vercel` 또는 GitHub 연동)

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run typecheck  # TypeScript 검사
npm run lint       # ESLint (next/core-web-vitals)
```

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 — Hero, 오늘 산책 가능한 아이들(관심 지역 우선), 참여 방법, 데이터 기반 지표, 후기 |
| `/dogs` | 강아지 목록 — 필터(지역/보호소/크기/성격/난이도/오늘 가능) + 정렬. 조건은 주소에 저장(`?today=1&region=서울`)되어 상세에서 돌아와도 유지, 적용 조건은 칩으로 하나씩 해제 |
| `/dogs/[id]` | 강아지 상세 — 판단 핵심 3가지, 스토리, 주의사항, 보호소, 하단 고정 신청 버튼 |
| `/dogs/[id]/apply` | 산책 신청 5단계 — 날짜 → 시간 → 정보(검증) → 약속 → 확인(항목별 변경). 단계는 `?step=`으로 브라우저 뒤로가기 = 이전 단계, 입력값은 탭 단위 임시 저장(새로고침해도 유지, 신청 시 삭제) |
| `/complete/[rid]` | 신청 접수 — 방문 정보, 준비물, "내 신청 확인하기" |
| `/requests` | 신청 내역 — 예정된 산책 / 지난 신청, 상태별 필터와 개수 |
| `/requests/[id]` | 신청 상세 — 진행 타임라인, 상태별 단 하나의 행동(승인·기록·재신청), 취소 |
| `/activity` | 활동 기록 — 통계, 배지(진행도), 만난 아이들, 산책 일지, 방금 기록 강조 |
| `/shelters`, `/shelters/[id]` | 보호소 소개 및 상세 |
| `/guide` | 봉사 가이드 — 참여 방법, 준비물, 현장 가이드, FAQ |
| `/me` | 마이페이지 — 요약, 찜한 아이들, 관심 지역(저장), 데모 데이터 초기화 |

## 데모 데이터

- 강아지 18마리 · 보호소 6곳 · 후기 12개 · 신청 내역 5건 · 활동 기록 4건
- 데모 사용자(김지우)가 자동 제공되며, 신청·찜·기록·관심 지역은 브라우저 `localStorage`에 저장됩니다.
- **시드 날짜는 오늘 기준 상대값**입니다(`lib/data/seed.ts`). 고정 날짜를 쓰면 시간이 지나
  "지난 날짜인데 방문예정" 같은 모순이 생기기 때문입니다. 주말 배지처럼 요일에 따라 바뀌는
  값은 기준일을 고정 규칙(가장 가까운 토요일)으로 계산해 날마다 결과가 달라지지 않습니다.
- 시연 시나리오: 송이(방문예정)를 기록하면 다섯 번째 친구가 되어 '5마리 친구' 배지가 열리고,
  보리(신청완료)로는 데모 승인 → 방문예정 전환을 체험할 수 있습니다.
- 실제로 연동되지 않은 동작은 화면에 **데모** 표시를 붙였습니다(보호소 승인, 방문일 전 기록).
- 마이페이지의 "처음 상태로 되돌리기"로 언제든 초기 데이터로 돌아갑니다.

## 이미지

실제 사진이 적용되어 있으며, 모두 WebP로 최적화되어 총 2.6MB입니다.

```
public/images/
├── dogs/          강아지 전신 사진 18장 (900×900)
│   └── face/      얼굴 중심 크롭 썸네일 18장 (320×320) — 작은 아바타용
├── shelters/      보호소 외관 사진 5장 (1200×900)
├── guide/         봉사 가이드 사진 7장 (1200×900)
└── brand/         제작사(미래에이아이랩) 로고 — 원본 그대로, 투명 배경
```

교체·추가 방법:

- 강아지: `public/images/dogs/` 에 넣고 `lib/data/dogs.ts` 의 `image` 필드에 파일명 지정.
  작은 아바타에 쓰이는 얼굴 썸네일은 같은 파일명으로 `dogs/face/` 에 함께 넣습니다.
- 보호소: `public/images/shelters/` + `lib/data/shelters.ts` 의 `image` 필드.
- 표시 비율은 컴포넌트가 담당합니다 — 카드 4:3, 상세 히어로 4:3(모바일)/16:10(PC), 보호소 16:9.
  원본 비율과 무관하게 `object-fit: cover` 로 크롭되므로 레이아웃이 무너지지 않습니다.
- `image` 가 `null` 이면 자동 폴백: 강아지는 팔레트 기반 일러스트, 보호소는 소속 아이들의 얼굴 콜라주.
  (현재 '행복한 쉼터'만 외관 사진이 없어 이 폴백이 적용되어 있습니다.)

## 브랜딩

서비스 브랜드는 **RescueWalk**, 제작사 브랜드는 **미래에이아이랩**으로 층을 나눠 씁니다.
한 화면에 제작사 표기가 반복되지 않도록 두 곳으로만 제한했습니다.

| 위치 | 형태 |
| --- | --- |
| 모든 페이지 하단 | `SampleBridgeCTA` — 제작 표기 + 소개 + 상담 CTA (텍스트만, 로고 없음) |
| 푸터 | `MiraeWordmark` — 원본 로고 1회 (밝은 배경 전용: 로고가 짙은 남색) |

`app/layout.tsx` 의 metadata(`creator`/`publisher`/OpenGraph)에도 제작사를 명시해
링크 공유 시 노출됩니다.

## 샘플 공통 CTA 브릿지

샘플을 다 본 사용자를 제작사 인지 → 상담 전환 → 다른 샘플·홈페이지로 이어주는
공통 섹션입니다. `app/layout.tsx` 에 한 번 삽입되어 **모든 페이지 하단**(푸터 위)에
동일하게 노출됩니다.

```
components/SampleBridgeCTA.tsx   CTA 섹션 본문 (다른 샘플에 그대로 복사 가능)
components/SampleBridgeSlot.tsx  경로별 노출 제어 (신청 폼 단계에서만 숨김)
lib/brand.ts                     링크 · 문구 상수 ← 여기만 고치면 전체 반영
```

**링크를 바꾸려면** → `lib/brand.ts` 의 `MIRAE_LINKS`

| 키 | 현재 값 | 쓰이는 곳 |
| --- | --- | --- |
| `consult` | `miraeailab.com/business-diagnosis` | 메인 CTA "우리 회사도 만들어보기" |
| `samples` | `miraeailab.com/business-services` | 서브 "다른 샘플 보기" |
| `home` | `miraeailab.com/` | 서브 "미래AI랩 홈페이지" |

**문구를 바꾸려면** → `lib/brand.ts` 의 `MIRAE_CTA_COPY`
(`eyebrow` 배지 / `kicker` 제작 표기 / `title` 헤드라인 / `description` 회사 소개 /
`note` 버튼 보조문구 / `consultLabel`·`samplesLabel`·`homeLabel` 버튼 라벨).
특정 페이지에서만 다르게 쓰려면 `<SampleBridgeCTA title="..." consultHref="..." />`
처럼 같은 이름의 props 로 덮어쓸 수 있습니다.

**노출 경로를 바꾸려면** → `components/SampleBridgeSlot.tsx` 의 `HIDDEN_PATHS`.
현재 `/dogs/[id]/apply` 만 제외되어 있습니다(5단계 신청 폼 진행 중에 외부 링크를
노출하면 샘플의 핵심 전환 흐름을 중간에 이탈시키기 때문). 신청이 끝난
`/complete/[rid]` 에서는 정상 노출되어, 흐름을 다 본 직후에 CTA를 만납니다.

디자인·모션 원칙

- 샘플 본문(크림 톤)과 구분되는 딥네이비 AX 톤 밴드 — "여기부터는 제작사 영역"이 한눈에 읽힘
- CTA 안에는 로고 이미지를 넣지 않음(푸터에 이미 노출). 브랜드명과 소개 문구만 텍스트로 전달
- 애니메이션은 두 개뿐: 메인 CTA의 light sweep(6초 주기, 실제 발광 약 1.5초)과
  배지 점의 느린 호흡(3.2초). hover 시 살짝 lift + glow
- `prefers-reduced-motion` 에서는 sweep이 숨고 무한 애니메이션이 모두 정지

모바일 하단 sticky mini CTA는 넣지 않았습니다. 이 샘플은 이미 하단 Bottom Navigation과
강아지 상세의 Sticky 신청 버튼을 쓰고 있어, 세 번째 고정 바가 겹치면 핵심 전환(산책 신청)을
가립니다.

## Supabase 연동 포인트

MVP는 데모 모드로 동작하지만, 데이터 계층이 교체 가능하게 분리되어 있습니다.

- 스키마 대응: `lib/types.ts` — `shelters`, `dogs`, `walk_slots(availableTimes)`, `walk_requests`, `favorites`, `activity_logs`, `testimonials`
- 교체 지점: `lib/store.tsx` 의 `addRequest` / `cancelRequest` / `confirmRequest` / `completeWalk` /
  `toggleFavorite` / `toggleInterestRegion` 액션을 Supabase 쿼리로 대체
  (`confirmRequest` 는 데모 전용 — 실제 서비스에서는 보호소 관리자 화면이 호출)
- 정적 데이터: `lib/data/*.ts` → Supabase 테이블 fetch로 대체

## 상태 정의

```
pending(신청완료) ─ confirmRequest ─▶ confirmed(방문예정) ─ completeWalk ─▶ completed(산책완료)
      └──────────── cancelRequest ────────┴──▶ cancelled(취소)
```

- `completeWalk` 는 `activity_logs` 에 기록(`requestId` 연결)을 추가해 통계·배지에 바로 반영됩니다.
- 각 전이 시각(`confirmedAt` / `completedAt` / `cancelledAt`)을 저장해 신청 상세의 타임라인에 씁니다.
- Dog Availability: `available` / `unavailable` / `scheduled`

## 디자인 원칙

- **색**: 브랜드 sage + 강조 tangerine(화면당 주요 행동에만) + cream/ink 중립 + 의미 색
  (완료=sage, 대기=tangerine, 취소·위험=red). 선택 상태는 sage, 태그는 중립색으로 통일
- **한 화면 한 행동**: 강아지 카드에는 버튼을 두지 않고 카드 전체를 상세 링크로,
  신청은 상세의 단일 CTA로 모음. 신청 상세는 상태별로 행동 하나만 노출
- **카드 최소화**: 독립된·클릭 가능한 객체에만 카드. 정보 묶음은 구분선·여백·타이포로 구분
- **고정 바는 한 겹**: 상세·신청 흐름에서는 하단 내비를 숨기고 그 화면의 주요 행동만 하단에 고정
- **조사 자동 처리**: 이름 뒤 조사는 `withJosa()`로 받침에 맞게("장군과", "보리와")
- **떠 있는 요소끼리 겹치지 않게**: 바텀시트·모달이 열리면 공용 뒤로/앞으로 버튼을 잠시 숨김(`body[data-modal-open]`),
  푸터 하단은 그 버튼 높이만큼 여백 확보
- 토큰은 `app/globals.css` 상단 주석에 정리(radius 12/16/20/24, shadow card/card-hover/overlay,
  `.tnum` = 숫자·날짜 한 덩어리의 줄바꿈 금지 — 여러 항목이 이어지는 목록에는 쓰지 않음)

## QA

Golden Path를 PC(1280)·모바일(390)에서 브라우저 자동화로 클릭해 검증합니다.
신청 → 새로고침 유지 → 승인 → 기록 → 배지 해금 → 취소 → 관심 지역 저장 → 초기화까지
상태 변화와, 필터 주소 유지(상세 왕복·뒤로가기), 신청 단계 뒤로/앞으로·새로고침 복원,
주소로 확인 단계 직접 진입 시 차단, 시트 열림 시 공용 버튼 숨김, 받침 조사,
9개 폭(360~1440) × 11개 경로의 가로 넘침, 콘솔·하이드레이션 경고를 확인합니다(66개 항목).
