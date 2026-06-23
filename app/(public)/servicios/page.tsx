import type { Metadata } from "next";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Handshake,
  Plane,
  ShieldQuestion
} from "lucide-react";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { ServiceDetailCard } from "@/components/sections/ServiceDetailCard";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { SectionHeading } from "@/components/sections/SectionHeading";

const pageDescription =
  "Conoce los servicios de acompanamiento, documentacion, revision de informacion y seguimiento por etapas de Cruza Norte.";

export const metadata: Metadata = {
  title: "Servicios",
  description: pageDescription,
  alternates: {
    canonical: "/servicios"
  }
};

const services = [
  {
    title: "Turismo",
    description:
      "Apoyo para organizar informacion, documentacion y preparacion general para tu viaje.",
    icon: Plane,
    benefits: [
      "Revision de informacion inicial",
      "Organizacion de documentos",
      "Preparacion general del proceso"
    ]
  },
  {
    title: "Trabajo",
    description:
      "Orientacion para personas que buscan ordenar su informacion y conocer pasos relacionados con trabajo.",
    icon: BriefcaseBusiness,
    benefits: [
      "Identificacion de datos relevantes",
      "Seguimiento de pendientes",
      "Acompanamiento por etapas"
    ]
  },
  {
    title: "Asilo politico",
    description:
      "Acompanamiento para organizar informacion, documentos y seguimiento de casos sensibles.",
    icon: Handshake,
    benefits: [
      "Trato cuidadoso de informacion",
      "Orden por etapas",
      "Revision de puntos importantes"
    ]
  },
  {
    title: "Casos dificiles",
    description:
      "Revision cuidadosa para personas con antecedentes, dudas o procesos previos complicados.",
    icon: ShieldQuestion,
    benefits: [
      "Analisis inicial de situacion",
      "Organizacion de antecedentes",
      "Seguimiento claro de proximos pasos"
    ]
  },
  {
    title: "Revision documental",
    description:
      "Ayuda para identificar documentos faltantes, informacion incompleta o puntos que requieren atencion.",
    icon: FileText,
    benefits: [
      "Lista de pendientes",
      "Revision de informacion incompleta",
      "Preparacion documental ordenada"
    ]
  },
  {
    title: "Seguimiento personalizado",
    description:
      "Cada proceso se muestra por etapas para que sepas que sigue y que falta por completar.",
    icon: ClipboardCheck,
    benefits: [
      "Vista por etapas",
      "Comunicacion clara",
      "Avance del proceso visible"
    ]
  }
];

const includes = [
  {
    title: "Acompanamiento profesional",
    description:
      "Orientacion cuidadosa para entender el proceso, ordenar informacion y avanzar con claridad.",
    icon: Handshake
  },
  {
    title: "Documentacion organizada",
    description:
      "Estructura de documentos y pendientes para facilitar la revision de informacion.",
    icon: ClipboardCheck
  },
  {
    title: "Seguimiento claro",
    description:
      "Etapas visibles para entender que se ha completado y que sigue pendiente.",
    icon: FileText
  }
];

const complementary = [
  {
    title: "Revision de informacion",
    description:
      "Ayuda para detectar datos incompletos, inconsistencias o temas que requieren atencion.",
    icon: FileText
  },
  {
    title: "Preparacion paso a paso",
    description:
      "Organizacion gradual para evitar que el proceso se sienta desordenado.",
    icon: ClipboardCheck
  },
  {
    title: "Orientacion personalizada",
    description:
      "Cada persona puede recibir una guia inicial de acuerdo con su situacion.",
    icon: Handshake
  }
];

export default function ServicesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Servicios"
        title="Acompanamiento, documentacion y seguimiento para avanzar con orden."
        description="Cruza Norte acompana a personas que necesitan organizar informacion, preparar documentacion, revisar su situacion y dar seguimiento a su proceso con claridad."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Servicios principales"
            title="Soluciones claras para distintas necesidades."
            description="Cada servicio mantiene un enfoque profesional, sin prometer resultados y con una experiencia de seguimiento por etapas."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceDetailCard {...service} key={service.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Que incluye"
            title="Una experiencia enfocada en orden y claridad."
            description="El acompanamiento se concentra en organizar informacion, revisar documentacion y mostrar avances de forma comprensible."
          />
          <div className="mt-10">
            <InfoGrid items={includes} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Complementarios"
            title="Apoyo adicional para preparar mejor tu informacion."
            description="Servicios pensados para personas que requieren mayor orden antes de continuar con su proceso."
          />
          <div className="mt-10">
            <InfoGrid items={complementary} />
          </div>
        </div>
      </section>

      <PageCta
        title="Comienza con una guia clara."
        description="Inicia tu registro para organizar informacion, revisar pendientes y conocer los proximos pasos."
      />
    </>
  );
}
