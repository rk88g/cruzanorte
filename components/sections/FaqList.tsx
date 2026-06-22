type FaqItem = {
  question: string;
  answer: string;
};

type FaqListProps = {
  items: FaqItem[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <details
          className="group rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl"
          key={item.question}
        >
          <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
            {item.question}
          </summary>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
