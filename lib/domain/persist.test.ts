import { describe, expect, it } from "vitest";
import { sanitizePersisted, type PersistedState } from "./persist";
import { makeRequest } from "@/lib/test/factories";

const dogExists = (id: string) => id.startsWith("dog-");
const fallback: PersistedState = {
  favorites: ["dog-seed"],
  requests: [],
  activityLogs: [],
  interestRegions: ["서울"],
};

describe("저장값 검증", () => {
  it("객체가 아니면 기본값", () => {
    expect(sanitizePersisted(null, fallback, dogExists)).toBe(fallback);
    expect(sanitizePersisted("x", fallback, dogExists)).toBe(fallback);
  });

  it("정상 데이터는 그대로 살립니다", () => {
    const valid = makeRequest();
    const out = sanitizePersisted(
      {
        favorites: ["dog-a"],
        requests: [valid],
        activityLogs: [{ id: "l", dogId: "dog-a", date: "2026-10-01", durationMin: 30, note: "hi" }],
        interestRegions: ["부산"],
      },
      fallback,
      dogExists
    );
    expect(out.requests).toEqual([valid]);
    expect(out.activityLogs[0]).toMatchObject({ id: "l", note: "hi" });
    expect(out.interestRegions).toEqual(["부산"]);
  });

  it("깨진 항목만 걸러내고 나머지는 지킵니다", () => {
    const good = makeRequest({ id: "good" });
    const out = sanitizePersisted(
      {
        favorites: ["dog-a", "dog-a", "unknown", 3, null],
        requests: [good, null, { id: "bad" }, makeRequest({ id: "x", dogId: "cat-1" }), makeRequest({ id: "t", time: "9시" })],
        activityLogs: [{}, { id: "l", dogId: "dog-a", date: "2026-10-01", durationMin: -5 }],
      },
      fallback,
      dogExists
    );
    expect(out.favorites).toEqual(["dog-a"]);
    expect(out.requests.map((r) => r.id)).toEqual(["good"]);
    expect(out.activityLogs).toEqual([]);
    // 아예 없는 필드는 기본값
    expect(out.interestRegions).toEqual(["서울"]);
  });

  it("빠진 선택 필드는 채워 넣습니다", () => {
    const { applicant, ...rest } = makeRequest();
    const out = sanitizePersisted(
      { requests: [{ ...rest, applicant: { name: applicant.name, phone: applicant.phone } }] },
      fallback,
      dogExists
    );
    expect(out.requests[0].applicant).toEqual({ ...applicant, experienced: false, memo: "" });
  });
});
