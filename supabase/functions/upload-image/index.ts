import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const IMGBB_KEY = Deno.env.get('IMGBB_API_KEY') || ''
const MAX_IMAGE_BYTES = 5 * 1024 * 1024
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
    if (!IMGBB_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Upload service is not configured' }), {
        status: 503,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    const formData = await req.formData()
    const image = formData.get('image')
    if (!(image instanceof File) || !image.type.startsWith('image/') || image.size > MAX_IMAGE_BYTES) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid image' }), {
        status: 400,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }

    formData.append('key', IMGBB_KEY)

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Upload failed' }), {
      status: 500,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
})
