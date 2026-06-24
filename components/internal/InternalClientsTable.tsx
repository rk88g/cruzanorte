import type { InternalClientListItem } from "@/lib/internal/queries";

type InternalClientsTableProps = {
  clients: InternalClientListItem[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function InternalClientsTable({ clients }: InternalClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
        <p className="text-sm text-muted-foreground">Aun no hay clientes registrados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="min-w-[920px] w-full text-left text-sm">
          <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Correo</th>
              <th className="px-4 py-3 font-semibold">country_code</th>
              <th className="px-4 py-3 font-semibold">phone_number</th>
              <th className="px-4 py-3 font-semibold">whatsapp_e164</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Registro</th>
              <th className="px-4 py-3 font-semibold">Solicitudes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => (
              <tr className="align-top text-foreground" key={client.id}>
                <td className="px-4 py-4 font-medium">
                  {client.full_name ?? "Cliente sin nombre"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">
                  {client.email ?? "Sin correo"}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{client.country_code}</td>
                <td className="px-4 py-4 text-muted-foreground">{client.phone_number}</td>
                <td className="px-4 py-4 text-muted-foreground">{client.whatsapp_e164}</td>
                <td className="px-4 py-4 text-muted-foreground">{client.status}</td>
                <td className="px-4 py-4 text-muted-foreground">
                  {formatDate(client.created_at)}
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {client.applications_count}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
