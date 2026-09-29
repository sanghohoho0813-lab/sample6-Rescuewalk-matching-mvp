import type { ActivityLog, WalkRequest } from "@/lib/types";
import { daysFromToday } from "@/lib/utils";

/**
 * 데모 시연용 초기 데이터.
 *
 * 날짜를 고정값으로 두면 시간이 지나면서 "지난 날짜인데 방문예정" 같은 모순이 생기므로,
 * 모든 날짜를 **시드가 만들어지는 날 기준 상대값**으로 계산합니다.
 * 첫 방문(또는 데모 초기화) 시 한 번 만들어져 localStorage에 저장되고,
 * 이후에는 사용자의 행동으로만 바뀝니다.
 *
 * 시연 시나리오가 자연스럽게 이어지도록 설계했습니다.
 * - 송이: 방문예정 → "산책 완료 기록하기"를 누르면 처음 만나는 다섯 번째 친구가 되어
 *   '5마리 친구 만나기' 배지가 열립니다.
 * - 보리: 신청완료(보호소 확인 대기) → 데모 승인 버튼으로 방문예정 전환을 체험할 수 있습니다.
 */

const APPLICANT = { name: "김지우", phone: "010-1234-5678" };

/** 오늘 기준 n일 뒤 hh:mm (사용자 브라우저의 로컬 시각) */
function isoAt(daysOffset: number, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysOffset, h, m).toISOString();
}

/** 오늘로부터 minDaysAgo일 이상 지난 가장 가까운 토요일 — 주말 배지가 매일 바뀌지 않도록 */
function saturdayAtLeast(minDaysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - minDaysAgo);
  while (d.getDay() !== 6) d.setDate(d.getDate() - 1);
  return daysFromToday(0, d);
}

function reservationNo(dateISO: string, serial: string): string {
  return `RW-${dateISO.slice(2).replaceAll("-", "")}-${serial}`;
}

export function buildSeed(): { requests: WalkRequest[]; activityLogs: ActivityLog[] } {
  const songiDate = daysFromToday(2);
  const boriDate = daysFromToday(5);
  const daniDate = daysFromToday(-6);
  const chocoDate = daysFromToday(-13);
  const yeontanDate = daysFromToday(-20);

  const requests: WalkRequest[] = [
    {
      id: "req-seed-1",
      reservationNo: reservationNo(songiDate, "104"),
      dogId: "dog-songi",
      date: songiDate,
      time: "11:00",
      applicant: { ...APPLICANT, experienced: true, memo: "송이 개인기 보고 싶어요!" },
      status: "confirmed",
      createdAt: isoAt(-3, "10:12"),
      confirmedAt: isoAt(-2, "14:30"),
    },
    {
      id: "req-seed-2",
      reservationNo: reservationNo(boriDate, "221"),
      dogId: "dog-bori",
      date: boriDate,
      time: "10:00",
      applicant: { ...APPLICANT, experienced: true, memo: "" },
      status: "pending",
      createdAt: isoAt(-1, "18:40"),
    },
    {
      id: "req-seed-3",
      reservationNo: reservationNo(daniDate, "087"),
      dogId: "dog-dani",
      date: daniDate,
      time: "16:00",
      applicant: { ...APPLICANT, experienced: true, memo: "" },
      status: "completed",
      createdAt: isoAt(-10, "09:05"),
      confirmedAt: isoAt(-9, "11:20"),
      completedAt: isoAt(-6, "17:10"),
    },
    {
      id: "req-seed-4",
      reservationNo: reservationNo(chocoDate, "152"),
      dogId: "dog-choco",
      date: chocoDate,
      time: "14:00",
      applicant: { ...APPLICANT, experienced: false, memo: "첫 봉사예요. 잘 부탁드립니다." },
      status: "completed",
      createdAt: isoAt(-17, "20:30"),
      confirmedAt: isoAt(-16, "10:05"),
      completedAt: isoAt(-13, "15:00"),
    },
    {
      id: "req-seed-5",
      reservationNo: reservationNo(yeontanDate, "063"),
      dogId: "dog-yeontan",
      date: yeontanDate,
      time: "16:00",
      applicant: { ...APPLICANT, experienced: false, memo: "" },
      status: "cancelled",
      createdAt: isoAt(-24, "13:15"),
      cancelledAt: isoAt(-22, "09:40"),
    },
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: "act-seed-1",
      requestId: "req-seed-3",
      dogId: "dog-dani",
      date: daniDate,
      durationMin: 40,
      note: "단이와 공원 두 바퀴. 벤치에서 같이 쉬면서 교감했어요.",
    },
    {
      id: "act-seed-2",
      requestId: "req-seed-4",
      dogId: "dog-choco",
      date: chocoDate,
      durationMin: 45,
      note: "초코 '기다려' 훈련 성공! 간식 두 개로 금방 친해졌어요.",
    },
    {
      id: "act-seed-3",
      dogId: "dog-bori",
      date: saturdayAtLeast(28),
      durationMin: 60,
      note: "보리와 첫 산책. 꼬리를 쉬지 않고 흔들어줘서 행복했어요.",
    },
    {
      id: "act-seed-4",
      dogId: "dog-dubu",
      date: daysFromToday(-41),
      durationMin: 30,
      note: "두부와 짧은 산책 후 품에 안겨 낮잠. 심장이 녹는 줄 알았네요.",
    },
  ];

  return { requests, activityLogs };
}

export const SEED_FAVORITES = ["dog-bori", "dog-dubu"];
export const SEED_INTEREST_REGIONS = ["서울"];
