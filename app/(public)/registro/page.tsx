import type { Metadata } from "next";
import { PhoneOtpForm } from "@/components/auth/PhoneOtpForm";
import { PageHeader } from "@/components/sections/PageHeader";

export const metadata: Metadata = {
  title: "Registro por WhatsApp",
  description:
    "Inicia tu registro en Cruza Norte con codigo de pais, numero de WhatsApp y verificacion OTP."
};

export default function RegisterPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Registro"
        title="Registro inicial por WhatsApp"
        description="Crea tu acceso sin contrasena usando un codigo de verificacion temporal de 6 digitos."
      />
      <PhoneOtpForm mode="register" />
    </div>
  );
}
