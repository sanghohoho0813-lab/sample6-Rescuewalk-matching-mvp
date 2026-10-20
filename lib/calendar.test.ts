import { describe, expect, it } from "vitest";
import { getDog } from "@/lib/data/dogs";
import { getShelter } from "@/lib/data/shelters";
import { buildIcs, escapeIcsText, foldLine, kstToDate, toIcsUtc, visitEvent } from "./calendar";

const event = {
  uid: "req-1",
  date: "2026-10-23",
  time: "11:00",
  durationMin: 60,
  title: "송이와 산책 — 한밭 보금자리",
  location: "대전 유성구 대학로 291",
  description: "보호소 2층 봉사자 라운지\n10분 전까지 도착",
  now: new Date(Date.UTC(2026, 9, 20, 3, 4, 5)),
};

describe("캘린더 파일(.ics)", () => {
  it("한국 시각을 UTC 로 적습니다(서머타임 없음)", () => {
    expect(toIcsUtc(kstToDate("2026-10-23", "11:00"))).toBe("20261023T020000Z");
    // 자정 근처는 날짜가 하루 앞으로
    expect(toIcsUtc(kstToDate("2026-01-01", "08:30"))).toBe("20251231T233000Z");
  });

  it("시작·끝·알림과 필수 항목을 담습니다", () => {
    const ics = buildIcs(event);
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20261023T020000Z");
    expect(ics).toContain("DTEND:20261023T030000Z");
    expect(ics).toContain("DTSTAMP:20261020T030405Z");
    expect(ics).toContain("UID:req-1@rescuewalk");
    expect(ics).toContain("TRIGGER:-P1D");
  });

  it("쉼표·세미콜론·줄바꿈은 글자 그대로 보이게 바꿉니다", () => {
    expect(escapeIcsText("a,b;c\\d\ne")).toBe("a\\,b\\;c\\\\d\\ne");
    expect(buildIcs(event)).toContain("DESCRIPTION:보호소 2층 봉사자 라운지\\n10분 전까지 도착");
  });

  it("긴 줄은 75바이트마다 접고, 한글 글자를 가르지 않습니다", () => {
    const line = `SUMMARY:${"가".repeat(40)}`;
    const folded = foldLine(line).split("\r\n");
    expect(folded.length).toBeGreaterThan(1);
    for (const l of folded) expect(new TextEncoder().encode(l).length).toBeLessThanOrEqual(75);
    expect(folded.slice(1).every((l) => l.startsWith(" "))).toBe(true);
    expect(folded.map((l, i) => (i === 0 ? l : l.slice(1))).join("")).toBe(line);
  });

  it("신청 → 일정: 승인 전이면 [승인 대기], 만나는 곳·준비물·연락처를 설명에", () => {
    const dog = getDog("dog-songi")!;
    const shelter = getShelter(dog.shelterId)!;
    const req = {
      id: "r1",
      date: "2026-10-23",
      time: "11:00",
      reservationNo: "RW-1",
      status: "pending" as const,
    };
    const pending = visitEvent(req, dog, shelter);
    expect(pending.title).toBe(`[승인 대기] 송이와 산책 · ${shelter.name}`);
    expect(pending.description).toContain(shelter.visit.meetingPoint);
    expect(pending.description).toContain("걷기 편한 운동화");
    expect(pending.description).toContain(shelter.phone);
    expect(visitEvent({ ...req, status: "confirmed" }, dog, shelter).title.startsWith("[승인 대기]")).toBe(
      false
    );
  });
});
