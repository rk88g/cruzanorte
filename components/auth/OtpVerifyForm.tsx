"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { OTP_CODE_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { verificationCodeSchema } from "@/validations";

const otpFormSchema = z.object({
  code: verificationCodeSchema
});

type OtpVerifyFormValues = z.infer<typeof otpFormSchema>;

type OtpVerifyFormProps = {
  countryCode: string;
  phoneNumber: string;
  whatsappE164: string;
  expiresAt?: string;
  isResending: boolean;
  onResend: () => Promise<void>;
};

export function OtpVerifyForm({
  countryCode,
  phoneNumber,
  whatsappE164,
  expiresAt,
  isResending,
  onResend
}: OtpVerifyFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<OtpVerifyFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      code: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          country_code: countryCode,
          phone_number: phoneNumber,
          code: values.code
        })
      });
      const result = (await response.json()) as {
        ok: boolean;
        message?: string;
        redirect_to?: string;
      };

      if (!response.ok || !result.ok) {
        setFormError(result.message ?? "No pudimos iniciar sesion. Intenta nuevamente.");
        return;
      }

      window.location.assign(result.redirect_to ?? "/panel");
    } catch {
      setFormError("No pudimos iniciar sesion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Verifica tu codigo</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Ingresa el codigo de {OTP_CODE_LENGTH} digitos enviado a tu WhatsApp.
          </p>
          <p className="mt-2 text-sm font-medium text-foreground">{whatsappE164}</p>
        </div>
      </div>

      {expiresAt ? (
        <p className="mt-4 text-sm text-muted-foreground">
          El codigo vence a las {new Date(expiresAt).toLocaleTimeString("es-MX", {
            hour: "2-digit",
            minute: "2-digit"
          })}
          .
        </p>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="code">
            Codigo de verificacion
          </label>
          <input
            className={cn(
              "mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-center text-lg font-semibold tracking-[0.4em] text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
              errors.code && "border-danger focus:border-danger focus:ring-danger/20"
            )}
            id="code"
            inputMode="numeric"
            maxLength={20}
            pattern="[0-9\\s-]*"
            placeholder="1 2 3 4 5 6"
            {...register("code")}
          />
          {errors.code ? <p className="mt-2 text-sm text-danger">{errors.code.message}</p> : null}
        </div>

        {formError ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {formError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Verificando..." : "Verificar codigo"}
          </button>
          <button
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isResending}
            onClick={() => void onResend()}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {isResending ? "Enviando..." : "Enviar nuevo codigo"}
          </button>
        </div>
      </form>
    </div>
  );
}
