import { describe, expect, it } from "vitest";
import {
  CAUTIONS,
  LAST_STEP,
  bookedSlotsByDate,
  formatPhone,
  maxReachableStep,
  openSlotsOn,
  parseStepParam,
  pastSlotsFor,
  restoreDraft,
  validateApplicant,
  type ApplyDraft,
} from "./apply";
import { makeRequest } from "@/lib/test/factories";

const TODAY = "2026-10-06";
const at = (hh: number, mm = 0) => new Date(2026, 9, 6, hh, mm);

describe("당일 신청 가능 시간", () => {
  it("지금으로부터 30분 안에 시작하는 시간까지는 지난 것으로 봅니다", () => {
    expect(pastSlotsFor(TODAY, at(13, 40), TODAY)).toEqual(["09:00", "10:00", "11:00", "14:00"]);
    expect(pastSlotsFor(TODAY, at(13, 29), TODAY)).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("다른 날은 지난 시간이 없습니다", () => {
    expect(pastSlotsFor("2026-10-07", at(23, 0), TODAY)).toEqual([]);
  });

  it("열린 시간 = 아이 가능 시간 − 이미 신청 − 지난 시간", () => {
    const booked = bookedSlotsByDate(
      [
        makeRequest({ date: TODAY, time: "15:00" }),
        makeRequest({ id: "c", date: TODAY, time: "16:00", status: "cancelled" }),
        makeRequest({ id: "o", date: TODAY, time: "17:00", dogId: "dog-other" }),
      ],
      "dog-bori"
    );
    const dog = { availableTimes: ["10:00", "15:00", "16:00", "17:00"] };
    // 10시는 지남, 15시는 신청함, 16시는 취소된 신청이라 다시 열림, 17시는 다른 아이 신청이라 무관
    expect(openSlotsOn(dog, TODAY, booked, at(12, 0), TODAY)).toEqual(["16:00", "17:00"]);
  });
});

describe("연락처 자동 하이픈", () => {
  it.each([
    ["010", "010"],
    ["0101", "010-1"],
    ["01012345", "010-1234-5"],
    ["0101234567", "010-123-4567"],
    ["01012345678", "010-1234-5678"],
    ["010-1234-56789", "010-1234-5678"],
    ["(010) 1234 5678", "010-1234-5678"],
  ])("%s → %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });
});

describe("신청자 정보 검증", () => {
  const ok = { name: "김지우", phone: "010-1234-5678", experienced: true };
  it("정상", () => expect(validateApplicant(ok)).toEqual({}));
  it("공백 이름", () => expect(validateApplicant({ ...ok, name: "   " }).name).toBeDefined());
  it("휴대폰 형식이 아님", () => expect(validateApplicant({ ...ok, phone: "02-123-4567" }).phone).toBeDefined());
  it("경험 미선택", () => expect(validateApplicant({ ...ok, experienced: null }).experienced).toBeDefined());
});

describe("단계 이동 규칙", () => {
  const full: ApplyDraft = {
    date: "2026-10-08",
    time: "10:00",
    name: "김지우",
    phone: "010-1234-5678",
    experienced: false,
    memo: "",
    agreed: CAUTIONS.map(() => true),
  };

  it("앞 단계를 채운 만큼만 진행할 수 있습니다", () => {
    expect(maxReachableStep({ ...full, date: null })).toBe(0);
    expect(maxReachableStep({ ...full, time: null })).toBe(1);
    expect(maxReachableStep({ ...full, phone: "010" })).toBe(2);
    expect(maxReachableStep({ ...full, agreed: [true, false, true, true] })).toBe(3);
    expect(maxReachableStep(full)).toBe(LAST_STEP);
  });

  it.each([
    [null, 0],
    ["1", 0],
    ["3", 2],
    ["99", LAST_STEP],
    ["0", 0],
    ["-2", 0],
    ["2.5", 0],
    ["abc", 0],
  ])("?step=%s → %i", (v, expected) => {
    expect(parseStepParam(v)).toBe(expected);
  });
});

describe("임시 저장 복원", () => {
  const defaults: ApplyDraft = {
    date: null,
    time: null,
    name: "기본",
    phone: "010-0000-0000",
    experienced: null,
    memo: "",
    agreed: CAUTIONS.map(() => false),
  };
  const ctx = { selectableDates: ["2026-10-07", "2026-10-08"], openSlots: () => ["10:00", "15:00"] };

  it("유효한 값은 그대로", () => {
    const saved = { ...defaults, date: "2026-10-08", time: "15:00", name: "이서연", experienced: true };
    expect(restoreDraft(saved, ctx, defaults)).toEqual(saved);
  });

  it("이미 지난 날짜·그새 찬 시간은 버립니다", () => {
    expect(restoreDraft({ date: "2026-10-01", time: "10:00" }, ctx, defaults)).toMatchObject({ date: null, time: null });
    expect(restoreDraft({ date: "2026-10-08", time: "17:00" }, ctx, defaults)).toMatchObject({
      date: "2026-10-08",
      time: null,
    });
  });

  it("형식이 다른 값은 기본값으로", () => {
    const r = restoreDraft({ name: 3, phone: "01099998888", agreed: [true], memo: "x".repeat(500) }, ctx, defaults);
    expect(r.name).toBe("기본");
    expect(r.phone).toBe("010-9999-8888");
    expect(r.agreed).toEqual(defaults.agreed);
    expect(r.memo).toHaveLength(100);
  });

  it("객체가 아니면 기본값", () => {
    expect(restoreDraft("garbage", ctx, defaults)).toEqual(defaults);
    expect(restoreDraft(null, ctx, defaults)).toEqual(defaults);
  });
});
