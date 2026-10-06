import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const PAGES = ["/", "/dogs", "/dogs/dog-bori", "/dogs/dog-bori/apply", "/requests", "/requests/req-seed-1", "/activity", "/me", "/shelters", "/shelters/sh-love", "/guide"];

test.describe("품질 기준", () => {
  for (const path of PAGES) {
    test(`접근성 위반 0건 — ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
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
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        if (o > 1) overflow.push(`${width}px ${path} +${o}px`);
      }
    }
    expect(overflow).toEqual([]);
  });

  test("일반 탐색 중 콘솔 오류·하이드레이션 경고 없음", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("ERR_FAILED")) errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
    for (const path of PAGES) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
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
