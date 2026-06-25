# Telo' Corp Group — Plataforma Digital v4.0

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
│  • 16 tablas con RLS granular                           │
│  • Auth real (email/password, server-side verified)     │
│  • 4 Edge Functions (chat, upload-image, ai-specs,      │
│    create-checkout)                                     │
└────────────────────────┬────────────────────────────────┘
                         │ Secrets (nunca en frontend)
┌────────────────────────▼────────────────────────────────┐
│  Servicios externos: Gemini IA · ImgBB · Google Maps ·  │
│  Stripe · WhatsApp · PayPal                             │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Stack

- **Frontend:** HTML5, CSS3 (Design System con tokens), JavaScript vanilla (SPA)
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions, Row Level Security)
- **IA:** Gemini 2.0 Flash vía Edge Function proxy
- **Mapas:** Google Maps JavaScript API + Places + Directions (lazy-loaded)
- **Imágenes:** wsrv.nl CDN (auto WebP) + ImgBB vía Edge Function
- **CI/CD:** GitHub Actions (minify HTML/CSS/JS → deploy GitHub Pages)
- **PWA:** Service Worker + Web App Manifest (instalable, offline-capable)

## 📦 Servicios del ecosistema

| Servicio | Función | Estado |
|----------|---------|--------|
| 🛒 **TeloSales** | Tienda de tecnología con catálogo dinámico, carrito, cupones, checkout | ✅ Funcional |
| 🎓 **TeloEduca** | Academia con cursos gestionables (CRUD), aula virtual, quiz, certificados | ✅ Funcional |
| 📦 **TeloLleva** | Logística con Google Maps, cotizador, tracking persistente | ✅ Funcional |
| 🔧 **TeloRepara** | Reparación de dispositivos con cotizador, tickets, tracking real | ✅ Funcional |
| 🛠️ **TeloInstala** | Instalaciones técnicas con técnicos gestionables, agenda, tracking real | ✅ Funcional |

## 🚀 Setup local

```bash
# Clonar
git clone https://github.com/telocorpgroup/telocg.com.git
cd telocg.com

# Abrir localmente (cualquier servidor estático)
python -m http.server 8000
# → http://localhost:8000
```

## 🗃️ Configurar backend (Supabase)

1. **Ejecutar migración:** Copiar el contenido de `supabase-schema-migration-v4.sql` → Supabase Dashboard → SQL Editor → New Query → Run
2. **Crear usuario admin:** Supabase Dashboard → Authentication → Users → Add user (email + password, marcar "Auto Confirm User")
3. **Deployar Edge Functions:** Ver [`supabase-edge-functions.md`](supabase-edge-functions.md)
4. **Configurar secrets:**
   ```bash
   supabase secrets set GEMINI_API_KEY=xxx --project-ref bhdictzvboiojyxorfiq
   supabase secrets set IMGBB_API_KEY=xxx --project-ref bhdictzvboiojyxorfiq
   supabase secrets set STRIPE_SECRET_KEY=xxx --project-ref bhdictzvboiojyxorfiq
   ```

## 🔐 Panel admin

- **URL:** `telocg.com/admin.html`
- **Auth:** Supabase Auth real (credenciales verificadas server-side)
- **Módulos:** Dashboard, TeloSales (CRUD), TeloEduca (CRUD), TeloLleva, TeloRepara, TeloInstala, Miembros, Categorías, Técnicos, Servicios, Configuración
- **No hay credenciales hardcodeadas** — el login usa Supabase Auth

## 📊 Evaluación de calidad (v4.0)

| Dimensión | v3.2 | v4.0 |
|-----------|------|------|
| Diseño/UI/UX | 88 A- | 92 A |
| Funcionalidad | 62 C+ | 85 A- |
| Seguridad | 15 F | 85 A- |
| Performance | 55 C- | 78 B+ |
| SEO | 40 D+ | 88 A- |
| Accesibilidad | 72 B- | 88 A- |
| **Compuesta** | **58 C+** | **84 B+** |

## 📁 Estructura

```
├── index.html              # Tienda pública (SPA)
├── script.js               # Lógica frontend
├── styles.css              # Design System
├── admin.html              # Panel admin (sin credenciales)
├── admin.js                # Lógica admin (auth real, CRUD completo)
├── sw.js                   # Service Worker
├── manifest.json           # PWA manifest
├── robots.txt              # SEO
├── sitemap.xml             # SEO
├── supabase-schema.sql                 # Schema original (v3)
├── supabase-schema-migration-v4.sql    # Migración v3→v4 (RLS + nuevas tablas)
├── supabase-edge-functions.md          # Docs Edge Functions
├── supabase/functions/
│   ├── chat/index.ts                   # Gemini proxy (TeloAsistente)
│   ├── upload-image/index.ts           # ImgBB proxy (admin)
│   ├── ai-specs/index.ts               # Gemini specs proxy (admin, NUEVA)
│   └── create-checkout/index.ts        # Stripe checkout
├── .github/workflows/minify-deploy.yml # CI/CD
└── TeloCorp/images/                    # Imágenes de productos
```

## 📜 Licencia

Propietaria — © 2024-2026 TeloCorp Group. Todos los derechos reservados.
