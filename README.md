# ÉLARA — Fashion Boutique

Tienda editorial Next.js + TypeScript con una identidad premium para Perú. La marca, moneda y contacto comercial se centralizan en `src/lib/config.ts`.

## Estado real de esta rama

Incluye la base visual responsive, navegación pública, enlaces oficiales a WhatsApp, páginas informativas, configuración inicial de Next.js/OpenNext para Cloudflare, esquema D1 y lectura pública de productos publicados. **Todavía no es una tienda lista para producción**: faltan el panel administrativo completo, el flujo seguro de creación y confirmación de pedidos, la integración final de Mercado Pago, los webhooks verificados y las pruebas end-to-end.

La portada utiliza imágenes editoriales ilustrativas externas; no representan stock disponible. El catálogo comienza vacío. Las páginas legales son borradores y deben revisarse y completarse.

## Requisitos

- Node.js 22.12 o superior (requisito para la versión actual de Vitest).
- Cloudflare para Workers, D1 y R2.
- Cuenta Mercado Pago Perú para credenciales de prueba y notificaciones.
- Cuenta GitHub y dominio personalizado opcional.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Configura `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_SITE_URL` y `APP_URL`. No añadas tokens reales al repositorio.

## D1 y Cloudflare

1. Crea una base D1 llamada `elara-db` y un bucket R2 `elara-product-images`.
2. Sustituye `REPLACE_WITH_D1_DATABASE_ID` en `wrangler.jsonc` por el ID real.
3. Aplica el esquema con `npm run db:local` localmente o `npm run db:remote` para el entorno remoto correcto.
4. Ejecuta `npm run cf:build` y valida `npm run cf:preview` antes de desplegar.
5. Enlaza el bucket R2 `PRODUCT_IMAGES` y configura `PUBLIC_MEDIA_URL` con un dominio HTTPS público de Cloudflare R2 o tu dominio de medios. La aplicación valida extensión, MIME y firma de archivo al subir fotos.\n6. Configura los secretos con Wrangler; consulta `.env.example`. Usa `node scripts/hash-password.mjs` con `ADMIN_PASSWORD_TO_HASH` para generar el hash PBKDF2 de la contraseña administrativa. No guardes la contraseña ni el hash en Git.

No ejecutes migraciones remotas hasta verificar el proyecto y la base de datos seleccionados.

## Comprobaciones previstas

```bash
npm run typecheck
npm test
npm run build
npm run cf:build
```

Estos comandos describen las comprobaciones que deben ejecutarse; no se deben considerar aprobadas hasta que terminen correctamente con las dependencias instaladas.

## WhatsApp

Los enlaces usan `https://wa.me/51930501096` y preparan mensajes que el cliente revisa y envía manualmente. Una consulta por WhatsApp no confirma stock ni acredita un pago.

## Mercado Pago y lanzamiento

Checkout Pro debe probarse con credenciales de prueba y notificaciones verificadas contra la API del proveedor. Una redirección del navegador no demuestra que el pago haya sido aprobado. No habilites producción hasta validar firma, monto, moneda, referencia de pedido, idempotencia y reintentos del webhook.

Antes de aceptar ventas, completa autenticación del administrador, operaciones atómicas de inventario, cargas seguras a R2, cancelaciones/reembolsos, costes y cobertura de envío, políticas legales, accesibilidad y pruebas móviles.

## Costes

Alojamiento, base de datos, almacenamiento, dominio y comisiones del proveedor de pago pueden generar cargos según uso y plan. Confirma los precios actuales en los paneles oficiales. No se necesita ninguna API generativa de pago para la arquitectura base.
