import Link from "next/link";
import { STORE } from "@/lib/config";

export function SiteHeader() {
  return (
    <>
      <div className="announcement">Una nueva mirada al estilo · Envíos en Perú</div>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label={STORE.name + " inicio"}>{STORE.name}</Link>
        <nav className="main-nav" aria-label="Navegación principal">
          <Link href="/catalogo">Colección</Link>
          <a href="/#seleccion">Selección</a>
          <Link href="/contacto">Contacto</Link>
        </nav>
        <Link className="bag-link" href="/carrito" aria-label="Ver carrito">Bolsa <span>↗</span></Link>
      </header>
    </>
  );
}
