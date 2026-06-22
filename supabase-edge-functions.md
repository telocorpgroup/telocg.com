# Supabase Edge Functions para TeloCorp

Este proyecto usa Edge Functions para mantener claves sensibles fuera del frontend.

## Despliegue

1. Instala Supabase CLI: `npm install -g supabase`
2. Enlaza tu proyecto: `supabase link --project-ref <PROJECT_REF>`
3. Configura secretos desde tu entorno seguro:

```bash
supabase secrets set GEMINI_API_KEY=<GEMINI_API_KEY>
supabase secrets set IMGBB_API_KEY=<IMGBB_API_KEY>
supabase secrets set STRIPE_SECRET_KEY=<STRIPE_SECRET_KEY>
supabase secrets set ALLOWED_ORIGINS=https://telocg.com,http://localhost:5500
```

4. Despliega las funciones:

```bash
supabase functions deploy chat --no-verify-jwt
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy upload-image
```

## Funciones

- `chat`: proxy del asistente IA. Valida tamaño de mensaje y restringe CORS por `ALLOWED_ORIGINS`.
- `upload-image`: proxy autenticado para subida de imágenes. Requiere JWT válido y limita el archivo a imagen menor de 5 MB.
- `create-checkout`: crea sesiones de Stripe Checkout con validación básica de items y redirects permitidos.

## Notas de seguridad

- No versionar claves reales en documentación, HTML o JavaScript.
- El usuario administrador de Supabase Auth debe tener `app_metadata.role = "admin"`.
- Las políticas RLS del esquema permiten inserciones públicas para formularios, pero lectura y gestión de datos sensibles solo para administradores.
