import Link from "next/link";
import { STORE } from "@/lib/config";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">Nueva temporada · Lima, Perú</p>
          <h1>Una forma<br />de ser.</h1>
          <p>Una selección de piezas para vestir tu propia historia. Siluetas atemporales, detalles sutiles y una elegancia que se siente tuya.</p>
          <Link className="button button-light" href="/catalogo">Descubrir colección <span aria-hidden="true"> ↗</span></Link>
        </div>
      </section>
      <section className="section" id="seleccion">
        <div className="section-heading">
          <div><p className="eyebrow">Encuentra tu expresión</p><h2>Selección con intención.</h2></div>
          <p>Menos, pero mejor. Inspírate con una mirada a la moda que celebra la individualidad.</p>
        </div>
        <div className="collection-grid">
          <Link className="collection-card" href="/catalogo"><div><h3>Esenciales</h3><span>Descubrir selección ↗</span></div></Link>
          <Link className="collection-card" href="/catalogo"><div><h3>Momentos</h3><span>Explorar piezas ↗</span></div></Link>
        </div>
      </section>
      <section className="statement">
        <p className="eyebrow">El universo {STORE.name}</p>
        <h2>La elegancia no necesita hacer ruido.</h2>
        <p>Diseñado para acompañarte, no para definirte.</p>
      </section>
      <section className="section">
        <div className="section-heading"><div><p className="eyebrow">Una experiencia pensada para ti</p><h2>Detalles que importan.</h2></div></div>
        <div className="benefits">
          <div className="benefit"><div className="symbol">✳</div><h3>Atención personal</h3><p>Te orientamos con tallas, colores y disponibilidad por WhatsApp.</p></div>
          <div className="benefit"><div className="symbol">◇</div><h3>Compra con confianza</h3><p>Información clara sobre precios, pagos y condiciones antes de confirmar.</p></div>
          <div className="benefit"><div className="symbol">⌁</div><h3>Envíos en Perú</h3><p>Consulta la cobertura, los plazos y el coste de entrega antes de comprar.</p></div>
        </div>
      </section>
    </>
  );
}
