import { describe, expect, it } from "vitest";
import {
  LAST_STEP,
  canSubmit,
  experienceGate,
  formatPhone,
  maxReachableStep,
  parseStepParam,
  preselect,
  restoreDraft,
  validateApplicant,
  type ApplyDraft,
} from "./apply";

const full: ApplyDraft = {
  date: "2026-10-15",
  time: "10:00",
  name: "김지우",
  phone: "010-1234-5678",
  experienced: false,
  memo: "",
  agreed: true,
};

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
  it("휴대폰 형식이 아님", () =>
    expect(validateApplicant({ ...ok, phone: "02-123-4567" }).phone).toBeDefined());
  it("경험 미선택", () => expect(validateApplicant({ ...ok, experienced: null }).experienced).toBeDefined());
});

describe("경험 매칭 — 안전을 위한 신청 제한", () => {
  it("처음인 봉사자는 '경험자 필수' 아이를 신청할 수 없습니다", () => {
    expect(experienceGate("experienced", false)).toBe("block");
    expect(
      validateApplicant({ name: "a", phone: "010-1234-5678", experienced: false }, "experienced").experienced
    ).toMatch(/경험이 있는 분만/);
  });
  it("'경험 조금 필요'는 안내만", () => expect(experienceGate("some", false)).toBe("caution"));
  it("경험이 있으면 모두 가능", () => {
    expect(experienceGate("experienced", true)).toBe("ok");
    expect(experienceGate("beginner", false)).toBe("ok");
  });
  it("경험을 아직 고르지 않았으면 판단하지 않습니다", () =>
    expect(experienceGate("experienced", null)).toBe("ok"));
});

describe("단계 이동 규칙 (일정 → 정보 → 확인)", () => {
  it("앞 단계를 채운 만큼만 진행할 수 있습니다", () => {
    expect(maxReachableStep({ ...full, date: null })).toBe(0);
    expect(maxReachableStep({ ...full, time: null })).toBe(0);
    expect(maxReachableStep({ ...full, phone: "010" })).toBe(1);
    expect(maxReachableStep(full)).toBe(LAST_STEP);
  });

  it("경험 제한에 걸리면 정보 단계에서 멈춥니다", () => {
    expect(maxReachableStep(full, "experienced")).toBe(1);
    expect(maxReachableStep({ ...full, experienced: true }, "experienced")).toBe(LAST_STEP);
  });

  it("제출은 약속 동의까지 해야 가능합니다", () => {
    expect(canSubmit(full)).toBe(true);
    expect(canSubmit({ ...full, agreed: false })).toBe(false);
    expect(canSubmit({ ...full, time: null })).toBe(false);
  });

  it.each([
    [null, 0],
    ["1", 0],
    ["2", 1],
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
    ...full,
    date: null,
    time: null,
    name: "기본",
    phone: "010-0000-0000",
    experienced: null,
    agreed: false,
  };
  const ctx = { selectableDates: ["2026-10-14", "2026-10-15"], openSlots: () => ["10:00", "15:00"] };

  it("유효한 값은 그대로", () => {
    const saved = {
      ...defaults,
      date: "2026-10-15",
      time: "15:00",
      name: "이서연",
      experienced: true,
      agreed: true,
    };
    expect(restoreDraft(saved, ctx, defaults)).toEqual(saved);
  });

  it("이미 지난 날짜·그새 찬 시간은 버립니다", () => {
    expect(restoreDraft({ date: "2026-10-01", time: "10:00" }, ctx, defaults)).toMatchObject({
      date: null,
      time: null,
    });
    expect(restoreDraft({ date: "2026-10-15", time: "17:00" }, ctx, defaults)).toMatchObject({
      date: "2026-10-15",
      time: null,
    });
  });

  it("이전 버전의 약속 배열도 읽습니다", () => {
    expect(restoreDraft({ agreed: [true, true, true, true] }, ctx, defaults).agreed).toBe(true);
    expect(restoreDraft({ agreed: [true, false] }, ctx, defaults).agreed).toBe(false);
  });

  it("형식이 다른 값은 기본값으로", () => {
    const r = restoreDraft({ name: 3, phone: "01099998888", memo: "x".repeat(500) }, ctx, defaults);
    expect(r.name).toBe("기본");
    expect(r.phone).toBe("010-9999-8888");
    expect(r.memo).toHaveLength(100);
  });

  it("객체가 아니면 기본값", () => {
    expect(restoreDraft("garbage", ctx, defaults)).toEqual(defaults);
    expect(restoreDraft(null, ctx, defaults)).toEqual(defaults);
  });
});

describe("상세에서 고른 일정으로 시작", () => {
  const open = (d: string) => (d === "2026-10-15" ? ["10:00", "15:00"] : []);
  const empty = { ...full, date: null, time: null };
  it("유효하면 날짜·시간을 채웁니다", () => {
    expect(preselect(empty, { date: "2026-10-15", time: "15:00" }, open)).toMatchObject({
      date: "2026-10-15",
      time: "15:00",
    });
  });
  it("시간이 이미 찼으면 날짜만", () => {
    expect(preselect(empty, { date: "2026-10-15", time: "11:00" }, open)).toMatchObject({
      date: "2026-10-15",
      time: null,
    });
  });
  it("신청할 수 없는 날이면 무시", () => {
    expect(preselect(empty, { date: "2026-10-16", time: "10:00" }, open)).toEqual(empty);
  });
});
