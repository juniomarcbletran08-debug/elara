import Link from "next/link";
export function AdminNavigation(){return <nav className="admin-nav" aria-label="Navegación administrativa"><Link href="/admin/productos">Productos</Link><Link href="/admin/categorias">Categorías</Link><Link href="/admin/pedidos">Pedidos</Link></nav>}
