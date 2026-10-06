import { describe, expect, it } from "vitest";
import { cancel, complete, confirm, groupRequests, isOverdue, nextWalk } from "./requests";
import { makeRequest } from "@/lib/test/factories";

const NOW = new Date("2026-10-06T05:00:00.000Z");
const ctx = { now: NOW, today: "2026-10-06", logId: "act-1" };

describe("상태 전이", () => {
  it("신청완료 → 방문예정", () => {
    const r = confirm(makeRequest(), NOW);
    expect(r.status).toBe("confirmed");
    expect(r.confirmedAt).toBe(NOW.toISOString());
  });

  it("허용되지 않는 전이는 같은 객체를 돌려줍니다(중복 클릭 안전)", () => {
    const done = makeRequest({ status: "completed" });
    expect(confirm(done, NOW)).toBe(done);
    expect(cancel(done, NOW)).toBe(done);
    const cancelled = makeRequest({ status: "cancelled" });
    expect(cancel(cancelled, NOW)).toBe(cancelled);
  });

  it("신청완료·방문예정만 취소할 수 있습니다", () => {
    expect(cancel(makeRequest({ status: "pending" }), NOW).status).toBe("cancelled");
    expect(cancel(makeRequest({ status: "confirmed" }), NOW).status).toBe("cancelled");
  });

  it("산책 완료 기록은 방문예정에서만", () => {
    expect(complete(makeRequest({ status: "pending" }), { durationMin: 40, note: "" }, ctx)).toBeNull();
    const result = complete(makeRequest({ status: "confirmed" }), { durationMin: 40, note: "  좋았어요 " }, ctx);
    expect(result?.request.status).toBe("completed");
    expect(result?.log).toMatchObject({ id: "act-1", requestId: "req-1", durationMin: 40, note: "좋았어요" });
  });

  it("방문일 전에 기록하면 기록 날짜는 오늘(미래 날짜 기록 방지)", () => {
    const future = complete(makeRequest({ status: "confirmed", date: "2026-10-09" }), { durationMin: 30, note: "" }, ctx);
    expect(future?.log.date).toBe("2026-10-06");
    const past = complete(makeRequest({ status: "confirmed", date: "2026-10-01" }), { durationMin: 30, note: "" }, ctx);
    expect(past?.log.date).toBe("2026-10-01");
  });

  it("0분·음수 시간은 기록하지 않습니다", () => {
    expect(complete(makeRequest({ status: "confirmed" }), { durationMin: 0, note: "" }, ctx)).toBeNull();
  });
});

describe("목록 규칙", () => {
  const list = [
    makeRequest({ id: "a", date: "2026-10-09", status: "pending" }),
    makeRequest({ id: "b", date: "2026-10-07", time: "15:00", status: "confirmed" }),
    makeRequest({ id: "c", date: "2026-10-07", time: "09:00", status: "pending" }),
    makeRequest({ id: "d", date: "2026-09-30", status: "completed" }),
    makeRequest({ id: "e", date: "2026-10-02", status: "cancelled" }),
    makeRequest({ id: "f", date: "2026-10-03", status: "confirmed" }),
  ];

  it("진행 중은 가까운 순, 끝난 신청은 최근 순", () => {
    const { open, closed } = groupRequests(list);
    expect(open.map((r) => r.id)).toEqual(["f", "c", "b", "a"]);
    expect(closed.map((r) => r.id)).toEqual(["e", "d"]);
  });

  it("다음 산책은 오늘 이후 가장 가까운 열린 신청", () => {
    expect(nextWalk(list, "2026-10-06")?.id).toBe("c");
    expect(nextWalk([], "2026-10-06")).toBeUndefined();
  });

  it("방문일이 지났는데 열린 신청", () => {
    expect(isOverdue(list[5], "2026-10-06")).toBe(true);
    expect(isOverdue(list[3], "2026-10-06")).toBe(false);
  });
});
