import type { MetadataRoute } from "next";
import { getPrimitiveSlugs } from "@/lib/registry-loader";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const systems: MetadataRoute.Sitemap = getPrimitiveSlugs().map((slug) => ({
    url: `${SITE_URL}/systems/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/systems`, changeFrequency: "weekly", priority: 0.9 },
    ...systems,
  ];
}
