import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fatoura.ma";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/new`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pro`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/tva`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/mentions`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/tools/ice`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/invoices`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
