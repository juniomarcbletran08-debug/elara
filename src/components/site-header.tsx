"use client";
import Link from "next/link";
import { STORE } from "@/lib/config";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const cart=useCart();
  return <>
    <div className="announcement">Una nueva mirada al estilo · Envíos en Perú</div>
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label={STORE.name + " inicio"}>{STORE.name}</Link>
      <nav className="main-nav" aria-label="Navegación principal">
        <Link href="/catalogo">Colección</Link><Link href="/categorias">Categorías</Link><a href="/#seleccion">Selección</a><Link href="/contacto">Contacto</Link>
      </nav>
      <Link className="bag-link" href="/carrito" aria-label={"Ver bolsa, "+cart.count+" artículos"}>Bolsa <span>{cart.count>0?"("+cart.count+")":"↗"}</span></Link>
    </header>
  </>;
}
