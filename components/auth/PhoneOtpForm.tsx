"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Check, Copy, MessageCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CountryCodeSelect } from "@/components/auth/CountryCodeSelect";
import { OtpVerifyForm } from "@/components/auth/OtpVerifyForm";
import { Alert } from "@/components/ui/Alert";
import { buildWhatsappE164 } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { phoneOtpRequestSchema, type PhoneOtpRequestInput } from "@/validations";

type PhoneOtpFormProps = {
  mode: "register" | "signin";
};

type SendOtpResponse = {
  ok: boolean;
  message?: string;
  expires_at?: string;
  whatsapp_e164?: string;
  test_code?: string;
};

export function PhoneOtpForm({ mode }: PhoneOtpFormProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [otpState, setOtpState] = useState<{
    countryCode: string;
    phoneNumber: string;
    whatsappE164: string;
    expiresAt?: string;
    testCode?: string;
  } | null>(null);
  const [phonePreview, setPhonePreview] = useState({
    countryCode: "+52",
    phoneNumber: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");
  const {
    formState: { errors },
    handleSubmit,
    register
  } = useForm<PhoneOtpRequestInput>({
    resolver: zodResolver(phoneOtpRequestSchema),
    defaultValues: {
      country_code: "+52",
      phone_number: ""
    }
  });

  async function sendOtp(values: PhoneOtpRequestInput) {
    setIsSending(true);
    setFormError(null);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const result = (await response.json()) as SendOtpResponse;

      if (!response.ok || !result.ok || !result.whatsapp_e164) {
        setFormError(result.message ?? "No pudimos iniciar sesion. Intenta nuevamente.");
        return;
      }

      setOtpState({
        countryCode: values.country_code,
        phoneNumber: values.phone_number,
        whatsappE164: result.whatsapp_e164,
        expiresAt: result.expires_at,
        testCode: result.test_code
      });
      setCopyStatus("idle");
    } catch {
      setFormError("No pudimos iniciar sesion. Intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  }

  const onSubmit = handleSubmit(sendOtp);
  const alternateHref = mode === "register" ? "/ingresar" : "/registro";
  const alternateText =
    mode === "register" ? "Ya tengo cuenta. Ingresar" : "Crear registro inicial";

  async function copyTestCode() {
    if (!otpState?.testCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(otpState.testCode);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("idle");
    }
  }

  return (
    <section className="px-5 pb-16 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-premium backdrop-blur-xl">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-background text-primary">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-2xl font-semibold text-foreground">
            Acceso exclusivo por WhatsApp
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Usaremos tu codigo de pais y numero nacional para preparar un proceso guiado,
            sin contrasenas y con seguimiento claro.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
              El telefono se normaliza como WhatsApp internacional.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
              El codigo temporal tiene 6 digitos y vence en 10 minutos.
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
              En esta fase el envio es simulado para pruebas controladas.
            </li>
          </ul>
        </div>

        <div className="space-y-6">
          <form
            className="rounded-2xl border border-border bg-card p-5 shadow-premium backdrop-blur-xl sm:p-6"
            onSubmit={onSubmit}
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-primary">
                <Smartphone className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {mode === "register" ? "Inicia tu registro" : "Ingresa a tu panel"}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Escribe tu numero sin espacios, guiones ni letras.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-[0.95fr_1.3fr]">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="country_code">
                  Codigo de pais
                </label>
                <div className="mt-2">
                  <CountryCodeSelect
                    className={cn(errors.country_code && "border-danger")}
                    id="country_code"
                    {...register("country_code", {
                      onChange: (event) => {
                        setPhonePreview((current) => ({
                          ...current,
                          countryCode: event.target.value
                        }));
                      }
                    })}
                  />
                </div>
                {errors.country_code ? (
                  <p className="mt-2 text-sm text-danger">{errors.country_code.message}</p>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="phone_number">
                  Numero de WhatsApp
                </label>
                <input
                  className={cn(
                    "mt-2 min-h-12 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground shadow-soft outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20",
                    errors.phone_number && "border-danger focus:border-danger focus:ring-danger/20"
                  )}
                  id="phone_number"
                  inputMode="numeric"
                  maxLength={15}
                  pattern="[0-9]*"
                  placeholder="5519876543"
                  {...register("phone_number", {
                    onChange: (event) => {
                      setPhonePreview((current) => ({
                        ...current,
                        phoneNumber: event.target.value
                      }));
                    }
                  })}
                />
                {errors.phone_number ? (
                  <p className="mt-2 text-sm text-danger">{errors.phone_number.message}</p>
                ) : null}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-muted-foreground">
              WhatsApp normalizado:{" "}
              <span className="font-semibold text-foreground">
                {phonePreview.phoneNumber
                  ? buildWhatsappE164(phonePreview.countryCode, phonePreview.phoneNumber)
                  : "pendiente"}
              </span>
            </div>

            {formError ? (
              <div className="mt-5 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {formError}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-premium transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending}
                type="submit"
              >
                {isSending ? "Enviando..." : "Enviar codigo"}
              </button>
              <Link
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-lg border border-border bg-background px-5 py-3 text-center text-sm font-semibold text-foreground shadow-soft transition hover:border-primary"
                href={alternateHref}
              >
                {alternateText}
              </Link>
            </div>
          </form>

          {otpState?.testCode ? (
            <Alert title="Codigo temporal de prueba">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-3xl font-semibold tracking-[0.22em] text-primary">
                    {otpState.testCode}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Este codigo se muestra solo mientras se conecta el envio real por WhatsApp.
                  </p>
                </div>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-soft transition hover:border-primary"
                  onClick={() => void copyTestCode()}
                  type="button"
                >
                  {copyStatus === "copied" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copyStatus === "copied" ? "Copiado" : "Copiar"}
                </button>
              </div>
            </Alert>
          ) : null}

          {otpState ? (
            <OtpVerifyForm
              countryCode={otpState.countryCode}
              expiresAt={otpState.expiresAt}
              isResending={isSending}
              onResend={() =>
                sendOtp({
                  country_code: otpState.countryCode,
                  phone_number: otpState.phoneNumber
                })
              }
              phoneNumber={otpState.phoneNumber}
              whatsappE164={otpState.whatsappE164}
            />
          ) : null}
        </div>
      </div>
    </section>
  );
}
