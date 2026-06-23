import type { Metadata } from "next";
import {
  CreditCard,
  FileCheck2,
  FileText,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  UserRoundCheck
} from "lucide-react";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";

const pageDescription =
  "Consulta los terminos de uso iniciales de Cruza Norte para el uso del sitio, registro, documentacion y comunicacion.";

export const metadata: Metadata = {
  title: "Terminos de uso",
  description: pageDescription,
  alternates: {
    canonical: "/terminos"
  }
};

const terms = [
  {
    title: "Uso del sitio",
    description:
      "El sitio presenta informacion publica sobre servicios, acompanamiento y seguimiento.",
    icon: FileText
  },
  {
    title: "Registro de usuario",
    description:
      "El registro real se habilitara en una fase posterior y podra requerir verificacion por WhatsApp.",
    icon: UserRoundCheck
  },
  {
    title: "Informacion del cliente",
    description:
      "La informacion proporcionada debera ser revisada y organizada de forma responsable.",
    icon: FileCheck2
  },
  {
    title: "Documentacion",
    description:
      "La revision documental busca identificar pendientes, faltantes o datos que requieren atencion.",
    icon: FileText
  },
  {
    title: "Comunicacion",
    description:
      "La comunicacion se realizara por canales definidos y con lenguaje claro.",
    icon: MessageCircle
  },
  {
    title: "Pagos futuros",
    description:
      "Cualquier funcion de pagos debera habilitarse en una fase posterior con condiciones claras.",
    icon: CreditCard
  },
  {
    title: "Limitacion de promesas",
    description:
      "Cruza Norte mantiene un alcance responsable; el servicio se enfoca en acompanamiento y seguimiento.",
    icon: ShieldAlert
  },
  {
    title: "Cambios en el servicio",
    description:
      "Las funciones del sistema podran actualizarse conforme avance el desarrollo del proyecto.",
    icon: RefreshCw
  }
];

export default function TermsPage() {
  return (
    <>
      <InternalHero
        eyebrow="Terminos de uso"
        title="Condiciones iniciales para usar el sitio Cruza Norte."
        description="Estos terminos son una version inicial y podran actualizarse conforme se habiliten nuevas funciones del sistema."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Version inicial"
            title="Puntos generales de uso y alcance del servicio."
            description="Cruza Norte mantiene un alcance responsable. El servicio se enfoca en acompanamiento, organizacion de informacion, revision documental y seguimiento del proceso."
          />
          <div className="mt-10">
            <InfoGrid items={terms} columns="four" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card p-8 shadow-premium backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-foreground">Contacto</h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Para dudas sobre estos terminos, el usuario podra comunicarse por los
            canales oficiales publicados por Cruza Norte. Esta pagina no reemplaza
            una revision legal definitiva.
          </p>
        </div>
      </section>

      <PageCta
        title="Revisa el alcance antes de comenzar."
        description="Cruza Norte mantiene un enfoque profesional, ordenado y responsable en cada etapa."
        primaryLabel="Contactar"
        primaryHref="/contacto"
      />
    </>
  );
}
