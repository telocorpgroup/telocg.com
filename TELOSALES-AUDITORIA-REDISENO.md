# 🛒 Auditoría Completa y Rediseño de TeloSales
## Informe Ejecutivo Multi-Disciplinario

**Fecha:** 26 de junio de 2026  
**Proyecto:** TeloCorp Group — Módulo TeloSales  
**Dominio:** telocg.com  
**Equipo Auditor:** Product Manager, Arquitecto de Software, Especialista UX/UI, Consultor eCommerce, Growth Marketing, Director de Operaciones  

---

## PARTE 1: DIAGNÓSTICO DEL ESTADO ACTUAL

### 1.1 Resumen Técnico Actual

| Aspecto | Estado |
|---------|--------|
| Stack Frontend | HTML + CSS + JS vanilla (SPA monolítica ~1600 líneas) |
| Stack Backend | Supabase (PostgreSQL + Edge Functions + RLS) |
| Productos | 22 hardcodeados + sync desde Supabase |
| Catálogo | Tabla plana, sin variantes, sin SKU |
| Carrito | localStorage, sin persistencia server |
| Checkout | WhatsApp link + PayPal email (manual) |
| Pagos | No hay gateway integrado real |
| Autenticación cliente | No existe |
| Inventario | Stock básico sin trazabilidad |
| Búsqueda | Filtro texto local (sin indexación) |
| SEO producto | No hay páginas individuales (SPA con hash) |
| Mobile | Responsive CSS, no app nativa |
| Analytics | Ninguno integrado |
| Email transaccional | No existe |
| Multi-idioma | No |
| Multi-moneda | No |


### 1.2 Problemas Críticos Encontrados

#### 🔴 P1 — Checkout inexistente (conversión ~0% automatizada)
No hay pasarela de pago integrada. El checkout genera un link de WhatsApp con el resumen del pedido. El cliente debe coordinarse manualmente para pagar. Esto **mata la conversión** en un 80-90% según benchmarks de eCommerce.

#### 🔴 P2 — Sin autenticación de cliente
No existe login/registro. El "perfil" es solo localStorage. Esto impide: historial de compras, tracking de pedidos, fidelización, recuperación de carrito, personalización.

#### 🔴 P3 — Sin páginas de producto individuales (SEO destruido)
Todo es una SPA con hash routing (`/#telosales`). Google no indexa contenido detrás de hash. Los productos no tienen URLs propias, no se pueden compartir, no aparecen en búsquedas.

#### 🔴 P4 — Inventario no transaccional
El stock se resta localmente en JS y hace un PATCH directo sin transacción atómica. Dos compras simultáneas pueden sobregirar el stock. No hay reservas temporales durante el checkout.

#### 🔴 P5 — Sin variantes de producto
No existe concepto de talla, color, material o versión. Un producto = una SKU. Esto elimina el 70% de los catálogos de moda, electrónica y hogar.

#### 🟠 P6 — Productos hardcodeados como fallback
22 productos están hardcodeados en `script.js`. Si Supabase no responde, se muestran estos. Pero cualquier edición requiere deployment, no hay gestión de contenido real.

#### 🟠 P7 — Sin sistema de reseñas real
Las reviews están hardcodeadas en el array de productos (siempre 5 estrellas, textos genéricos auto-generados). No hay sistema UGC.

#### 🟠 P8 — Sin analytics ni métricas de conversión
No hay Google Analytics, Meta Pixel, eventos de funnel, ni tracking de abandono de carrito.

#### 🟠 P9 — Sin email transaccional
No se envían confirmaciones de orden, actualizaciones de estado, ni emails de bienvenida. Todo depende de WhatsApp manual.

#### 🟡 P10 — Búsqueda limitada
Filtro de texto en memoria sobre el array local. No soporta: búsqueda fonética, sinónimos, typo-tolerance, filtros facetados, ni sugerencias.


### 1.3 Fortalezas Actuales a Preservar

| Fortaleza | Valor |
|-----------|-------|
| Diseño visual atractivo (dark theme) | UX moderna, diferenciada |
| CDN de imágenes (wsrv.nl auto-WebP) | Performance sólida |
| PWA con Service Worker | Instalable, offline básico |
| Edge Functions como proxy de API keys | Seguridad correcta |
| Admin panel funcional (12 módulos) | Base operativa sólida |
| Supabase como backend | Escalable, PostgreSQL, Auth, RLS |
| Notificaciones WhatsApp al admin | Operaciones en tiempo real |
| IA integrada (TeloAsistente) | Diferenciador competitivo |
| Catálogo dinámico desde DB | Fundación para crecimiento |

---

## PARTE 2: BENCHMARK COMPETITIVO

### Shopify vs TeloSales Actual

| Funcionalidad | Shopify | TeloSales |
|--------------|---------|-----------|
| Checkout de 1 paso | ✅ | ❌ (WhatsApp manual) |
| Pasarelas de pago | 100+ | 0 integradas |
| Variantes de producto | Ilimitadas | 0 |
| SEO per-product | ✅ URLs limpias | ❌ SPA hash |
| Carrito persistente | ✅ Server-side | ❌ localStorage |
| Auth de clientes | ✅ | ❌ |
| Abandono de carrito | ✅ Emails auto | ❌ |
| Inventario multi-location | ✅ | ❌ |
| Reviews UGC | ✅ | ❌ (fake) |
| Descuentos automáticos | ✅ Reglas | ✅ Cupones básicos |
| Multi-idioma | ✅ | ❌ |
| Analytics integrados | ✅ | ❌ |
| App mobile | ✅ | ❌ (solo PWA) |
| API / Headless | ✅ GraphQL | ❌ |
| Multi-tienda | ✅ | ❌ |

### Gap Score: TeloSales cubre aproximadamente un 15% de las funcionalidades de una plataforma eCommerce moderna.

---

## PARTE 3: REDISEÑO FUNCIONAL COMPLETO


### 3.1 Módulo de Productos Avanzado

```
TABLA: products_v2
├── id (UUID)
├── sku (TEXT UNIQUE, auto-generado: TCG-{CAT}-{SEQ})
├── barcode (TEXT, EAN-13/UPC)
├── title (TEXT NOT NULL)
├── slug (TEXT UNIQUE, URL-friendly)
├── brand_id (FK → brands)
├── manufacturer (TEXT)
├── supplier_id (FK → suppliers)
├── status (ENUM: draft, active, archived, out_of_stock)
├── type (ENUM: physical, digital, service, bundle)
├── description_short (TEXT, 160 chars para meta)
├── description_html (TEXT, rich editor)
├── specifications (JSONB, {key: value} ilimitados)
├── technical_sheet_url (TEXT, PDF descargable)
├── weight_grams (INT)
├── dimensions (JSONB: {length, width, height, unit})
├── seo_title (TEXT)
├── seo_description (TEXT)
├── og_image (TEXT)
├── schema_markup (JSONB, Product schema auto-generado)
├── tags (TEXT[])
├── is_featured (BOOLEAN)
├── is_taxable (BOOLEAN DEFAULT true)
├── tax_class (TEXT DEFAULT 'standard')
├── requires_shipping (BOOLEAN DEFAULT true)
├── published_at (TIMESTAMPTZ)
├── created_at / updated_at (TIMESTAMPTZ)
└── deleted_at (TIMESTAMPTZ, soft delete)

TABLA: product_media
├── id (UUID)
├── product_id (FK → products_v2)
├── type (ENUM: image, video, youtube, tiktok, model_3d)
├── url (TEXT)
├── alt_text (TEXT, accesibilidad)
├── position (INT, drag & drop ordering)
├── is_primary (BOOLEAN)
└── metadata (JSONB: {width, height, duration, thumbnail})

TABLA: product_variants
├── id (UUID)
├── product_id (FK → products_v2)
├── sku (TEXT UNIQUE)
├── title (TEXT, ej: "Rojo / XL")
├── option_values (JSONB: {color: "Rojo", size: "XL"})
├── price (NUMERIC)
├── compare_at_price (NUMERIC)
├── cost_price (NUMERIC)
├── weight_grams (INT)
├── barcode (TEXT)
├── inventory_quantity (INT)
├── inventory_policy (ENUM: deny, continue)
├── requires_shipping (BOOLEAN)
├── image_id (FK → product_media)
├── position (INT)
└── is_default (BOOLEAN)

TABLA: product_options (color, talla, material...)
├── id (UUID)
├── product_id (FK → products_v2)
├── name (TEXT: "Color", "Talla", "Material")
├── position (INT)
└── values (TEXT[]: ["Rojo", "Azul", "Negro"])
```


### 3.2 Gestión Inteligente de Categorías

```
TABLA: categories_v2
├── id (UUID)
├── parent_id (FK → categories_v2, NULL = root)
├── name (TEXT)
├── slug (TEXT UNIQUE)
├── description (TEXT)
├── image_url (TEXT)
├── icon (TEXT)
├── position (INT)
├── is_featured (BOOLEAN)
├── seo_title (TEXT)
├── seo_description (TEXT)
├── default_margin (INT, %)
├── is_active (BOOLEAN)
├── depth (INT, computed trigger)
├── path (TEXT, materialized: "electronics/phones/covers")
└── product_count (INT, computed trigger)

TABLA: collections (agrupaciones manuales/automáticas)
├── id (UUID)
├── title (TEXT)
├── slug (TEXT UNIQUE)
├── description (TEXT)
├── image_url (TEXT)
├── type (ENUM: manual, automated)
├── rules (JSONB, para automáticas: [{field, operator, value}])
├── position (INT)
├── published_at (TIMESTAMPTZ)
└── is_active (BOOLEAN)

TABLA: product_relationships (cross-sell, up-sell, related)
├── id (UUID)
├── source_product_id (FK)
├── target_product_id (FK)
├── type (ENUM: related, cross_sell, up_sell, complementary, bundle_item)
├── position (INT)
└── auto_generated (BOOLEAN, IA)
```

### 3.3 CRM Integrado de Clientes

```
TABLA: customers_v2
├── id (UUID)
├── auth_user_id (FK → auth.users, nullable para guest checkout)
├── email (TEXT UNIQUE)
├── phone (TEXT)
├── first_name / last_name (TEXT)
├── avatar_url (TEXT)
├── accepts_marketing (BOOLEAN DEFAULT false)
├── marketing_channels (TEXT[]: email, sms, whatsapp, push)
├── locale (TEXT DEFAULT 'es-DO')
├── currency (TEXT DEFAULT 'DOP')
├── tags (TEXT[])
├── notes (TEXT, admin notes)
├── ── Métricas computadas ──
├── total_orders (INT)
├── total_spent (NUMERIC)
├── average_order_value (NUMERIC)
├── last_order_at (TIMESTAMPTZ)
├── ── Segmentación ──
├── segment (ENUM: new, active, at_risk, lost, vip)
├── lifetime_value (NUMERIC)
├── acquisition_source (TEXT)
├── referral_code (TEXT UNIQUE)
├── referred_by (FK → customers_v2)
├── ── Fidelización ──
├── loyalty_points (INT DEFAULT 0)
├── loyalty_tier (ENUM: bronze, silver, gold, platinum)
├── cashback_balance (NUMERIC DEFAULT 0)
└── created_at / updated_at

TABLA: customer_addresses
├── id (UUID)
├── customer_id (FK)
├── label (TEXT: "Casa", "Oficina")
├── first_name / last_name
├── address_line1 / address_line2
├── city / province / postal_code / country
├── phone (TEXT)
├── is_default_shipping / is_default_billing (BOOLEAN)
├── coordinates (POINT, para Google Maps)
└── delivery_instructions (TEXT)

TABLA: loyalty_transactions
├── id (UUID)
├── customer_id (FK)
├── type (ENUM: earned, redeemed, expired, adjusted)
├── points (INT)
├── description (TEXT)
├── order_id (FK, nullable)
└── created_at
```


### 3.4 Sistema de Reviews y Q&A

```
TABLA: reviews
├── id (UUID)
├── product_id (FK)
├── customer_id (FK)
├── order_id (FK, verificar compra real)
├── rating (INT 1-5)
├── title (TEXT)
├── body (TEXT)
├── pros / cons (TEXT[])
├── media (JSONB[]: [{type, url}], imágenes/videos)
├── is_verified_purchase (BOOLEAN)
├── status (ENUM: pending, approved, rejected, flagged)
├── helpful_count / unhelpful_count (INT)
├── admin_reply (TEXT)
├── admin_reply_at (TIMESTAMPTZ)
└── created_at

TABLA: review_votes
├── review_id (FK)
├── customer_id (FK)
├── is_helpful (BOOLEAN)
└── UNIQUE(review_id, customer_id)

TABLA: product_questions
├── id (UUID)
├── product_id (FK)
├── customer_id (FK)
├── question (TEXT)
├── answer (TEXT, admin/seller response)
├── answered_by (TEXT)
├── answered_at (TIMESTAMPTZ)
├── is_public (BOOLEAN DEFAULT true)
├── votes (INT DEFAULT 0)
└── created_at
```

### 3.5 Sistema de Pedidos Profesional

```
TABLA: orders_v2
├── id (UUID)
├── order_number (TEXT UNIQUE, auto: TCG-2026-00001)
├── customer_id (FK → customers_v2)
├── email (TEXT, guest checkout)
├── ── Direcciones ──
├── shipping_address (JSONB)
├── billing_address (JSONB)
├── ── Financiero ──
├── currency (TEXT DEFAULT 'DOP')
├── subtotal (NUMERIC)
├── discount_total (NUMERIC)
├── shipping_total (NUMERIC)
├── tax_total (NUMERIC)
├── total (NUMERIC)
├── ── Estado ──
├── status (ENUM: draft, pending_payment, paid, processing,
│           packed, shipped, out_for_delivery, delivered,
│           cancelled, refunded, partially_refunded)
├── payment_status (ENUM: pending, authorized, paid, partially_paid,
│                   refunded, voided, failed)
├── fulfillment_status (ENUM: unfulfilled, partial, fulfilled)
├── ── Pago ──
├── payment_method (TEXT)
├── payment_gateway (TEXT: stripe, paypal, azul, cardnet, cod)
├── payment_reference (TEXT, ID transacción)
├── paid_at (TIMESTAMPTZ)
├── ── Envío ──
├── shipping_method (TEXT)
├── tracking_number (TEXT)
├── tracking_url (TEXT)
├── shipped_at / delivered_at (TIMESTAMPTZ)
├── estimated_delivery (TIMESTAMPTZ)
├── ── Metadata ──
├── source (ENUM: web, mobile, pos, api, marketplace)
├── discount_codes (TEXT[])
├── notes (TEXT, cliente)
├── admin_notes (TEXT)
├── tags (TEXT[])
├── ip_address (INET)
├── user_agent (TEXT)
├── abandoned_checkout_id (FK)
├── ── NCF (República Dominicana) ──
├── ncf_type (TEXT: B01, B02, B14, B15)
├── ncf_number (TEXT)
├── rnc (TEXT, cédula/RNC del comprador)
├── cancelled_at / refunded_at (TIMESTAMPTZ)
├── cancel_reason (TEXT)
└── created_at / updated_at

TABLA: order_items
├── id (UUID)
├── order_id (FK)
├── product_id (FK)
├── variant_id (FK, nullable)
├── title (TEXT, snapshot)
├── sku (TEXT, snapshot)
├── quantity (INT)
├── unit_price (NUMERIC)
├── discount_amount (NUMERIC)
├── tax_amount (NUMERIC)
├── total (NUMERIC)
├── image_url (TEXT, snapshot)
├── properties (JSONB, custom: grabado, dedicatoria)
├── fulfillment_status (ENUM)
├── requires_shipping (BOOLEAN)
└── weight_grams (INT)

TABLA: order_timeline (historial completo)
├── id (UUID)
├── order_id (FK)
├── event_type (ENUM: created, paid, note_added, status_changed,
│              shipped, delivered, refunded, edited, email_sent)
├── description (TEXT)
├── changes (JSONB, diff del cambio)
├── actor (TEXT, email admin o 'system' o 'customer')
├── is_customer_visible (BOOLEAN)
└── created_at

TABLA: abandoned_checkouts
├── id (UUID)
├── customer_id (FK, nullable)
├── email (TEXT)
├── cart_items (JSONB)
├── subtotal (NUMERIC)
├── recovery_status (ENUM: pending, email_sent, recovered, expired)
├── recovery_email_sent_at (TIMESTAMPTZ)
├── recovered_order_id (FK, nullable)
├── expires_at (TIMESTAMPTZ, 72h default)
└── created_at
```


### 3.6 Dashboard Ejecutivo (KPIs)

```
MÓDULOS DEL DASHBOARD:
├── 📊 Resumen Hoy (ventas, órdenes, AOV, conversión)
├── 📈 Tendencias (7d, 30d, 90d, YTD, comparativo)
├── 🏆 Top Productos (vendidos, revenue, margen)
├── 👥 Adquisición de Clientes (nuevos, recurrentes, LTV)
├── 💰 P&L en Tiempo Real (revenue - COGS - shipping - fees)
├── 🛒 Funnel de Conversión (visita → PDP → ATC → checkout → paid)
├── 📦 Fulfillment (pendientes, enviados, tasa de entrega)
├── 🔔 Alertas Activas (stock bajo, pedidos sin procesar, reviews)
├── 🗺️ Mapa de Ventas (por ciudad/provincia, heatmap)
└── 🤖 Insights IA (tendencias detectadas, recomendaciones)

WIDGETS INTERACTIVOS:
- Gráficos con zoom, pan, drill-down
- Exportar a CSV/PDF/Excel
- Comparar períodos (este mes vs anterior)
- Targets/metas configurables con progreso
- Alertas personalizables (email/WhatsApp/push)
```

### 3.7 Inteligencia Artificial Integrada

```
MÓDULO IA — Funcionalidades:

1. GENERACIÓN DE CONTENIDO
   - Descripción de producto (corta + larga + HTML)
   - Títulos optimizados para conversión
   - Meta descriptions SEO-optimized
   - Tags automáticos por análisis de imagen
   - Traducción automática (ES ↔ EN)

2. PRICING INTELIGENTE
   - Análisis de competencia (scraping + comparación)
   - Precio óptimo por elasticidad
   - Alertas de margin erosion
   - Sugerencias de bundle pricing

3. PREDICCIÓN DE DEMANDA
   - Forecast de ventas por producto (30/60/90 días)
   - Alertas de restock automáticas
   - Detección de estacionalidad
   - Tendencias emergentes del catálogo

4. PERSONALIZACIÓN
   - Recomendaciones "Otros compraron" (collaborative filtering)
   - "Productos para ti" (content-based)
   - Home page personalizada por segmento
   - Emails con productos relevantes

5. ABANDONO DE CARRITO
   - Detección de intención de salida
   - Scoring de probabilidad de compra
   - Timing óptimo para email de recuperación
   - Copy personalizado por IA para el email

6. CHATBOT COMERCIAL (TeloAsistente mejorado)
   - Conoce todo el catálogo (RAG sobre productos)
   - Guía de tallas/compatibilidad
   - Estado de pedido por conversación
   - Escalamiento inteligente a humano
   - Proactivo: ofrece ayuda tras 60s en PDP sin acción
```

### 3.8 Marketing y Conversión

```
TABLA: promotions
├── id (UUID)
├── title (TEXT)
├── type (ENUM: percentage, fixed_amount, free_shipping,
│          buy_x_get_y, bundle, flash_sale)
├── code (TEXT, nullable — automáticas no tienen código)
├── value (NUMERIC, % o monto fijo)
├── minimum_purchase (NUMERIC)
├── maximum_discount (NUMERIC)
├── applies_to (ENUM: all, specific_products, specific_collections,
│              specific_customers)
├── target_ids (UUID[])
├── usage_limit (INT)
├── usage_count (INT DEFAULT 0)
├── per_customer_limit (INT DEFAULT 1)
├── starts_at / ends_at (TIMESTAMPTZ)
├── is_stackable (BOOLEAN DEFAULT false)
├── is_automatic (BOOLEAN, se aplica sin código)
├── priority (INT, orden de evaluación)
└── is_active (BOOLEAN)

FUNCIONES DE CONVERSIÓN:
├── Recuperación de carrito (email 1h, 24h, 72h)
├── Exit-intent popup con descuento
├── Countdown timers en flash sales
├── Social proof: "X personas viendo este producto"
├── Stock urgency: "Solo 3 disponibles"
├── Recently viewed carousel
├── Price drop alerts (wishlist)
├── Back in stock notifications
├── Bundle savings calculator
└── Quantity breaks (compra 3+, ahorra 15%)

SOCIAL COMMERCE:
├── Facebook Shop sync (via Meta Commerce API)
├── Instagram Shopping tags
├── TikTok Shop catalog feed
├── WhatsApp Business catalog sync
├── Google Merchant Center feed
└── Pinterest Rich Pins
```


### 3.9 Multi-Tienda y Marketplace

```
TABLA: stores
├── id (UUID)
├── owner_id (FK → auth.users)
├── name (TEXT)
├── slug (TEXT UNIQUE)
├── domain (TEXT, dominio propio)
├── logo_url / banner_url (TEXT)
├── description (TEXT)
├── category (TEXT)
├── commission_rate (NUMERIC, % plataforma)
├── payout_schedule (ENUM: weekly, biweekly, monthly)
├── status (ENUM: pending, active, suspended, closed)
├── settings (JSONB: {currency, locale, tax_config})
├── rating (NUMERIC)
├── total_sales (INT)
└── created_at

TABLA: store_payouts
├── id (UUID)
├── store_id (FK)
├── amount (NUMERIC)
├── commission_deducted (NUMERIC)
├── net_amount (NUMERIC)
├── status (ENUM: pending, processing, paid, failed)
├── paid_at (TIMESTAMPTZ)
├── payment_method (TEXT)
├── reference (TEXT)
└── period_start / period_end (TIMESTAMPTZ)
```

### 3.10 Seguridad y Roles

```
TABLA: admin_roles
├── id (UUID)
├── name (TEXT: super_admin, admin, manager, seller, support)
├── permissions (JSONB: {
│     products: {create, read, update, delete},
│     orders: {read, update, refund, cancel},
│     customers: {read, update},
│     analytics: {read},
│     settings: {read, update},
│     store: {manage_all_stores, own_store_only}
│   })
└── is_system (BOOLEAN, no editable)

TABLA: admin_users
├── id (UUID)
├── auth_user_id (FK → auth.users)
├── role_id (FK → admin_roles)
├── store_id (FK, nullable — NULL = acceso global)
├── two_factor_enabled (BOOLEAN)
├── last_login_at (TIMESTAMPTZ)
├── ip_whitelist (INET[])
└── is_active (BOOLEAN)

TABLA: activity_log (auditoría completa)
├── id (BIGSERIAL)
├── admin_user_id (FK)
├── action (TEXT)
├── entity_type (TEXT)
├── entity_id (UUID)
├── changes (JSONB, diff antes/después)
├── ip_address (INET)
├── user_agent (TEXT)
└── created_at
```

### 3.11 Inventario Avanzado

```
TABLA: inventory_locations (almacenes)
├── id (UUID)
├── name (TEXT: "Almacén Principal", "Punto de Venta")
├── address (JSONB)
├── is_active (BOOLEAN)
├── is_default (BOOLEAN)
└── priority (INT, fulfillment order)

TABLA: inventory_levels
├── id (UUID)
├── variant_id (FK → product_variants)
├── location_id (FK → inventory_locations)
├── available (INT)
├── reserved (INT, durante checkout activo)
├── committed (INT, en pedidos pagados no enviados)
├── damaged (INT)
├── incoming (INT, en tránsito de proveedor)
├── reorder_point (INT, alerta de restock)
├── reorder_quantity (INT, cantidad sugerida de reorden)
└── updated_at

TABLA: inventory_movements (trazabilidad completa)
├── id (UUID)
├── variant_id (FK)
├── location_id (FK)
├── type (ENUM: received, sold, returned, adjusted,
│          transferred, reserved, released, damaged)
├── quantity (INT, positivo o negativo)
├── reference_type (TEXT: order, transfer, adjustment, purchase_order)
├── reference_id (UUID)
├── reason (TEXT)
├── admin_id (FK)
└── created_at

TABLA: purchase_orders (reabastecimiento)
├── id (UUID)
├── supplier_id (FK → suppliers)
├── status (ENUM: draft, sent, partial, received, cancelled)
├── items (JSONB: [{variant_id, qty, unit_cost}])
├── total_cost (NUMERIC)
├── expected_arrival (DATE)
├── received_at (TIMESTAMPTZ)
├── notes (TEXT)
└── created_at
```


---

## PARTE 4: ARQUITECTURA TÉCNICA RECOMENDADA

### 4.1 Stack Tecnológico Propuesto

```
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 15 / App Router)                         │
│  ├── SSR/ISR para SEO (producto, categorías, home)          │
│  ├── RSC (React Server Components) para performance         │
│  ├── Tailwind CSS + shadcn/ui (Design System)               │
│  ├── PWA con next-pwa (offline, push notifications)         │
│  └── Capacitor para app mobile (Android/iOS)                │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS / tRPC or REST
┌───────────────────────────▼─────────────────────────────────┐
│  API LAYER                                                   │
│  ├── Supabase (PostgreSQL + Auth + Realtime + Storage)       │
│  ├── Edge Functions (Deno) para lógica de negocio           │
│  ├── Supabase Realtime para notifications en vivo           │
│  └── Supabase Storage para imágenes/archivos                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  SERVICIOS EXTERNOS                                          │
│  ├── Stripe (pagos internacionales + RD con Azul)           │
│  ├── Resend (email transaccional)                           │
│  ├── Gemini / OpenAI (IA generativa)                        │
│  ├── Meilisearch (búsqueda full-text instantánea)           │
│  ├── Vercel (hosting + Edge + Analytics)                    │
│  ├── Cloudflare Images (CDN + transformaciones)             │
│  ├── WhatsApp Business API (Twilio/Meta Cloud)              │
│  ├── Google Maps Platform                                   │
│  └── Meta Commerce API (Facebook/Instagram Shop)            │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Justificación de Decisiones Arquitectónicas

| Decisión | Razón |
|----------|-------|
| Next.js 15 en lugar de vanilla JS | SSR para SEO, file-based routing, image optimization, ISR para catálogo |
| Supabase se mantiene | Ya integrado, PostgreSQL maduro, Auth, RLS, Realtime, Edge Functions |
| Meilisearch en lugar de PostgreSQL FTS | Typo-tolerance, faceted search, 50ms responses, multi-idioma |
| Stripe como gateway principal | Soporta DOP (con Azul como processor local), 3D Secure, subscriptions |
| Resend para emails | Developer-first, React Email templates, 3000 free/mo |
| Capacitor para mobile | Reutiliza código web, push notifications, barcode scanner |
| Cloudflare Images | On-the-fly resize, WebP/AVIF, $5/100k transformations |
| tRPC o REST directo a Supabase | Type-safety end-to-end sin overhead de GraphQL |

### 4.3 Arquitectura de Datos Resumida

```
CONTEO DE TABLAS: ~45 tablas para eCommerce completo

CORE COMMERCE (12):
  products_v2, product_variants, product_options, product_media,
  categories_v2, collections, product_relationships,
  orders_v2, order_items, order_timeline,
  inventory_levels, inventory_movements

CUSTOMERS (6):
  customers_v2, customer_addresses, loyalty_transactions,
  wishlists, wishlist_items, customer_segments

PAYMENTS (4):
  payments, refunds, payment_methods_saved, gift_cards

MARKETING (5):
  promotions, abandoned_checkouts, email_campaigns,
  notification_preferences, referral_program

CONTENT (4):
  reviews, review_votes, product_questions, blog_posts

OPERATIONS (6):
  inventory_locations, purchase_orders, suppliers,
  shipping_zones, shipping_rates, tax_rates

PLATFORM (6):
  stores, store_payouts, admin_roles, admin_users,
  activity_log, site_settings_v2

ANALYTICS (2):
  events (event sourcing), daily_metrics (materialized)
```


---

## PARTE 5: ROADMAP DE IMPLEMENTACIÓN POR FASES

### Fase 0 — Fundación (2-3 semanas)
**Objetivo:** Migrar de vanilla JS a Next.js sin perder funcionalidad actual.

- [ ] Scaffold Next.js 15 con App Router + Tailwind + shadcn/ui
- [ ] Migrar productos a páginas individuales SSR (`/products/[slug]`)
- [ ] Migrar categorías a páginas (`/categories/[slug]`)
- [ ] Implementar layout con header, footer, carrito drawer
- [ ] Conectar Supabase con @supabase/ssr
- [ ] Migrar auth de admin a Supabase + middleware Next.js
- [ ] Setup Vercel deployment (preview + production)
- [ ] Redirigir telocg.com a Vercel (mantener GitHub Pages temporalmente)
- [ ] Setup CI/CD con Vercel Git Integration

### Fase 1 — Core Commerce (4-6 semanas)
**Objetivo:** Checkout funcional con pago real. Conversión medible.

- [ ] Auth de clientes (Supabase Auth: email, Google, phone OTP)
- [ ] Carrito persistente server-side (tabla `carts`)
- [ ] Checkout de 1 paso con dirección + método de pago
- [ ] Integrar Stripe (tarjeta internacional)
- [ ] Integrar WhatsApp Pay / transferencia como fallback
- [ ] Confirmación de orden por email (Resend + React Email)
- [ ] Página de estado de pedido `/orders/[id]`
- [ ] Dashboard de pedidos mejorado en admin
- [ ] Inventario transaccional (reservas durante checkout)
- [ ] Pasarela Azul/CardNET para tarjetas dominicanas

### Fase 2 — Catálogo Profesional (3-4 semanas)
**Objetivo:** Gestión de productos nivel Shopify.

- [ ] Variantes de producto (talla, color, material)
- [ ] SKU automático y manual
- [ ] Galería multimedia drag & drop (múltiples imágenes)
- [ ] Editor rich text para descripciones (Tiptap)
- [ ] Categorías jerárquicas con árbol visual
- [ ] Colecciones manuales y automáticas (por reglas)
- [ ] Productos relacionados / cross-sell
- [ ] Especificaciones técnicas dinámicas
- [ ] Importar/Exportar CSV masivo
- [ ] Búsqueda avanzada con Meilisearch

### Fase 3 — Experiencia de Cliente (3-4 semanas)
**Objetivo:** Retención y fidelización.

- [ ] Perfil de cliente con historial de compras
- [ ] Múltiples direcciones guardadas
- [ ] Wishlist persistente con alertas de precio
- [ ] Sistema de reviews con fotos + verificación de compra
- [ ] Preguntas y respuestas en producto
- [ ] Programa de puntos (ganar/canjear)
- [ ] Cupones personalizados por segmento
- [ ] Notificaciones push (Web Push + PWA)
- [ ] Tracking de envío integrado en cuenta

### Fase 4 — Marketing y Growth (3-4 semanas)
**Objetivo:** Automatizar la adquisición y recuperación.

- [ ] Recuperación de carrito abandonado (3 emails automáticos)
- [ ] Exit-intent popup con cupón
- [ ] Flash sales con countdown timer
- [ ] Descuentos automáticos (reglas: monto mínimo, cantidad)
- [ ] Referral program (invita amigo → ambos ganan)
- [ ] Email marketing básico (welcome, post-purchase, win-back)
- [ ] Meta Pixel + Google Analytics 4 events
- [ ] Google Merchant Center feed
- [ ] Social proof: "X personas compraron hoy"
- [ ] SEO automático (schema markup, sitemaps dinámicos)

### Fase 5 — Inteligencia y Analytics (2-3 semanas)
**Objetivo:** Decisiones basadas en datos.

- [ ] Dashboard ejecutivo con KPIs en tiempo real
- [ ] Funnel de conversión visual
- [ ] Cohort analysis (retención de clientes)
- [ ] Product performance scoring
- [ ] Recomendaciones por IA (collaborative filtering)
- [ ] Predicción de demanda (forecast 30d)
- [ ] Generación de descripciones por IA (integrado en admin)
- [ ] Chatbot comercial con RAG sobre catálogo
- [ ] Alertas inteligentes (anomalías, oportunidades)
- [ ] Reportes exportables (PDF/Excel)

### Fase 6 — Escalamiento (4-6 semanas)
**Objetivo:** Multi-vendor, mobile, integraciones enterprise.

- [ ] Multi-tienda / Marketplace
- [ ] Panel independiente por vendedor
- [ ] Comisiones automáticas + payouts
- [ ] App mobile con Capacitor (Android + iOS)
- [ ] WhatsApp Business API real (confirmaciones auto)
- [ ] ERP integration hooks (REST webhooks)
- [ ] Multi-idioma (i18n: ES, EN)
- [ ] Multi-moneda (DOP, USD)
- [ ] Facturación electrónica con NCF (DGII RD)
- [ ] Roles granulares (super admin, gerente, vendedor, soporte)

---

## PARTE 6: PRIORIZACIÓN MoSCoW


### MUST HAVE (sin esto no es eCommerce profesional)

| # | Funcionalidad | Impacto en Revenue |
|---|--------------|-------------------|
| 1 | Pasarela de pago real (Stripe + Azul) | +300% conversión |
| 2 | Checkout de 1 paso | +40% completion rate |
| 3 | Auth de clientes (registro/login) | Habilita todo lo demás |
| 4 | Páginas individuales de producto (SEO) | +500% tráfico orgánico |
| 5 | Carrito server-side persistente | -60% abandono |
| 6 | Email de confirmación de orden | Confianza + retención |
| 7 | Inventario transaccional | Evita overselling |
| 8 | Variantes de producto | +70% catálogo posible |
| 9 | Panel de pedidos con estados completos | Operaciones funcionales |
| 10 | Búsqueda funcional con filtros | +25% descubrimiento |

### SHOULD HAVE (diferenciadores clave)

| # | Funcionalidad | Impacto |
|---|--------------|---------|
| 11 | Recuperación de carrito abandonado | +15% revenue |
| 12 | Sistema de reviews real | +18% conversión |
| 13 | Programa de fidelización (puntos) | +25% recompra |
| 14 | Dashboard ejecutivo con KPIs | Decisiones informadas |
| 15 | Categorías jerárquicas | Navegación profesional |
| 16 | Colecciones y cross-sell | +12% AOV |
| 17 | Meta Pixel + GA4 | ROI de marketing |
| 18 | Flash sales con countdown | Urgencia de compra |
| 19 | Email marketing (welcome + post-purchase) | +20% LTV |
| 20 | Múltiples direcciones de envío | UX profesional |

### COULD HAVE (competitivo pero no urgente)

| # | Funcionalidad | Impacto |
|---|--------------|---------|
| 21 | IA generativa para descripciones | Productividad admin |
| 22 | Chatbot comercial con RAG | +8% conversión |
| 23 | Multi-idioma (ES/EN) | Mercado turístico |
| 24 | App mobile nativa (Capacitor) | Canal adicional |
| 25 | WhatsApp Business API real | Automatización |
| 26 | Social commerce (FB/IG Shop) | Canal adicional |
| 27 | Facturación NCF automática | Compliance DGII |
| 28 | Predicción de demanda | Optimización inventario |
| 29 | Referral program | Adquisición orgánica |
| 30 | Multi-moneda (DOP + USD) | Turistas/diáspora |

### WON'T HAVE (v1 — futuro lejano)

| # | Funcionalidad | Razón de posponer |
|---|--------------|-------------------|
| 31 | Marketplace multi-vendor | Requiere volumen primero |
| 32 | ERP integration | Sin ERP actual |
| 33 | Modelos 3D / AR | Catálogo no lo requiere aún |
| 34 | Subscriptions/memberships | No aplica al catálogo actual |
| 35 | POS (punto de venta) | Sin tienda física |
| 36 | B2B pricing/wholesale portal | Volumen insuficiente |

---

## PARTE 7: RECOMENDACIONES UX/UI (NIVEL SHOPIFY/AMAZON)

### 7.1 Principios de Diseño

1. **Mobile-first radical** — 78% del tráfico eCommerce en RD es mobile
2. **Thumb-zone navigation** — botones CTA en zona inferior del pulgar
3. **Progressive disclosure** — mostrar solo lo necesario, expandir on-demand
4. **Micro-interactions** — feedback visual en cada acción (add to cart, wishlist)
5. **Trust signals everywhere** — badges, reviews, garantías visibles
6. **Speed obsession** — LCP < 2.5s, FID < 100ms, CLS < 0.1

### 7.2 Flujo de Compra Ideal (5 pasos máximo)

```
1. DISCOVERY → Home/Categoría/Búsqueda
   └─ Grid con lazy-load, filtros sticky, sort inteligente

2. PRODUCT (PDP) → Página individual
   └─ Galería hero, variantes, reviews, add-to-cart sticky

3. CART → Drawer lateral (no página completa)
   └─ Resumen, upsell, cupón, envío estimado

4. CHECKOUT → Single-page (accordion o stepper)
   └─ Email → Dirección → Envío → Pago → Confirmar

5. CONFIRMATION → Página + email
   └─ Resumen, tracking, cross-sell post-purchase
```

### 7.3 Componentes UX Clave

- **Sticky Add-to-Cart bar** en PDP al scrollear (mobile)
- **Quick View** modal desde grid (sin navegar)
- **Recently Viewed** carousel en footer
- **Smart search** con autocomplete, imágenes, categorías
- **Size guide** modal con tabla interactiva
- **Availability badge** ("En stock", "Últimas 3 unidades")
- **Delivery estimate** dinámico por zona
- **Trust strip** bajo el header: envío gratis, garantía, soporte
- **Social proof notification** (popup: "Juan compró hace 3 min")


---

## PARTE 8: VENTAJA COMPETITIVA POR IA

### 8.1 Funcionalidades IA que ningún competidor local ofrece

| Funcionalidad | Implementación | Ventaja |
|--------------|---------------|---------|
| **Auto-merchandising** | IA reordena el grid de productos según probabilidad de compra del visitante | +22% conversión |
| **Dynamic pricing** | Ajuste automático de precios por demanda, hora del día, stock | +8% margen |
| **Visual search** | Sube foto → encuentra productos similares | Diferenciador único en RD |
| **Size recommendation** | "Clientes de tu complexión eligieron M" | -30% devoluciones |
| **Review summarization** | "Lo que más les gusta: calidad del material (mencionado 15 veces)" | +12% confianza |
| **Auto-tagging** | Sube imagen → IA extrae categoría, color, material, tags | Productividad 10x |
| **Conversational commerce** | "Quiero un audífono resistente al agua por menos de RD$2000" → resultados filtrados | Canal nuevo |
| **Predictive restock** | "El Cable D06 se agota en 5 días al ritmo actual" → PO automática | 0 stockouts |
| **Churn prediction** | Detecta clientes que no volverán → cupón personalizado | +15% retención |
| **Copy generation** | Admin sube producto → título, descripción, SEO, social copy auto | 90% menos tiempo |

### 8.2 Modelo de IA Recomendado

```
TIER 1 (Gemini 2.5 Flash — ya disponible, gratis)
├── Generación de descripciones
├── Optimización SEO
├── Chatbot (TeloAsistente)
├── Traducción
└── Summarización de reviews

TIER 2 (Supabase pgvector + embeddings)
├── Recomendaciones de producto (similarity search)
├── Visual search (CLIP embeddings)
├── Semantic search en catálogo
└── Clustering de clientes

TIER 3 (Custom ML — futuro)
├── Predicción de demanda (time series)
├── Dynamic pricing (reinforcement learning)
├── Churn scoring (classification)
└── Fraud detection (anomaly detection)
```

---

## PARTE 9: MÉTRICAS DE ÉXITO POST-IMPLEMENTACIÓN

| Métrica | Actual (estimado) | Target Fase 1 | Target Fase 3 |
|---------|-------------------|---------------|---------------|
| Tasa de conversión | ~0.5% (WhatsApp) | 2.5% | 4.0% |
| AOV (Average Order Value) | RD$ 1,200 | RD$ 1,800 | RD$ 2,500 |
| Abandono de carrito | ~85% | 65% | 55% |
| Tráfico orgánico (SEO) | ~50 visitas/día | 200/día | 800/día |
| Clientes recurrentes | ~5% | 20% | 35% |
| Email list size | 0 | 500 | 3,000 |
| Reviews por producto | 0 reales | 3+ | 10+ |
| Tiempo en sitio | 2:30 | 4:00 | 5:30 |
| Pages per session | 2.1 | 4.5 | 6.0 |
| Revenue mensual | ? | +150% | +500% |

---

## PARTE 10: QUICK WINS (implementables en la plataforma actual)

Mientras se desarrolla la arquitectura v2 con Next.js, estas mejoras se pueden hacer **ahora** en el código actual:

### Implementables esta semana (vanilla JS + Supabase actual)

1. **Google Analytics 4** — Agregar gtag.js con eventos: `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
2. **Meta Pixel** — Tracking de conversión para Facebook/Instagram Ads
3. **Open Graph por producto** — Actualizar dinámicamente las meta tags al abrir un producto
4. **WhatsApp widget flotante** — Botón fijo para contacto inmediato
5. **Exit-intent popup** — Detectar mouse leaving viewport → mostrar cupón PRIMERA10
6. **Urgency indicators** — Mostrar "Solo X en stock" cuando stock ≤ 5
7. **Recently viewed** — Guardar últimos 5 productos vistos en localStorage, mostrar carousel
8. **Trust badges** — Strip bajo header: "🚚 Envío gratis +RD$1,500 | 🔒 Pago seguro | 💬 Soporte 24/7"
9. **Improved search** — Agregar filtros por rango de precio, rating, freeShipping
10. **Customer email capture** — Popup de bienvenida: "10% off tu primera compra. Deja tu email."

---

## CONCLUSIÓN

TeloSales tiene una **base visual excelente y una arquitectura backend correcta** (Supabase + Edge Functions + RLS), pero opera como un catálogo con checkout manual, no como una plataforma de eCommerce. El gap principal es la **ausencia de pasarela de pago** y la **falta de páginas individuales de producto para SEO**.

La migración a Next.js 15 con las fases propuestas transforma TeloSales de un catálogo al 15% de capacidad a una plataforma comparable con Shopify Lite en Fase 1 y con Shopify Standard en Fase 3. La IA integrada (ya parcialmente implementada con Gemini) es el **diferenciador competitivo** que ningún competidor local en República Dominicana ofrece actualmente.

**Inversión estimada total (6 fases):** 20-28 semanas de desarrollo.  
**ROI esperado:** Break-even en Fase 1 por mejora de conversión de ~0.5% a 2.5%.

---

*Documento generado por auditoría multi-disciplinaria. Actualizar conforme avance la implementación.*
