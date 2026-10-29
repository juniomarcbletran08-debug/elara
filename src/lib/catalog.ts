export type Product = {
  id: string;
  name: string;
  category: "Vestidos" | "Blusas" | "Accesorios" | "Conjuntos";
  price: number;
  oldPrice?: number;
  label?: string;
  image: string;
  imageAlt: string;
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  {
    id: "vestido-sofia",
    name: "Vestido Sofía",
    category: "Vestidos",
    price: 189,
    oldPrice: 229,
    label: "Favorito",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Vestido elegante en tono neutro",
    description: "Una silueta delicada para momentos que merecen quedarse.",
    sizes: ["S", "M", "L"]
  },
  {
    id: "blusa-celeste",
    name: "Blusa Celeste",
    category: "Blusas",
    price: 119,
    label: "Nuevo",
    image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Blusa femenina de estilo minimalista",
    description: "Textura suave, caída ligera y elegancia sin esfuerzo.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "conjunto-amalfi",
    name: "Conjunto Amalfi",
    category: "Conjuntos",
    price: 249,
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Conjunto femenino de dos piezas",
    description: "Dos piezas, infinitas maneras de sentirte tú.",
    sizes: ["S", "M", "L"]
  },
  {
    id: "bolso-milano",
    name: "Bolso Milano",
    category: "Accesorios",
    price: 159,
    label: "Edición especial",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Bolso elegante de acabado estructurado",
    description: "El detalle final que transforma todo el look.",
    sizes: ["Única"]
  },
  {
    id: "vestido-valentina",
    name: "Vestido Valentina",
    category: "Vestidos",
    price: 219,
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Vestido de ocasión de corte elegante",
    description: "Movimiento, luz y una presencia inolvidable.",
    sizes: ["S", "M", "L"]
  },
  {
    id: "top-perla",
    name: "Top Perla",
    category: "Blusas",
    price: 89,
    image: "https://images.unsplash.com/photo-1564257577-7e7e9e9d8c4c?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Top femenino en color claro",
    description: "Un esencial refinado para combinar a tu manera.",
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "aretes-luz",
    name: "Aretes Luz",
    category: "Accesorios",
    price: 59,
    label: "Pequeño lujo",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Aretes dorados delicados",
    description: "Un brillo sutil, pensado para acompañarte cada día.",
    sizes: ["Única"]
  },
  {
    id: "conjunto-siena",
    name: "Conjunto Siena",
    category: "Conjuntos",
    price: 239,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
    imageAlt: "Look femenino sofisticado",
    description: "Una combinación moderna para vestir con intención.",
    sizes: ["S", "M", "L"]
  }
];

export const categories = ["Todo", "Vestidos", "Blusas", "Conjuntos", "Accesorios"] as const;
export type CategoryFilter = typeof categories[number];

export function filterProducts(items: Product[], query: string, category: CategoryFilter): Product[] {
  const normalized = query.trim().toLocaleLowerCase("es");
  return items.filter((item) => {
    const matchesCategory = category === "Todo" || item.category === category;
    const matchesQuery = !normalized || [item.name, item.category, item.description]
      .some((value) => value.toLocaleLowerCase("es").includes(normalized));
    return matchesCategory && matchesQuery;
  });
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0
  }).format(price);
}