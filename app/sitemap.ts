import type { MetadataRoute } from "next";
import { getComponentSlugs, getSystemSlugs } from "@/lib/registry-loader";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const systems: MetadataRoute.Sitemap = getSystemSlugs().map((slug) => ({
    url: `${SITE_URL}/systems/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const components: MetadataRoute.Sitemap = getComponentSlugs().map((slug) => ({
    url: `${SITE_URL}/components/${slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/systems`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/components`, changeFrequency: "weekly", priority: 0.9 },
    ...systems,
    ...components,
  ];
}
