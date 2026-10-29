import type { Metadata } from "next";
import Link from "next/link";
export const metadata:Metadata={title:"Administración"};
export default function AdminIndex(){return <div className="page-shell"><p className="page-kicker">Área privada</p><h1 className="page-title">Administración.</h1><p className="page-intro">Accede con la cuenta administrativa configurada para este entorno.</p><Link className="button" href="/admin/login">Entrar al panel ↗</Link></div>}
