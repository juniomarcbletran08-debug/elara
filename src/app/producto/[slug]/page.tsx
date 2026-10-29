import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { formatPEN } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";

export const metadata: Metadata = { title: "Producto" };
export const dynamic = "force-dynamic";
type Product = { id:string; name:string; slug:string; description:string; price_cents:number; sale_price_cents:number|null; images_json:string; sku:string };
type Variant = {id:string;size:string;color:string;sku:string;stock_on_hand:number;stock_reserved:number;active:number};
async function loadProduct(slug:string):Promise<{product:Product;variants:Variant[]}|null>{
  try{
    const db=await getDb();
    const product=await db.prepare("SELECT id,name,slug,description,price_cents,sale_price_cents,images_json,sku FROM products WHERE slug=? AND status='published' LIMIT 1").bind(slug).first<Product>();
    if(!product)return null;
    const variants=(await db.prepare("SELECT id,size,color,sku,stock_on_hand,stock_reserved,active FROM product_variants WHERE product_id=? ORDER BY size,color").bind(product.id).all<Variant>()).results;
    return {product,variants};
  }catch{return null}
}
function parseImages(raw:string):string[]{try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"&&/^https:\/\//.test(x)).slice(0,12):[]}catch{return[]}}
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const data=await loadProduct(slug);
  if(!data)return <div className="page-shell"><p className="page-kicker">Colección ÉLARA</p><h1 className="page-title">Producto no disponible.</h1><p className="page-intro">No encontramos un producto publicado con esa referencia.</p><Link className="button" href="/catalogo">Volver a la colección ↗</Link></div>;
  const {product,variants}=data;const images=parseImages(product.images_json);const price=product.sale_price_cents??product.price_cents;
  return <div className="page-shell"><p className="page-kicker">Selección ÉLARA</p><div className="product-detail">
    <div className="product-detail-gallery"><div className="product-detail-image">{images[0]?<img src={images[0]} alt={product.name}/>:<span className="product-placeholder">ÉLARA</span>}</div>{images.length>1&&<div className="product-thumbs">{images.slice(1).map((image,i)=><img src={image} alt={product.name+" — vista "+(i+2)} key={image+i}/>)}</div>}</div>
    <div className="product-detail-copy"><h1 className="page-title">{product.name}</h1><p className="product-detail-price">{formatPEN(price/100)}</p><p className="product-detail-sku">SKU · {product.sku}</p><p className="product-detail-description">{product.description}</p><AddToCart product={{id:product.id,slug:product.slug,name:product.name,priceCents:price,image:images[0]||null,variants}}/><p><Link href="/envios-y-devoluciones">Consulta condiciones de envío y cambios</Link></p></div>
  </div></div>;
}
