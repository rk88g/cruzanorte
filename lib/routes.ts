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

export const CLIENT_ROUTES = {
  panel: "/panel",
  registro: "/panel/registro",
  personas: "/panel/personas"
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

export const FOOTER_NAVIGATION: NavigationItem[] = [
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
    label: "Preguntas frecuentes",
    href: PUBLIC_ROUTES.preguntasFrecuentes
  },
  {
    label: "Contacto",
    href: PUBLIC_ROUTES.contacto
  }
];

export const INDEXABLE_PUBLIC_ROUTES = [
  PUBLIC_ROUTES.home,
  PUBLIC_ROUTES.servicios,
  PUBLIC_ROUTES.comoFunciona,
  PUBLIC_ROUTES.casosDificiles,
  PUBLIC_ROUTES.historias,
  PUBLIC_ROUTES.preguntasFrecuentes,
  PUBLIC_ROUTES.contacto,
  PUBLIC_ROUTES.avisoDePrivacidad,
  PUBLIC_ROUTES.terminos
] as const;
