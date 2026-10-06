import { test, expect, seedStore } from "./fixtures";

test.describe("빈 상태 · 오류 상태", () => {
  test("신청이 하나도 없으면 필터 대신 시작 안내", async ({ page }) => {
    await seedStore(page, { favorites: [], requests: [], activityLogs: [], interestRegions: [] });
    await page.goto("/requests");
    await expect(page.getByText("아직 신청한 산책이 없어요")).toBeVisible();
    await expect(page.getByRole("button", { name: /^전체/ })).toHaveCount(0);
  });

  test("깨진 저장값이 있어도 화면이 깨지지 않습니다", async ({ page }) => {
    await seedStore(page, {
      favorites: ["nope", 3],
      requests: [{ id: "bad" }, null, "x"],
      activityLogs: [{}],
      interestRegions: "서울",
    });
    for (const path of ["/", "/requests", "/requests/bad", "/activity", "/me", "/dogs/dog-bori/apply"]) {
      await page.goto(path);
      await expect(page.locator("main")).not.toBeEmpty();
      await expect(page.getByText("Application error")).toHaveCount(0);
    }
  });

  test("없는 페이지·없는 신청", async ({ page }) => {
    await page.goto("/dogs/nope");
    await expect(page.getByRole("heading", { name: "앗, 길을 잃었어요" })).toBeVisible();
    await page.goto("/requests/nope");
    await expect(page.getByText("신청 내역을 찾지 못했어요")).toBeVisible();
  });
});
