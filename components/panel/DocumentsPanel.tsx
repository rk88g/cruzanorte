import { DocumentRequirementCard } from "@/components/panel/DocumentRequirementCard";
import type {
  ClientDocumentationSummary,
  ClientDocumentRequirement,
  ClientTravelerDocumentSection
} from "@/lib/documents";

type DocumentsPanelProps = {
  applicationId: string;
  generalRequirements: ClientDocumentRequirement[];
  mexicoSections: ClientTravelerDocumentSection[];
  summary: ClientDocumentationSummary;
  travelerSections: ClientTravelerDocumentSection[];
};

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function RequirementGrid({
  applicationId,
  requirements
}: {
  applicationId: string;
  requirements: ClientDocumentRequirement[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {requirements.map((requirement) => (
        <DocumentRequirementCard
          applicationId={applicationId}
          key={requirement.key}
          requirement={requirement}
        />
      ))}
    </div>
  );
}

export function DocumentsPanel({
  applicationId,
  generalRequirements,
  mexicoSections,
  summary,
  travelerSections
}: DocumentsPanelProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Resumen documental
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <SummaryItem label="Requeridos" value={summary.required_total} />
          <SummaryItem label="Pendientes" value={summary.pending_count} />
          <SummaryItem label="Cargados" value={summary.uploaded_count} />
          <SummaryItem label="En revision" value={summary.in_review_count} />
          <SummaryItem label="Aceptados" value={summary.accepted_count} />
          <SummaryItem
            label="Atencion"
            value={summary.rejected_count + summary.replacement_requested_count}
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Solicitud
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            Documentos generales
          </h2>
        </div>
        <RequirementGrid applicationId={applicationId} requirements={generalRequirements} />
      </section>

      {travelerSections.map((section) => (
        <section key={section.traveler.id}>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Persona que viaja
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              {section.traveler.full_name}
            </h2>
          </div>
          <RequirementGrid applicationId={applicationId} requirements={section.requirements} />
        </section>
      ))}

      {mexicoSections.length > 0 ? (
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
              Revision documental
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Entrada a Mexico
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              Estos documentos ayudan a organizar la informacion de personas que requieren
              revision documental adicional.
            </p>
          </div>

          <div className="space-y-6">
            {mexicoSections.map((section) => (
              <div key={section.traveler.id}>
                <h3 className="mb-3 text-lg font-semibold text-foreground">
                  {section.traveler.full_name}
                </h3>
                <RequirementGrid
                  applicationId={applicationId}
                  requirements={section.requirements}
                />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
