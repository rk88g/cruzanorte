import { SectionHeading } from "@/components/sections/SectionHeading";

const faqs = [
  {
    question: "Como inicio mi proceso?",
    answer:
      "Puedes comenzar desde el registro inicial. En esta fase el boton te lleva a una pantalla placeholder mientras se prepara el flujo real."
  },
  {
    question: "Puedo registrarme solo con WhatsApp?",
    answer:
      "El sistema esta pensado para acceso por WhatsApp con codigo de verificacion. La integracion real se trabajara en una fase posterior."
  },
  {
    question: "Puedo agregar a varias personas?",
    answer:
      "La plataforma esta preparada para crecer por modulos. Las funciones familiares se definiran cuando se construya la intranet del cliente."
  },
  {
    question: "Que documentos necesito?",
    answer:
      "Depende de cada caso. Cruza Norte se enfoca en organizar informacion, revisar documentos y senalar pendientes de forma clara."
  },
  {
    question: "Puedo dar seguimiento a mi avance?",
    answer:
      "La experiencia esta disenada para mostrar etapas, pendientes y proximos pasos dentro del panel del cliente."
  },
  {
    question: "Cruza Norte promete resultados?",
    answer:
      "No. Cada caso es diferente. En Cruza Norte nos enfocamos en acompanamiento, organizacion, revision de informacion y seguimiento claro."
  }
];

export function FaqSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeading
          eyebrow="Preguntas frecuentes"
          title="Respuestas claras antes de comenzar."
          description="Informacion inicial para entender el alcance de la plataforma y las fases que vienen despues."
        />

        <div className="grid gap-3">
          {faqs.map((faq) => (
            <details
              className="group rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl"
              key={faq.question}
            >
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                {faq.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
