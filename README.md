# ÉLARA — Fashion Boutique

Tienda editorial para Perú construida con Next.js, TypeScript y Vercel. La arquitectura objetivo es Supabase PostgreSQL para catálogo, variantes, inventario, pedidos y pagos; Supabase Storage para fotografías; Mercado Pago Checkout Pro en modo de prueba hasta validar todo el flujo.

## Estado de la configuración

- Proyecto Supabase: `elara` (`ubmnqtysksakyzjpaifw`), región São Paulo.
- El esquema inicial de PostgreSQL y las protecciones de inventario se aplicaron al proyecto.
- Vercel publica la aplicación en `https://elara-olive.vercel.app`.
- Esta rama reemplaza el adaptador D1 de Cloudflare por una capa de compatibilidad PostgreSQL para mantener las consultas y transacciones existentes.
- **La conexión de runtime todavía requiere configurar `DATABASE_URL` y la clave secreta de Supabase en Vercel.** No guardes credenciales reales en Git.
- El bucket de fotografías se debe crear en Supabase Storage y la variable `PUBLIC_MEDIA_URL` debe apuntar al prefijo público del bucket.

## Requisitos

- Node.js 22.12 o superior.
- Proyecto Supabase con PostgreSQL y Storage.
- Proyecto Vercel vinculado al repositorio GitHub.
- Cuenta Mercado Pago Perú para credenciales de prueba y notificaciones.
- Un dominio HTTPS opcional; por ahora se usa el dominio de Vercel.

## Instalación local

```bash
npm install
cp .env.example .env.local
npm run dev
```

No añadas secretos a `.env.example`, al repositorio ni a variables `NEXT_PUBLIC_*`.

## Conectar Supabase con Vercel

1. En Supabase, abre el proyecto `elara`, entra en **Connect** y copia la cadena del **shared pooler, transaction mode** (puerto `6543`). Vercel funciona en una red IPv4; evita la conexión directa que usa el endpoint IPv6. Conserva `sslmode=require`.
2. En Vercel → Project `elara` → Settings → Environment Variables, crea `DATABASE_URL` con la cadena obtenida, para Production, Preview y Development. Márcala como secreta.
3. Crea o copia una clave secreta de servidor de Supabase y guárdala como `SUPABASE_SECRET_KEY` en los mismos entornos. Nunca la llames `NEXT_PUBLIC_...`. El código también admite la antigua clave `service_role` mediante `SUPABASE_SERVICE_ROLE_KEY`.
4. Añade `SUPABASE_URL=https://ubmnqtysksakyzjpaifw.supabase.co`.
5. En **Storage**, crea un bucket público llamado `elara-product-images`, con límite de 8 MB y tipos permitidos JPEG, PNG, WebP y AVIF. Los objetos son fotos públicas de productos; las operaciones de carga y modificación siguen siendo del servidor.
6. Configura `SUPABASE_STORAGE_BUCKET=elara-product-images` y `PUBLIC_MEDIA_URL=https://ubmnqtysksakyzjpaifw.supabase.co/storage/v1/object/public/elara-product-images`.
7. Añade `APP_URL` y `NEXT_PUBLIC_SITE_URL` con la URL canónica de la tienda, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET` y las demás variables descritas en `.env.example`.
8. Guarda las variables y vuelve a desplegar en Vercel. Después prueba `/api/health`, `/api/products`, inicio de sesión administrativo, creación de producto, carga de imagen y reserva de inventario.

El host exacto del pooler no se debe inventar a partir de la región: cópialo del diálogo **Connect** del propio proyecto. No compartas una cadena de conexión con contraseña por chat.

## Base de datos

La estructura de referencia de PostgreSQL está en `supabase/migrations/`. Las tablas privadas tienen Row Level Security activado. La aplicación usa un acceso PostgreSQL del lado servidor; no abras permisos de lectura o escritura de pedidos al rol anónimo. Las operaciones de pedido se ejecutan en transacciones para que las reservas de inventario sean atómicas.

## Imágenes y almacenamiento

Las cargas pasan por una ruta administrativa autenticada que limita el tamaño, valida la firma real del archivo y comprueba que coincida con el MIME. Las fotografías se guardan en Supabase Storage; no se exponen claves privilegiadas al navegador.

## Mercado Pago

Checkout Pro debe probarse con credenciales de prueba y notificaciones verificadas contra la API del proveedor. Una redirección del navegador no demuestra que el pago haya sido aprobado. No habilites producción hasta validar firma, monto, moneda, referencia, idempotencia y reintentos del webhook.

## Comprobaciones

```bash
npm run typecheck
npm test
npm run build
```

## Antes de aceptar ventas

- Configurar y comprobar las variables de conexión de Supabase en Vercel.
- Crear el bucket público de fotos y validar cargas desde el panel.
- Cargar productos e inventario reales desde el panel de administración.
- Probar pagos en sandbox, webhooks duplicados/reintentados, cancelaciones y reservas concurrentes.
- Definir costes y cobertura de envío, revisar políticas legales y completar pruebas de accesibilidad y móviles.
- Comprobar los límites y precios vigentes de Supabase, Vercel y Mercado Pago; el coste puede depender del uso y del plan.

No uses datos personales reales ni credenciales de producción durante las pruebas.
