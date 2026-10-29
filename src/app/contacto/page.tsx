import type { Metadata } from "next";
import { STORE, whatsappUrl } from "@/lib/config";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactoPage() {
  return (
    <div className="page-shell">
      <p className="page-kicker">Estamos para ayudarte</p>
      <h1 className="page-title">Hablemos.</h1>
      <p className="page-intro">¿Necesitas ayuda con una talla, disponibilidad, un envío o tu pedido? Escríbenos y te orientaremos.</p>
      <div className="empty-state">
        <h2>Atención personal</h2>
        <p>WhatsApp comercial: {STORE.whatsappDisplay}. Al abrir WhatsApp podrás revisar y enviar tu mensaje manualmente.</p>
        <a className="button" href={whatsappUrl("Hola, quisiera contactar con " + STORE.name + ".")} target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a>
      </div>
    </div>
  );
}
