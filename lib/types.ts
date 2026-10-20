export type Region = "서울" | "인천" | "경기" | "대전" | "부산";

export type DogSize = "소형" | "중형" | "대형";

export type WalkDifficulty = "쉬움" | "보통" | "어려움";

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

/** available: 일정에 따라 신청 가능 / unavailable: 치료·휴식 등으로 신청 중단 */
export type DogAvailability = "available" | "unavailable";

/** 0=일 … 6=토 (Date#getDay 와 같음) */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type WalkRequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Shelter {
  id: string;
  name: string;
  region: Region;
  address: string;
  hours: string;
  /** 휴무 요일 — 이 날은 어떤 아이도 산책 신청을 받지 않습니다 */
  closedDays: Weekday[];
  phone: string;
  intro: string;
  description: string;
  /** 보호소의 특징 — 봉사자가 고를 때 실제로 차이가 나는 것만 (2~3개) */
  features: string[];
  /** 방문 안내 — 신청 후 화면과 보호소 상세에서 그대로 씁니다 */
  visit: {
    /** 도착해서 찾아갈 곳 */
    meetingPoint: string;
    transit: string;
    parking: string;
    /** 처음 오는 봉사자에게 하는 것 */
    firstVisit: string;
    /** 주로 걷는 산책 코스 */
    course: string;
  };
  /** 이미지 슬롯 — /public/images/shelters/{image} 로 교체 가능 */
  image: string | null;
  themeColor: string;
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: "남아" | "여아";
  weightKg: number;
  size: DogSize;
  neutered: boolean;
  shelterId: string;
  personality: string[];
  energy: EnergyLevel;
  difficulty: WalkDifficulty;
  availability: DogAvailability;
  /** 산책 가능한 요일. 보호소 휴무일은 이와 관계없이 제외됩니다 */
  walkDays: Weekday[];
  /** 산책 가능한 요일의 시작 시각(HH:mm) */
  availableTimes: string[];
  /** 카드에서 성격을 한 줄로 — 태그 나열 대신 */
  headline: string;
  story: string;
  /** 매칭 판단의 핵심 — 카드와 상세, 필터가 같은 값을 씁니다 */
  match: DogMatch;
  /** 걷는 습관 (2~3개) */
  habits: string[];
  /** 대상별 반응 */
  reactions: DogReaction[];
  /** 이런 봉사자에게 추천 — 상세의 첫 판단 문장 */
  recommendedFor: string;
  /** 이 아이라서 더 챙길 것 (공통 준비물 외) */
  bring?: string[];
  walkNote: {
    recommendedDuration: string;
    caution: string;
    leashTrained: boolean;
    walkExperience: string;
    dogFriendly: string;
    kidFriendly: boolean;
  };
  /** 이미지 슬롯 — /public/images/dogs/{image} 로 교체 가능 */
  image: string | null;
  /** 이미지가 없을 때 사용하는 일러스트 팔레트 */
  art: { bg: string; body: string; ear: string };
  registeredAt: string;
  distanceKm: number;
  recommended: boolean;
}

export type PeopleAffinity = "high" | "medium" | "shy";
export type DogsAffinity = "good" | "selective" | "keep-distance";
export type PullStrength = "light" | "moderate" | "strong";
export type ExperienceNeeded = "beginner" | "some" | "experienced";

export interface DogMatch {
  /** 사람 친화도 */
  people: PeopleAffinity;
  /** 다른 강아지와의 관계 */
  dogs: DogsAffinity;
  /** 리드줄을 당기는 힘 */
  pulling: PullStrength;
  /** 필요한 봉사 경험 */
  experience: ExperienceNeeded;
}

export type ReactionLevel = "good" | "care" | "avoid";

export interface DogReaction {
  target: "사람" | "다른 강아지" | "고양이·작은 동물" | "소리·차량";
  level: ReactionLevel;
  text: string;
}

export interface WalkRequest {
  id: string;
  reservationNo: string;
  dogId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  applicant: {
    name: string;
    phone: string;
    experienced: boolean;
    memo: string;
  };
  status: WalkRequestStatus;
  createdAt: string;
  /** 상태 전이 시각 — 상세 화면의 진행 타임라인에 사용 */
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export interface ActivityLog {
  id: string;
  dogId: string;
  /** 이 기록을 만든 산책 신청. 시드의 오래된 기록에는 없을 수 있음 */
  requestId?: string;
  date: string;
  durationMin: number;
  note: string;
  /** 산책 중 관찰 — 보호소가 아이 기록(입양 프로필)에 반영합니다 */
  observations?: string[];
}

export interface Testimonial {
  id: string;
  author: string;
  dogName: string;
  region: Region;
  rating: number;
  content: string;
  date: string;
}

/** 활동 기록의 이정표 — 게임 점수가 아니라 실제로 있었던 일의 기준선 */
export interface Milestone {
  id: string;
  label: string;
  description: string;
  achieved: (stats: ActivityStats) => boolean;
  /** 아직 닿지 않은 이정표에 보여줄 진행도 (예: "4/5마리") */
  progress: (stats: ActivityStats) => string;
  /** 진행 막대용 0~1 */
  ratio: (stats: ActivityStats) => number;
}

export interface ActivityStats {
  totalWalks: number;
  uniqueDogs: number;
  totalMinutes: number;
  /** 두 번 이상 함께 걸은 아이 수 */
  revisitedDogs: number;
  /** 함께한 보호소 수 */
  shelters: number;
}
