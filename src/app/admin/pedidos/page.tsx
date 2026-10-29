import {AdminNavigation} from "@/components/admin-navigation";
import type {Metadata} from "next";
import {AdminOrders} from "@/components/admin-orders";
export const metadata:Metadata={title:"Administrar pedidos"};
export default function AdminOrdersPage(){return <div className="admin-wrap"><AdminNavigation/><p className="page-kicker">Área privada · ÉLARA</p><h1 className="admin-title">Pedidos.</h1><p className="admin-muted">Consulta solicitudes, pagos registrados y estados. El administrador no puede marcar manualmente un pago como aprobado.</p><AdminOrders/></div>}
