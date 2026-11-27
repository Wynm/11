import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://fatoura.ma";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/i/", "/api/"] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
