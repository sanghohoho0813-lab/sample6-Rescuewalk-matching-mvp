import type { MetadataRoute } from "next";
import { dogs } from "@/lib/data/dogs";
import { shelters } from "@/lib/data/shelters";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** 공개 화면만 — 신청·기록 같은 개인 화면은 제외 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/dogs", "/shelters", "/guide"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "daily" as const })),
    ...dogs.map((d) => ({ url: `${SITE_URL}/dogs/${d.id}`, changeFrequency: "daily" as const })),
    ...shelters.map((s) => ({ url: `${SITE_URL}/shelters/${s.id}`, changeFrequency: "weekly" as const })),
  ];
}
