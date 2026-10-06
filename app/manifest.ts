import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RescueWalk — 유기견 산책 매칭",
    short_name: "RescueWalk",
    description: "산책이 필요한 아이와, 함께 걸어줄 당신을 연결합니다.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF8",
    theme_color: "#FFFDF8",
    lang: "ko",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
