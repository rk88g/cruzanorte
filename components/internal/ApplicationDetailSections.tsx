import Link from "next/link";
import { InternalDateDecisionActions } from "@/components/internal/InternalDateDecisionActions";
import { ClientProcessTimeline } from "@/components/panel/ClientProcessTimeline";
import {
  DOCUMENT_STATUS_LABELS,
  REQUESTED_DATE_STATUS_LABELS
} from "@/lib/constants";
import { getDocumentLabel } from "@/lib/documents";
import { getInternalDocumentDetailRoute } from "@/lib/internal/routes";
import type { InternalApplicationDetail } from "@/lib/internal/queries";

type ApplicationDetailSectionsProps = {
  application: InternalApplicationDetail;
};

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin dato";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00Z`));
}

function InfoItem({
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

function DetailSection({
  children,
  defaultOpen = false,
  id,
  title
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
  id?: string;
  title: string;
}) {
  return (
    <details
      className="rounded-2xl border border-border bg-card p-5 shadow-soft backdrop-blur-xl open:shadow-premium sm:p-6"
      id={id}
      open={defaultOpen}
    >
      <summary className="cursor-pointer text-lg font-semibold text-foreground">{title}</summary>
      <div className="mt-5">{children}</div>
    </details>
  );
}

export function ApplicationDetailSections({ application }: ApplicationDetailSectionsProps) {
  const travelersWithMexicoReview = application.travelers.filter(
    (traveler) => traveler.requires_mexico_entry_review
  );

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Informacion completa
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Secciones colapsables
        </h2>
      </div>

      <DetailSection defaultOpen title="Datos del cliente">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem
            label="Nombre"
            value={application.main_contact_name ?? application.client?.full_name}
          />
          <InfoItem label="Correo" value={application.client?.email} />
          <InfoItem label="country_code" value={application.client?.country_code} />
          <InfoItem label="phone_number" value={application.client?.phone_number} />
          <InfoItem label="whatsapp_e164" value={application.client?.whatsapp_e164} />
          <InfoItem label="Estado de cuenta" value={application.client?.status} />
          <InfoItem label="Fecha de registro" value={formatDate(application.client?.created_at)} />
        </div>
      </DetailSection>

      <DetailSection title="Personas que viajan">
        {application.travelers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aun no se han agregado personas que viajan.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {application.travelers.map((traveler) => (
              <article
                className="rounded-xl border border-border bg-background/60 p-4"
                key={traveler.id}
              >
                <h3 className="text-base font-semibold text-foreground">
                  {traveler.full_name}
                </h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Edad" value={traveler.age} />
                  <InfoItem label="Nacionalidad" value={traveler.nationality} />
                  <InfoItem label="Parentesco" value={traveler.relationship} />
                  <InfoItem label="Principal" value={traveler.is_main_client ? "Si" : "No"} />
                  <InfoItem label="whatsapp_e164" value={traveler.whatsapp_e164} />
                  <InfoItem
                    label="Revision Mexico"
                    value={traveler.requires_mexico_entry_review ? "Requiere revision" : "No aplica"}
                  />
                  <InfoItem label="Estado" value={traveler.mexico_entry_status} />
                </div>
              </article>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Contacto que recibe">
        {application.receiving_contact ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Nombre" value={application.receiving_contact.full_name} />
            <InfoItem label="Relacion" value={application.receiving_contact.relationship} />
            <InfoItem label="whatsapp_e164" value={application.receiving_contact.whatsapp_e164} />
            <InfoItem label="Estado USA" value={application.receiving_contact.state_name} />
            <InfoItem
              label="Ciudad USA"
              value={
                application.receiving_contact.city_other ??
                application.receiving_contact.city_name
              }
            />
            <InfoItem label="Otra ciudad" value={application.receiving_contact.city_other} />
            <InfoItem
              label="Direccion aproximada"
              value={application.receiving_contact.address_reference}
            />
            <InfoItem label="Notas" value={application.receiving_contact.notes} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aun no se ha agregado contacto que recibe.
          </p>
        )}
      </DetailSection>

      <DetailSection
        defaultOpen={application.requested_date_status === "requested"}
        id="fecha"
        title="Fecha solicitada/autorizada"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoItem
            label="Fecha solicitada"
            value={formatDateOnly(application.requested_date?.date)}
          />
          <InfoItem
            label="Estado de fecha"
            value={REQUESTED_DATE_STATUS_LABELS[application.requested_date_status]}
          />
          <InfoItem
            label="Fecha autorizada"
            value={formatDateOnly(application.approved_date?.date)}
          />
          <InfoItem
            label="Ciudad/base"
            value={
              application.approved_date?.location_city ??
              application.requested_date?.location_city
            }
          />
          <InfoItem label="Cupo requerido" value={application.total_people} />
          <InfoItem
            label="Cupo disponible"
            value={application.requested_date?.capacity_available}
          />
          <InfoItem label="Notas de fecha" value={application.requested_date_notes} />
        </div>
        <div className="mt-4 rounded-xl border border-border bg-background/60 p-4">
          <InternalDateDecisionActions
            applicationId={application.id}
            requestedDateStatus={application.requested_date_status}
          />
        </div>
      </DetailSection>

      <DetailSection title="Documentacion">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <InfoItem label="Total documentos" value={application.document_summary.required_total} />
          <InfoItem label="Pendientes" value={application.document_summary.pending_count} />
          <InfoItem label="Cargados" value={application.document_summary.uploaded_count} />
          <InfoItem label="En revision" value={application.document_summary.in_review_count} />
          <InfoItem label="Aceptados" value={application.document_summary.accepted_count} />
          <InfoItem
            label="Rechazados"
            value={
              application.document_summary.rejected_count +
              application.document_summary.replacement_requested_count
            }
          />
        </div>

        {application.documents.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Aun no hay documentos cargados.
          </p>
        ) : (
          <div className="mt-5 grid gap-3">
            {application.documents.map((document) => (
              <article
                className="rounded-xl border border-border bg-background/60 p-4"
                key={document.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {getDocumentLabel(document.document_type)}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {document.file_name ?? "Sin archivo"}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {DOCUMENT_STATUS_LABELS[document.status]}
                  </span>
                </div>
                <div className="mt-3">
                  <Link
                    className="text-sm font-semibold text-primary transition hover:text-accent"
                    href={getInternalDocumentDetailRoute(document.id)}
                  >
                    Ver documento
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Requisitos Mexico">
        {travelersWithMexicoReview.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ningun viajero requiere revision documental de Mexico.
          </p>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {travelersWithMexicoReview.map((traveler) => (
              <article
                className="rounded-xl border border-border bg-background/60 p-4"
                key={traveler.id}
              >
                <h3 className="text-base font-semibold text-foreground">
                  {traveler.full_name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Estado: {traveler.mexico_entry_status}
                </p>
              </article>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Actividad reciente">
        <ClientProcessTimeline
          currentStage={application.current_stage}
          progress={application.progress}
        />
      </DetailSection>
    </section>
  );
}
