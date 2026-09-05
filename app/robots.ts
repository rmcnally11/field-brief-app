import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/card", "/enter", "/book"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
