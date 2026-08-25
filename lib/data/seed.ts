import type { ActivityLog, WalkRequest } from "@/lib/types";

/**
 * 데모 시연용 초기 데이터.
 * 첫 방문 시 localStorage에 시드되며, 사용자가 신청을 완료하면 여기에 쌓입니다.
 */
export const seedRequests: WalkRequest[] = [
  {
    id: "req-seed-1",
    reservationNo: "RW-260830-104",
    dogId: "dog-bori",
    date: "2026-08-30",
    time: "10:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: true, memo: "" },
    status: "confirmed",
    createdAt: "2026-08-22T10:12:00+09:00",
  },
  {
    id: "req-seed-2",
    reservationNo: "RW-260827-221",
    dogId: "dog-songi",
    date: "2026-08-27",
    time: "11:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: true, memo: "송이 개인기 보고 싶어요!" },
    status: "pending",
    createdAt: "2026-08-23T18:40:00+09:00",
  },
  {
    id: "req-seed-3",
    reservationNo: "RW-260816-087",
    dogId: "dog-dani",
    date: "2026-08-16",
    time: "15:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: true, memo: "" },
    status: "completed",
    createdAt: "2026-08-12T09:05:00+09:00",
  },
  {
    id: "req-seed-4",
    reservationNo: "RW-260809-152",
    dogId: "dog-choco",
    date: "2026-08-09",
    time: "14:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: false, memo: "첫 봉사예요. 잘 부탁드립니다." },
    status: "completed",
    createdAt: "2026-08-05T20:30:00+09:00",
  },
  {
    id: "req-seed-5",
    reservationNo: "RW-260802-063",
    dogId: "dog-yeontan",
    date: "2026-08-02",
    time: "16:00",
    applicant: { name: "김지우", phone: "010-1234-5678", experienced: false, memo: "" },
    status: "cancelled",
    createdAt: "2026-07-29T13:15:00+09:00",
  },
];

export const seedActivityLogs: ActivityLog[] = [
  {
    id: "act-seed-1",
    dogId: "dog-dani",
    date: "2026-08-16",
    durationMin: 40,
    note: "단이와 공원 두 바퀴. 벤치에서 같이 쉬면서 교감했어요.",
  },
  {
    id: "act-seed-2",
    dogId: "dog-choco",
    date: "2026-08-09",
    durationMin: 45,
    note: "초코 '기다려' 훈련 성공! 간식 두 개로 금방 친해졌어요.",
  },
  {
    id: "act-seed-3",
    dogId: "dog-bori",
    date: "2026-07-26",
    durationMin: 60,
    note: "보리와 첫 산책. 꼬리를 쉬지 않고 흔들어줘서 행복했어요.",
  },
  {
    id: "act-seed-4",
    dogId: "dog-dubu",
    date: "2026-07-19",
    durationMin: 30,
    note: "두부와 짧은 산책 후 품에 안겨 낮잠. 심장이 녹는 줄 알았네요.",
  },
];
