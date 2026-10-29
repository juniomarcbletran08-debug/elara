import type { Metadata } from "next";
import { LoginForm } from "./login-form";
export const metadata:Metadata={title:"Acceso administrativo"};
export default function AdminLoginPage(){return <div className="admin-wrap admin-login"><p className="page-kicker">Área privada · ÉLARA</p><h1 className="admin-title">Acceso administrativo.</h1><p className="admin-muted">Inicia sesión para gestionar el catálogo. La sesión usa una cookie HttpOnly y caduca automáticamente.</p><LoginForm/></div>}
