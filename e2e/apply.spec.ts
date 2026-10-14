import { test, expect, firstOpenDate, isMobile, pickSchedule, stepTitle } from "./fixtures";

test.describe("산책 신청 (일정 → 참여자 정보 → 확인)", () => {
  test("처음부터 접수까지 — 검증, 뒤로가기, 새로고침 복원, 약속 확인, 중복 신청 방지", async ({ page }) => {
    await page.goto("/dogs/dog-happy/apply");
    await expect(stepTitle(page)).toHaveText("언제 함께 걸을까요?");

    // 날짜와 시간은 한 화면 — 시간을 고르면 바로 정보 단계로
    const picked = await pickSchedule(page);
    await expect(stepTitle(page)).toHaveText("누가 함께 걷나요?");

    // 브라우저 뒤로가기 = 이전 단계(선택 유지), 앞으로가기 = 다시 다음 단계
    await page.goBack();
    await expect(stepTitle(page)).toHaveText("언제 함께 걸을까요?");
    await expect(
      page.locator('section[aria-labelledby="step-title"] button[aria-pressed="true"]', { hasText: picked })
    ).toHaveCount(1);
    await page.goForward();
    await expect(page.locator("#f-phone")).toBeVisible();

    // 왜 필요한지 안내 + 잘못된 연락처 → 진행 막고 그 칸으로 포커스
    await expect(page.getByText("승인 문자와 방문 전날 안내를 이 번호로 보내요.")).toBeVisible();
    await page.locator("#f-phone").fill("0101234");
    await page.getByRole("button", { name: "처음이에요" }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page.getByText("010-0000-0000 형식으로 입력해주세요.")).toBeVisible();
    await expect(page.locator("#f-phone")).toBeFocused();
    await page.locator("#f-phone").fill("01098765432");
    await expect(page.locator("#f-phone")).toHaveValue("010-9876-5432");

    // 새로고침해도 단계와 입력값이 남아 있음
    await page.reload();
    await expect(page.locator("#f-phone")).toHaveValue("010-9876-5432");
    await expect(page.getByRole("button", { name: "처음이에요" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(stepTitle(page)).toHaveText("이대로 신청할까요?");
    await expect(page.getByText("리드줄은 짧게, 두 손으로")).toBeVisible();

    // 약속을 확인하기 전에는 신청할 수 없습니다
    const submit = page.getByRole("button", { name: "산책 신청하기" });
    await expect(submit).toBeDisabled();
    await page.getByRole("button", { name: "세 가지를 지킬게요" }).click();
    await submit.click();
    await expect(page.getByRole("button", { name: /신청하고 있어요/ })).toBeDisabled();
    await expect(page).toHaveURL(/\/complete\//);
    await expect(page.getByRole("heading", { name: "산책 신청이 접수됐어요" })).toBeVisible();
    // 접수 직후: 접수 완료, 승인 대기
    await expect(page.locator('[aria-current="step"]')).toContainText("승인");

    // 접수 후 뒤로가기 → 빈 신청서가 아니라 '이미 신청했어요'
    await page.goBack();
    await expect(page.getByRole("heading", { name: /이미 신청했어요/ })).toBeVisible();
    await page.getByRole("link", { name: "신청 내역 보기" }).click();
    await expect(page.getByRole("main")).toContainText("보호소가 신청을 확인하고 있어요");
  });

  test("상세에서 시간을 고르면 그 일정이 채워진 채 정보 단계부터 시작합니다", async ({ page }) => {
    await page.goto("/dogs/dog-bori");
    const scope = isMobile(page)
      ? page.getByRole("main")
      : page.getByRole("complementary", { name: "산책 신청" });
    const time = scope.getByRole("link", { name: /^오[전후] \d{1,2}:\d{2}$/ }).first();
    const label = await time.innerText();
    await time.click();
    await expect(page).toHaveURL(/apply\?step=2$/);
    await expect(stepTitle(page)).toHaveText("누가 함께 걷나요?");
    if (!isMobile(page)) {
      await expect(page.getByRole("complementary", { name: "신청 요약" })).toContainText(label);
    }
  });

  test("처음인 봉사자는 '경험자만' 아이를 신청할 수 없습니다", async ({ page }) => {
    await page.goto("/dogs/dog-janggun/apply");
    await pickSchedule(page);
    await page.getByRole("button", { name: "처음이에요" }).click();
    await expect(page.locator("#e-exp")).toContainText("경험이 있는 분만 산책할 수 있어요");
    await expect(page.getByRole("link", { name: "초보 가능한 아이 보기" })).toBeVisible();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page).toHaveURL(/step=2$/);

    await page.getByRole("button", { name: "네, 있어요" }).click();
    await page.getByRole("button", { name: "다음", exact: true }).click();
    await expect(page).toHaveURL(/step=3$/);
  });

  test("휴무일은 고를 수 없습니다", async ({ page }) => {
    // 한밭 보금자리는 월·화 휴무
    await page.goto("/dogs/dog-songi/apply");
    await expect(firstOpenDate(page)).toBeVisible();
    const closed = page.locator('section[aria-labelledby="step-title"] button[aria-label$="(휴무)"]');
    expect(await closed.count()).toBeGreaterThanOrEqual(2);
    await expect(closed.first()).toBeDisabled();
  });

  test("주소로 뒷단계에 바로 들어오면 첫 미완료 단계로 돌아갑니다", async ({ page }) => {
    await page.goto("/dogs/dog-bori/apply?step=3");
    await expect(page).toHaveURL(/step=1$/);
    await expect(stepTitle(page)).toHaveText("언제 함께 걸을까요?");
  });

  test("쉬는 중인 아이는 신청 화면 대신 안내", async ({ page }) => {
    await page.goto("/dogs/dog-mangchi/apply");
    await expect(page.getByRole("heading", { name: /쉬는 중이에요/ })).toBeVisible();
  });
});
