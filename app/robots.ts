import type { MetadataRoute } from "next";
import { PROJECT } from "@/lib/constants";
import { INDEXABLE_PUBLIC_ROUTES, PUBLIC_ROUTES } from "@/lib/routes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [...INDEXABLE_PUBLIC_ROUTES],
      disallow: ["/panel", PUBLIC_ROUTES.registro, PUBLIC_ROUTES.ingresar, "/api"]
    },
    sitemap: `${PROJECT.siteUrl}/sitemap.xml`,
    host: PROJECT.siteUrl
  };
}
