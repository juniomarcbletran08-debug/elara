# ÉLARA — Boutique de demostración

Tienda frontend de moda femenina con dirección visual de glamour discreto: crema, champán, tipografía editorial y fotografía protagonista.

## Modo de demostración

ÉLARA funciona como una página frontend independiente. **No utiliza Supabase, base de datos, API de pagos ni credenciales externas.** El catálogo es de muestra y vive en el código del proyecto.

Incluye:
- Catálogo con 48 productos de demostración en cuatro categorías.
- Búsqueda y filtros por categoría.
- Favoritos durante la sesión.
- Selector de tallas y bolsa de compra con cantidades y subtotal.
- Formulario visual de interés que no envía ni guarda correos.
- Diseño adaptable a móviles y escritorio.

Los nombres, precios, disponibilidad y fotografías son ilustrativos; no representan inventario real. El botón de pago solo informa que los cobros no están habilitados. No se reciben pedidos ni se procesa dinero.

## Requisitos

- Node.js 22
- npm

## Ejecutar localmente

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Verificaciones

```bash
npm run typecheck
npm test
npm run build
```

No se requieren variables de entorno ni credenciales para ejecutar esta demo.
