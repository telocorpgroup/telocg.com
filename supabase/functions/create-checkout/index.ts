import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', { apiVersion: '2023-10-16' })
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

function isSafeRedirect(url: string | undefined) {
  if (!url) return true
  try {
    const parsed = new URL(url)
    return ALLOWED_ORIGINS.includes(parsed.origin)
  } catch {
    return false
  }
}

serve(async (req) => {
  const headers = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const { items, customer_email, success_url, cancel_url } = await req.json()
    if (!Deno.env.get('STRIPE_SECRET_KEY')) {
      return new Response(JSON.stringify({ error: 'Checkout is not configured' }), {
        status: 503,
        headers: { ...headers, 'Content-Type': 'application/json' }
      })
    }
    if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
      throw new Error('Invalid checkout items')
    }
    if (!isSafeRedirect(success_url) || !isSafeRedirect(cancel_url)) {
      throw new Error('Invalid redirect URL')
    }

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'dop', // Dominican Peso
        product_data: {
          name: String(item.title || '').slice(0, 120),
          images: typeof item.image === 'string' && item.image.startsWith('https://') ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100), // Stripe uses cents
      },
      quantity: Math.max(1, Math.min(20, Number(item.qty) || 1)),
    }))
    if (line_items.some((item: any) => !item.price_data.product_data.name || !Number.isFinite(item.price_data.unit_amount) || item.price_data.unit_amount <= 0)) {
      throw new Error('Invalid item data')
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: success_url || 'https://telocg.com/?checkout=success',
      cancel_url: cancel_url || 'https://telocg.com/?checkout=cancel',
      customer_email,
      metadata: { source: 'telosales' },
    })

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...headers, 'Content-Type': 'application/json' }
    })
  }
})
