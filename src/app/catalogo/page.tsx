import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedProducts, type PublicProduct } from "@/lib/supabase-public";
import { formatPEN } from "@/lib/format";

export const metadata: Metadata = { title: "Colección" };
export const dynamic = "force-dynamic";
type Product = Pick<PublicProduct,"id"|"name"|"slug"|"description"|"price_cents"|"sale_price_cents"|"images_json">;

async function getProducts(category?: string): Promise<Product[]> {
  try {
    return await listPublishedProducts(category);
  } catch {
    return [];
  }
}
function imageOf(raw:string):string {
  try { const v:unknown=JSON.parse(raw); if(Array.isArray(v)&&typeof v[0]==="string"&&/^https:\/\//.test(v[0]))return v[0]; } catch {}
  return "";
}
export default async function CatalogoPage({searchParams}:{searchParams:Promise<{category?:string|string[]}>}) {
  const params=await searchParams;
  const category=Array.isArray(params.category)?params.category[0]:params.category;
  const products=await getProducts(category);
  return <div className="page-shell">
    <p className="page-kicker">El universo ÉLARA</p>
    <h1 className="page-title">La colección.</h1>
    <p className="page-intro">{category?"Explora las piezas de esta categoría.":"Piezas seleccionadas con una mirada contemporánea. Los precios se muestran en soles peruanos."}</p>
    {products.length ? <div className="product-grid">{products.map(p=>{
      const image=imageOf(p.images_json);const price=p.sale_price_cents??p.price_cents;
      return <article className="product-card" key={p.id}><Link href={"/producto/"+encodeURIComponent(p.slug)} className="product-image">{image?<img src={image} alt={p.name} loading="lazy"/>:<span className="product-placeholder">ÉLARA</span>}</Link><div className="product-info"><Link href={"/producto/"+encodeURIComponent(p.slug)}><h2>{p.name}</h2></Link><p>{formatPEN(price/100)}</p></div></article>;
    })}</div> : <div className="empty-state"><h2>Estamos preparando la selección.</h2><p>El catálogo aparece aquí cuando se publiquen productos reales. Mientras tanto, consulta disponibilidad directamente con nosotros.</p><Link className="button" href="/contacto">Consultar por WhatsApp ↗</Link></div>}
  </div>;
}
