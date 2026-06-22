import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || 'https://telocg.com,http://localhost:5500,http://127.0.0.1:5500')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

function corsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || ''
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

serve(async (req) => {
  const headers = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { message, context } = await req.json()
    if (!GEMINI_KEY) {
      return new Response(JSON.stringify({ reply: 'El asistente no está configurado.' }), {
        status: 503,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }
    if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) {
      return new Response(JSON.stringify({ reply: 'Mensaje inválido.' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    const systemPrompt = `Eres TeloAsistente, el asistente IA oficial de Telo' Corp Group. Responde siempre en español, de forma concisa, profesional y útil. Servicios disponibles: TeloSales (tienda de tecnología y accesorios), TeloEduca (academia online), TeloLleva (mensajería express), TeloRepara (reparación de dispositivos), TeloInstala (instalaciones del hogar). ${context || ''}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario: ${message}` }] }]
        })
      }
    )

    const data = await res.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta en este momento.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ reply: 'Error interno del asistente. Intenta de nuevo.' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
})
