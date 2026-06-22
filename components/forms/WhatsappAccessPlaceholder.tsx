type WhatsappAccessPlaceholderProps = {
  mode: "signin" | "register";
};

export function WhatsappAccessPlaceholder({
  mode
}: WhatsappAccessPlaceholderProps) {
  const title =
    mode === "signin"
      ? "Formulario de acceso pendiente"
      : "Formulario de registro pendiente";

  return (
    <section className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6 lg:px-8">
      <div className="content-shell rounded-lg border border-border bg-card p-6 text-card-foreground shadow-premium backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          En una fase posterior se solicitara el numero WhatsApp con codigo de
          pais y se validara un codigo de 6 digitos. No se utilizara contrasena
          para clientes.
        </p>
      </div>
    </section>
  );
}
