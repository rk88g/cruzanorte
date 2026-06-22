import { WhatsappAccessPlaceholder } from "@/components/forms/WhatsappAccessPlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";

export default function SignInPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Acceso cliente"
        title="Ingreso por WhatsApp"
        description="El acceso del cliente se realizara con un codigo de verificacion de 6 digitos enviado a un numero WhatsApp con codigo de pais."
      />
      <WhatsappAccessPlaceholder mode="signin" />
    </div>
  );
}
