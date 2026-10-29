"use client";
import {useState} from "react";
import {useCart} from "@/components/cart-provider";
type Variant={id:string;size:string;color:string;sku:string;stock_on_hand:number;stock_reserved:number;active:number};
export function AddToCart({product}:{product:{id:string;slug:string;name:string;priceCents:number;image:string|null;variants:Variant[]}}){
 const {addItem}=useCart();const available=product.variants.filter(v=>v.active===1&&v.stock_on_hand-v.stock_reserved>0);
 const [variantId,setVariantId]=useState(available[0]?.id||"");const [quantity,setQuantity]=useState("1");const [notice,setNotice]=useState("");
 const selected=available.find(v=>v.id===variantId);const stock=selected?selected.stock_on_hand-selected.stock_reserved:0;
 function add(){setNotice("");const qty=Number(quantity);if(!selected){setNotice("Selecciona una variante disponible.");return;}if(!Number.isInteger(qty)||qty<1||qty>Math.min(20,stock)){setNotice("La cantidad supera el stock disponible.");return;}addItem({productId:product.id,variantId:selected.id,slug:product.slug,name:product.name,sku:selected.sku,size:selected.size,color:selected.color,unitPriceCents:product.priceCents,image:product.image},qty);setNotice("Añadido a tu bolsa.");}
 return <div className="add-cart">
  <div className="admin-field"><label htmlFor="variant">Talla · color</label><select id="variant" value={variantId} onChange={e=>setVariantId(e.target.value)} disabled={available.length===0}><option value="">Seleccionar variante</option>{available.map(v=><option key={v.id} value={v.id}>{v.size} · {v.color} — {v.stock_on_hand-v.stock_reserved} disponibles</option>)}</select></div>
  <div className="admin-field"><label htmlFor="quantity">Cantidad</label><select id="quantity" value={quantity} onChange={e=>setQuantity(e.target.value)}>{Array.from({length:Math.max(1,Math.min(20,stock))},(_,i)=>String(i+1)).map(q=><option key={q} value={q}>{q}</option>)}</select></div>
  <button className="button" type="button" onClick={add} disabled={available.length===0}>{available.length===0?"Sin stock disponible":"Añadir a la bolsa ↗"}</button>
  {notice&&<p role="status" className="cart-notice">{notice}</p>}
 </div>
}
