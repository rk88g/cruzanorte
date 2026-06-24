import { z } from "zod";

const emptyStringToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalEmailSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().email("Ingresa un correo electronico valido.").max(160).optional()
);

const optionalDateSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ingresa una fecha valida.")
    .optional()
);

const optionalNotesSchema = z.preprocess(
  emptyStringToUndefined,
  z.string().trim().max(2000, "Usa maximo 2000 caracteres.").optional()
);

export const applicationStartSchema = z.object({
  main_contact_name: z
    .string()
    .trim()
    .min(1, "Ingresa tu nombre completo.")
    .max(120, "Usa maximo 120 caracteres."),
  email: optionalEmailSchema,
  origin_country: z
    .string()
    .trim()
    .min(1, "Selecciona el pais donde te encuentras.")
    .max(80, "Usa maximo 80 caracteres."),
  origin_city: z
    .string()
    .trim()
    .min(1, "Ingresa la ciudad donde te encuentras.")
    .max(100, "Usa maximo 100 caracteres."),
  process_reason: z
    .string()
    .trim()
    .min(1, "Selecciona el motivo principal del proceso.")
    .max(120, "Usa maximo 120 caracteres."),
  total_people: z.coerce
    .number({
      invalid_type_error: "Ingresa el numero de personas incluidas."
    })
    .int("Ingresa un numero entero.")
    .min(1, "Debe incluir al menos 1 persona.")
    .max(20, "Por ahora puedes incluir hasta 20 personas."),
  departure_country: z
    .string()
    .trim()
    .min(1, "Selecciona el pais de salida.")
    .max(80, "Usa maximo 80 caracteres."),
  departure_city: z
    .string()
    .trim()
    .min(1, "Ingresa la ciudad de salida.")
    .max(100, "Usa maximo 100 caracteres."),
  desired_date: optionalDateSchema,
  alternative_date: optionalDateSchema,
  notes_public: optionalNotesSchema
});

export type ApplicationStartInput = z.input<typeof applicationStartSchema>;
export type ApplicationStart = z.output<typeof applicationStartSchema>;
