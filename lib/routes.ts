import type { NavigationItem } from "@/types";

export const PUBLIC_ROUTES = {
  home: "/",
  servicios: "/servicios",
  comoFunciona: "/como-funciona",
  casosDificiles: "/casos-dificiles",
  historias: "/historias",
  preguntasFrecuentes: "/preguntas-frecuentes",
  contacto: "/contacto",
  avisoDePrivacidad: "/aviso-de-privacidad",
  terminos: "/terminos",
  ingresar: "/ingresar",
  registro: "/registro"
} as const;

export const PUBLIC_NAVIGATION: NavigationItem[] = [
  {
    label: "Inicio",
    href: PUBLIC_ROUTES.home
  },
  {
    label: "Servicios",
    href: PUBLIC_ROUTES.servicios
  },
  {
    label: "Como funciona",
    href: PUBLIC_ROUTES.comoFunciona
  },
  {
    label: "Casos dificiles",
    href: PUBLIC_ROUTES.casosDificiles
  },
  {
    label: "Historias",
    href: PUBLIC_ROUTES.historias
  },
  {
    label: "Contacto",
    href: PUBLIC_ROUTES.contacto
  }
];

export const DESKTOP_NAVIGATION: NavigationItem[] = PUBLIC_NAVIGATION.filter(
  (item) => item.href !== PUBLIC_ROUTES.home
);

export const LEGAL_NAVIGATION: NavigationItem[] = [
  {
    label: "Aviso de privacidad",
    href: PUBLIC_ROUTES.avisoDePrivacidad
  },
  {
    label: "Terminos",
    href: PUBLIC_ROUTES.terminos
  }
];
