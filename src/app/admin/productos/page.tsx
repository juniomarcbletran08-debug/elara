import { AdminNavigation } from "@/components/admin-navigation";
import type { Metadata } from "next";
import { ProductPanel } from "./product-panel";
export const metadata: Metadata = { title: "Subir productos · ÉLARA" };
export default function AdminProductsPage() {
  return <div className="admin-wrap"><AdminNavigation /><div className="admin-top"><div><p className="page-kicker">ÁREA PRIVADA · ÉLARA</p><h1 className="admin-title">Subir productos.</h1><p className="admin-muted">Elige las fotos desde tu computadora, escribe el nombre y el precio, indica cuántas unidades tienes y guarda. El código se crea automáticamente.</p></div></div><ProductPanel /></div>;
}
