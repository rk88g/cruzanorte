import { Star } from "lucide-react";

type Testimonial = {
  name: string;
  location: string;
  text: string;
};

type TestimonialGridProps = {
  testimonials: Testimonial[];
};

export function TestimonialGrid({ testimonials }: TestimonialGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {testimonials.map((testimonial) => (
        <article
          className="rounded-2xl border border-border bg-card p-6 shadow-soft backdrop-blur-xl"
          key={`${testimonial.name}-${testimonial.location}`}
        >
          <div className="flex gap-1 text-accent" aria-label="Calificacion visual">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star className="h-4 w-4 fill-current" key={index} aria-hidden="true" />
            ))}
          </div>
          <p className="mt-6 text-sm leading-7 text-muted-foreground">
            &ldquo;{testimonial.text}&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-accent">
              {testimonial.name.slice(0, 1)}
            </span>
            <div>
              <p className="font-semibold text-foreground">{testimonial.name}</p>
              <p className="text-sm text-muted-foreground">{testimonial.location}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
