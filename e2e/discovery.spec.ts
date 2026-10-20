import { test, expect, gotoReady, isMobile } from "./fixtures";

test.describe("둘러보기", () => {
  test("홈의 '가능한 N마리 모두 보기'는 같은 N마리 목록으로 이어집니다", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /(오늘|이번 주) 가능한 \d+마리 모두 보기/ });
    const n = Number((await link.innerText()).match(/(\d+)마리/)![1]);
    await link.click();
    await expect(page).toHaveURL(/\/dogs\?when=(today|week)/);
    await expect(page.getByRole("main").locator("article")).toHaveCount(n);
  });

  test("다가오는 산책이 있으면 홈 첫 화면에서 바로 방문 안내로 갑니다", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/D-\d+ · 송이와의 산책/)).toBeVisible();
    await page.getByRole("link", { name: "방문 안내 보기" }).click();
    await expect(page).toHaveURL(/\/requests\/req-seed-1$/);
    await expect(page.getByRole("heading", { level: 1, name: "송이" })).toBeVisible();
  });

  test("카드에서 매칭 판단 정보(난이도·사람·경험·다음 일정·위치)를 바로 봅니다", async ({ page }) => {
    await page.goto("/dogs");
    const card = page.getByRole("main").locator("article", { hasText: "장군" });
    await expect(card).toContainText("힘이 아주 센 수다쟁이 허스키");
    await expect(card).toContainText("경험자만");
    await expect(card).toContainText("다음 가능");
    await expect(card).toContainText("함께하는 쉼터");
  });

  test("'초보 가능' 조건을 걸면 경험자만 신청할 수 있는 아이는 빠집니다", async ({ page }) => {
    await page.goto("/dogs?need=beginner");
    await expect(page.getByRole("main").locator("article").first()).toBeVisible();
    await expect(page.getByRole("main").locator("article", { hasText: "경험자만" })).toHaveCount(0);
  });

  test("필터는 주소에 남아 상세에 다녀와도 유지됩니다", async ({ page }) => {
    await page.goto("/dogs");
    if (isMobile(page)) {
      await page.getByRole("button", { name: /^필터/ }).click();
      const sheet = page.getByRole("dialog", { name: "필터" });
      await sheet.getByRole("button", { name: "서울", exact: true }).click();
      await sheet.getByRole("button", { name: /마리 보기/ }).click();
    } else {
      await page
        .getByRole("complementary", { name: "필터" })
        .getByRole("button", { name: "서울", exact: true })
        .click();
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

    await page.getByRole("button", { name: "서울 조건 해제" }).click();
    await expect(page).toHaveURL(/\/dogs$/);
    await expect(page.getByRole("main").locator("article")).toHaveCount(18);
  });

  test("이름·품종으로 찾고, 칩으로 검색을 풉니다", async ({ page }) => {
    await gotoReady(page, "/dogs");
    const search = page.getByRole("searchbox", { name: "이름·품종·보호소로 찾기" });
    await search.fill("허스키");
    await expect(page).toHaveURL(/q=/);
    const cards = page.getByRole("main").locator("article");
    await expect(cards).toHaveCount(1);
    await expect(cards).toContainText("장군");
    // 검색어가 주소에 있으므로 새로고침해도 유지
    await page.reload();
    await expect(search).toHaveValue("허스키");
    await page.getByRole("button", { name: /허스키.*검색 조건 해제/ }).click();
    await expect(page).toHaveURL(/\/dogs$/);
    await expect(search).toHaveValue("");
    await expect(cards).toHaveCount(18);
  });

  test("결과가 없으면 한 번에 조건을 풀 수 있습니다", async ({ page }) => {
    await page.goto("/dogs?region=%EB%B6%80%EC%82%B0&size=%EB%8C%80%ED%98%95&level=%EC%89%AC%EC%9B%80");
    await expect(page.getByText("조건에 맞는 아이를 찾지 못했어요")).toBeVisible();
    await page.getByRole("button", { name: "필터 모두 해제" }).click();
    await expect(page.getByRole("main").locator("article")).toHaveCount(18);
  });

  test("어떤 정렬에서도 쉬는 중인 아이는 맨 뒤", async ({ page }) => {
    await page.goto("/dogs?sort=soon");
    await expect(page.getByRole("main").locator("article").last()).toContainText("망치");
  });

  test("상세는 '누구에게 맞는지'부터 — 경험자 필수 아이는 그 사실을 먼저 알립니다", async ({ page }) => {
    await page.goto("/dogs/dog-janggun");
    await expect(page.getByText("이런 분께 추천해요")).toBeVisible();
    await expect(page.getByText("대형견 산책 경험이 꼭 있는 분")).toBeVisible();
    await expect(page.getByText(/경험이 있는 분만 신청할 수 있어요/).first()).toBeVisible();
    await expect(page.getByRole("main")).toContainText("장군과");
    await expect(page.getByRole("main")).not.toContainText("장군와");
  });

  test("모바일 상세: 사진을 지나면 이름·목차가 위에 붙고, 목차로 섹션을 오갑니다", async ({ page }) => {
    test.skip(!isMobile(page), "모바일 전용 — PC 는 공용 헤더와 옆 패널");
    await gotoReady(page, "/dogs/dog-janggun");
    const toc = page.getByRole("navigation", { name: "장군 소개 목차" });
    await expect(toc).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(toc).toBeVisible();
    await toc.getByRole("link", { name: "보호소" }).click();
    await expect(page.getByRole("heading", { name: "보호소 안내" })).toBeInViewport();
    await expect(toc.getByRole("link", { name: "보호소" })).toHaveAttribute("aria-current", "location");
    // 목차 이동은 기록을 남기지 않습니다(뒤로가기 = 이전 화면)
    expect(page.url()).not.toContain("#");
  });

  test("보호소 화면에서 운영 정보와 이번 주 일정을 봅니다", async ({ page }) => {
    await page.goto("/shelters/sh-hanbat");
    await expect(page.getByRole("heading", { level: 1, name: "한밭 보금자리" })).toBeVisible();
    await expect(page.getByRole("main")).toContainText("월·화 휴무");
    await expect(page.getByRole("list", { name: "이번 주 산책 일정" }).getByRole("listitem")).toHaveCount(7);
    await expect(page.getByText("보호소 2층 봉사자 라운지").first()).toBeVisible();
  });
});
