"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useCart} from "@/components/cart-provider";
import {formatPEN} from "@/lib/format";
type Item={name:string;variant:string;quantity:number;unitPriceCents:number;lineTotalCents:number};
type Order={orderNumber:string;status:string;paymentStatus:string;currency:string;subtotalCents:number;shippingCents:number;totalCents:number;channel:string;createdAt:string;updatedAt:string;items:Item[]};
const labels:Record<string,string>={pending_payment:"Pago pendiente de confirmación",paid:"Pago confirmado",payment_rejected:"Pago rechazado",cancelled:"Pedido cancelado",payment_setup_failed:"No se pudo iniciar el pago",needs_review:"Pedido en revisión",fulfilled:"Pedido completado"};
export function PaymentResult(){
 const cart=useCart();const [key,setKey]=useState<{orderNumber:string;accessCode:string}|null>(null);const [order,setOrder]=useState<Order|null>(null);const [error,setError]=useState("");const [loading,setLoading]=useState(false);
 useEffect(()=>{try{const raw=sessionStorage.getItem("elara-last-order");if(raw){const data:unknown=JSON.parse(raw);if(data&&typeof data==="object"&&"orderNumber" in data&&"accessCode" in data&&typeof data.orderNumber==="string"&&typeof data.accessCode==="string")setKey({orderNumber:data.orderNumber,accessCode:data.accessCode});}}catch{}},[]);
 async function check(){if(!key)return;setLoading(true);setError("");try{const r=await fetch("/api/orders/lookup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(key),cache:"no-store"});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"No se pudo verificar el estado.");const value=d.order as Order;setOrder(value);if(value.paymentStatus==="approved"){cart.clear();try{sessionStorage.removeItem("elara-last-order")}catch{}}}catch(e){setError(e instanceof Error?e.message:"No se pudo conectar.");}finally{setLoading(false)}}
 useEffect(()=>{if(key)void check();},[key]);
 return <div className="page-shell"><p className="page-kicker">Estado de la operación</p><h1 className="page-title">Gracias por tu pedido.</h1><p className="page-intro">La página de retorno no confirma un pago por sí sola. El estado que mostramos procede de la consulta del pedido registrado en la tienda.</p>
 {!key?<div className="empty-state"><h2>No encontramos una consulta guardada en esta sesión.</h2><p>Usa el número de pedido y el código de consulta que se mostraron al iniciar el pedido para verificar el estado.</p><Link className="button" href="/pedido/consultar">Consultar pedido ↗</Link></div>:
 <div className="order-result"><p className="eyebrow">Pedido {key.orderNumber}</p>{loading&&!order?<h2>Consultando el estado real…</h2>:order?<><h2>{labels[order.status]||order.status.replaceAll("_"," ")}</h2><p className="order-status-note">Estado de pago registrado: <strong>{order.paymentStatus}</strong>. Si sigue pendiente, espera la notificación verificada de Mercado Pago y vuelve a consultar.</p>{order.items.map((i,n)=><div className="summary-row" key={n}><span>{i.name} · {i.variant} × {i.quantity}</span><strong>{formatPEN(i.lineTotalCents/100)}</strong></div>)}<div className="summary-row summary-grand"><span>Total del pedido</span><strong>{formatPEN(order.totalCents/100)}</strong></div></>:<p>El estado todavía no está disponible.</p>}
 {error&&<p className="admin-error" role="alert">{error}</p>}<div className="admin-actions"><button className="button" type="button" onClick={()=>void check()} disabled={loading}>{loading?"Consultando…":"Volver a consultar ↻"}</button><Link className="button" href="/pedido/consultar">Consulta con tu código ↗</Link><Link className="button" href="/catalogo">Volver a la tienda</Link></div></div>}
 </div>
}
