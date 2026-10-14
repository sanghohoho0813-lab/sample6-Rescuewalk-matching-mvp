import { test, expect } from "./fixtures";

test.describe("신청 이후 (접수 → 승인 → 방문 예정 → 산책 → 완료)", () => {
  test("승인 → 산책 기록(관찰 포함) → 활동 기록·이정표 반영", async ({ page }) => {
    await page.goto("/requests/req-seed-2");
    await expect(page.locator('[aria-current="step"]')).toContainText("승인");
    await expect(page.getByText("만나는 곳").first()).toBeVisible();
    await page.getByRole("button", { name: "보호소 승인 처리하기" }).click();
    await expect(page.locator('[aria-current="step"]')).toContainText("방문 예정");

    await page.goto("/requests/req-seed-1");
    await expect(page.getByText("챙겨 오세요")).toBeVisible();
    await expect(page.getByText("연락은 이렇게 와요")).toBeVisible();
    await page.locator("button:visible", { hasText: "산책 완료 기록하기" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "60분" }).click();
    await dialog.getByRole("button", { name: "배변했어요" }).click();
    await dialog.getByRole("textbox").fill("송이와 개천 산책");
    await dialog.getByRole("button", { name: "기록 완료" }).click();

    await expect(page).toHaveURL(/\/activity\?new=/);
    await expect(page.getByRole("main")).toContainText("송이와의 산책이 기록됐어요");
    await expect(page.getByRole("main")).toContainText("새 이정표 · 5마리 친구");
    await expect(page.getByRole("main")).toContainText("보호소의 아이 기록에 반영돼요");
    await page.reload();
    await expect(page.getByRole("main")).toContainText("송이와 개천 산책");

    // 완료된 신청은 모든 단계가 끝나 있고, 다시 산책할 수 있습니다
    await page.goto("/requests/req-seed-1");
    await expect(page.locator('[aria-current="step"]')).toHaveCount(0);
    await expect(page.getByRole("main")).toContainText("송이와 60분 함께 걸었어요");
    await expect(page.getByRole("main")).toContainText("배변했어요");
  });

  test("같은 아이를 다시 만나면 '다시 만난 친구'가 됩니다", async ({ page }) => {
    // 보리는 한 달 전에 한 번 만난 아이
    await page.goto("/requests/req-seed-2");
    await page.getByRole("button", { name: "보호소 승인 처리하기" }).click();
    await page.locator("button:visible", { hasText: "산책 완료 기록하기" }).first().click();
    await page.getByRole("dialog").getByRole("button", { name: "기록 완료" }).click();
    await expect(page).toHaveURL(/\/activity\?new=/);
    await expect(page.getByRole("main")).toContainText("보리와 2번째 산책이에요");
    await expect(page.getByRole("main")).toContainText("새 이정표 · 다시 만난 친구");
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
    await expect(page.getByRole("main")).toContainText("신청을 취소했어요");
    await expect(page.getByRole("link", { name: /다시 산책하기/ }).first()).toBeAttached();
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
