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
