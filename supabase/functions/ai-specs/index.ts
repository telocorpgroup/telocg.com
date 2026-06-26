// ai-specs — Edge Function: genera especificaciones de producto vía Gemini
// Reemplaza la llamada directa a la API key desde el frontend del admin.
// La API key vive solo en Supabase (secret GEMINI_API_KEY).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY') || ''

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const { product_name, context } = await req.json()

    if (!product_name) {
      return new Response(JSON.stringify({ error: 'product_name es requerido' }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' }
      })
    }

    const prompt = `Genera 5 especificaciones técnicas concisas y realistas para un producto titulado "${product_name}". ${context || ''}
Responde SOLO con JSON válido (sin markdown, sin texto adicional) en este formato exacto:
{"Clave 1": "Valor 1", "Clave 2": "Valor 2", "Clave 3": "Valor 3", "Clave 4": "Valor 4", "Clave 5": "Valor 5"}
Las claves deben ser nombres de propiedades (Material, Potencia, Capacidad, etc.) y los valores descriptivos breves.`

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_KEY
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
        })
      }
    )

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extraer el JSON de la respuesta
    const match = text.match(/\{[\s\S]*\}/)
    let specs = {}
    if (match) {
      try { specs = JSON.parse(match[0]) } catch (e) {
        return new Response(JSON.stringify({ error: 'Formato inválido de IA', raw: text }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' }
        })
      }
    }

    return new Response(JSON.stringify({ specs }), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Error interno: ' + error.message }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
