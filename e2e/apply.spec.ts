import { test, expect, firstOpenChoice, stepTitle } from "./fixtures";

test.describe("산책 신청", () => {
  test("처음부터 접수까지 — 자동 진행, 검증, 뒤로가기, 새로고침 복원, 중복 신청 방지", async ({ page }) => {
    await page.goto("/dogs/dog-happy");
    await page.getByRole("link", { name: /산책 신청하기/ }).first().click();
    await expect(page).toHaveURL(/\/dogs\/dog-happy\/apply/);

    // 날짜·시간은 고르는 순간 다음 단계로
    await firstOpenChoice(page).click();
    await expect(page).toHaveURL(/step=2$/);
    await expect(stepTitle(page)).toContainText("몇 시가 좋을까요");
    await expect(page.getByRole("button", { name: /불가/ })).toHaveCount(0);
    const time = firstOpenChoice(page);
    const picked = await time.innerText();
    await time.click();
    await expect(page).toHaveURL(/step=3$/);

    // 브라우저 뒤로가기 = 이전 단계(선택 유지), 앞으로가기 = 다시 다음 단계
    await page.goBack();
    await expect(stepTitle(page)).toContainText("몇 시가 좋을까요");
    await expect(page.locator('section[aria-labelledby="step-title"] [aria-pressed="true"]')).toHaveText(picked);
    await page.goForward();
    await expect(page.locator("#f-phone")).toBeVisible();

    // 잘못된 연락처 → 진행 막고 그 칸으로 포커스
    await page.locator("#f-phone").fill("0101234");
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByText("010-0000-0000 형식으로 입력해주세요.")).toBeVisible();
    await expect(page.locator("#f-phone")).toBeFocused();
    await page.locator("#f-phone").fill("01098765432");
    await expect(page.locator("#f-phone")).toHaveValue("010-9876-5432");
    await page.getByRole("button", { name: "처음이에요" }).click();

    // 새로고침해도 단계와 입력값이 남아 있음
    await page.reload();
    await expect(page.locator("#f-phone")).toHaveValue("010-9876-5432");
    await expect(page.getByRole("button", { name: "처음이에요" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByRole("button", { name: "다음", exact: true })).toBeDisabled();
    await page.getByRole("button", { name: "모두 확인했어요" }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(stepTitle(page)).toHaveText("이대로 신청할까요?");

    await page.getByRole("button", { name: "산책 신청하기" }).click();
    await expect(page.getByRole("button", { name: /신청하고 있어요/ })).toBeDisabled();
    await expect(page).toHaveURL(/\/complete\//);
    await expect(page.getByRole("heading", { name: "산책 신청이 접수됐어요" })).toBeVisible();

    // 접수 후 뒤로가기 → 빈 신청서가 아니라 '이미 신청했어요'
    await page.goBack();
    await expect(page.getByRole("heading", { name: /이미 신청했어요/ })).toBeVisible();
    await page.getByRole("link", { name: "신청 내역 보기" }).click();
    await expect(page.getByRole("main")).toContainText("보호소가 신청을 확인하고 있어요");
  });

  test("주소로 뒷단계에 바로 들어오면 첫 미완료 단계로 돌아갑니다", async ({ page }) => {
    await page.goto("/dogs/dog-bori/apply?step=5");
    await expect(page).toHaveURL(/step=1$/);
    await expect(stepTitle(page)).toHaveText("언제 함께 걸을까요?");
  });

  test("쉬는 중인 아이는 신청 화면 대신 안내", async ({ page }) => {
    await page.goto("/dogs");
    const restingHref = await page.getByRole("main").locator("article", { hasText: "잠시 쉬는 중" }).first().locator("h3 a").getAttribute("href");
    await page.goto(`${restingHref}/apply`);
    await expect(page.getByRole("heading", { name: /쉬는 중이에요/ })).toBeVisible();
  });
});
