import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatPEN } from "@/lib/format";

export const metadata: Metadata = { title: "Producto" };
export const dynamic = "force-dynamic";
type Product = { id:string; name:string; slug:string; description:string; price_cents:number; sale_price_cents:number|null; images_json:string; sku:string };
async function findProduct(slug:string):Promise<Product|null>{
  try {
    const db=await getDb();
    return await db.prepare("SELECT id,name,slug,description,price_cents,sale_price_cents,images_json,sku FROM products WHERE slug=? AND status='published' LIMIT 1").bind(slug).first<Product>();
  } catch { return null; }
}
function parseImages(raw:string):string[]{try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"&&/^https:\/\//.test(x)).slice(0,12):[]}catch{return[]}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const product=await findProduct(slug);
  if(!product)return <div className="page-shell"><p className="page-kicker">Colección ÉLARA</p><h1 className="page-title">Producto no disponible.</h1><p className="page-intro">No encontramos un producto publicado con esa referencia.</p><Link className="button" href="/catalogo">Volver a la colección ↗</Link></div>;
  const images=parseImages(product.images_json);
  const price=product.sale_price_cents??product.price_cents;
  return <div className="page-shell"><p className="page-kicker">Selección ÉLARA</p><div className="product-detail">
    <div className="product-detail-image">{images[0]?<img src={images[0]} alt={product.name}/>:<span className="product-placeholder">ÉLARA</span>}</div>
    <div><h1 className="page-title">{product.name}</h1><p className="product-detail-price">{formatPEN(price/100)}</p><p className="page-intro">{product.description}</p><p className="page-intro">Consulta talla, color y disponibilidad antes de confirmar el pedido.</p><Link className="button" href="/contacto">Consultar disponibilidad ↗</Link><p><Link href="/envios-y-devoluciones">Consulta condiciones de envío y cambios</Link></p></div>
  </div></div>;
}
