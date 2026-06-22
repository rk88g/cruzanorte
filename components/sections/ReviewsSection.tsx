import { Star } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";

const reviews = [
  {
    name: "Mariana",
    location: "Monterrey",
    text: "Me ayudaron a entender que informacion necesitaba organizar y siempre supe cual era el siguiente paso."
  },
  {
    name: "Luis",
    location: "Guadalajara",
    text: "Lo que mas me dio confianza fue ver mi avance por etapas y recibir seguimiento claro."
  },
  {
    name: "Ana",
    location: "Puebla",
    text: "Tenia muchas dudas y el proceso se sintio mas ordenado desde el primer registro."
  }
];

export function ReviewsSection() {
  return (
    <section className="px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          eyebrow="Resenas"
          title="Experiencias sobre orden, claridad y seguimiento."
          description="Testimonios de referencia para mostrar el tipo de experiencia que Cruza Norte busca ofrecer."
        />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <article
              className="rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl"
              key={review.name}
            >
              <div className="flex gap-1 text-accent" aria-label="Calificacion visual">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="h-4 w-4 fill-current" key={index} aria-hidden="true" />
                ))}
              </div>
              <p className="mt-6 text-sm leading-7 text-muted-foreground">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-accent">
                  {review.name.slice(0, 1)}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.location}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
