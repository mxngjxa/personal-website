import type { MetadataRoute } from "next";
import { RESUME_DATA } from "@/data/resume-data";
import { SITE_UPDATED } from "@/lib/structured-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: RESUME_DATA.personalWebsiteUrl,
      // Fixed content date, not build time, so rebuilds don't churn it.
      lastModified: SITE_UPDATED,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
