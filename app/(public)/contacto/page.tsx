import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { ContactCard } from "@/components/sections/ContactCard";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PROJECT } from "@/lib/constants";
import { PUBLIC_ROUTES } from "@/lib/routes";

const pageDescription =
  "Contacta a Cruza Norte para recibir orientacion, iniciar tu registro o resolver dudas sobre el proceso.";

export const metadata: Metadata = {
  title: "Contacto",
  description: pageDescription,
  alternates: {
    canonical: "/contacto"
  }
};

const contactOptions = [
  {
    title: "WhatsApp",
    description:
      "Canal principal contemplado para comunicacion y verificacion del cliente.",
    detail: PROJECT.supportWhatsapp,
    icon: MessageCircle
  },
  {
    title: "Correo",
    description:
      "Canal placeholder para consultas generales mientras se prepara el sistema.",
    detail: "contacto@cruzanorte.com",
    icon: Mail
  },
  {
    title: "Atencion",
    description:
      "Horarios iniciales de referencia sujetos a ajustes conforme crezca el servicio.",
    detail: "Lunes a viernes, 9:00 a 18:00",
    icon: Clock
  }
];

export default function ContactPage() {
  return (
    <>
      <InternalHero
        eyebrow="Contacto"
        title="Atencion profesional por canales oficiales."
        description="Escribenos para iniciar tu proceso, resolver dudas o conocer como se organiza el acompanamiento de Cruza Norte."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto w-full max-w-6xl">
          <SectionHeading
            eyebrow="Formas de contacto"
            title="Canales claros para una comunicacion ordenada."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {contactOptions.map((option) => (
              <ContactCard {...option} key={option.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="rounded-[2rem] border border-border bg-card p-8 shadow-premium backdrop-blur-xl">
            <Phone className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-3xl font-semibold text-foreground">
              Tarjeta de WhatsApp
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground">
              Todos los numeros telefonicos del sistema deben usar WhatsApp con
              codigo de pais. La integracion real se habilitara en fases futuras.
            </p>
            <p className="mt-6 text-lg font-semibold text-accent">
              {PROJECT.supportWhatsapp}
            </p>
          </div>

          <form className="rounded-[2rem] border border-border bg-card p-6 shadow-premium backdrop-blur-xl sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
              Formulario visual
            </p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground">
              Cuentanos que necesitas revisar.
            </h2>
            <div className="mt-6 grid gap-4">
              {["Nombre", "WhatsApp con codigo de pais", "Correo", "Motivo de contacto"].map(
                (label) => (
                  <label className="grid gap-2 text-sm font-medium text-foreground" key={label}>
                    {label}
                    <input
                      className="min-h-11 rounded-lg border border-border bg-secondary px-4 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                      placeholder={label}
                      type="text"
                    />
                  </label>
                )
              )}
              <label className="grid gap-2 text-sm font-medium text-foreground">
                Mensaje
                <textarea
                  className="min-h-32 rounded-lg border border-border bg-secondary px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
                  placeholder="Comparte una descripcion breve."
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={PUBLIC_ROUTES.registro}>Iniciar registro</ButtonLink>
              <span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-secondary px-5 py-3 text-sm font-semibold text-muted-foreground">
                Proximamente disponible
              </span>
            </div>
          </form>
        </div>
      </section>

      <PageCta
        title="Da el primer paso con comunicacion clara."
        description="Inicia tu registro para organizar informacion y conocer los proximos pasos."
      />
    </>
  );
}
