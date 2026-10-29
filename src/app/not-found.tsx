import Link from "next/link";
export default function NotFound(){return <div className="page-shell"><p className="page-kicker">404 · Página no encontrada</p><h1 className="page-title">Este no es el camino.</h1><p className="page-intro">La página que buscas no está disponible o ha cambiado de dirección.</p><Link className="button" href="/">Volver al inicio ↗</Link></div>}
