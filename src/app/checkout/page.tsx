import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
export const metadata:Metadata={title:"Checkout"};
export default function CheckoutPage(){return <div className="page-shell"><p className="page-kicker">Finaliza tu selección</p><h1 className="page-title">Checkout.</h1><p className="page-intro">Revisa tu selección y confirma tus datos. Tu solicitud por WhatsApp queda pendiente hasta que la tienda confirme disponibilidad, envío y total.</p><CheckoutForm/></div>}
