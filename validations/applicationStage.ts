import { z } from "zod";
import { APPLICATION_STAGES } from "@/lib/constants";
import type { ApplicationStage } from "@/types/database";

const stageValues = APPLICATION_STAGES.map((stage) => stage.slug) as [
  ApplicationStage,
  ...ApplicationStage[]
];

const emptyValueToUndefined = (value: unknown) => {
  if (value === null) {
    return undefined;
  }

  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

export const internalStageUpdateSchema = z.object({
  current_stage: z.enum(stageValues, {
    errorMap: () => ({ message: "Selecciona una etapa valida." })
  }),
  note: z.preprocess(
    emptyValueToUndefined,
    z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
  )
});

export type InternalStageUpdateData = z.output<typeof internalStageUpdateSchema>;
