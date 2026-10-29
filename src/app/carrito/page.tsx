import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bolsa" };

export default function CarritoPage() {
  return (
    <div className="page-shell">
      <p className="page-kicker">Tu selección</p>
      <h1 className="page-title">Tu bolsa.</h1>
      <div className="empty-state">
        <h2>Tu bolsa está esperando.</h2>
        <p>Los productos publicados podrán añadirse aquí. También puedes consultar disponibilidad y preparar una solicitud de pedido por WhatsApp.</p>
        <Link className="button" href="/catalogo">Explorar colección ↗</Link>
      </div>
    </div>
  );
}
