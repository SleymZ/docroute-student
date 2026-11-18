import { countryHref, countryPages } from "@/lib/country-list";
import type { MetadataRoute } from "next";

import { indexableUniversityIds } from "@/lib/indexable-universities";
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
      url: `${siteUrl}/deadlines`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/explore`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/explore/top`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${siteUrl}/countries`,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    ...countryPages.map((country) => ({
      url: `${siteUrl}${countryHref(country.code)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...indexableUniversityIds().map((id) => ({
      url: `${siteUrl}/universities/${encodeURIComponent(id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
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
    ...["/plus", "/terms", "/privacy", "/cookies", "/feedback", "/contact"].map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
