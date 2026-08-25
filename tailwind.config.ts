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
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "pop-in": "pop-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-up": "slide-up 0.28s ease-out both",
        wag: "wag 1s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
