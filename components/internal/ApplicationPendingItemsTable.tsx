import Link from "next/link";
import type {
  ApplicationPendingItem,
  BreakdownStatus,
  PendingPriority
} from "@/lib/internal/applicationDetail";
import { cn } from "@/lib/utils";

type ApplicationPendingItemsTableProps = {
  items: ApplicationPendingItem[];
};

const priorityClassNames: Record<PendingPriority, string> = {
  Alta: "border-danger/30 bg-danger/10 text-danger",
  Media: "border-primary/30 bg-primary/10 text-primary",
  Baja: "border-border bg-background text-muted-foreground"
};

const statusClassNames: Record<BreakdownStatus, string> = {
  Autorizado: "border-success/30 bg-success/10 text-success",
  Completo: "border-success/30 bg-success/10 text-success",
  "En revision": "border-primary/30 bg-primary/10 text-primary",
  "No aplica": "border-border bg-background text-muted-foreground",
  Pendiente: "border-border bg-background text-muted-foreground",
  Proximamente: "border-border bg-background text-muted-foreground",
  Rechazado: "border-danger/30 bg-danger/10 text-danger",
  "Requiere accion": "border-danger/30 bg-danger/10 text-danger"
};

function Badge({
  className,
  value
}: {
  className: string;
  value: string;
}) {
  return (
    <span className={cn("w-fit rounded-full border px-3 py-1 text-xs font-semibold", className)}>
      {value}
    </span>
  );
}

function Action({ item }: { item: ApplicationPendingItem }) {
  if (item.actionHref) {
    return (
      <Link className="font-semibold text-primary transition hover:text-accent" href={item.actionHref}>
        {item.actionLabel}
      </Link>
    );
  }

  return <span className="text-sm text-muted-foreground">{item.actionLabel}</span>;
}

export function ApplicationPendingItemsTable({ items }: ApplicationPendingItemsTableProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Pendientes del proceso
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Acciones activas consolidadas
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-xl border border-border bg-background/60 p-6 text-center">
          <p className="text-base font-semibold text-foreground">
            No hay pendientes activos en este momento.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            La solicitud no tiene acciones pendientes registradas.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 font-semibold">Prioridad</th>
                  <th className="px-3 py-3 font-semibold">Area</th>
                  <th className="px-3 py-3 font-semibold">Pendiente</th>
                  <th className="px-3 py-3 font-semibold">Relacionado con</th>
                  <th className="px-3 py-3 font-semibold">Estado</th>
                  <th className="px-3 py-3 font-semibold">Responsable</th>
                  <th className="px-3 py-3 font-semibold">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item, index) => (
                  <tr className="align-top" key={`${item.area}-${item.pending}-${index}`}>
                    <td className="px-3 py-4">
                      <Badge
                        className={priorityClassNames[item.priority]}
                        value={item.priority}
                      />
                    </td>
                    <td className="px-3 py-4 font-medium text-foreground">{item.area}</td>
                    <td className="px-3 py-4 text-foreground">{item.pending}</td>
                    <td className="px-3 py-4 text-muted-foreground">{item.relatedTo}</td>
                    <td className="px-3 py-4">
                      <Badge className={statusClassNames[item.status]} value={item.status} />
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">{item.responsible}</td>
                    <td className="px-3 py-4">
                      <Action item={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 grid gap-3 lg:hidden">
            {items.map((item, index) => (
              <article
                className="rounded-xl border border-border bg-background/60 p-4"
                key={`${item.area}-${item.pending}-mobile-${index}`}
              >
                <div className="flex flex-wrap gap-2">
                  <Badge className={priorityClassNames[item.priority]} value={item.priority} />
                  <Badge className={statusClassNames[item.status]} value={item.status} />
                </div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {item.area}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{item.pending}</h3>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Relacionado con
                    </dt>
                    <dd className="mt-1 text-foreground">{item.relatedTo}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Responsable
                    </dt>
                    <dd className="mt-1 text-foreground">{item.responsible}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      Accion
                    </dt>
                    <dd className="mt-1">
                      <Action item={item} />
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
