import Link from "next/link";
import { STORE } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div><Link className="wordmark footer-wordmark" href="/">{STORE.name}</Link><p>Elegancia sin esfuerzo. Estilo con intención.</p></div>
        <div className="footer-links">
          <Link href="/catalogo">Colección</Link>
          <Link href="/pedido/consultar">Consultar pedido</Link>
          <Link href="/preguntas-frecuentes">Preguntas frecuentes</Link>
          <Link href="/envios-y-devoluciones">Envíos y devoluciones</Link>
          <Link href="/politicas-de-privacidad">Privacidad</Link>
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} {STORE.name}. Todos los derechos reservados.</span><span>Lima, Perú · PEN S/</span></div>
    </footer>
  );
}
