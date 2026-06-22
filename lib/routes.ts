import type { NavigationItem } from "@/types";

export const PUBLIC_ROUTES = {
  home: "/",
  servicios: "/servicios",
  comoFunciona: "/como-funciona",
  casosDificiles: "/casos-dificiles",
  historias: "/historias",
  preguntasFrecuentes: "/preguntas-frecuentes",
  contacto: "/contacto",
  ingresar: "/ingresar",
  registro: "/registro"
} as const;

export const CLIENT_ROUTES = {
  panel: "/panel"
} as const;

export const PUBLIC_NAVIGATION: NavigationItem[] = [
  {
    label: "Servicios",
    href: PUBLIC_ROUTES.servicios
  },
  {
    label: "Como funciona",
    href: PUBLIC_ROUTES.comoFunciona
  },
  {
    label: "Historias",
    href: PUBLIC_ROUTES.historias
  },
  {
    label: "Contacto",
    href: PUBLIC_ROUTES.contacto
  },
  {
    label: "Ingresar",
    href: PUBLIC_ROUTES.ingresar
  }
];
