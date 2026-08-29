# RescueWalk — 유기견 산책 매칭 MVP 🐾

> 산책이 필요한 아이와, 함께 걸어줄 당신을 연결합니다.

유기견 보호소의 강아지와 산책 봉사자를 연결하는 반응형 웹앱 MVP입니다.
탐색 → 상세 → 날짜/시간 선택 → 신청 완료 → 신청 내역 → 활동 기록까지
전체 사용자 플로우가 실제로 동작합니다.

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
```

## 주요 화면

| 경로 | 화면 |
| --- | --- |
| `/` | 홈 — Hero, 오늘 산책 가능한 아이들, 참여 방법, 활동 지표, 후기 |
| `/dogs` | 강아지 목록 — 필터(지역/보호소/크기/성격/난이도/오늘 가능) + 정렬, 모바일 필터 드로어 |
| `/dogs/[id]` | 강아지 상세 — 스토리, 산책 정보, 보호소 정보, 모바일 Sticky CTA |
| `/dogs/[id]/apply` | 산책 신청 — 날짜 → 시간 → 정보 → 주의사항 → 확인 5단계 Step UI |
| `/complete/[rid]` | 신청 완료 — 예약번호, 방문 안내, 준비물 |
| `/requests` | 신청 내역 — 상태별(신청완료/방문예정/산책완료/취소) 필터, 취소 기능 |
| `/activity` | 활동 기록 — 통계, 활동 배지, 만난 아이들, 산책 일지 |
| `/shelters`, `/shelters/[id]` | 보호소 소개 및 상세 |
| `/guide` | 봉사 가이드 — 참여 방법, 준비물, 현장 가이드, FAQ |
| `/me` | 마이페이지 — 프로필, 찜한 강아지, 관심 지역, 알림 설정 |

## 데모 데이터

- 강아지 18마리 · 보호소 6곳 · 후기 12개 · 신청 내역 5건 · 활동 기록 4건
- 데모 사용자(김지우)가 자동 제공되며, 신청/찜/취소 내역은 브라우저 `localStorage`에 저장됩니다.

## 이미지

실제 사진이 적용되어 있으며, 모두 WebP로 최적화되어 총 2.6MB입니다.

```
public/images/
├── dogs/          강아지 전신 사진 18장 (900×900)
│   └── face/      얼굴 중심 크롭 썸네일 18장 (320×320) — 작은 아바타용
├── shelters/      보호소 외관 사진 5장 (1200×900)
└── guide/         봉사 가이드 사진 7장 (1200×900)
```

교체·추가 방법:

- 강아지: `public/images/dogs/` 에 넣고 `lib/data/dogs.ts` 의 `image` 필드에 파일명 지정.
  작은 아바타에 쓰이는 얼굴 썸네일은 같은 파일명으로 `dogs/face/` 에 함께 넣습니다.
- 보호소: `public/images/shelters/` + `lib/data/shelters.ts` 의 `image` 필드.
- 표시 비율은 컴포넌트가 담당합니다 — 카드 4:3, 상세 히어로 4:3(모바일)/16:10(PC), 보호소 16:9.
  원본 비율과 무관하게 `object-fit: cover` 로 크롭되므로 레이아웃이 무너지지 않습니다.
- `image` 가 `null` 이면 자동 폴백: 강아지는 팔레트 기반 일러스트, 보호소는 소속 아이들의 얼굴 콜라주.
  (현재 '행복한 쉼터'만 외관 사진이 없어 이 폴백이 적용되어 있습니다.)

## Supabase 연동 포인트

MVP는 데모 모드로 동작하지만, 데이터 계층이 교체 가능하게 분리되어 있습니다.

- 스키마 대응: `lib/types.ts` — `shelters`, `dogs`, `walk_slots(availableTimes)`, `walk_requests`, `favorites`, `activity_logs`, `testimonials`
- 교체 지점: `lib/store.tsx` 의 `addRequest` / `toggleFavorite` / `cancelRequest` 액션을 Supabase 쿼리로 대체
- 정적 데이터: `lib/data/*.ts` → Supabase 테이블 fetch로 대체

## 상태 정의

- Walk Request: `pending`(신청완료) → `confirmed`(방문예정) → `completed`(산책완료) / `cancelled`(취소)
- Dog Availability: `available` / `unavailable` / `scheduled`
