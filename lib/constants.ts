const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://cruzanorte.vercel.app";

export const PROJECT = {
  name: "Cruza Norte",
  defaultTitle: "Cruza Norte | Tu camino al norte empieza aqui",
  description:
    "Acompanamiento profesional para organizar documentacion, revisar informacion y dar seguimiento por etapas a tu proceso.",
  openGraphDescription:
    "Acompanamiento profesional, documentacion organizada y seguimiento por etapas.",
  siteUrl: SITE_URL,
  openGraphImage: "/og/cruza-norte-og.png",
  keywords: [
    "Cruza Norte",
    "acompanamiento migratorio",
    "documentacion migratoria",
    "seguimiento de proceso",
    "orientacion para viajar",
    "proceso guiado",
    "revision documental",
    "casos dificiles",
    "apoyo para documentacion",
    "preparacion de viaje"
  ],
  supportWhatsapp: "+5210000000000"
} as const;

export const VERIFICATION_CODE_LENGTH = 6;
