import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const IMGBB_KEY = Deno.env.get('IMGBB_API_KEY') || ''

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  try {
    const formData = await req.formData()
    formData.append('key', IMGBB_KEY)

    const res = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'Upload failed' }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' }
    })
  }
})
