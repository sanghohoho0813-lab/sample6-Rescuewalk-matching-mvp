import fs from "node:fs";
import { test, expect, gotoReady, isMobile, pickSchedule, stepTitle } from "./fixtures";

/** 이번 단계에서 다듬은 상호작용 — 실수 되돌리기, 시트 끌어 닫기, 바로가기, 체크리스트, 목차 */
test.describe("상호작용", () => {
  test("신청 상세: 캘린더 파일을 받고, 준비물 체크는 다시 열어도 남아 있습니다", async ({ page }) => {
    await gotoReady(page, "/requests/req-seed-1");
    const shortcuts = page.getByRole("navigation", { name: "방문 바로가기" });
    await expect(shortcuts.getByRole("link", { name: "길찾기" })).toHaveAttribute("href", /map\.kakao\.com/);
    await expect(shortcuts.getByRole("link", { name: "보호소 전화" })).toHaveAttribute("href", /^tel:/);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      shortcuts.getByRole("button", { name: "캘린더에 추가" }).click(),
    ]);
    expect(download.suggestedFilename()).toMatch(/^rescuewalk-RW-.+\.ics$/);
    const ics = fs.readFileSync((await download.path())!, "utf8");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:송이와 산책");
    expect(ics).toContain("TRIGGER:-P1D");

    await page.getByText("걷기 편한 운동화").click();
    await expect(page.getByRole("checkbox", { name: "걷기 편한 운동화" })).toBeChecked();
    await expect(page.getByText(/1\/\d 준비했어요/)).toBeVisible();
    await page.reload();
    await expect(page.getByRole("checkbox", { name: "걷기 편한 운동화" })).toBeChecked();
  });

  test("찜을 빼도 토스트의 '되돌리기'로 바로 되살립니다", async ({ page }) => {
    await gotoReady(page, "/me");
    const favorites = page.getByRole("list", { name: "찜한 아이들" });
    await expect(favorites.getByRole("link", { name: "보리" })).toBeVisible();
    await favorites.getByRole("button", { name: "보리 찜 해제" }).click();
    await expect(favorites.getByRole("link", { name: "보리" })).toHaveCount(0);
    await page.getByRole("button", { name: "되돌리기", exact: true }).click();
    await expect(favorites.getByRole("link", { name: "보리" })).toBeVisible();
  });

  test("모바일 바텀시트는 머리를 끌어내려 닫습니다", async ({ page }) => {
    test.skip(!isMobile(page), "모바일 바텀시트 전용");
    await gotoReady(page, "/dogs");
    await page.getByRole("button", { name: /^필터/ }).click();
    const sheet = page.getByRole("dialog", { name: "필터" });
    await expect(sheet).toBeVisible();
    // 시트가 올라오는 동안 위치를 재면 어긋나므로, 멈춘 뒤(hover 가 기다림) 제목에서 끌기 시작
    const title = sheet.getByRole("heading", { name: "필터" });
    await title.hover();
    const box = (await title.boundingBox())!;
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 260, { steps: 10 });
    await page.mouse.up();
    await expect(sheet).toBeHidden();
  });

  test("신청 정보 단계: 칸을 떠나면 바로 알려주고, 고른 일정을 위에서 바꿀 수 있습니다", async ({ page }) => {
    await gotoReady(page, "/dogs/dog-happy/apply");
    await pickSchedule(page);
    await expect(stepTitle(page)).toHaveText("누가 함께 걷나요?");
    await page.locator("#f-phone").fill("0101234");
    await page.locator("#f-phone").press("Tab");
    // '다음'을 누르기 전에 이미 보입니다
    await expect(page.getByText("010-0000-0000 형식으로 입력해주세요.")).toBeVisible();
    await page.locator("#f-phone").fill("01012345678");
    await expect(page.getByText("010-0000-0000 형식으로 입력해주세요.")).toHaveCount(0);

    if (isMobile(page)) {
      await page.getByRole("button", { name: /고른 일정 .+, 일정 변경/ }).click();
      await expect(page).toHaveURL(/step=1$/);
      await expect(stepTitle(page)).toHaveText("언제 함께 걸을까요?");
    }
  });

  test("활동 기록: 이정표는 진행 막대로, 일지는 달마다 묶여 보입니다", async ({ page }) => {
    await gotoReady(page, "/activity");
    await expect(page.getByRole("progressbar", { name: "5마리 친구 진행" })).toHaveAttribute(
      "aria-valuenow",
      "80"
    );
    await expect(page.getByRole("progressbar", { name: "첫 산책 진행" })).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
    expect(await page.getByRole("heading", { level: 3, name: /^\d{4}년 \d{1,2}월/ }).count()).toBeGreaterThan(
      0
    );
  });

  test("가이드 목차는 지금 읽는 곳을 표시하고, 눌러도 주소에 #을 남기지 않습니다", async ({ page }) => {
    await gotoReady(page, "/guide");
    const toc = page.getByRole("navigation", { name: "가이드 목차" });
    await expect(toc.getByRole("link", { name: "참여 방법" })).toHaveAttribute("aria-current", "location");
    await toc.getByRole("link", { name: "현장 약속" }).click();
    await expect(page.getByRole("heading", { name: "산책할 때 이것만은 지켜주세요" })).toBeInViewport();
    await expect(toc.getByRole("link", { name: "현장 약속" })).toHaveAttribute("aria-current", "location");
    expect(page.url()).not.toContain("#");
  });
});
