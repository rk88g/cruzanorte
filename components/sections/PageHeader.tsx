type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-copper">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-graphite sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-8 text-neutral-700 sm:text-lg">
          {description}
        </p>
      </div>
    </section>
  );
}
