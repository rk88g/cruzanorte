import type { Metadata } from "next";
import { FileText, LockKeyhole, MessageSquareText, ShieldCheck } from "lucide-react";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";

const pageDescription =
  "Consulta el aviso de privacidad inicial de Cruza Norte y el uso de informacion para contacto, orientacion y seguimiento.";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: pageDescription,
  alternates: {
    canonical: "/aviso-de-privacidad"
  }
};

const uses = [
  {
    title: "Contacto",
    description:
      "La informacion podra usarse para responder solicitudes y mantener comunicacion con el usuario.",
    icon: MessageSquareText
  },
  {
    title: "Orientacion",
    description:
      "Los datos pueden apoyar la orientacion personalizada y la revision de informacion.",
    icon: ShieldCheck
  },
  {
    title: "Seguimiento",
    description:
      "La informacion se usara para gestionar etapas, pendientes y avance del proceso.",
    icon: FileText
  },
  {
    title: "Proteccion",
    description:
      "Cruza Norte buscara manejar la informacion con cuidado conforme se habiliten nuevas funciones.",
    icon: LockKeyhole
  }
];

export default function PrivacyNoticePage() {
  return (
    <>
      <InternalHero
        eyebrow="Aviso de privacidad"
        title="Uso responsable de la informacion del usuario."
        description="Este aviso es una version inicial y podra actualizarse conforme se habiliten nuevas funciones del sistema."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Version inicial"
            title="Informacion usada para contacto, orientacion y seguimiento."
            description="Cruza Norte protege la informacion del usuario y la utiliza para contacto, orientacion, seguimiento, documentacion y gestion del proceso."
          />
          <div className="mt-10">
            <InfoGrid items={uses} columns="four" />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-border bg-card p-8 shadow-premium backdrop-blur-xl">
          <h2 className="text-2xl font-semibold text-foreground">
            Nota importante
          </h2>
          <p className="mt-5 text-base leading-8 text-muted-foreground">
            Este aviso es una version inicial y no constituye un documento legal
            definitivo. Debera revisarse y actualizarse conforme se integren
            funciones como registro real, verificacion por WhatsApp,
            almacenamiento de documentos, pagos futuros y gestion de
            procesos.
          </p>
        </div>
      </section>

      <PageCta
        title="Tienes dudas sobre el uso de tu informacion?"
        description="Contacta a Cruza Norte para resolver dudas sobre privacidad y manejo de informacion."
        primaryLabel="Contactar"
        primaryHref="/contacto"
      />
    </>
  );
}
