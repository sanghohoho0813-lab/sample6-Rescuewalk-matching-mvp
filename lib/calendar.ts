/**
 * 방문 일정을 캘린더 파일(.ics)로 — 휴대폰·PC 기본 캘린더 어디에서나 열리는 표준 형식(RFC 5545).
 *
 * 시각은 한국 표준시(UTC+9, 서머타임 없음)로 받은 날짜·시간을 UTC 로 바꿔 적습니다.
 * TZID 를 쓰면 시간대 정의(VTIMEZONE)를 함께 넣어야 하는 캘린더가 있어, UTC 가 가장 덜 깨집니다.
 */

import type { Dog, Shelter, WalkRequest } from "@/lib/types";
import { withJosa } from "@/lib/utils";
import { ARRIVE_EARLY_MIN, COMMON_BRING } from "@/lib/visitGuide";

const KST_OFFSET_MIN = 9 * 60;

export interface VisitEvent {
  /** 같은 신청을 다시 받아도 캘린더가 같은 일정으로 알아보게 하는 고유값 */
  uid: string;
  /** YYYY-MM-DD (한국 날짜) */
  date: string;
  /** HH:MM (한국 시각) */
  time: string;
  durationMin: number;
  title: string;
  location: string;
  description: string;
  /** 생성 시각(DTSTAMP) — 테스트에서 고정할 수 있게 받습니다 */
  now?: Date;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Date → 20261023T020000Z */
export function toIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** 한국 날짜·시각 → 실제 시점(Date) */
export function kstToDate(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hh, mm) - KST_OFFSET_MIN * 60_000);
}

/** 쉼표·세미콜론·역슬래시·줄바꿈은 글자 그대로 보이도록 바꿉니다 */
export const escapeIcsText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** 한 줄은 75바이트를 넘지 않게 접습니다(이어지는 줄은 공백으로 시작) — 한글은 3바이트 */
export function foldLine(line: string): string {
  const out: string[] = [];
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length;
    if (bytes + b > (out.length === 0 ? 75 : 74)) {
      out.push(cur);
      cur = "";
      bytes = 0;
    }
    cur += ch;
    bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
}

export function buildIcs(e: VisitEvent): string {
  const start = kstToDate(e.date, e.time);
  const end = new Date(start.getTime() + e.durationMin * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//RescueWalk//Visit//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}@rescuewalk`,
    `DTSTAMP:${toIcsUtc(e.now ?? new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcsText(e.title)}`,
    `LOCATION:${escapeIcsText(e.location)}`,
    `DESCRIPTION:${escapeIcsText(e.description)}`,
    // 하루 전 알림 — 연락 흐름의 '방문 전날 안내'와 같은 때
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P1D",
    `DESCRIPTION:${escapeIcsText(e.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/**
 * 신청 하나 → 캘린더 일정. 신청 상세·접수 완료가 같은 내용을 씁니다.
 * 승인 전이면 제목 앞에 [승인 대기]를 붙여, 확정된 일정으로 오해하지 않게 합니다.
 */
export function visitEvent(
  req: Pick<WalkRequest, "id" | "date" | "time" | "status" | "reservationNo">,
  dog: Pick<Dog, "name" | "bring">,
  shelter: Pick<Shelter, "name" | "address" | "phone" | "visit">
): VisitEvent {
  return {
    uid: req.id,
    date: req.date,
    time: req.time,
    durationMin: 60,
    title: `${req.status === "pending" ? "[승인 대기] " : ""}${withJosa(dog.name, "와")} 산책 · ${shelter.name}`,
    location: `${shelter.name}, ${shelter.address}`,
    description: [
      `만나는 곳: ${shelter.visit.meetingPoint}`,
      `${ARRIVE_EARLY_MIN}분 전까지 도착해주세요`,
      `챙길 것: ${[...COMMON_BRING, ...(dog.bring ?? [])].join(", ")}`,
      `보호소 연락처: ${shelter.phone}`,
      `예약번호: ${req.reservationNo}`,
    ].join("\n"),
  };
}

/** 브라우저에서 파일로 내려받기 */
export function downloadIcs(filename: string, ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
