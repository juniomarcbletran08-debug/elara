import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatPEN } from "@/lib/format";

export const metadata: Metadata = { title: "Colección" };
export const dynamic = "force-dynamic";

type Product = { id:string; name:string; slug:string; description:string; price_cents:number; sale_price_cents:number|null; images_json:string };

async function getProducts(): Promise<Product[]> {
  try {
    const db = await getDb();
    const result = await db.prepare("SELECT id,name,slug,description,price_cents,sale_price_cents,images_json FROM products WHERE status='published' ORDER BY created_at DESC LIMIT 100").all<Product>();
    return result.results;
  } catch { return []; }
}
function imageOf(raw:string): string {
  try { const v:unknown=JSON.parse(raw); if(Array.isArray(v)&&typeof v[0]==="string"&&/^https:\/\//.test(v[0])) return v[0]; } catch {}
  return "";
}
export default async function CatalogoPage() {
  const products = await getProducts();
  return <div className="page-shell">
    <p className="page-kicker">El universo ÉLARA</p>
    <h1 className="page-title">La colección.</h1>
    <p className="page-intro">Piezas seleccionadas con una mirada contemporánea. Los precios se muestran en soles peruanos.</p>
    {products.length ? <div className="product-grid">{products.map(p => {
      const image = imageOf(p.images_json);
      const price = p.sale_price_cents ?? p.price_cents;
      return <article className="product-card" key={p.id}>
        <Link href={"/producto/" + encodeURIComponent(p.slug)} className="product-image">{image ? <img src={image} alt={p.name} loading="lazy" /> : <span className="product-placeholder">ÉLARA</span>}</Link>
        <div className="product-info"><Link href={"/producto/" + encodeURIComponent(p.slug)}><h2>{p.name}</h2></Link><p>{formatPEN(price / 100)}</p></div>
      </article>;
    })}</div> : <div className="empty-state"><h2>Estamos preparando la selección.</h2><p>El catálogo aparecerá cuando el administrador publique los productos reales. Mientras tanto, consulta disponibilidad directamente con nosotros.</p><Link className="button" href="/contacto">Consultar por WhatsApp ↗</Link></div>}
  </div>;
}
