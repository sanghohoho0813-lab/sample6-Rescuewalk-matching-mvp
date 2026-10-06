import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ["lib/**/*.test.ts"],
    environment: "node",
    // 날짜 계산은 사용자 기기 시간대를 따르므로, 테스트는 서비스 대상 시간대로 고정합니다
    setupFiles: ["./lib/test/setup.ts"],
  },
});
