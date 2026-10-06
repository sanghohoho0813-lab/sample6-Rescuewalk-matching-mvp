import AxeBuilder from "@axe-core/playwright";
import { test, expect, gotoReady } from "./fixtures";

const PAGES = ["/", "/dogs", "/dogs/dog-bori", "/dogs/dog-bori/apply", "/requests", "/requests/req-seed-1", "/activity", "/me", "/shelters", "/shelters/sh-love", "/guide"];

test.describe("품질 기준", () => {
  for (const path of PAGES) {
    test(`접근성 위반 0건 — ${path}`, async ({ page }) => {
      await gotoReady(page, path);
      const { violations } = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
        .analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("360~1440px 어디서도 가로 스크롤이 생기지 않습니다", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "폭을 직접 바꿔 가며 한 번만 확인");
    test.setTimeout(180_000);
    const overflow: string[] = [];
    for (const width of [360, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        await gotoReady(page, path);
        const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (o > 1) overflow.push(`${width}px ${path} +${o}px`);
      }
    }
    expect(overflow).toEqual([]);
  });

  test("일반 탐색 중 콘솔 오류·하이드레이션 경고 없음", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      const text = m.text();
      // 다음 페이지로 바로 이동하면서 Next 가 화면 안 링크를 미리 받던 요청이 취소될 때 남기는 로그 — 앱 오류가 아님
      const cancelledPrefetch = text.startsWith("Failed to fetch RSC payload");
      if (m.type() === "error" && !text.includes("ERR_FAILED") && !cancelledPrefetch) errors.push(text);
    });
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of PAGES) {
      await gotoReady(page, path);
    }
    expect(errors).toEqual([]);
  });

  test("키보드: 본문으로 건너뛰기", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "키보드 탐색은 데스크톱 기준");
    await page.goto("/dogs");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "본문으로 건너뛰기" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });
});
