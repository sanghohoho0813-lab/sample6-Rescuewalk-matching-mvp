import { test as base, expect, type Page } from "@playwright/test";
import { STORE_KEY } from "../lib/storageKeys";

/** 외부 웹폰트 요청은 테스트 결과와 무관하므로 막아 속도·안정성을 확보합니다 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route("**cdn.jsdelivr.net/**", (r) => r.abort());
    await use(page);
  },
});
export { expect };

/**
 * 페이지 이동 후 앱이 저장값까지 읽고 그려질 때까지 기다립니다.
 * 'networkidle' 은 이미지·프리페치가 많은 페이지에서 느린 CI 러너에선 끝나지 않을 수 있어 쓰지 않습니다.
 */
export async function gotoReady(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("html[data-hydrated]")).toHaveCount(1);
  // 등장 애니메이션(투명도 변화) 중에 색 대비를 재면 실제보다 낮게 나오므로 끝날 때까지 기다립니다
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
  );
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

/** 신청 1단계에서 고를 수 있는 첫 날짜 */
export const firstOpenDate = (page: Page) =>
  page
    .locator('section[aria-labelledby="step-title"] button[aria-label$="시간 가능"]:not([disabled])')
    .first();

/** 신청 1단계에서 고를 수 있는 첫 시간(지난 시간·이미 신청한 시간 제외) */
export const firstOpenTime = (page: Page) =>
  page
    .locator('section[aria-labelledby="step-title"]')
    .getByRole("button", { name: /^오[전후] \d{1,2}:\d{2}$/ })
    .and(page.locator(":not([disabled])"))
    .first();

/** 날짜 → 시간까지 골라 정보 단계로 */
export async function pickSchedule(page: Page) {
  await firstOpenDate(page).click();
  const time = firstOpenTime(page);
  const label = await time.innerText();
  await time.click();
  await expect(page).toHaveURL(/step=2$/);
  return label;
}

export const stepTitle = (page: Page) => page.locator("#step-title");

/**
 * 스토어(localStorage)를 직접 채워 특정 상태에서 시작.
 * 앱 스크립트보다 먼저 실행되도록 init script 로 넣고, 이후 이동에서는 다시 덮어쓰지 않습니다.
 */
export async function seedStore(page: Page, state: unknown) {
  await page.addInitScript(
    ([key, s]) => {
      if (sessionStorage.getItem("__e2e_seeded")) return;
      localStorage.setItem(key, JSON.stringify(s));
      sessionStorage.setItem("__e2e_seeded", "1");
    },
    [STORE_KEY, state] as const
  );
}
