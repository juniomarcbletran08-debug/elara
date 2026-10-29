# ÉLARA — Vístete de ti

Boutique digital de moda femenina con una dirección visual de glamour discreto: crema, champán, tipografía editorial y fotografía protagonista.

## Estado actual

La rama \`main\` contiene una nueva experiencia de tienda creada desde cero. Incluye catálogo de demostración, filtros por categoría, búsqueda, favoritos de sesión, selección de talla, bolsa de compra y formulario de interés. No procesa pagos ni guarda pedidos reales.

**No está lista para vender todavía.** Antes de habilitar pedidos hay que confirmar el proyecto correcto de Supabase, revisar el esquema existente y Storage, configurar credenciales de servidor en Vercel, crear autenticación administrativa segura y conectar Mercado Pago en modo de prueba con webhooks verificados.

## Requisitos

- Node.js 22
- npm
- Git

## Desarrollo local

\`\`\`bash
npm install
cp .env.example .env.local
npm run dev
\`\`\`

Abre \`http://localhost:3000\`.

## Verificaciones

\`\`\`bash
npm run typecheck
npm test
npm run build
\`\`\`

## Servicios externos y secretos

No se han modificado recursos de Supabase, Vercel ni Mercado Pago. El proyecto de Supabase descrito por la documentación anterior no apareció entre los proyectos accesibles con la conexión actual; no se asumió que una base de datos distinta fuera la correcta. El proyecto de Vercel llamado \`elara\` tampoco fue encontrado en el ámbito actualmente conectado.

No pongas claves reales en el repositorio. Cuando se recupere el acceso al proyecto externo correcto, configura los valores desde los paneles oficiales y usa solo variables de servidor para credenciales privilegiadas. Las variables públicas \`NEXT_PUBLIC_*\` nunca deben contener secretos.

## Próximas fases

1. Confirmar el proyecto real de Supabase y hacer inventario de tablas, políticas y bucket sin borrar datos.
2. Configurar el acceso de servidor con credenciales verificadas y añadir migraciones revisables.
3. Implementar autenticación administrativa, gestión de productos/fotos/inventario y pedidos.
4. Conectar Mercado Pago en sandbox; verificar firma, monto, moneda, referencia e idempotencia de notificaciones.
5. Ejecutar pruebas completas, revisar accesibilidad, móvil, privacidad y política de envíos antes de activar ventas.
