import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProduct, listActiveVariants, type PublicProduct, type PublicVariant } from "@/lib/supabase-public";
import { formatPEN } from "@/lib/format";
import { AddToCart } from "@/components/add-to-cart";

export const metadata: Metadata = { title: "Producto" };
export const dynamic = "force-dynamic";
type Product = PublicProduct;
type Variant = PublicVariant;

async function loadProduct(slug:string):Promise<{product:Product;variants:Variant[]}|null>{
  try{
    const product=await getPublishedProduct(slug);
    if(!product)return null;
    const variants=await listActiveVariants(product.id);
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
