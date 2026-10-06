import { test, expect, isMobile } from "./fixtures";

test.describe("둘러보기", () => {
  test("홈의 '오늘 가능한 N마리 모두 보기'는 같은 N마리 목록으로 이어집니다", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /오늘 가능한 \d+마리 모두 보기/ });
    const n = Number((await link.innerText()).match(/(\d+)마리/)![1]);
    await link.click();
    await expect(page).toHaveURL(/\/dogs\?today=1$/);
    await expect(page.getByRole("main").locator("article")).toHaveCount(n);
  });

  test("다가오는 산책이 있으면 홈에서 바로 그 신청으로 갈 수 있습니다", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /D-2 · 송이와의 산책/ }).click();
    await expect(page).toHaveURL(/\/requests\/req-seed-1$/);
    await expect(page.getByRole("heading", { level: 1, name: "송이" })).toBeVisible();
  });

  test("필터는 주소에 남아 상세에 다녀와도 유지됩니다", async ({ page }) => {
    await page.goto("/dogs");
    if (isMobile(page)) {
      await page.getByRole("button", { name: /^필터/ }).click();
      const sheet = page.getByRole("dialog", { name: "필터" });
      await sheet.getByRole("button", { name: "서울", exact: true }).click();
      await sheet.getByRole("button", { name: /마리 보기/ }).click();
    } else {
      await page.getByRole("complementary", { name: "필터" }).getByRole("button", { name: "서울", exact: true }).click();
    }
    await expect(page).toHaveURL(/region=/);
    const filteredUrl = page.url();
    const count = await page.getByRole("main").locator("article").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(18);

    await page.getByRole("main").locator("article h3 a").first().click();
    await expect(page).toHaveURL(/\/dogs\/dog-/);
    await page.getByRole("main").getByRole("link", { name: "강아지 찾기" }).click();
    await expect(page).toHaveURL(filteredUrl);
    await expect(page.getByRole("main").locator("article")).toHaveCount(count);

    // 적용 조건 칩으로 해제
    await page.getByRole("button", { name: "서울 조건 해제" }).click();
    await expect(page).toHaveURL(/\/dogs$/);
    await expect(page.getByRole("main").locator("article")).toHaveCount(18);
  });

  test("결과가 없으면 한 번에 조건을 풀 수 있습니다", async ({ page }) => {
    await page.goto("/dogs?region=%EB%B6%80%EC%82%B0&size=%EB%8C%80%ED%98%95&level=%EC%89%AC%EC%9B%80");
    await expect(page.getByRole("main").locator("article")).toHaveCount(0);
    await page.getByRole("button", { name: "필터 모두 해제" }).click();
    await expect(page.getByRole("main").locator("article")).toHaveCount(18);
  });

  test("어떤 정렬에서도 쉬는 중인 아이는 맨 뒤", async ({ page }) => {
    await page.goto("/dogs?sort=distance");
    await expect(page.getByRole("main").locator("article").last()).toContainText("잠시 쉬는 중");
  });

  test("받침에 맞는 조사", async ({ page }) => {
    await page.goto("/dogs/dog-janggun");
    await expect(page.getByRole("main")).toContainText("장군과");
    await expect(page.getByRole("main")).not.toContainText("장군와");
  });
});
