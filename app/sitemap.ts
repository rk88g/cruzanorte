import type { MetadataRoute } from "next";
import { PROJECT } from "@/lib/constants";
import { INDEXABLE_PUBLIC_ROUTES } from "@/lib/routes";

const routePriority: Record<(typeof INDEXABLE_PUBLIC_ROUTES)[number], number> = {
  "/": 1,
  "/servicios": 0.9,
  "/como-funciona": 0.9,
  "/casos-dificiles": 0.8,
  "/historias": 0.7,
  "/preguntas-frecuentes": 0.7,
  "/contacto": 0.8,
  "/aviso-de-privacidad": 0.4,
  "/terminos": 0.4
};

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return INDEXABLE_PUBLIC_ROUTES.map((route) => ({
    url: `${PROJECT.siteUrl}${route === "/" ? "" : route}`,
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: routePriority[route]
  }));
}
