import type {Metadata} from "next";
import {OrderLookup} from "@/components/order-lookup";
export const metadata:Metadata={title:"Consultar pedido"};
export default function OrderLookupPage(){return <div className="page-shell"><p className="page-kicker">Seguimiento</p><h1 className="page-title">Consulta tu pedido.</h1><p className="page-intro">Introduce el número de pedido y el código de consulta que recibiste al registrar la solicitud. No compartas este código con otras personas.</p><OrderLookup/></div>}
