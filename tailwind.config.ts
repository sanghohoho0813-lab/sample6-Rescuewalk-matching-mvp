import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#FFFDF8",
          100: "#FDF8EE",
          200: "#F9F0DD",
          300: "#F2E5C9",
        },
        sage: {
          50: "#F3F7EE",
          100: "#E5EEDB",
          200: "#CDDfBB",
          300: "#AEC994",
          400: "#8FB06F",
          500: "#729653",
          600: "#5A7A40",
          700: "#476132",
          800: "#3A4F2B",
          900: "#2E3F23",
        },
        tangerine: {
          50: "#FEF6EC",
          100: "#FDEAD3",
          200: "#FAD3A5",
          300: "#F7B96F",
          400: "#F49E42",
          500: "#EF8827",
          600: "#DE6F1B",
          700: "#B85618",
          800: "#93451B",
          900: "#773A19",
        },
        ink: {
          900: "#2B2622",
          700: "#4A433C",
          500: "#6E655C",
          400: "#8B8177",
          300: "#AFA69B",
        },
        /** 제작사(미래AI랩) 브랜드 컬러 — 로고 원본에서 추출 */
        mirae: {
          50: "#EEF8FC",
          100: "#D3EDF7",
          200: "#A6DCEF",
          300: "#6AC6E5",
          400: "#35B4DE",
          500: "#1A9BC9",
          600: "#127BA4",
          700: "#125F7E",
          800: "#123F55",
          900: "#0E2536",
          950: "#081726",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Noto Sans KR",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Segoe UI",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 2px 12px rgba(74, 62, 42, 0.07)",
        "card-hover": "0 10px 28px rgba(74, 62, 42, 0.13)",
        cta: "0 6px 18px rgba(239, 136, 39, 0.32)",
        header: "0 1px 0 rgba(74, 62, 42, 0.06)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "70%": { transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        wag: {
          "0%, 100%": { transform: "rotate(-8deg)" },
          "50%": { transform: "rotate(8deg)" },
        },
        /**
         * 메인 CTA용 light sweep.
         * 전체 6초 중 실제로 빛이 지나가는 구간은 약 1.5초뿐이고 나머지는 완전 투명 —
         * 광고 배너처럼 계속 번쩍이지 않고 "은은하게 한 번씩" 스치는 정도만 보입니다.
         */
        "light-sweep": {
          "0%, 70%": { transform: "translateX(-130%) skewX(-18deg)", opacity: "0" },
          "76%": { opacity: "0.5" },
          "90%": { opacity: "0.28" },
          "100%": { transform: "translateX(230%) skewX(-18deg)", opacity: "0" },
        },
        /** 배지의 작은 상태 점 — 아주 느린 호흡 */
        "soft-pulse": {
          "0%, 100%": { opacity: "0.45", transform: "scale(0.9)" },
          "50%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 0.28s ease-out both",
        wag: "wag 1s ease-in-out infinite",
        "light-sweep": "light-sweep 6s ease-in-out infinite",
        "soft-pulse": "soft-pulse 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
