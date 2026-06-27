import { APPLICATION_STAGES } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { InternalStageUpdateData } from "@/validations/applicationStage";

export type InternalStageUpdateResult =
  | {
      message: string;
      progress: number;
      status: "updated";
    }
  | {
      message: string;
      status: "not_found";
    };

function getStageConfig(stageSlug: InternalStageUpdateData["current_stage"]) {
  return APPLICATION_STAGES.find((stage) => stage.slug === stageSlug);
}

function buildInternalNote({
  actorEmail,
  note,
  previousNotes,
  previousStage,
  nextStage
}: {
  actorEmail: string;
  note?: string;
  nextStage: string;
  previousNotes: string | null;
  previousStage: string;
}) {
  if (!note?.trim()) {
    return previousNotes;
  }

  const entry = [
    `[${new Date().toISOString()}] Cambio manual de etapa`,
    `Usuario interno: ${actorEmail}`,
    `Etapa anterior: ${previousStage}`,
    `Nueva etapa: ${nextStage}`,
    `Nota: ${note.trim()}`
  ].join("\n");

  return previousNotes ? `${previousNotes}\n\n${entry}` : entry;
}

async function logStageUpdate({
  applicationId,
  actorEmail,
  note,
  pendingPaymentIds,
  previousStage,
  progress,
  stageLabel,
  stageSlug
}: {
  actorEmail: string;
  applicationId: string;
  note?: string;
  pendingPaymentIds: string[];
  previousStage: string;
  progress: number;
  stageLabel: string;
  stageSlug: string;
}) {
  const supabase = createSupabaseAdminClient();

  try {
    await supabase.from("timeline_events").insert({
      application_id: applicationId,
      description: note?.trim() || "Cambio manual desde panel interno.",
      progress_value: progress,
      stage: stageSlug,
      status: "completed",
      title: `Etapa actualizada: ${stageLabel}`,
      visible_to_client: false
    });
  } catch {
    // Timeline events are useful context, but stage updates must remain available.
  }

  try {
    await supabase.from("activity_logs").insert({
      action:
        pendingPaymentIds.length > 0
          ? "stage_advanced_with_pending_blocking_payment"
          : "application_stage_updated",
      application_id: applicationId,
      entity_id: applicationId,
      entity_type: "application",
      metadata: {
        actor_email: actorEmail,
        application_id: applicationId,
        new_stage: stageSlug,
        note: note ?? null,
        pending_payment_ids: pendingPaymentIds,
        previous_stage: previousStage,
        progress,
        stage: stageSlug
      },
      user_id: null
    });
  } catch {
    // Activity logging should not block the internal workflow.
  }
}

export async function updateInternalApplicationStage({
  actorEmail,
  applicationId,
  input
}: {
  actorEmail: string;
  applicationId: string;
  input: InternalStageUpdateData;
}): Promise<InternalStageUpdateResult> {
  const stageConfig = getStageConfig(input.current_stage);

  if (!stageConfig) {
    return {
      status: "not_found",
      message: "No encontramos la etapa seleccionada."
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: application, error: readError } = await supabase
    .from("applications")
    .select("id, current_stage, notes_internal")
    .eq("id", applicationId)
    .maybeSingle();

  if (readError) {
    throw new Error("Could not read application stage.");
  }

  if (!application) {
    return {
      status: "not_found",
      message: "No encontramos la solicitud."
    };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      current_stage: stageConfig.slug,
      notes_internal: buildInternalNote({
        actorEmail,
        note: input.note,
        nextStage: stageConfig.slug,
        previousNotes: application.notes_internal,
        previousStage: application.current_stage
      }),
      progress: stageConfig.progress,
      updated_at: new Date().toISOString()
    })
    .eq("id", applicationId);

  if (error) {
    throw new Error("Could not update application stage.");
  }

  await logStageUpdate({
    actorEmail,
    applicationId,
    note: input.note,
    pendingPaymentIds: input.pending_payment_ids,
    previousStage: application.current_stage,
    progress: stageConfig.progress,
    stageLabel: stageConfig.label,
    stageSlug: stageConfig.slug
  });

  return {
    status: "updated",
    message: "Etapa actualizada.",
    progress: stageConfig.progress
  };
}
