import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/lib/db";
export const metadata:Metadata={title:"Categorías"};
export const dynamic="force-dynamic";
type Category={id:string;name:string;slug:string;description:string};
async function load():Promise<Category[]>{try{const db=await getDb();return (await db.prepare("SELECT id,name,slug,description FROM categories ORDER BY sort_order,name LIMIT 100").all<Category>()).results}catch{return[]}}
export default async function CategoriesPage(){const cats=await load();return <div className="page-shell"><p className="page-kicker">Encuentra tu estilo</p><h1 className="page-title">Categorías.</h1><p className="page-intro">Explora la selección por categoría.</p>{cats.length?<div className="category-list">{cats.map(c=><Link className="category-link" href={"/catalogo?category="+encodeURIComponent(c.slug)} key={c.id}><span><strong>{c.name}</strong><small>{c.description}</small></span><span aria-hidden="true">↗</span></Link>)}</div>:<div className="empty-state"><h2>Las colecciones se están preparando.</h2><p>Las categorías aparecerán cuando el catálogo haya sido configurado.</p><Link className="button" href="/catalogo">Ver colección ↗</Link></div>}</div>}
