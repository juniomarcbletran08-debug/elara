import type { Metadata } from "next";
import { ProductPanel } from "./product-panel";
export const metadata:Metadata={title:"Administrar productos"};
export default function AdminProductsPage(){return <div className="admin-wrap"><div className="admin-top"><div><p className="page-kicker">Área privada · ÉLARA</p><h1 className="admin-title">Productos.</h1><p className="admin-muted">Crea, publica, edita o archiva artículos. Los precios y estados se validan en el servidor.</p></div></div><ProductPanel/></div>}
