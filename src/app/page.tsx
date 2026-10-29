"use client";

import { FormEvent, useMemo, useState } from "react";
import { categories, filterProducts, formatPrice, products, type CategoryFilter, type Product } from "@/lib/catalog";

type BagItem = { product: Product; size: string; quantity: number };

function Icon({ name, size = 20 }: { name: "bag" | "search" | "heart" | "close" | "plus" | "minus" | "arrow" | "menu" | "sparkle"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<string, React.ReactNode> = {
    bag: <><path d="M5 8h14l1 13H4L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    heart: <path d="M20.5 8.8c0 4.1-8.5 10-8.5 10s-8.5-5.9-8.5-10A4.5 4.5 0 0 1 12 6.1a4.5 4.5 0 0 1 8.5 2.7Z" />,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    arrow: <><path d="M4 12h15M13 5l7 7-7 7" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    sparkle: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function HomePage() {
  const [category, setCategory] = useState<CategoryFilter>("Todo");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [bag, setBag] = useState<BagItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const visibleProducts = useMemo(() => filterProducts(products, query, category), [query, category]);
  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToBag(product: Product, size: string) {
    setBag((current) => {
      const existing = current.find((item) => item.product.id === product.id && item.size === size);
      if (existing) return current.map((item) => item === existing ? { ...item, quantity: item.quantity + 1 } : item);
      return [...current, { product, size, quantity: 1 }];
    });
    setSelectedProduct(null);
    setBagOpen(true);
    setNotice("");
  }

  function changeQuantity(productId: string, size: string, delta: number) {
    setBag((current) => current
      .map((item) => item.product.id === productId && item.size === size ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  }

  function selectCategory(next: CategoryFilter) {
    setCategory(next);
    setMobileMenu(false);
    document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <main>
      <div className="announcement"><span>Una pequeña dosis de belleza para todos tus días</span><span className="announcement-right">ENVÍOS A TODO EL PERÚ · COLECCIÓN 2026</span></div>
      <header className="site-header">
        <button className="icon-button mobile-menu-button" aria-label="Abrir menú" onClick={() => setMobileMenu(!mobileMenu)}><Icon name="menu" /></button>
        <a className="wordmark" href="#" aria-label="ÉLARA inicio">ÉLARA<span className="wordmark-dot">.</span><small>VÍSTETE DE TI</small></a>
        <nav className={mobileMenu ? "main-nav is-open" : "main-nav"} aria-label="Navegación principal">
          <a href="#coleccion" onClick={() => setMobileMenu(false)}>Nueva colección</a>
          <a href="#historia" onClick={() => setMobileMenu(false)}>Nuestra esencia</a>
          <a href="#newsletter" onClick={() => setMobileMenu(false)}>Club ÉLARA</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button search-trigger" aria-label="Buscar productos" onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" /></button>
          <button className="bag-button" aria-label={"Bolsa de compra, " + bagCount + " artículos"} onClick={() => setBagOpen(true)}><Icon name="bag" /><span className="bag-label">Mi bolsa</span><span className="bag-count">{bagCount}</span></button>
        </div>
      </header>

      {searchOpen && <div className="search-bar"><Icon name="search" /><input autoFocus aria-label="Buscar en la colección" placeholder="Busca esa pieza especial..." value={query} onChange={(event) => setQuery(event.target.value)} /><button className="text-button" onClick={() => { setQuery(""); setSearchOpen(false); }}>Cerrar</button></div>}

      <section className="hero" aria-label="Campaña de temporada">
        <div className="hero-image" role="img" aria-label="Editorial de moda en tonos cálidos" />
        <div className="hero-wash" />
        <div className="hero-copy">
          <p className="eyebrow"><span /> LA BELLEZA DE SER TÚ</p>
          <h1>Tu estilo.<br /><em>Tu momento.</em></h1>
          <p className="hero-description">Piezas que acompañan tu esencia y hacen especial hasta el día más sencillo.</p>
          <a className="button button-dark" href="#coleccion">Descubrir colección <Icon name="arrow" size={17} /></a>
          <div className="hero-note"><span className="hero-note-line" /> Diseñado para sentirte bien, siempre.</div>
        </div>
        <div className="hero-stamp"><Icon name="sparkle" size={21} /><span>DETALLES QUE<br />ENAMORAN</span></div>
        <div className="hero-pagination"><b>01</b><span /> 03</div>
      </section>

      <section className="promise-strip" aria-label="Beneficios de ÉLARA">
        <div><span className="promise-icon">✳</span><p><strong>Selección especial</strong><small>Piezas elegidas con intención</small></p></div>
        <div><span className="promise-icon">♡</span><p><strong>Compra con confianza</strong><small>Atención cercana y transparente</small></p></div>
        <div><span className="promise-icon">✧</span><p><strong>Envíos nacionales</strong><small>Tu próximo favorito va contigo</small></p></div>
      </section>

      <section className="collection section-shell" id="coleccion">
        <div className="section-heading">
          <div><p className="eyebrow">DESCUBRE TU PRÓXIMO FAVORITO</p><h2>La colección <em>ÉLARA</em></h2></div>
          <p className="section-intro">Un guardarropa con intención.<br />Detalles que hablan de ti.</p>
        </div>
        <p className="catalog-disclaimer">Catálogo de demostración · precios y disponibilidad por confirmar</p>
        <div className="collection-toolbar">
          <div className="category-tabs" role="group" aria-label="Filtrar por categoría">
            {categories.map((item) => <button key={item} className={category === item ? "category-tab active" : "category-tab"} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          <span className="result-count">{visibleProducts.length} PIEZAS</span>
        </div>
        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <article className="product-card" key={product.id}>
              <div className="product-image-wrap" onClick={() => { setSelectedProduct(product); setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0]); }} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") { setSelectedProduct(product); setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0]); } }} aria-label={"Ver " + product.name}>
                <img src={product.image} alt={product.imageAlt} className="product-image" loading={index > 3 ? "lazy" : "eager"} />
                {product.label && <span className="product-label">{product.label}</span>}
                <button className={favorites.includes(product.id) ? "favorite-button is-favorite" : "favorite-button"} aria-label={favorites.includes(product.id) ? "Quitar de favoritos" : "Añadir a favoritos"} onClick={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}><Icon name="heart" size={18} /></button>
                <button className="quick-add" onClick={(event) => { event.stopPropagation(); setSelectedProduct(product); setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0]); }}>Ver detalles <Icon name="arrow" size={15} /></button>
              </div>
              <div className="product-meta"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3></div><div className="product-price">{formatPrice(product.price)}{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div></div>
              <p className="product-description">{product.description}</p>
            </article>
          ))}
        </div>
        {visibleProducts.length === 0 && <div className="empty-state"><Icon name="search" size={28} /><h3>No encontramos esa pieza</h3><p>Prueba con otra búsqueda o explora toda la colección.</p><button className="button button-outline" onClick={() => { setQuery(""); setCategory("Todo"); }}>Ver todo</button></div>}
        <div className="collection-footer"><span>Elegido con cariño, pensado para ti.</span><span className="collection-footer-line" /><span>ÉLARA · 2026</span></div>
      </section>

      <section className="story" id="historia">
        <div className="story-image" role="img" aria-label="Detalles de una colección femenina en tonos naturales" />
        <div className="story-content"><p className="eyebrow">NUESTRA ESENCIA</p><h2>No se trata solo<br />de vestir. Se trata<br /><em>de sentirte tú.</em></h2><p>Creemos en esos pequeños detalles que cambian cómo te sientes. En prendas que te acompañan, en elegir sin prisa y en encontrar belleza en tu propia manera de ser.</p><a className="underlined-link" href="#coleccion">Encuentra tu esencia <Icon name="arrow" size={16} /></a><div className="story-signature">Con cariño, <span>ÉLARA</span></div></div>
      </section>

      <section className="newsletter" id="newsletter">
        <div className="newsletter-mark"><Icon name="sparkle" size={25} /></div>
        <p className="eyebrow">UNA NOTA BONITA PARA TI</p><h2>Un lugar para las <em>cosas bonitas.</em></h2>
        <p className="newsletter-copy">Sé parte del Club ÉLARA y entérate primero de las nuevas colecciones, novedades y sorpresas especiales.</p>
        {subscribed ? <div className="subscribe-success" role="status">Gracias por acercarte a ÉLARA. Pronto tendremos novedades para ti.</div> : <form className="newsletter-form" onSubmit={subscribe}><label className="sr-only" htmlFor="email">Tu correo electrónico</label><input id="email" type="email" required placeholder="Tu correo electrónico" value={email} onChange={(event) => setEmail(event.target.value)} /><button type="submit" aria-label="Suscribirme">Quiero estar al tanto <Icon name="arrow" size={16} /></button></form>}
        <small className="privacy-note">Con cariño, sin ruido. Puedes darte de baja cuando quieras.</small>
      </section>

      <footer className="site-footer">
        <div className="footer-main"><div className="footer-brand"><a className="wordmark footer-wordmark" href="#">ÉLARA<span className="wordmark-dot">.</span><small>VÍSTETE DE TI</small></a><p>La belleza está en cómo te sientes.</p></div><div className="footer-links"><div><strong>EXPLORA</strong><a href="#coleccion">Colección</a><a href="#historia">Nuestra esencia</a><a href="#newsletter">Club ÉLARA</a></div><div><strong>TE ACOMPAÑAMOS</strong><span>Envíos a todo el Perú</span><span>Atención de lunes a sábado</span><span>Pronto: guía de tallas y ayuda</span></div></div><div className="footer-social"><span>SÍGUENOS EN EL CAMINO</span><a href="#newsletter">Instagram ↗</a><a href="#newsletter">TikTok ↗</a></div></div>
        <div className="footer-bottom"><span>© 2026 ÉLARA. Todos los derechos reservados.</span><span>Hecho con intención y cariño.</span></div>
      </footer>

      {selectedProduct && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}><section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-product-title"><button className="modal-close icon-button" aria-label="Cerrar detalles" onClick={() => setSelectedProduct(null)}><Icon name="close" /></button><div className="modal-photo"><img src={selectedProduct.image} alt={selectedProduct.imageAlt} /></div><div className="modal-details"><p className="eyebrow">{selectedProduct.category.toUpperCase()} · ÉLARA</p><h2 id="modal-product-title">{selectedProduct.name}</h2><div className="modal-price">{formatPrice(selectedProduct.price)} {selectedProduct.oldPrice && <del>{formatPrice(selectedProduct.oldPrice)}</del>}</div><p>{selectedProduct.description}</p><span className="field-label">Selecciona tu talla</span><div className="size-options">{selectedProduct.sizes.map((size) => <button key={size} className={selectedSize === size ? "size-option selected" : "size-option"} onClick={() => setSelectedSize(size)}>{size}</button>)}</div><button className="button button-dark add-to-bag" onClick={() => addToBag(selectedProduct, selectedSize)}>Añadir a mi bolsa <Icon name="bag" size={17} /></button><small className="modal-note">La disponibilidad y el pago se confirmarán cuando la tienda esté conectada al inventario.</small></div></section></div>}

      {bagOpen && <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setBagOpen(false); }}><aside className="bag-drawer" aria-label="Tu bolsa de compra"><div className="drawer-header"><div><p className="eyebrow">TU SELECCIÓN</p><h2>Mi bolsa <span>({bagCount})</span></h2></div><button className="icon-button" aria-label="Cerrar bolsa" onClick={() => setBagOpen(false)}><Icon name="close" /></button></div>{bag.length === 0 ? <div className="bag-empty"><Icon name="bag" size={34} /><h3>Tu bolsa está esperando</h3><p>Encuentra una pieza que te haga sentir especial.</p><button className="button button-dark" onClick={() => { setBagOpen(false); document.getElementById("coleccion")?.scrollIntoView({ behavior: "smooth" }); }}>Explorar colección</button></div> : <><div className="bag-items">{bag.map((item) => <div className="bag-item" key={item.product.id + item.size}><img src={item.product.image} alt="" /><div className="bag-item-info"><h3>{item.product.name}</h3><span>Talla: {item.size}</span><strong>{formatPrice(item.product.price)}</strong><div className="quantity-control"><button aria-label="Restar unidad" onClick={() => changeQuantity(item.product.id, item.size, -1)}><Icon name="minus" size={13} /></button><span>{item.quantity}</span><button aria-label="Sumar unidad" onClick={() => changeQuantity(item.product.id, item.size, 1)}><Icon name="plus" size={13} /></button></div></div><button className="remove-item" aria-label={"Eliminar " + item.product.name} onClick={() => changeQuantity(item.product.id, item.size, -item.quantity)}><Icon name="close" size={15} /></button></div>)}</div><div className="bag-summary"><div><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p>El envío se calculará cuando confirmemos tu ubicación.</p><button className="button button-dark checkout-button" onClick={() => setNotice("El pago estará disponible cuando conectemos y verifiquemos el backend seguro y Mercado Pago. No se ha realizado ningún cobro.")}>Continuar al pago <Icon name="arrow" size={17} /></button>{notice && <p className="checkout-notice" role="status">{notice}</p>}<small>Pago seguro próximamente · Sin cargos en esta demo</small></div></>}</aside></div>}

      <div className="floating-note" aria-live="polite">{favorites.length > 0 && <span><Icon name="heart" size={13} /> {favorites.length} {favorites.length === 1 ? "favorito" : "favoritos"}</span>}</div>
    </main>
  );
}