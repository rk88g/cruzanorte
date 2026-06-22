import type { Metadata } from "next";
import { FaqList } from "@/components/sections/FaqList";
import { InternalHero } from "@/components/sections/InternalHero";
import { PageCta } from "@/components/sections/PageCta";
import { SectionHeading } from "@/components/sections/SectionHeading";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas sobre registro, documentacion, seguimiento y funcionamiento de Cruza Norte."
};

const faqs = [
  {
    question: "Como inicio mi proceso?",
    answer:
      "Puedes iniciar desde la pagina de registro. En esta fase el registro es un placeholder visual y no guarda informacion."
  },
  {
    question: "El registro sera por WhatsApp?",
    answer:
      "Si. El sistema esta planeado para acceso por WhatsApp con codigo de verificacion, pero la integracion real se construira despues."
  },
  {
    question: "Puedo agregar a varias personas?",
    answer:
      "La plataforma esta preparada para crecer por modulos. La gestion de personas incluidas se construira en una fase posterior."
  },
  {
    question: "Que documentos necesito?",
    answer:
      "Depende de cada situacion. Cruza Norte se enfoca en organizar informacion y revisar pendientes documentales de forma clara."
  },
  {
    question: "Puedo dar seguimiento a mi avance?",
    answer:
      "El objetivo del panel del cliente es mostrar etapas, pendientes y proximos pasos. En esta fase todavia no hay datos reales."
  },
  {
    question: "Puedo subir comprobantes o documentos?",
    answer:
      "La carga de documentos se integrara mas adelante con almacenamiento seguro. Ahora solo se presenta la estructura publica."
  },
  {
    question: "Que pasa si me falta informacion?",
    answer:
      "Se podran identificar pendientes y puntos que requieren atencion para preparar mejor el proceso."
  },
  {
    question: "Puedo cambiar mi numero de WhatsApp?",
    answer:
      "Esa funcion se definira cuando se implemente el acceso real por WhatsApp y la gestion de cuenta."
  },
  {
    question: "Los resultados estan garantizados?",
    answer:
      "No. Cada caso es diferente y ningun proceso debe prometer resultados garantizados. En Cruza Norte nos enfocamos en acompanamiento, organizacion, revision de informacion, documentacion y seguimiento claro."
  },
  {
    question: "Como se comunican conmigo?",
    answer:
      "La comunicacion principal esta pensada por WhatsApp con codigo de pais, junto con avisos y seguimiento dentro del panel del cliente."
  }
];

export default function FaqPage() {
  return (
    <>
      <InternalHero
        eyebrow="Preguntas frecuentes"
        title="Respuestas claras para tomar decisiones informadas."
        description="Conoce el alcance actual de Cruza Norte, las funciones planeadas y la forma en que se dara seguimiento al proceso."
      />

      <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading
            eyebrow="Dudas importantes"
            title="Informacion inicial sobre registro, documentos y seguimiento."
          />
          <FaqList items={faqs} />
        </div>
      </section>

      <PageCta
        title="Resuelve tus dudas desde el primer paso."
        description="Comienza tu registro y prepara tu informacion de forma organizada."
      />
    </>
  );
}
