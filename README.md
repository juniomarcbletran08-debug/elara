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

## Publicar en Cloudflare Pages con un ZIP

El proyecto está configurado para generar un sitio estático en la carpeta `out/`, compatible con **Cloudflare Pages Direct Upload**. No subas el ZIP del código fuente: debes subir el ZIP de los archivos generados.

### Obtener el ZIP sin compilar en tu equipo

1. Abre la pestaña **Actions** del repositorio en GitHub.
2. Entra en la ejecución más reciente del flujo **CI** de la rama `main` y espera a que todas las verificaciones terminen correctamente.
3. En **Artifacts**, descarga `elara-cloudflare-pages`.
4. Extrae el artefacto descargado si GitHub te entrega un ZIP exterior. Dentro estará `elara-cloudflare-pages.zip`, que contiene el sitio listo para subir.
5. En Cloudflare Dashboard, abre **Workers & Pages**, crea o selecciona un proyecto de Pages con **Direct Upload**, y carga `elara-cloudflare-pages.zip`.

Cloudflare no quedará conectado automáticamente a GitHub con este método: después de cada cambio tendrás que descargar el artefacto nuevo y volver a subirlo. El proyecto no necesita variables de entorno.

### Generación local alternativa

Requisitos: Node.js 22 y npm.

```bash
npm install
npm run typecheck
npm test
npm run build
cd out
zip -r ../elara-cloudflare-pages.zip .
```

Después, carga `elara-cloudflare-pages.zip` en Cloudflare Pages Direct Upload.

## Verificaciones

```bash
npm run typecheck
npm test
npm run build
```
