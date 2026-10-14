import type { ActivityLog, WalkRequest } from "@/lib/types";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { scheduledSlots } from "@/lib/domain/schedule";
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
 *   '5마리 친구' 이정표에 닿습니다.
 * - 보리: 신청완료(보호소 확인 대기) → 데모 승인 → 기록하면, 한 달 전에 만난 보리를 다시 만나
 *   '다시 만난 친구'가 됩니다.
 *
 * 모든 날짜는 그 아이의 실제 산책 일정(보호소 휴무·산책 요일)에 맞는 날로 고릅니다.
 * 시드가 일정 규칙을 어기면 "휴무일에 방문예정" 같은 모순이 생기기 때문입니다.
 */

const APPLICANT = { name: "김지우", phone: "010-1234-5678" };

/** 오늘 기준 n일 뒤 hh:mm (사용자 브라우저의 로컬 시각) */
function isoAt(daysOffset: number, hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysOffset, h, m).toISOString();
}

/**
 * offset 일 뒤(음수면 전)부터 같은 방향으로 찾아, 그 아이가 그 시간에 산책할 수 있는 첫 날짜.
 * 미래 일정은 앞으로, 지난 기록은 과거로 찾습니다.
 */
function walkDate(dogId: string, offset: number, time: string): { date: string; offset: number } {
  const dog = getDog(dogId)!;
  const shelter = getShelter(dog.shelterId)!;
  const step = offset >= 0 ? 1 : -1;
  for (let o = offset, i = 0; i < 14; o += step, i++) {
    const date = daysFromToday(o);
    if (scheduledSlots(dog, shelter, date).includes(time)) return { date, offset: o };
  }
  throw new Error(`시드 일정을 찾지 못했어요: ${dogId} ${time}`);
}

function reservationNo(dateISO: string, serial: string): string {
  return `RW-${dateISO.slice(2).replaceAll("-", "")}-${serial}`;
}

export function buildSeed(): { requests: WalkRequest[]; activityLogs: ActivityLog[] } {
  const songi = walkDate("dog-songi", 2, "11:00");
  const bori = walkDate("dog-bori", 5, "10:00");
  const dani = walkDate("dog-dani", -6, "16:00");
  const choco = walkDate("dog-choco", -13, "14:00");
  const yeontan = walkDate("dog-yeontan", -20, "16:00");
  const songiDate = songi.date;
  const boriDate = bori.date;
  const daniDate = dani.date;
  const chocoDate = choco.date;
  const yeontanDate = yeontan.date;

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
      createdAt: isoAt(dani.offset - 4, "09:05"),
      confirmedAt: isoAt(dani.offset - 3, "11:20"),
      completedAt: isoAt(dani.offset, "17:10"),
    },
    {
      id: "req-seed-4",
      reservationNo: reservationNo(chocoDate, "152"),
      dogId: "dog-choco",
      date: chocoDate,
      time: "14:00",
      applicant: { ...APPLICANT, experienced: false, memo: "첫 봉사예요. 잘 부탁드립니다." },
      status: "completed",
      createdAt: isoAt(choco.offset - 4, "20:30"),
      confirmedAt: isoAt(choco.offset - 3, "10:05"),
      completedAt: isoAt(choco.offset, "15:00"),
    },
    {
      id: "req-seed-5",
      reservationNo: reservationNo(yeontanDate, "063"),
      dogId: "dog-yeontan",
      date: yeontanDate,
      time: "16:00",
      applicant: { ...APPLICANT, experienced: false, memo: "" },
      status: "cancelled",
      createdAt: isoAt(yeontan.offset - 4, "13:15"),
      cancelledAt: isoAt(yeontan.offset - 2, "09:40"),
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
      observations: ["리드줄을 잘 따라 걸었어요", "사람을 반겼어요"],
    },
    {
      id: "act-seed-2",
      requestId: "req-seed-4",
      dogId: "dog-choco",
      date: chocoDate,
      durationMin: 45,
      note: "초코 '기다려' 훈련 성공! 간식 두 개로 금방 친해졌어요.",
      observations: ["소리에 놀랐어요", "배변했어요"],
    },
    {
      id: "act-seed-3",
      dogId: "dog-bori",
      date: walkDate("dog-bori", -28, "15:00").date,
      durationMin: 60,
      note: "보리와 첫 산책. 꼬리를 쉬지 않고 흔들어줘서 행복했어요.",
    },
    {
      id: "act-seed-4",
      dogId: "dog-dubu",
      date: walkDate("dog-dubu", -41, "14:00").date,
      durationMin: 30,
      note: "두부와 짧은 산책 후 품에 안겨 낮잠. 심장이 녹는 줄 알았네요.",
    },
  ];

  return { requests, activityLogs };
}

export const SEED_FAVORITES = ["dog-bori", "dog-dubu"];
export const SEED_INTEREST_REGIONS = ["서울"];
