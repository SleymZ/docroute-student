import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    {
      url: siteUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/home`,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/explore`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/stories`,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...["/plus", "/terms", "/privacy", "/cookies", "/feedback"].map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
