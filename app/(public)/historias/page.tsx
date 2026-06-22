import type { Metadata } from "next";
import { HeartHandshake, MessageSquareText, UsersRound } from "lucide-react";
import { InfoGrid } from "@/components/sections/InfoGrid";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { TestimonialGrid } from "@/components/sections/TestimonialGrid";
import { PUBLIC_ROUTES } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Historias",
  description:
    "Experiencias de personas que organizaron su proceso con seguimiento claro."
};

const testimonials = [
  {
    name: "Carolina",
    location: "Ciudad de Mexico",
    text: "Me ayudaron a entender que documentos necesitaba y cual era el siguiente paso."
  },
  {
    name: "Jorge",
    location: "Tijuana",
    text: "Me dio confianza ver mi avance por etapas y tener la informacion ordenada."
  },
  {
    name: "Patricia",
    location: "Queretaro",
    text: "Pude organizar la informacion de mi familia en un solo lugar."
  }
];

const storyTypes = [
  {
    title: "Organizacion familiar",
    description:
      "Personas que necesitan reunir informacion de varios integrantes sin perder claridad.",
    icon: UsersRound
  },
  {
    title: "Seguimiento por etapas",
    description:
      "Experiencias donde conocer el siguiente paso ayuda a reducir confusion.",
    icon: MessageSquareText
  },
  {
    title: "Acompanamiento humano",
    description:
      "Casos donde la atencion cuidadosa permite ordenar informacion sensible.",
    icon: HeartHandshake
  }
];

export default function StoriesPage() {
  return (
    <>
      <InternalHero
        eyebrow="Historias"
        title="Experiencias compartidas con cuidado y responsabilidad."
        description="Las historias de Cruza Norte se enfocan en organizacion, seguimiento claro y preparacion paso a paso, sin afirmar resultados ni prometer desenlaces."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Resenas destacadas"
            title="Voces sobre claridad, orden y seguimiento."
          />
          <div className="mt-10">
            <TestimonialGrid testimonials={testimonials} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Historias de organizacion"
            title="Cada experiencia se cuenta desde el acompanamiento."
            description="Estos bloques son placeholders editoriales para mostrar el tipo de historias que podran publicarse conforme el servicio crezca."
          />
          <div className="mt-10">
            <InfoGrid items={storyTypes} />
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto rounded-[2rem] border border-border bg-card p-8 shadow-premium backdrop-blur-xl lg:max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
            Comparte tu experiencia
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-foreground">
            Tu historia puede ayudar a otras personas a entender el proceso.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
            En fases posteriores se podran recibir experiencias de forma cuidada,
            con autorizacion y sin publicar informacion sensible.
          </p>
        </div>
      </section>

      <PageCta
        title="Empieza tu propia historia con orden."
        description="Inicia el registro y prepara tu informacion con una guia clara."
        primaryHref={PUBLIC_ROUTES.registro}
      />
    </>
  );
}
