import { describe, expect, it } from "vitest";
import {
  addDays,
  availabilityWindow,
  bookedSlotsByDate,
  closedDaysLabel,
  dayLabel,
  nextOpening,
  openSlotsOn,
  pastSlots,
  scheduledSlots,
  shelterHours,
  slotFitsHours,
  weekdayOf,
} from "./schedule";
import { makeRequest } from "@/lib/test/factories";

// 2026-10-13 은 화요일
const TODAY = "2026-10-13";
const at = (hh: number, mm = 0) => new Date(2026, 9, 13, hh, mm);
const shelter = { closedDays: [1 as const], hours: "10:00 – 17:00" };
const dog = {
  availability: "available" as const,
  walkDays: [0, 2, 3, 4, 5, 6] as (0 | 2 | 3 | 4 | 5 | 6)[],
  availableTimes: ["10:00", "15:00", "16:00"],
};

describe("날짜 계산", () => {
  it("요일", () => {
    expect(weekdayOf("2026-10-13")).toBe(2);
    expect(weekdayOf("2026-10-18")).toBe(0);
  });
  it("월 경계를 넘는 날짜 더하기", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
  });
  it("카드용 짧은 날짜", () => {
    expect(dayLabel("2026-10-13", TODAY)).toBe("오늘");
    expect(dayLabel("2026-10-14", TODAY)).toBe("내일");
    expect(dayLabel("2026-10-16", TODAY)).toBe("금요일");
    expect(dayLabel("2026-10-21", TODAY)).toBe("10월 21일");
  });
});

describe("보호소 운영 시간", () => {
  it("운영 시간 해석", () => expect(shelterHours(shelter)).toEqual({ open: 600, close: 1020 }));
  it("형식이 다르면 null", () => expect(shelterHours({ hours: "상시" })).toBeNull());
  it("휴무 표기", () => {
    expect(closedDaysLabel({ closedDays: [] })).toBe("연중무휴");
    expect(closedDaysLabel({ closedDays: [1] })).toBe("월요일 휴무");
    expect(closedDaysLabel({ closedDays: [2, 1] })).toBe("월·화 휴무");
  });
  it("산책을 마칠 수 있는 시간만 유효", () => {
    expect(slotFitsHours("16:00", shelter)).toBe(true);
    expect(slotFitsHours("16:30", shelter)).toBe(false);
    expect(slotFitsHours("09:00", shelter)).toBe(false);
  });
});

describe("가능한 시간", () => {
  it("보호소 휴무일과 아이가 쉬는 요일에는 없습니다", () => {
    expect(scheduledSlots(dog, shelter, "2026-10-19")).toEqual([]); // 월 — 휴무
    expect(scheduledSlots({ ...dog, walkDays: [3] }, shelter, "2026-10-13")).toEqual([]); // 화 — 산책 요일 아님
    expect(scheduledSlots(dog, shelter, "2026-10-14")).toEqual(dog.availableTimes);
  });

  it("신청이 중단된 아이는 언제나 없습니다", () => {
    expect(scheduledSlots({ ...dog, availability: "unavailable" }, shelter, "2026-10-14")).toEqual([]);
  });

  it("당일은 30분 안에 시작하는 시간까지 마감", () => {
    expect(pastSlots(["10:00", "15:00", "16:00"], TODAY, at(14, 40), TODAY)).toEqual(["10:00", "15:00"]);
    expect(pastSlots(["10:00", "15:00"], "2026-10-14", at(23, 0), TODAY)).toEqual([]);
  });

  it("열린 시간 = 일정 − 이미 신청 − 지난 시간", () => {
    const booked = bookedSlotsByDate(
      [
        makeRequest({ dogId: "d", date: TODAY, time: "16:00" }),
        makeRequest({ id: "c", dogId: "d", date: TODAY, time: "10:00", status: "cancelled" }),
        makeRequest({ id: "o", dogId: "other", date: TODAY, time: "15:00" }),
      ],
      "d"
    );
    // 10시는 지남(취소됐어도), 15시는 다른 아이 신청이라 무관하게 열림, 16시는 이미 신청
    expect(openSlotsOn(dog, shelter, TODAY, { now: at(12, 0), today: TODAY, booked })).toEqual(["15:00"]);
  });

  it("지난 날짜는 언제나 닫혀 있습니다", () => {
    expect(openSlotsOn(dog, shelter, "2026-10-10", { now: at(9), today: TODAY })).toEqual([]);
  });

  it("다음 가능한 일정 — 오늘이 끝났으면 다음 산책 요일", () => {
    expect(nextOpening(dog, shelter, { now: at(9), today: TODAY })).toEqual({ date: TODAY, time: "10:00" });
    expect(nextOpening(dog, shelter, { now: at(18), today: TODAY })).toEqual({
      date: "2026-10-14",
      time: "10:00",
    });
    expect(
      nextOpening({ ...dog, availability: "unavailable" }, shelter, { now: at(9), today: TODAY })
    ).toBeNull();
  });

  it("2주 창에는 휴무일이 표시됩니다", () => {
    const w = availabilityWindow(dog, shelter, { now: at(9), today: TODAY });
    expect(w).toHaveLength(14);
    expect(w.find((d) => d.date === "2026-10-19")).toMatchObject({ closed: true, open: [] });
  });
});
