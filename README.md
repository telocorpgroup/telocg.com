# Telo' Corp Group — Plataforma Digital v4.2

> Super-app multi-servicio para República Dominicana: e-commerce, academia online, logística, reparación e instalaciones técnicas.

**🌐 Producción:** [telocg.com](https://telocg.com) · **🔐 Admin:** [telocg.com/admin.html](https://telocg.com/admin.html)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (HTML + CSS + JS vanilla, SPA)                │
│  index.html · script.js · styles.css · admin.html       │
│  admin.js · sw.js · manifest.json                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
┌────────────────────────▼────────────────────────────────┐
│  Supabase (PostgreSQL + Auth + RLS + Edge Functions)    │
│  • 19 tablas con RLS granular                           │
│  • Auth real (email/password, server-side verified)     │
│  • 4 Edge Functions (chat, upload-image, ai-specs,      │
│    notify-whatsapp)                                     │
└────────────────────────┬────────────────────────────────┘
                         │ Secrets (nunca en frontend)
┌────────────────────────▼────────────────────────────────┐
│  Servicios externos: Gemini IA · ImgBB · Google Maps ·  │
│  WhatsApp · PayPal · CardNET (link de pago vía WA)      │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Stack

- **Frontend:** HTML5, CSS3 (Design System con tokens), JavaScript vanilla (SPA)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Row Level Security)
- **IA:** Gemini 2.0 Flash vía Edge Function proxy
- **Mapas:** Google Maps JavaScript API + Places + Directions (lazy-loaded)
- **Imágenes:** wsrv.nl CDN (auto WebP) + ImgBB vía Edge Function
- **Deploy:** GitHub Pages directo desde main (push = live)
- **PWA:** Service Worker + Web App Manifest (instalable, offline-capable)
- **Pagos:** CardNET (link vía WhatsApp), Transferencia bancaria, PayPal

## 📦 Servicios del ecosistema

| Servicio | Función | Estado |
|----------|---------|--------|
| 🛒 **TeloSales** | Tienda con catálogo dinámico, carrito, cupones, checkout inline | ✅ Funcional |
| 🎓 **TeloEduca** | Academia con cursos CRUD, aula virtual, quiz, certificados | ✅ Funcional |
| 📦 **TeloLleva** | Logística con Google Maps, conductores reales, tracking | ✅ Funcional |
| 🔧 **TeloRepara** | Reparación con cotizador, tickets, tracking por estados | ✅ Funcional |
| 🛠️ **TeloInstala** | Instalaciones con técnicos reales, agenda, tracking | ✅ Funcional |
| 🤖 **TeloAsistente** | Chat IA con RAG del catálogo (Gemini 2.0 Flash) | ✅ Funcional |

## 🚀 Setup local

```bash
git clone https://github.com/telocorpgroup/telocg.com.git
cd telocg.com

# Abrir localmente (cualquier servidor estático)
python -m http.server 8000
# → http://localhost:8000
```

## 🗃️ Configurar backend (Supabase)

1. **Ejecutar migración:** `supabase-schema-migration-v4.sql` → Supabase Dashboard → SQL Editor → Run
2. **Ejecutar v4.1:** `supabase-schema-migration-v4.1.sql` (drivers, notifications, orders_history)
3. **Ejecutar v4.2:** `supabase-schema-migration-v4.2.sql` (site_settings columns)
4. **Fix RLS:** `supabase-fix-admin-rls.sql` (policies UPDATE/DELETE para orders)
5. **Crear usuario admin:** Authentication → Users → Add user → `admin@telocg.com` (Auto Confirm)
6. **Deployar Edge Functions:** Ver [`supabase-edge-functions.md`](supabase-edge-functions.md)
7. **Configurar secrets:**
   ```bash
   supabase secrets set GEMINI_API_KEY=xxx --project-ref bhdictzvboiojyxorfiq
   supabase secrets set IMGBB_API_KEY=xxx --project-ref bhdictzvboiojyxorfiq
   ```

## 🔐 Panel admin

- **URL:** `telocg.com/admin.html`
- **Auth:** Supabase Auth real (token validado server-side + verificación de rol admin)
- **Módulos:** Dashboard (gráficos Chart.js), TeloSales CRUD, TeloEduca CRUD, TeloLleva, TeloRepara, TeloInstala, Miembros, Categorías, Técnicos, Conductores, Servicios, Configuración
- **Configuración dinámica:** exit-popup, social proof, flash sale, métodos de pago, chatbot, GA4, Meta Pixel, promo banner — todo desde admin

## 📁 Estructura

```
├── index.html                          # Tienda pública (SPA, SEO, PWA)
├── script.js                           # Lógica frontend completa
├── styles.css                          # Design System (dark theme, responsive, AA)
├── admin.html                          # Panel admin (12 módulos)
├── admin.js                            # Lógica admin (auth real, CRUD, gráficos)
├── sw.js                               # Service Worker (offline page, stale-while-revalidate)
├── manifest.json                       # PWA manifest
├── robots.txt / sitemap.xml            # SEO
├── assets/                             # Logo y marca
├── supabase-schema.sql                 # Schema original (v3)
├── supabase-schema-migration-v4.sql    # Migración v3→v4
├── supabase-schema-migration-v4.1.sql  # v4→v4.1 (drivers, notifications)
├── supabase-schema-migration-v4.2.sql  # v4.1→v4.2 (site_settings columns)
├── supabase-fix-admin-rls.sql          # Fix policies UPDATE/DELETE
├── supabase-edge-functions.md          # Docs de deploy
├── supabase/
│   ├── config.toml                     # Config local Supabase
│   └── functions/
│       ├── chat/index.ts               # Gemini proxy (TeloAsistente)
│       ├── upload-image/index.ts       # ImgBB proxy (admin)
│       ├── ai-specs/index.ts           # Gemini specs (admin)
│       └── notify-whatsapp/index.ts    # Notificaciones WhatsApp
├── ECOSYSTEM-AUDITORIA-REDISENO.md     # Auditoría de servicios
└── TELOSALES-AUDITORIA-REDISENO.md     # Auditoría e-commerce
```

## 📜 Licencia

Propietaria — © 2024-2026 TeloCorp Group. Todos los derechos reservados.
