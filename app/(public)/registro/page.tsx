import { WhatsappAccessPlaceholder } from "@/components/forms/WhatsappAccessPlaceholder";
import { PageHeader } from "@/components/sections/PageHeader";

export default function RegisterPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Registro"
        title="Registro inicial por WhatsApp"
        description="Este espacio preparara el alta de clientes sin contrasena, usando verificacion por WhatsApp."
      />
      <WhatsappAccessPlaceholder mode="register" />
    </div>
  );
}
