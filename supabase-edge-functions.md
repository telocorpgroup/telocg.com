# Supabase Edge Functions para TeloCorp

## Función: chat (TeloAsistente IA)

Para desplegar esta Edge Function en Supabase:

1. Instala Supabase CLI: `npm install -g supabase`
2. Enlaza tu proyecto: `supabase link --project-ref bhdictzvboiojyxorfiq`
3. Crea la función: `supabase functions new chat`
4. Reemplaza el contenido de `supabase/functions/chat/index.ts` con:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  const { message, context } = await req.json()
  const systemPrompt = `Eres TeloAsistente, el asistente IA de Telo' Corp Group. Responde en español, de forma concisa y útil. Servicios: TeloSales (tienda), TeloEduca (cursos), TeloLleva (mensajería), TeloRepara (reparaciones), TeloInstala (instalaciones). ${context || ''}`

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario: ${message}` }] }] })
  })

  const data = await res.json()
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.'

  return new Response(JSON.stringify({ reply }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
})
```

5. Configura el secret: `supabase secrets set GEMINI_API_KEY=AIzaSyB6Fw9dciFlipwPONefQbbUB0tJBDWibFc`
6. Despliega: `supabase functions deploy chat --no-verify-jwt`

## Función: upload-image (Proxy ImgBB)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const IMGBB_KEY = Deno.env.get('IMGBB_API_KEY') || ''

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type' } })
  }

  const formData = await req.formData()
  formData.append('key', IMGBB_KEY)

  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: formData })
  const data = await res.json()

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
})
```

Configura: `supabase secrets set IMGBB_API_KEY=8199e433dfe9c12d1f452ce857dbce9d`
Despliega: `supabase functions deploy upload-image --no-verify-jwt`

## Database Triggers (Notificaciones automáticas)

Ejecutar en SQL Editor para crear triggers que puedan enviar webhooks:

```sql
-- Trigger para notificar nuevas órdenes
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://n8n.tudominio.com/webhook/new-order',
    body := row_to_json(NEW)::text,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_new_order
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_new_order();
```

## Variables de entorno necesarias en Supabase:
- GEMINI_API_KEY
- IMGBB_API_KEY
