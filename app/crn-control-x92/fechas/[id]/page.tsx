import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AvailableDateForm } from "@/components/forms/AvailableDateForm";
import { InternalDateDetail } from "@/components/internal/InternalDateDetail";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalAvailableDateDetail } from "@/lib/availableDates";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

type InternalDateDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de fecha",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalDateDetailPage({
  params
}: InternalDateDetailPageProps) {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const { id } = await params;
  const date = await getInternalAvailableDateDetail(id);

  if (!date) {
    notFound();
  }

  return (
    <InternalShell
      title="Detalle de fecha"
      description="Consulta cupos, solicitudes relacionadas y acciones de autorizacion de fecha."
    >
      <div className="space-y-6">
        <InternalDateDetail date={date} />

        <section id="editar">
          <AvailableDateForm availableDate={date} mode="edit" />
        </section>
      </div>
    </InternalShell>
  );
}
