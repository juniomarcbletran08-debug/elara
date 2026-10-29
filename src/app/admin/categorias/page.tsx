import {AdminNavigation} from "@/components/admin-navigation";
import type {Metadata} from "next";
import {AdminCategories} from "@/components/admin-categories";
export const metadata:Metadata={title:"Administrar categorías"};
export default function AdminCategoriesPage(){return <div className="admin-wrap"><AdminNavigation/><p className="page-kicker">Área privada · ÉLARA</p><h1 className="admin-title">Categorías.</h1><p className="admin-muted">Organiza las colecciones del catálogo. Las operaciones se validan en el servidor.</p><AdminCategories/></div>}
