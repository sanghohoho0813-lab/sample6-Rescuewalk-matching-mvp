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
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity)
  );
}

export const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1280) < 768;

/** 신청 흐름에서 현재 단계의 고를 수 있는 첫 칸 */
export const firstOpenChoice = (page: Page) =>
  page.locator('section[aria-labelledby="step-title"] button:not([disabled])').first();

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
