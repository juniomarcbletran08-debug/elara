import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Checkout"};
export default function CheckoutPage(){return <div className="page-shell"><p className="page-kicker">Finaliza tu selección</p><h1 className="page-title">Checkout.</h1><div className="empty-state"><h2>El pago online aún no está habilitado.</h2><p>Antes de cobrar debemos configurar el coste real de envío, validar inventario en el servidor y completar las pruebas de Mercado Pago. Puedes consultar disponibilidad por WhatsApp.</p><Link className="button" href="/contacto">Consultar por WhatsApp ↗</Link></div></div>}
