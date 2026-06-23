import type { Metadata } from "next";
import { PhoneOtpForm } from "@/components/auth/PhoneOtpForm";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = {
  title: "Ingresar por WhatsApp",
  description:
    "Ingresa a tu panel de Cruza Norte con codigo de pais, numero de WhatsApp y verificacion OTP."
};

export default function SignInPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Acceso cliente"
        title="Ingreso por WhatsApp"
        description="Accede a tu panel con un codigo de verificacion de 6 digitos enviado a tu WhatsApp."
      />
      <PhoneOtpForm mode="signin" />
    </div>
  );
}
