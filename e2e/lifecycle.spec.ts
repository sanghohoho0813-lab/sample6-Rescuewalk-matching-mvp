import { test, expect } from "./fixtures";

test.describe("신청 이후", () => {
  test("승인 → 산책 기록 → 활동 기록·배지 반영", async ({ page }) => {
    await page.goto("/requests/req-seed-2");
    await expect(page.getByRole("main")).toContainText("신청완료");
    await page.getByRole("button", { name: "보호소 승인 처리하기" }).click();
    await expect(page.getByRole("main")).toContainText("방문예정");

    await page.goto("/requests/req-seed-1");
    await page.locator("button:visible", { hasText: "산책 완료 기록하기" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "60분" }).click();
    await dialog.getByRole("textbox").fill("송이와 개천 산책");
    await dialog.getByRole("button", { name: "기록 완료" }).click();

    await expect(page).toHaveURL(/\/activity\?new=/);
    await expect(page.getByRole("main")).toContainText("송이와의 산책이 기록됐어요");
    await expect(page.getByRole("main")).toContainText("새 배지 · 5마리 친구");
    await page.reload();
    await expect(page.getByRole("main")).toContainText("송이와 개천 산책");
  });

  test("취소는 확인 후에만, 키보드 Esc 로 닫을 수 있습니다", async ({ page }) => {
    await page.goto("/requests/req-seed-2");
    await page.getByRole("button", { name: "신청 취소하기" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(page.getByRole("main")).toContainText("신청완료");

    await page.getByRole("button", { name: "신청 취소하기" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "신청 취소" }).click();
    await expect(page.getByRole("main")).toContainText("취소된 신청이에요");
    await expect(page.getByRole("link", { name: /다시 신청하기/ })).toBeVisible();
  });

  test("데모 데이터 초기화", async ({ page }) => {
    await page.goto("/requests/req-seed-2");
    await page.getByRole("button", { name: "신청 취소하기" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "신청 취소" }).click();
    await page.goto("/me");
    await page.getByRole("button", { name: "처음 상태로 되돌리기" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "되돌리기" }).click();
    await page.goto("/requests/req-seed-2");
    await expect(page.getByRole("main")).toContainText("신청완료");
  });
});
