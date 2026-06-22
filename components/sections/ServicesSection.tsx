import Link from "next/link";
import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Plane,
  ShieldQuestion
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { PUBLIC_ROUTES } from "@/lib/routes";

const services = [
  {
    title: "Turismo",
    description:
      "Apoyo para organizar informacion, documentacion y preparacion general para tu viaje.",
    icon: Plane,
    href: PUBLIC_ROUTES.servicios
  },
  {
    title: "Trabajo",
    description:
      "Orientacion para ordenar tu informacion y conocer pasos relacionados con procesos de trabajo.",
    icon: BriefcaseBusiness,
    href: PUBLIC_ROUTES.servicios
  },
  {
    title: "Asilo politico",
    description:
      "Acompanamiento para organizar informacion, documentos y seguimiento de casos sensibles.",
    icon: HeartHandshake,
    href: PUBLIC_ROUTES.servicios
  },
  {
    title: "Casos dificiles",
    description:
      "Revision cuidadosa para personas con antecedentes, dudas o procesos previos complejos.",
    icon: ShieldQuestion,
    href: PUBLIC_ROUTES.casosDificiles
  },
  {
    title: "Revision documental",
    description:
      "Ayuda para identificar documentos faltantes, informacion incompleta o puntos de atencion.",
    icon: FileText,
    href: PUBLIC_ROUTES.servicios
  },
  {
    title: "Seguimiento personalizado",
    description:
      "Cada proceso se muestra por etapas para saber que sigue y que falta por completar.",
    icon: ClipboardCheck,
    href: PUBLIC_ROUTES.comoFunciona
  }
];

export function ServicesSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Servicios principales"
          title="Opciones de acompanamiento para distintas necesidades."
          description="Cada servicio se presenta con lenguaje responsable, enfoque profesional y seguimiento por etapas."
        />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-premium"
                key={service.title}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {service.description}
                </p>
                <Link
                  className="mt-6 inline-flex text-sm font-semibold text-accent transition group-hover:translate-x-1"
                  href={service.href}
                >
                  Conocer mas
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
