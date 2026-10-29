import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Resultado del pago"};
export default function PaymentResultPage(){return <div className="page-shell"><p className="page-kicker">Estado de la operación</p><h1 className="page-title">Verifica el estado de tu pago.</h1><div className="empty-state"><h2>Esta página no es un comprobante.</h2><p>Una redirección del navegador no confirma que el pago haya sido aprobado. El estado definitivo debe verificarse consultando la operación real de Mercado Pago desde el servidor.</p><Link className="button" href="/">Volver al inicio ↗</Link></div></div>}
