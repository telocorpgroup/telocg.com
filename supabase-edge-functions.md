# Supabase Edge Functions — TeloCorp Group v4.0

Guía de deploy y configuración de las Edge Functions del ecosistema TeloCorp.

## 📋 Edge Functions disponibles

| Función | Propósito | Secret requerido |
|---------|-----------|------------------|
| `chat` | Proxy de Gemini 2.0 Flash para TeloAsistente | `GEMINI_API_KEY` |
| `upload-image` | Proxy de ImgBB para subir imágenes de productos | `IMGBB_API_KEY` |
| `ai-specs` | Generación de especificaciones de producto con Gemini (NUEVA v4.0) | `GEMINI_API_KEY` |
| `create-checkout` | Crea sesión de Stripe Checkout | `STRIPE_SECRET_KEY` |

## 🔧 Deploy

### Pre-requisitos
```bash
npm install -g supabase
supabase login
```

### Configurar secrets (una sola vez)
```bash
supabase secrets set GEMINI_API_KEY=tu_key_aqui --project-ref bhdictzvboiojyxorfiq
supabase secrets set IMGBB_API_KEY=tu_key_aqui --project-ref bhdictzvboiojyxorfiq
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx --project-ref bhdictzvboiojyxorfiq
```

### Deploy de todas las funciones

**⚠️ IMPORTANTE:** La ruta del workspace contiene caracteres especiales (OneDrive + acentos).
Copia la carpeta `supabase/` a una ruta sin espacios antes de deployar:

```bash
# 1. Copiar a ruta limpia
xcopy /E /I "supabase" "C:\temp\sb-deploy\supabase"

# 2. Deployar desde ahí
cd C:\temp\sb-deploy
supabase functions deploy chat --project-ref bhdictzvboiojyxorfiq --no-verify-jwt
supabase functions deploy upload-image --project-ref bhdictzvboiojyxorfiq --no-verify-jwt
supabase functions deploy ai-specs --project-ref bhdictzvboiojyxorfiq --no-verify-jwt
supabase functions deploy create-checkout --project-ref bhdictzvboiojyxorfiq --no-verify-jwt
```

### Invocación desde el frontend

```javascript
const SB_URL = 'https://bhdictzvboiojyxorfiq.supabase.co';
const SB_ANON_KEY = 'sb_publishable_AgpNN0k_KfW0moe6f1CKXg_qP2GKJCm';

// Chat (TeloAsistente)
const res = await fetch(`${SB_URL}/functions/v1/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SB_ANON_KEY}` },
  body: JSON.stringify({ message: 'Hola' })
});

// Subida de imagen (admin)
const fd = new FormData();
fd.append('image', file);
const res = await fetch(`${SB_URL}/functions/v1/upload-image`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${SB_ANON_KEY}` },
  body: fd
});

// AI Specs (admin, NUEVA v4.0)
const res = await fetch(`${SB_URL}/functions/v1/ai-specs`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SB_ANON_KEY}` },
  body: JSON.stringify({ product_name: 'iPhone 15 Pro' })
});
```

## 🔒 Seguridad

- **Las API keys NUNCA se exponen en el frontend.** Viven exclusivamente como secrets de Supabase.
- Las Edge Functions actúan como proxies que inyectan la API key server-side.
- `--no-verify-jwt` permite invocación desde el storefront público (clientes no autenticados crean órdenes/leads).
- El admin panel (`admin.js`) autentica con Supabase Auth real; el token JWT se inyecta automáticamente en las queries posteriores.
- RLS granular protege UPDATE/DELETE: solo `is_admin()` (definida en SQL) permite modificaciones.

## 🆕 ai-specs (nueva en v4.0)

Reemplaza la llamada directa a la API de Gemini desde el frontend del admin (que exponía la API key en base64). Genera 5 especificaciones técnicas realistas para un producto.

**Request:**
```json
{ "product_name": "AirPods Pro 2", "context": "Inalámbricos, cancelación de ruido" }
```

**Response:**
```json
{ "specs": { "Tipo": "In-ear", "Cancelación": "Activa ANC", "Batería": "6h + 24h estuche" } }
```

## 🗃️ Base de datos

Ejecutar `supabase-schema-migration-v4.sql` en Supabase Dashboard → SQL Editor para:
- Crear tablas nuevas: `courses`, `categories`, `technicians`, `services_catalog`, `site_settings`, `audit_log`
- Aplicar RLS granular (SELECT público, INSERT público para clientes, UPDATE/DELETE solo admin)
- Crear función `is_admin()` para verificar permisos
- Cargar datos semilla (cursos, técnicos, catálogo de servicios)
- Crear triggers `updated_at` automáticos
- Crear índices para performance

## 👤 Crear usuario admin

1. Ejecutar `supabase-schema-migration-v4.sql`
2. Supabase Dashboard → Authentication → Users → Add user
3. Email: `admin@telocg.com`, contraseña segura, marcar "Auto Confirm User"
4. La función `is_admin()` otorga permisos automáticamente si el email termina en `@telocg.com`
