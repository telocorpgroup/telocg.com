import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Validar que la key esté configurada
  if (!GEMINI_KEY) {
    return new Response(JSON.stringify({ reply: 'El asistente IA no está configurado aún. Contacta por WhatsApp: +1 (809) 903-8707' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { message, context } = await req.json()
    const systemPrompt = `Eres TeloAsistente, el asistente IA oficial de Telo' Corp Group. Responde siempre en español, de forma concisa, profesional y útil. Servicios disponibles: TeloSales (tienda de tecnología y accesorios), TeloEduca (academia online), TeloLleva (mensajería express), TeloRepara (reparación de dispositivos), TeloInstala (instalaciones del hogar). ${context || ''}`

    // Usar x-goog-api-key header (compatible con ambos formatos: AIzaSy... y AQ.Ab8R...)
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuario: ${message}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        })
      }
    )

    const data = await res.json()

    // Manejo de errores de cuota (429)
    if (data.error && data.error.code === 429) {
      return new Response(JSON.stringify({ reply: 'El asistente IA ha alcanzado su límite de uso diario. Por favor contáctanos por WhatsApp: +1 (809) 903-8707' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Manejo de errores de auth (401/403)
    if (data.error && (data.error.code === 401 || data.error.code === 403)) {
      console.error('[chat] Auth error:', data.error.message)
      return new Response(JSON.stringify({ reply: 'El asistente IA tendrá una respuesta pronto. Mientras tanto, contacta al equipo por WhatsApp: +1 (809) 903-8707' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta en este momento. Intenta reformular tu pregunta.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ reply: 'El asistente no está disponible en este momento. Contacta por WhatsApp: +1 (809) 903-8707' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
