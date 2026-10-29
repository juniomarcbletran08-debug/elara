"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminVariants } from "@/components/admin-variants";

type Product={id:string;name:string;slug:string;description:string;category_id:string|null;price_cents:number;sale_price_cents:number|null;sku:string;status:"draft"|"published"|"archived";images_json:string};
type CategoryOption={id:string;name:string};
const empty={name:"",description:"",sku:"",price:"",salePrice:"",categoryId:"",images:"",status:"draft"};
function money(cents:number){return new Intl.NumberFormat("es-PE",{style:"currency",currency:"PEN"}).format(cents/100)}
function imageList(raw:string){try{const v:unknown=JSON.parse(raw);return Array.isArray(v)?v.filter((x):x is string=>typeof x==="string"):[]}catch{return[]}}
async function optimizeImage(file:File):Promise<File>{
  try{
    const bitmap=await createImageBitmap(file);
    const scale=Math.min(1,2200/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const ctx=canvas.getContext("2d");
    if(!ctx){bitmap.close();return file;}
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",0.82));
    if(!blob||blob.size>=file.size)return file;
    const base=file.name.replace(/\.[^.]+$/,"")||"producto";
    return new File([blob],base+".webp",{type:"image/webp",lastModified:Date.now()});
  }catch{return file;}
}
export function ProductPanel(){
  const router=useRouter();
  const [products,setProducts]=useState<Product[]>([]);
  const [categories,setCategories]=useState<CategoryOption[]>([]);
  const [form,setForm]=useState(empty);
  const [editing,setEditing]=useState<string|null>(null);
  const [variantProduct,setVariantProduct]=useState<{id:string;name:string}|null>(null);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [loading,setLoading]=useState(true);
  const [uploading,setUploading]=useState(false);
  const [search,setSearch]=useState("");
  const [statusFilter,setStatusFilter]=useState("all");
  async function load(){setLoading(true);try{const res=await fetch("/api/admin/products",{cache:"no-store"});if(res.status===401){router.replace("/admin/login");return;}const data=await res.json();if(!res.ok)throw new Error(data.error||"No se pudo cargar el catálogo.");setProducts(data.products||[]);const catRes=await fetch("/api/admin/categories",{cache:"no-store"});if(catRes.status===401){router.replace("/admin/login");return;}if(catRes.ok){const cats=await catRes.json();setCategories(cats.categories||[]);}}catch(e){setError(e instanceof Error?e.message:"Error de red.");}finally{setLoading(false);}}
  useEffect(()=>{void load();},[]);
  function change(field:keyof typeof empty,value:string){setForm(old=>({...old,[field]:value}));}
  function reset(){setEditing(null);setForm(empty);setError("");}
  function edit(p:Product){const imgs=imageList(p.images_json);setEditing(p.id);setForm({name:p.name,description:p.description,sku:p.sku,price:(p.price_cents/100).toFixed(2),salePrice:p.sale_price_cents===null?"":(p.sale_price_cents/100).toFixed(2),categoryId:p.category_id||"",images:imgs.join("\n"),status:p.status});setError("");setNotice("");window.scrollTo({top:0,behavior:"smooth"});}
  const filteredProducts=useMemo(()=>products.filter(p=>{
    const q=search.trim().toLocaleLowerCase("es");
    const matchesText=!q||[p.name,p.sku,p.slug].some(value=>value.toLocaleLowerCase("es").includes(q));
    return matchesText&&(statusFilter==="all"||p.status===statusFilter);
  }),[products,search,statusFilter]);
  async function uploadFiles(fileList:FileList|null){
    if(!fileList||fileList.length===0)return;
    const selectedFiles=Array.from(fileList);
    setError("");setNotice("");setUploading(true);
    const urls:string[]=[];
    try{
      for(const original of selectedFiles){
        const file=await optimizeImage(original);
        const formData=new FormData();formData.append("file",file);
        const response=await fetch("/api/admin/uploads",{method:"POST",body:formData,cache:"no-store"});
        const data=await response.json().catch(()=>({}));
        if(response.status===401){router.replace("/admin/login");return;}
        if(!response.ok||typeof data.url!=="string")throw new Error(data.error||"No se pudo subir "+file.name+".");
        urls.push(data.url);
      }
      setForm(old=>({...old,images:[...old.images.split(/\\n|,/).map(v=>v.trim()).filter(Boolean),...urls].join("\\n")}));
      setNotice("Imagen(es) subida(s) a R2. Guarda el producto para asociarlas.");
    }catch(e){setError(e instanceof Error?e.message:"Error de carga.");}
    finally{setUploading(false);}
  }
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");setNotice("");
    const price=Number(form.price);const sale=form.salePrice.trim()===""?null:Number(form.salePrice);
    if(!Number.isFinite(price)||price<0){setError("Introduce un precio válido en soles.");return;}
    if(sale!==null&&(!Number.isFinite(sale)||sale<0||sale>=price)){setError("La promoción debe ser menor que el precio normal.");return;}
    const payload={name:form.name,description:form.description,sku:form.sku,priceCents:Math.round(price*100),salePriceCents:sale===null?null:Math.round(sale*100),categoryId:form.categoryId||null,images:form.images.split(/\n|,/).map(x=>x.trim()).filter(Boolean),status:form.status};
    try{
      const res=await fetch(editing?"/api/admin/products/"+encodeURIComponent(editing):"/api/admin/products",{method:editing?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});
      const data=await res.json().catch(()=>({}));
      if(res.status===401){router.replace("/admin/login");return;}
      if(!res.ok)throw new Error(data.error||"No se pudo guardar el producto.");
      setNotice(editing?"Producto actualizado.":"Producto creado.");reset();await load();
    }catch(e){setError(e instanceof Error?e.message:"Error de red.");}
  }
  async function remove(p:Product){if(!window.confirm("¿Archivar o eliminar de catálogo “"+p.name+"”?"))return;setError("");setNotice("");try{const res=await fetch("/api/admin/products/"+encodeURIComponent(p.id),{method:"DELETE"});const data=await res.json().catch(()=>({}));if(res.status===401){router.replace("/admin/login");return;}if(!res.ok)throw new Error(data.error||"No se pudo eliminar.");setProducts(old=>data.archived?old.map(v=>v.id===p.id?{...v,status:"archived" as const}:v):old.filter(v=>v.id!==p.id));setNotice(data.archived?"Producto archivado para preservar su historial de pedidos o stock reservado.":"Producto eliminado del catálogo.");if(editing===p.id)reset();}catch(e){setError(e instanceof Error?e.message:"Error de red.");}}
  async function logout(){await fetch("/api/admin/session",{method:"DELETE"}).catch(()=>undefined);router.replace("/admin/login");router.refresh();}
  return <>
    <div className="admin-actions"><button className="button" type="button" onClick={logout}>Cerrar sesión</button><button className="button" type="button" onClick={()=>{reset();window.scrollTo({top:0,behavior:"smooth"});}}>Nuevo producto +</button></div>
    <form className="admin-panel admin-form" onSubmit={submit}>
      <h2 className="admin-title admin-full" style={{fontSize:30}}>{editing?"Editar producto":"Crear producto"}</h2>
      <div className="admin-field"><label htmlFor="name">Nombre</label><input id="name" value={form.name} onChange={e=>change("name",e.target.value)} minLength={2} maxLength={140} required/></div>
      <div className="admin-field"><label htmlFor="sku">SKU (único)</label><input id="sku" value={form.sku} onChange={e=>change("sku",e.target.value)} minLength={2} maxLength={64} pattern="[A-Za-z0-9_-]+" required/></div>
      <div className="admin-field"><label htmlFor="price">Precio normal (S/)</label><input id="price" type="number" min="0" step="0.01" value={form.price} onChange={e=>change("price",e.target.value)} required/></div>
      <div className="admin-field"><label htmlFor="sale">Precio promocional (S/)</label><input id="sale" type="number" min="0" step="0.01" value={form.salePrice} onChange={e=>change("salePrice",e.target.value)} placeholder="Opcional"/></div>
      <div className="admin-field"><label htmlFor="category">Categoría (opcional)</label><select id="category" value={form.categoryId} onChange={e=>change("categoryId",e.target.value)}><option value="">Sin categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div className="admin-field"><label htmlFor="status">Publicación</label><select id="status" value={form.status} onChange={e=>change("status",e.target.value)}><option value="draft">Borrador</option><option value="published" disabled={!editing}>Publicado (configura variantes primero)</option>{editing&&<option value="archived">Archivado</option>}</select></div>
      <div className="admin-field admin-full"><label htmlFor="description">Descripción</label><textarea id="description" value={form.description} onChange={e=>change("description",e.target.value)} maxLength={5000}/></div>
      <div className="admin-field admin-full"><label htmlFor="images">Imágenes (URL HTTPS, una por línea)</label><textarea id="images" value={form.images} onChange={e=>change("images",e.target.value)} placeholder="https://..."/></div>
      <div className="admin-field admin-full"><label htmlFor="image-files">FOTOGRAFÍAS DEL PRODUCTO</label><label className="upload-dropzone" htmlFor="image-files"><span className="upload-dropzone-icon" aria-hidden="true">↑</span><strong>{uploading?"Subiendo tus fotografías…":"Añade imágenes a tu colección"}</strong><small>Selecciona uno o varios archivos · JPEG, PNG, WebP o AVIF · máximo 8 MB por imagen</small><input id="image-files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading} onChange={e=>{void uploadFiles(e.target.files);e.currentTarget.value="";}}/></label><p className="admin-muted">{uploading?"La carga está en curso; no cierres esta pantalla.":"Las imágenes se guardan en el almacenamiento actual. Después, guarda el producto para asociarlas."}</p>{form.images.trim()&&<div className="upload-preview-grid">{form.images.split(/\r?\n|,/).map(v=>v.trim()).filter(v=>/^https:\/\//i.test(v)).map((url,i)=><figure className="upload-preview" key={url+i}><img src={url} alt={"Vista previa de producto "+(i+1)} loading="lazy"/><figcaption>Imagen {i+1} · lista para guardar</figcaption></figure>)}</div>}</div>
      {error&&<p className="admin-error admin-full" role="alert">{error}</p>}
      {notice&&<p className="admin-success admin-full" role="status">{notice}</p>}
      <div className="admin-actions admin-full"><button className="button" type="submit">{editing?"Guardar cambios":"Crear producto"}</button>{editing&&<button className="button" type="button" onClick={reset}>Cancelar edición</button>}</div>
    </form>
    {variantProduct&&<AdminVariants productId={variantProduct.id} productName={variantProduct.name} onClose={()=>setVariantProduct(null)}/>}
    <section className="admin-panel"><div className="admin-top"><p className="admin-muted">TU SELECCIÓN</p><h2 className="admin-title" style={{fontSize:30}}>Catálogo</h2><p className="admin-muted">Gestiona tus piezas, fotografías y estados desde un solo lugar.</p></div><div className="admin-toolbar"><label className="admin-search"><span className="sr-only">Buscar productos</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nombre, SKU o referencia…"/></label><label className="admin-muted">Estado <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} aria-label="Filtrar por estado"><option value="all">Todos</option><option value="published">Publicados</option><option value="draft">Borradores</option><option value="archived">Archivados</option></select></label></div>{loading?<p className="admin-muted">Cargando productos…</p>:products.length===0?<div className="empty-state"><h2>Aún no hay piezas en tu catálogo</h2><p>Crea el primer producto, añade sus fotografías y configura las variantes antes de publicarlo.</p></div>:filteredProducts.length===0?<div className="empty-state"><h2>No encontramos coincidencias</h2><p>Prueba con otro nombre, SKU o estado.</p><button className="button" type="button" onClick={()=>{setSearch("");setStatusFilter("all");}}>Limpiar filtros</button></div>:<div className="admin-products">{filteredProducts.map(p=>{const image=imageList(p.images_json)[0];return <article className="admin-product" key={p.id}><div className="admin-product-main"><div className="admin-product-media">{image?<img src={image} alt={p.name} loading="lazy"/>:<span>ÉLARA</span>}</div><div className="admin-product-copy"><span className="admin-tag">{p.status==="published"?"Publicado":p.status==="archived"?"Archivado":"Borrador"}</span><h3>{p.name}</h3><p>SKU: {p.sku} · {money(p.sale_price_cents??p.price_cents)}</p><p>{p.slug}</p></div></div><div className="admin-actions"><button className="button" type="button" onClick={()=>edit(p)}>Editar</button><button className="button" type="button" onClick={()=>setVariantProduct({id:p.id,name:p.name})}>Inventario</button><button className="button" type="button" onClick={()=>void remove(p)}>Archivar / eliminar</button></div></article>})}</div>}<p className="admin-muted" style={{marginTop:20}}>{filteredProducts.length} de {products.length} productos</p></section>
  </>;
}
