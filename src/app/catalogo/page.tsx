import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Colección" };

export default function CatalogoPage() {
  return (
    <div className="page-shell">
      <p className="page-kicker">El universo ÉLARA</p>
      <h1 className="page-title">La colección.</h1>
      <p className="page-intro">Piezas seleccionadas con una mirada contemporánea. El catálogo se mostrará aquí cuando el administrador publique los productos reales y su disponibilidad.</p>
      <div className="empty-state">
        <h2>Estamos preparando la selección.</h2>
        <p>Para consultar las piezas disponibles, tallas o colores, escríbenos directamente. Te atenderemos de forma personal.</p>
        <Link className="button" href="/contacto">Consultar por WhatsApp ↗</Link>
      </div>
    </div>
  );
}
