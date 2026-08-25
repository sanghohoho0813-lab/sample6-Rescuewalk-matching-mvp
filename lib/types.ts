export type Region = "서울" | "인천" | "경기" | "대전" | "부산";

export type DogSize = "소형" | "중형" | "대형";

export type WalkDifficulty = "쉬움" | "보통" | "어려움";

export type EnergyLevel = 1 | 2 | 3 | 4 | 5;

export type DogAvailability = "available" | "unavailable" | "scheduled";

export type WalkRequestStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Shelter {
  id: string;
  name: string;
  region: Region;
  address: string;
  hours: string;
  phone: string;
  intro: string;
  description: string;
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
  availableToday: boolean;
  availableTimes: string[];
  story: string;
  walkNote: {
    recommendedDuration: string;
    caution: string;
    leashTrained: boolean;
    walkExperience: string;
    dogFriendly: string;
    kidFriendly: boolean;
    beginnerFriendly: boolean;
  };
  /** 이미지 슬롯 — /public/images/dogs/{image} 로 교체 가능 */
  image: string | null;
  /** 이미지가 없을 때 사용하는 일러스트 팔레트 */
  art: { bg: string; body: string; ear: string };
  registeredAt: string;
  distanceKm: number;
  recommended: boolean;
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
}

export interface ActivityLog {
  id: string;
  dogId: string;
  date: string;
  durationMin: number;
  note: string;
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

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  achieved: (stats: ActivityStats) => boolean;
}

export interface ActivityStats {
  totalWalks: number;
  uniqueDogs: number;
  totalMinutes: number;
  weekendWalks: number;
}
