"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminVariants } from "@/components/admin-variants";

type Product = { id: string; name: string; slug: string; description: string; category_id: string | null; price_cents: number; sale_price_cents: number | null; sku: string; status: "draft" | "published" | "archived"; images_json: string };
type CategoryOption = { id: string; name: string };
const empty = { name: "", description: "", sku: "", price: "", salePrice: "", categoryId: "", images: "", status: "draft", size: "Única", color: "Único", stock: "0", publishNow: false };
function money(cents: number) { return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(cents / 100); }
function imageList(raw: string) { try { const v: unknown = JSON.parse(raw); return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []; } catch { return []; } }
function makeSku(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "PRODUCTO";
  return "ELA-" + base + "-" + Date.now().toString(36).toUpperCase();
}
async function optimizeImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); return file; }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.82));
    if (!blob || blob.size >= file.size) return file;
    const base = file.name.replace(/\.[^.]+$/, "") || "producto";
    return new File([blob], base + ".webp", { type: "image/webp", lastModified: Date.now() });
  } catch { return file; }
}
export function ProductPanel() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [variantProduct, setVariantProduct] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const filePicker = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cargar el catálogo.");
      setProducts(data.products || []);
      const catRes = await fetch("/api/admin/categories", { cache: "no-store" });
      if (catRes.status === 401) { router.replace("/admin/login"); return; }
      if (catRes.ok) { const cats = await catRes.json(); setCategories(cats.categories || []); }
    } catch (e) { setError(e instanceof Error ? e.message : "Error de red."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  function change(field: "name" | "description" | "sku" | "price" | "salePrice" | "categoryId" | "images" | "status" | "size" | "color" | "stock", value: string) {
    setForm(old => ({ ...old, [field]: value }));
  }
  function reset() { setEditing(null); setForm(empty); setError(""); setNotice(""); }
  function edit(p: Product) {
    const imgs = imageList(p.images_json);
    setEditing(p.id);
    setForm({ ...empty, name: p.name, description: p.description, sku: p.sku, price: (p.price_cents / 100).toFixed(2), salePrice: p.sale_price_cents === null ? "" : (p.sale_price_cents / 100).toFixed(2), categoryId: p.category_id || "", images: imgs.join("\n"), status: p.status, publishNow: p.status === "published" });
    setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const filteredProducts = useMemo(() => products.filter(p => {
    const q = search.trim().toLocaleLowerCase("es");
    const matchesText = !q || [p.name, p.sku, p.slug].some(value => value.toLocaleLowerCase("es").includes(q));
    return matchesText && (statusFilter === "all" || p.status === statusFilter);
  }), [products, search, statusFilter]);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const selectedFiles = Array.from(fileList);
    const currentCount = form.images.split(/\n|,/).map(v => v.trim()).filter(Boolean).length;
    if (currentCount + selectedFiles.length > 12) { setError("Puedes añadir hasta 12 fotos por producto."); return; }
    setError(""); setNotice(""); setUploading(true);
    const urls: string[] = [];
    try {
      for (const original of selectedFiles) {
        const file = await optimizeImage(original);
        const formData = new FormData(); formData.append("file", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body: formData, cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) { router.replace("/admin/login"); return; }
        if (!response.ok || typeof data.url !== "string") throw new Error(data.error || "No se pudo subir " + file.name + ".");
        urls.push(data.url);
      }
      setForm(old => ({ ...old, images: [...old.images.split(/\n|,/).map(v => v.trim()).filter(Boolean), ...urls].join("\n") }));
      setNotice(urls.length === 1 ? "Foto subida correctamente." : urls.length + " fotos subidas correctamente.");
    } catch (e) { setError(e instanceof Error ? e.message : "Error de carga."); }
    finally { setUploading(false); }
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(""); setNotice("");
    const price = Number(form.price);
    const sale = form.salePrice.trim() === "" ? null : Number(form.salePrice);
    const stock = Number(form.stock);
    if (!Number.isFinite(price) || price < 0) { setError("Escribe un precio válido en soles."); return; }
    if (sale !== null && (!Number.isFinite(sale) || sale < 0 || sale >= price)) { setError("El precio de oferta debe ser menor al precio normal."); return; }
    if (!editing && (!Number.isSafeInteger(stock) || stock < 0 || stock > 100000)) { setError("Escribe una cantidad de stock válida."); return; }
    const images = form.images.split(/\n|,/).map(x => x.trim()).filter(Boolean);
    if (form.publishNow && images.length === 0) { setError("Para publicar, primero añade al menos una foto."); return; }
    if (form.publishNow && !form.categoryId) { setError("Elige una categoría antes de publicar."); return; }
    if (form.publishNow && !editing && stock < 1) { setError("Para publicar, el stock debe ser al menos 1 unidad."); return; }
    const sku = form.sku.trim() || makeSku(form.name);
    const status = form.publishNow ? "published" : (form.status === "archived" ? "archived" : "draft");
    const payload = { name: form.name.trim(), description: form.description.trim(), sku, priceCents: Math.round(price * 100), salePriceCents: sale === null ? null : Math.round(sale * 100), categoryId: form.categoryId || null, images, status };
    try {
      let productId = editing;
      if (editing) {
        const res = await fetch("/api/admin/products/" + encodeURIComponent(editing), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) { router.replace("/admin/login"); return; }
        if (!res.ok) throw new Error(data.error || "No se pudo guardar el producto.");
      } else {
        const res = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, status: "draft" }), cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) { router.replace("/admin/login"); return; }
        if (!res.ok || typeof data.product?.id !== "string") throw new Error(data.error || "No se pudo crear el producto.");
        const createdProductId: string = data.product.id;
        productId = createdProductId;
        const variantSku = sku.slice(0, 52) + "-V-" + Date.now().toString(36).toUpperCase();
        const variantRes = await fetch("/api/admin/products/" + encodeURIComponent(createdProductId) + "/variants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ size: form.size.trim() || "Única", color: form.color.trim() || "Único", sku: variantSku, stock, active: true }), cache: "no-store" });
        const variantData = await variantRes.json().catch(() => ({}));
        if (variantRes.status === 401) { router.replace("/admin/login"); return; }
        if (!variantRes.ok) {
          setEditing(createdProductId); setForm(old => ({ ...old, sku, publishNow: false }));
          setError("El producto se guardó, pero falta registrar el stock. En el catálogo, pulsa «Tallas y stock» para terminarlo. " + (variantData.error || ""));
          await load(); return;
        }
        if (form.publishNow) {
          const publishRes = await fetch("/api/admin/products/" + encodeURIComponent(createdProductId) , { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...payload, status: "published" }), cache: "no-store" });
          const publishData = await publishRes.json().catch(() => ({}));
          if (publishRes.status === 401) { router.replace("/admin/login"); return; }
          if (!publishRes.ok) {
            setEditing(createdProductId); setForm(old => ({ ...old, sku, publishNow: false, status: "draft" }));
            setError("El producto y el stock se guardaron como borrador, pero no se pudo publicar: " + (publishData.error || "revisa los datos."));
            await load(); return;
          }
        }
      }
      setEditing(null); setForm(empty);
      setNotice(form.publishNow ? "¡Producto guardado y publicado en la tienda!" : (editing ? "Producto actualizado." : "Producto guardado como borrador. Puedes publicarlo marcando «Mostrar en la tienda al guardar»."));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Error de red."); }
  }

  async function remove(p: Product) {
    if (!window.confirm("¿Archivar o eliminar de catálogo “" + p.name + "”?")) return;
    setError(""); setNotice("");
    try {
      const res = await fetch("/api/admin/products/" + encodeURIComponent(p.id), { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { router.replace("/admin/login"); return; }
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar.");
      setProducts(old => data.archived ? old.map(v => v.id === p.id ? { ...v, status: "archived" as const } : v) : old.filter(v => v.id !== p.id));
      setNotice(data.archived ? "Producto archivado para preservar su historial de pedidos o stock reservado." : "Producto eliminado del catálogo.");
      if (editing === p.id) reset();
    } catch (e) { setError(e instanceof Error ? e.message : "Error de red."); }
  }
  async function logout() { await fetch("/api/admin/session", { method: "DELETE" }).catch(() => undefined); router.replace("/admin/login"); router.refresh(); }

  return <>
    <div className="admin-actions"><button className="button" type="button" onClick={logout}>Cerrar sesión</button><button className="button" type="button" onClick={() => { reset(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>+ Añadir producto</button></div>
    <form className="admin-panel admin-form quick-product-form" onSubmit={submit}>
      <div className="admin-full quick-upload-head">
        <p className="page-kicker">CARGA RÁPIDA</p>
        <h2 className="admin-title" style={{ fontSize: 30 }}>{editing ? "Editar producto" : "Añadir un producto"}</h2>
        <p className="admin-muted">Solo completa lo esencial, elige tus fotos y guarda. El código del producto se genera automáticamente.</p>
      </div>
      <div className="admin-field"><label htmlFor="name">Nombre del producto *</label><input id="name" value={form.name} onChange={e => change("name", e.target.value)} minLength={2} maxLength={140} placeholder="Ej. Vestido floral" required /></div>
      <div className="admin-field"><label htmlFor="price">Precio en soles (S/) *</label><input id="price" type="number" min="0" step="0.01" value={form.price} onChange={e => change("price", e.target.value)} placeholder="89.90" required /></div>
      <div className="admin-field"><label htmlFor="category">Categoría</label><select id="category" value={form.categoryId} onChange={e => change("categoryId", e.target.value)}><option value="">Elegir categoría</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      {!editing && <div className="admin-field"><label htmlFor="stock">Cantidad disponible *</label><input id="stock" type="number" min="0" max="100000" step="1" value={form.stock} onChange={e => change("stock", e.target.value)} required /><small className="admin-muted">¿Cuántas unidades tienes?</small></div>}
      {!editing && <div className="admin-field"><label htmlFor="size">Talla inicial</label><input id="size" value={form.size} onChange={e => change("size", e.target.value)} maxLength={60} placeholder="Única, S, M, L..." required /></div>}
      {!editing && <div className="admin-field"><label htmlFor="color">Color inicial</label><input id="color" value={form.color} onChange={e => change("color", e.target.value)} maxLength={60} placeholder="Único, negro, beige..." required /></div>}
      <div className="admin-field admin-full">
        <label>Fotos del producto *</label>
        <div className="upload-dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void uploadFiles(e.dataTransfer.files); }}>
          <span className="upload-dropzone-icon" aria-hidden="true">↑</span>
          <strong>{uploading ? "Subiendo tus fotos…" : "Arrastra tus fotos aquí"}</strong>
          <small>O selecciona varias desde tu computadora · JPEG, PNG, WebP o AVIF · máximo 8 MB por foto</small>
          <button className="button" type="button" onClick={() => filePicker.current?.click()} disabled={uploading}>{uploading ? "Subiendo fotos…" : "Elegir fotos"}</button>
          <input ref={filePicker} id="image-files" type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading} style={{ position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }} onChange={e => { const input = e.currentTarget; const files = input.files; void uploadFiles(files); input.value = ""; }} />
        </div>
        <p className="admin-muted">{uploading ? "No cierres esta pantalla mientras se suben las fotos." : "Las fotos se guardan automáticamente al subirlas; al guardar el producto quedarán asociadas."}</p>
        {form.images.trim() && <div className="upload-preview-grid">{form.images.split(/\r?\n|,/).map(v => v.trim()).filter(v => /^https:\/\//i.test(v)).map((url, i) => <figure className="upload-preview" key={url + i}><img src={url} alt={"Vista previa " + (i + 1)} loading="lazy" /><figcaption>Foto {i + 1}</figcaption><button type="button" className="upload-remove" onClick={() => { const next = form.images.split(/\n|,/).map(v => v.trim()).filter(Boolean).filter((_, index) => index !== i); setForm(old => ({ ...old, images: next.join("\n") })); }}>Quitar</button></figure>)}</div>}
        {!form.images.trim() && <p className="admin-muted">Aún no has elegido ninguna foto. Puedes guardar como borrador y añadirlas después.</p>}
      </div>
      <details className="admin-full optional-fields">
        <summary>Más detalles (opcionales)</summary>
        <div className="admin-form optional-grid">
          <div className="admin-field"><label htmlFor="sku">Código SKU</label><input id="sku" value={form.sku} onChange={e => change("sku", e.target.value)} minLength={2} maxLength={64} pattern="[A-Za-z0-9_-]+" placeholder="Se genera automáticamente" /></div>
          <div className="admin-field"><label htmlFor="sale">Precio de oferta (S/)</label><input id="sale" type="number" min="0" step="0.01" value={form.salePrice} onChange={e => change("salePrice", e.target.value)} placeholder="Opcional" /></div>
          <div className="admin-field admin-full"><label htmlFor="description">Descripción</label><textarea id="description" value={form.description} onChange={e => change("description", e.target.value)} maxLength={5000} placeholder="Detalles, tela, cuidado, medidas… (opcional)" /></div>
        </div>
      </details>
      <label className="admin-full quick-publish"><input type="checkbox" checked={form.publishNow} onChange={e => setForm(old => ({ ...old, publishNow: e.target.checked }))} /> <span><strong>Mostrar en la tienda al guardar</strong><small>Necesita categoría, al menos una foto y stock disponible.</small></span></label>
      {error && <p className="admin-error admin-full" role="alert">{error}</p>}
      {notice && <p className="admin-success admin-full" role="status">{notice}</p>}
      <div className="admin-actions admin-full quick-submit-actions"><button className="button" type="submit" disabled={uploading}>{uploading ? "Subiendo fotos…" : editing ? "Guardar cambios" : "Guardar producto"}</button>{editing && <button className="button" type="button" onClick={reset}>Cancelar edición</button>}</div>
    </form>
    {variantProduct && <AdminVariants productId={variantProduct.id} productName={variantProduct.name} onClose={() => setVariantProduct(null)} />}
    <section className="admin-panel">
      <div className="admin-top"><p className="admin-muted">TU CATÁLOGO</p><h2 className="admin-title" style={{ fontSize: 30 }}>Productos guardados</h2><p className="admin-muted">Busca, edita o administra las tallas y existencias.</p></div>
      <div className="admin-toolbar">
        <label className="admin-search"><span className="sr-only">Buscar productos</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o código…" /></label>
        <label className="admin-muted">Estado <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filtrar por estado"><option value="all">Todos</option><option value="published">Publicados</option><option value="draft">Borradores</option><option value="archived">Archivados</option></select></label>
      </div>
      {loading ? <p className="admin-muted">Cargando productos…</p> : products.length === 0 ? <div className="empty-state"><h2>Aún no hay productos</h2><p>Añade el primero usando el formulario de arriba.</p></div> : filteredProducts.length === 0 ? <div className="empty-state"><h2>No encontramos productos</h2><p>Prueba con otra búsqueda o estado.</p><button className="button" type="button" onClick={() => { setSearch(""); setStatusFilter("all"); }}>Limpiar filtros</button></div> : <div className="admin-products">{filteredProducts.map(p => {
        const firstImage = imageList(p.images_json)[0];
        return <article className="admin-product" key={p.id}><div className="admin-product-main"><div className="admin-product-media">{firstImage ? <img src={firstImage} alt={p.name} loading="lazy" /> : <span>ÉLARA</span>}</div><div className="admin-product-copy"><span className="admin-tag">{p.status === "published" ? "Publicado" : p.status === "archived" ? "Archivado" : "Borrador"}</span><h3>{p.name}</h3><p>SKU: {p.sku} · {money(p.sale_price_cents ?? p.price_cents)}</p></div></div><div className="admin-actions"><button className="button" type="button" onClick={() => edit(p)}>Editar</button><button className="button" type="button" onClick={() => setVariantProduct({ id: p.id, name: p.name })}>Tallas y stock</button><button className="button" type="button" onClick={() => void remove(p)}>Archivar / eliminar</button></div></article>;
      })}</div>}
      <p className="admin-muted" style={{ marginTop: 20 }}>{filteredProducts.length} de {products.length} productos</p>
    </section>
  </>;
}
