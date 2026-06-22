import {
  ClipboardList,
  HeartHandshake,
  LockKeyhole,
  MessageCircle,
  Route,
  ScanSearch
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

const benefits = [
  {
    title: "Proceso claro",
    icon: Route
  },
  {
    title: "Comunicacion por WhatsApp",
    icon: MessageCircle
  },
  {
    title: "Documentacion ordenada",
    icon: ClipboardList
  },
  {
    title: "Seguimiento por etapas",
    icon: ScanSearch
  },
  {
    title: "Atencion humana",
    icon: HeartHandshake
  },
  {
    title: "Panel privado del cliente",
    icon: LockKeyhole
  }
];

export function WhyChooseSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          align="center"
          eyebrow="Por que elegir Cruza Norte"
          title="Claridad, seguimiento y acompanamiento en una sola experiencia."
          description="Accede a tu proceso mediante verificacion por WhatsApp y revisa cada etapa desde una experiencia privada y ordenada."
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <article
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl"
                key={benefit.title}
              >
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <p className="font-semibold text-foreground">{benefit.title}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
