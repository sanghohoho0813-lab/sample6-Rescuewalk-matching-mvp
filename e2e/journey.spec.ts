import { test, expect, isMobile, seedStore, stepTitle } from "./fixtures";

/**
 * 신규 사용자 전체 여정 — 기록도 신청도 없는 첫 방문자가
 * 홈 → 초보 가능한 아이 → 상세에서 일정 선택 → 신청 → 보호소 승인 → 산책 기록 → 활동 기록까지.
 */
test("신규 사용자: 처음 방문부터 첫 산책 기록까지", async ({ page }) => {
  await seedStore(page, { favorites: [], requests: [], activityLogs: [], interestRegions: [] });

  // 1. 홈 — 처음이라는 상황에 맞는 안내
  await page.goto("/");
  await expect(page.getByText("처음이라면 이렇게 시작해요")).toBeVisible();
  await page.getByRole("link", { name: /초보도 괜찮은 아이 \d+마리 보기/ }).click();

  // 2. 목록 — 초보 가능한 아이만
  await expect(page).toHaveURL(/need=beginner/);
  const cards = page.getByRole("main").locator("article");
  await expect(cards.first()).toBeVisible();
  await expect(page.getByRole("main").locator("article", { hasText: "경험자만" })).toHaveCount(0);
  await cards.locator("h3 a").first().click();

  // 3. 상세 — 누구에게 맞는지 확인하고 가능한 시간을 바로 고름
  await expect(page.getByText("이런 분께 추천해요")).toBeVisible();
  const scope = isMobile(page)
    ? page.getByRole("main")
    : page.getByRole("complementary", { name: "산책 신청" });
  await scope
    .getByRole("link", { name: /^오[전후] \d{1,2}:\d{2}$/ })
    .first()
    .click();

  // 4. 신청 — 일정은 채워진 채 정보부터
  await expect(stepTitle(page)).toHaveText("누가 함께 걷나요?");
  await page.getByRole("button", { name: "처음이에요" }).click();
  await expect(page.getByText("처음이어도 괜찮아요")).toBeVisible();
  await page.getByRole("button", { name: "다음", exact: true }).click();
  await page.getByRole("button", { name: "세 가지를 지킬게요" }).click();
  await page.getByRole("button", { name: "산책 신청하기" }).click();
  await expect(page.getByRole("heading", { name: "산책 신청이 접수됐어요" })).toBeVisible();

  // 5. 신청 상세 — 승인 대기 → (데모) 승인 → 방문 예정
  await page.getByRole("link", { name: "내 신청 확인하기" }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText("승인");
  await page.getByRole("button", { name: "보호소 승인 처리하기" }).click();
  await expect(page.locator('[aria-current="step"]')).toContainText("방문 예정");

  // 6. 산책 기록
  await page.locator("button:visible", { hasText: "산책 완료 기록하기" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "40분" }).click();
  await dialog.getByRole("button", { name: "리드줄을 잘 따라 걸었어요" }).click();
  await dialog.getByRole("button", { name: "기록 완료" }).click();

  // 7. 활동 기록 — 첫 산책
  await expect(page).toHaveURL(/\/activity\?new=/);
  await expect(page.getByRole("main")).toContainText("새 이정표 · 첫 산책");
  await expect(page.getByRole("main")).toContainText("40분");
  await expect(page.getByRole("main")).toContainText("리드줄을 잘 따라 걸었어요");

  // 8. 홈으로 돌아오면 '다시 만나볼까요?'
  await page.goto("/");
  await expect(page.getByText("다시 만나볼까요?")).toBeVisible();
});
