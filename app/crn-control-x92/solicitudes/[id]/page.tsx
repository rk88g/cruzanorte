import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import { InternalShell } from "@/components/internal/InternalShell";
import { APPLICATION_STAGES } from "@/lib/constants";
import { getInternalApplicationDetail } from "@/lib/internal/queries";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";
import type { ApplicationStatus } from "@/types/database";

type InternalApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de solicitud",
  robots: {
    index: false,
    follow: false
  }
};

const statusLabels: Record<ApplicationStatus, string> = {
  draft: "Borrador",
  active: "Activa",
  in_review: "En revision",
  paused: "Pausada",
  completed: "Completada",
  cancelled: "Cancelada"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getStageLabel(stageSlug: string) {
  return APPLICATION_STAGES.find((stage) => stage.slug === stageSlug)?.label ?? stageSlug;
}

function DetailItem({
  label,
  value
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-foreground">
        {value ?? "Sin dato"}
      </p>
    </div>
  );
}

export default async function InternalApplicationDetailPage({
  params
}: InternalApplicationDetailPageProps) {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const { id } = await params;
  const application = await getInternalApplicationDetail(id);

  if (!application) {
    notFound();
  }

  return (
    <InternalShell
      title="Detalle de solicitud"
      description="Informacion principal de la solicitud en modo solo lectura."
    >
      <div className="space-y-6">
        <Link
          className="inline-flex text-sm font-semibold text-primary transition hover:text-accent"
          href={INTERNAL_ROUTES.applications}
        >
          Volver a solicitudes
        </Link>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">Resumen</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="ID de solicitud" value={application.id} />
            <DetailItem label="Estado" value={statusLabels[application.status]} />
            <DetailItem label="Etapa actual" value={getStageLabel(application.current_stage)} />
            <DetailItem label="Avance" value={`${application.progress}%`} />
            <DetailItem label="Fecha de creacion" value={formatDate(application.created_at)} />
            <DetailItem label="Total de personas" value={application.total_people} />
            <DetailItem label="Pais de origen" value={application.origin_country} />
            <DetailItem label="Ciudad de origen" value={application.origin_city} />
            <DetailItem label="Motivo del proceso" value={application.process_reason} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">Cliente principal</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Nombre"
              value={application.main_contact_name ?? application.client?.full_name}
            />
            <DetailItem label="Correo" value={application.client?.email} />
            <DetailItem label="country_code" value={application.client?.country_code} />
            <DetailItem label="phone_number" value={application.client?.phone_number} />
            <DetailItem label="whatsapp_e164" value={application.client?.whatsapp_e164} />
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">Personas que viajan</h2>
          {application.travelers.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aun no se han agregado personas que viajan.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[980px] w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-3 font-semibold">Nombre</th>
                    <th className="px-3 py-3 font-semibold">Edad</th>
                    <th className="px-3 py-3 font-semibold">Nacionalidad</th>
                    <th className="px-3 py-3 font-semibold">Parentesco</th>
                    <th className="px-3 py-3 font-semibold">country_code</th>
                    <th className="px-3 py-3 font-semibold">phone_number</th>
                    <th className="px-3 py-3 font-semibold">whatsapp_e164</th>
                    <th className="px-3 py-3 font-semibold">Principal</th>
                    <th className="px-3 py-3 font-semibold">Revision Mexico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {application.travelers.map((traveler) => (
                    <tr key={traveler.id}>
                      <td className="px-3 py-3 font-medium text-foreground">
                        {traveler.full_name}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.age ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.nationality ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.relationship ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.country_code ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.phone_number ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.whatsapp_e164 ?? "Sin dato"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.is_main_client ? "Si" : "No"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {traveler.mexico_entry_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl sm:p-6">
          <h2 className="text-xl font-semibold text-foreground">Contacto que recibe</h2>
          {application.receiving_contact ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem label="Nombre" value={application.receiving_contact.full_name} />
              <DetailItem label="Relacion" value={application.receiving_contact.relationship} />
              <DetailItem label="country_code" value={application.receiving_contact.country_code} />
              <DetailItem label="phone_number" value={application.receiving_contact.phone_number} />
              <DetailItem
                label="whatsapp_e164"
                value={application.receiving_contact.whatsapp_e164}
              />
              <DetailItem label="Estado" value={application.receiving_contact.state_name} />
              <DetailItem
                label="Ciudad"
                value={
                  application.receiving_contact.city_other ??
                  application.receiving_contact.city_name
                }
              />
              <DetailItem
                label="Otra ciudad"
                value={application.receiving_contact.city_other}
              />
              <DetailItem
                label="Direccion aproximada"
                value={application.receiving_contact.address_reference}
              />
              <DetailItem label="Notas" value={application.receiving_contact.notes} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              Aun no se ha agregado contacto que recibe.
            </p>
          )}
        </section>

        <ClientProcessTimeline
          currentStage={application.current_stage}
          progress={application.progress}
        />
      </div>
    </InternalShell>
  );
}
