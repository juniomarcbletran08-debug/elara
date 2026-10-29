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

const featuredProducts: Product[] = [
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

const additionalProductDetails = [
  {
    "category": "Vestidos",
    "name": "Vestido Aurora",
    "price": 229,
    "description": "Una silueta fluida para ocasiones que merecen brillar.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Vestidos",
    "name": "Vestido Magnolia",
    "price": 199,
    "description": "Romanticismo moderno en una pieza versátil.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Julieta",
    "price": 259,
    "description": "Elegancia suave con una caída que acompaña cada paso.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "label": "Favorito"
  },
  {
    "category": "Vestidos",
    "name": "Vestido Cielo",
    "price": 179,
    "description": "Ligero, femenino y listo para acompañar tus planes.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Isabella",
    "price": 289,
    "description": "Una pieza protagonista para tus momentos especiales.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Edición especial"
  },
  {
    "category": "Vestidos",
    "name": "Vestido Olivia",
    "price": 209,
    "description": "Un clásico renovado para vestir con naturalidad.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Roma",
    "price": 239,
    "description": "Líneas limpias y un encanto atemporal.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Florencia",
    "price": 269,
    "description": "Un toque sofisticado para celebraciones y noches bonitas.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Favorito"
  },
  {
    "category": "Vestidos",
    "name": "Vestido Luna",
    "price": 189,
    "description": "Suave, cómodo y perfecto para un look sin esfuerzo.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Dalia",
    "price": 219,
    "description": "Detalles delicados que hacen especial lo sencillo.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Vestidos",
    "name": "Vestido Abril",
    "price": 199,
    "description": "Una silueta fresca para días llenos de luz.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Vestidos",
    "name": "Vestido Camila",
    "price": 249,
    "description": "Versatilidad refinada para tu guardarropa favorito.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Emilia",
    "price": 99,
    "description": "Una textura delicada para combinar una y otra vez.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Blusas",
    "name": "Blusa Renata",
    "price": 129,
    "description": "Un básico elegante que eleva cualquier conjunto.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Martina",
    "price": 109,
    "description": "Ligereza y movimiento en un diseño femenino.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Abril",
    "price": 89,
    "description": "Un esencial suave para los días de ritmo ligero.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Amalia",
    "price": 139,
    "description": "Acabados sutiles con un aire sofisticado.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Favorito"
  },
  {
    "category": "Blusas",
    "name": "Blusa Olivia",
    "price": 119,
    "description": "Una pieza fácil de llevar, difícil de olvidar.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Miel",
    "price": 95,
    "description": "Tonos cálidos y una caída que favorece tu estilo.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Valeria",
    "price": 145,
    "description": "Un diseño contemporáneo para ocasiones especiales.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "label": "Edición especial"
  },
  {
    "category": "Blusas",
    "name": "Blusa Clara",
    "price": 105,
    "description": "Sencillez bonita para crear looks a tu manera.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Blusas",
    "name": "Blusa Elena",
    "price": 125,
    "description": "Un detalle delicado para tu colección de todos los días.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Verona",
    "price": 279,
    "description": "Dos piezas coordinadas para un look impecable.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Capri",
    "price": 229,
    "description": "Comodidad y estilo con inspiración mediterránea.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ]
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Roma",
    "price": 299,
    "description": "Una combinación elegante para destacar sin esfuerzo.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Favorito"
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Alba",
    "price": 259,
    "description": "Silueta relajada y detalles que marcan la diferencia.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Siena II",
    "price": 269,
    "description": "Una propuesta moderna para combinar dentro y fuera de casa.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Marfil",
    "price": 289,
    "description": "Una paleta serena con un acabado de aire premium.",
    "sizes": [
      "S",
      "M",
      "L",
      "XL"
    ],
    "label": "Edición especial"
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Nápoles",
    "price": 249,
    "description": "Dos piezas para multiplicar las posibilidades de tu armario.",
    "sizes": [
      "S",
      "M",
      "L"
    ]
  },
  {
    "category": "Conjuntos",
    "name": "Conjunto Lirio",
    "price": 239,
    "description": "Un conjunto femenino pensado para sentirte cómoda.",
    "sizes": [
      "S",
      "M",
      "L"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Accesorios",
    "name": "Cartera Aurora",
    "price": 179,
    "description": "Un complemento estructurado para cerrar tu look.",
    "sizes": [
      "Única"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Accesorios",
    "name": "Bolso Siena",
    "price": 169,
    "description": "Espacio y estilo en una silueta elegante.",
    "sizes": [
      "Única"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Aretes Doré",
    "price": 69,
    "description": "Un brillo cálido que acompaña tus mejores momentos.",
    "sizes": [
      "Única"
    ],
    "label": "Favorito"
  },
  {
    "category": "Accesorios",
    "name": "Collar Perla",
    "price": 79,
    "description": "Un detalle delicado para llevar cerca de ti.",
    "sizes": [
      "Única"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Pulsera Alba",
    "price": 49,
    "description": "Minimalismo dorado para sumar un toque especial.",
    "sizes": [
      "Única"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Lentes Sol",
    "price": 89,
    "description": "Un accesorio con carácter para días luminosos.",
    "sizes": [
      "Única"
    ],
    "label": "Nuevo"
  },
  {
    "category": "Accesorios",
    "name": "Cinturón Siena",
    "price": 59,
    "description": "Define tu silueta con un detalle sutil.",
    "sizes": [
      "S/M",
      "L/XL"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Pañuelo Étoile",
    "price": 45,
    "description": "Un toque de color para transformar tus combinaciones.",
    "sizes": [
      "Única"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Monedero Miel",
    "price": 55,
    "description": "Un pequeño esencial para tus salidas cotidianas.",
    "sizes": [
      "Única"
    ]
  },
  {
    "category": "Accesorios",
    "name": "Set Brillo",
    "price": 99,
    "description": "Tres detalles delicados para regalar o regalarte.",
    "sizes": [
      "Única"
    ],
    "label": "Edición especial"
  }
] as const;

const galleryImages = [
  "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1564257577-7e7e9e9d8c4c?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85"
];

export const products: Product[] = [
  ...featuredProducts,
  ...additionalProductDetails.map((item, index) => ({
    id: item.name.toLocaleLowerCase("es").normalize("NFD").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: item.name,
    category: item.category,
    price: item.price,
    ...(index % 5 === 0 ? { oldPrice: item.price + 30 } : {}),
    ...(item.label ? { label: item.label } : {}),
    image: galleryImages[index % galleryImages.length],
    imageAlt: item.name + " — fotografía de referencia para la demo",
    description: item.description,
    sizes: [...item.sizes]
  }))
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