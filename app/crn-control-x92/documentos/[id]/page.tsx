import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { InternalDocumentDetail } from "@/components/internal/InternalDocumentDetail";
import { InternalDocumentStatusActions } from "@/components/internal/InternalDocumentStatusActions";
import { InternalShell } from "@/components/internal/InternalShell";
import { getInternalDocumentDetail } from "@/lib/documents";
import { INTERNAL_ROUTES } from "@/lib/internal/routes";
import { getInternalSession } from "@/lib/internal/session";

type InternalDocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "Detalle de documento",
  robots: {
    index: false,
    follow: false
  }
};

export default async function InternalDocumentDetailPage({
  params
}: InternalDocumentDetailPageProps) {
  const session = await getInternalSession();

  if (!session) {
    redirect(INTERNAL_ROUTES.login);
  }

  const { id } = await params;
  const document = await getInternalDocumentDetail(id);

  if (!document) {
    notFound();
  }

  return (
    <InternalShell
      title="Detalle de documento"
      description="Consulta archivo privado, notas y cambia el estado de revision documental."
    >
      <div className="space-y-6">
        <InternalDocumentDetail document={document} />
        <InternalDocumentStatusActions documentId={document.id} />
      </div>
    </InternalShell>
  );
}
