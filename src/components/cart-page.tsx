"use client";
import Link from "next/link";
import {useCart} from "@/components/cart-provider";
import {formatPEN} from "@/lib/format";
export function CartPage(){
 const {items,ready,count,subtotalCents,setQuantity,removeItem}=useCart();
 if(!ready)return <div className="page-shell"><p className="page-kicker">Tu selección</p><h1 className="page-title">Tu bolsa.</h1><p className="page-intro">Cargando tu bolsa…</p></div>;
 return <div className="page-shell"><p className="page-kicker">Tu selección · {count} artículo(s)</p><h1 className="page-title">Tu bolsa.</h1>
 {items.length===0?<div className="empty-state"><h2>Tu bolsa está esperando.</h2><p>Descubre la colección y elige una pieza para empezar.</p><Link className="button" href="/catalogo">Explorar colección ↗</Link></div>:
 <div className="cart-layout"><section className="cart-lines">{items.map(item=><article className="cart-item" key={item.variantId}><Link className="cart-item-image" href={"/producto/"+item.slug}>{item.image?<img src={item.image} alt={item.name}/>:<span className="product-placeholder">ÉLARA</span>}</Link><div className="cart-item-details"><Link href={"/producto/"+item.slug}><h2>{item.name}</h2></Link><p>Talla: {item.size} · Color: {item.color}</p><p>{formatPEN(item.unitPriceCents/100)}</p><div className="cart-item-controls"><label>Cantidad <select aria-label={"Cantidad de "+item.name} value={item.quantity} onChange={e=>setQuantity(item.variantId,Number(e.target.value))}>{Array.from({length:20},(_,i)=>String(i+1)).map(q=><option key={q} value={q}>{q}</option>)}</select></label><button type="button" className="text-button" onClick={()=>removeItem(item.variantId)}>Eliminar</button></div></div><p className="cart-line-total">{formatPEN(item.unitPriceCents*item.quantity/100)}</p></article>)}</section>
 <aside className="cart-summary"><p className="eyebrow">Resumen</p><h2>Tu selección.</h2><div className="summary-row"><span>Subtotal estimado</span><strong>{formatPEN(subtotalCents/100)}</strong></div><p className="summary-note">El precio y la disponibilidad se verificarán de nuevo en el servidor. El coste de envío se confirma según destino.</p><Link className="button" href="/checkout">Continuar al pedido ↗</Link><Link className="continue-shopping" href="/catalogo">Seguir explorando</Link></aside></div>}
 </div>;
}
