// Supabase Edge Function — creates a Stripe Checkout Session
// Deploy: supabase functions deploy create-checkout
// Env vars needed (set in Supabase dashboard → Project Settings → Edge Functions):
//   STRIPE_SECRET_KEY
//   SITE_URL  (e.g. https://daydreamdwelling.com)
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (for server-side price/seller lookup)

import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-04-10',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Canonical line item after server-side validation. This is what we trust
// downstream (Stripe line items + webhook order_item inserts), not the raw
// buyer-supplied payload.
interface ValidatedItem {
  productId: string | null   // null for static demo items (no DB row)
  sellerId:  string | null   // null for static demo items
  sizeId:    string | null
  swatchId:  string | null
  productName: string
  sizeLabel:   string
  swatchName:  string
  unitPriceCents: number     // authoritative — from DB for live products
  qty: number
  typeKey: string            // original cart key, useful for the scene renderer
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { items, successUrl, cancelUrl, buyerMood, buyerRoom, shipping, address } = await req.json()
    // items: [{ typeKey, sizeIndex, swatchIndex, qty, label?, sizeLabel?, swatchName?, unitPrice? }]
    // sizeIndex/swatchIndex are required for live products (they index into
    // product_sizes/product_swatches ordered by sort_order). Static demo items
    // can fall back to client-supplied label/price.

    if (!items?.length) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'

    // ────────────────────────────────────────────────────────────────
    // SERVER-SIDE VALIDATION — replace client-supplied unitPrice and
    // sellerId with values pulled from the database. Without this, a buyer
    // can paste a console snippet and pay $0.50 for a $500 sofa, or pin a
    // fraudulent paid order to any seller's dashboard.
    // ────────────────────────────────────────────────────────────────
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Resolve the authenticated buyer's user_id from the forwarded JWT.
    // supabase-js auto-attaches the session JWT for signed-in users; for
    // guests the Authorization header carries only the anon key and
    // getUser() returns null. Either is fine — null user_id means a guest
    // checkout, otherwise we stamp the user_id on the order so it shows up
    // on their /orders page.
    let buyerUserId: string | null = null
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
      const callerClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } },
      )
      const { data: userData } = await callerClient.auth.getUser()
      buyerUserId = userData?.user?.id ?? null
    }

    const validated: ValidatedItem[] = []
    for (const raw of items) {
      const qty = Math.max(1, parseInt(raw.qty ?? 1, 10) || 1)
      const typeKey = String(raw.typeKey ?? '')

      if (UUID_RE.test(typeKey)) {
        // Live product — look up authoritative price + seller from the DB.
        const { data: product, error: prodErr } = await adminClient
          .from('products')
          .select(`
            id, seller_id, name, label, is_active,
            product_sizes ( id, label, price, sort_order ),
            product_swatches ( id, name, sort_order )
          `)
          .eq('id', typeKey)
          .single()
        if (prodErr || !product) {
          return new Response(JSON.stringify({ error: `Product not found: ${typeKey}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        if (product.is_active === false) {
          return new Response(JSON.stringify({ error: `Product no longer available: ${product.label || product.name}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const sizes = (product.product_sizes ?? []).slice().sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        const swatches = (product.product_swatches ?? []).slice().sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
        const sizeIdx   = parseInt(raw.sizeIndex ?? 0, 10) || 0
        const swatchIdx = parseInt(raw.swatchIndex ?? 0, 10) || 0
        const size   = sizes[sizeIdx]
        const swatch = swatches[swatchIdx]
        if (!size) {
          return new Response(JSON.stringify({ error: `Selected size not available for ${product.label || product.name}` }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        // Price always comes from the DB. We ignore raw.unitPrice entirely
        // (buyer-controlled and therefore untrusted).
        validated.push({
          productId: product.id,
          sellerId:  product.seller_id,
          sizeId:    size.id,
          swatchId:  swatch?.id ?? null,
          productName: product.label || product.name || 'Product',
          sizeLabel:   size.label,
          swatchName:  swatch?.name ?? '',
          unitPriceCents: Math.round(parseFloat(size.price) * 100),
          qty,
          typeKey,
        })
      } else {
        // Static demo item — no DB row, no real seller, can't be price-
        // spoofed against any seller's revenue. Trust the client price as
        // a v0 fallback; flag so we can see in logs if real money ever
        // moves through this branch.
        console.warn('[create-checkout] demo item checkout (no seller revenue):', typeKey)
        validated.push({
          productId: null,
          sellerId:  null,
          sizeId:    null,
          swatchId:  null,
          productName: String(raw.label ?? typeKey),
          sizeLabel:   String(raw.sizeLabel ?? ''),
          swatchName:  String(raw.swatchName ?? ''),
          unitPriceCents: Math.round(parseFloat(raw.unitPrice ?? 0) * 100),
          qty,
          typeKey,
        })
      }
    }

    const lineItems = validated.map((item) => ({
      price_data: {
        currency: 'usd',
        unit_amount: item.unitPriceCents,
        product_data: {
          name: item.productName,
          description: `${item.sizeLabel}${item.swatchName ? ` · ${item.swatchName}` : ''}`.trim(),
        },
      },
      quantity: item.qty,
    }))

    // Add the buyer-chosen shipping rate as its own line item so they pay
    // items + postage in one Stripe session. v1 = single rate for whole cart.
    if (shipping?.amount) {
      lineItems.push({
        price_data: {
          currency: (shipping.currency || 'usd').toLowerCase(),
          unit_amount: Math.round(parseFloat(shipping.amount) * 100),
          product_data: {
            name: 'Shipping',
            description: `${shipping.carrier ?? ''} ${shipping.service ?? ''}`.trim() || 'Shipping',
          },
        },
        quantity: 1,
      })
    }

    // ────────────────────────────────────────────────────────────────
    // STRIPE CONNECT — destination charges for single-seller carts.
    // When the cart belongs to one seller and that seller has completed
    // Connect onboarding (charges_enabled = true), we route the payment
    // directly to their connected account using transfer_data.destination,
    // and skim PLATFORM_FEE_BPS basis points as application_fee_amount.
    // Stripe handles the money split atomically; nothing has to be paid
    // out manually from the platform balance.
    //
    // Multi-seller carts fall back to the single-account flow for v1.
    // (Stripe doesn't natively split across multiple destinations in a
    // single Checkout Session; we'd need separate manual transfers via
    // the Transfers API after capture.)
    //
    // Static demo items (no sellerId) and not-yet-onboarded sellers also
    // fall back to the single-account flow so checkout doesn't break
    // before the seller finishes KYC. Those funds sit in the platform
    // balance until the seller completes onboarding or we refund.
    // ────────────────────────────────────────────────────────────────
    const PLATFORM_FEE_BPS = parseInt(Deno.env.get('PLATFORM_FEE_BPS') ?? '1000', 10) // 10% default
    const distinctSellerIds = [...new Set(validated.map(v => v.sellerId).filter(Boolean))] as string[]
    let payment_intent_data: Record<string, unknown> | undefined = undefined
    if (distinctSellerIds.length === 1) {
      const sellerId = distinctSellerIds[0]
      const { data: seller } = await adminClient
        .from('profiles')
        .select('stripe_account_id, stripe_charges_enabled')
        .eq('id', sellerId)
        .single()
      if (seller?.stripe_account_id && seller?.stripe_charges_enabled) {
        // Compute the seller's portion (items only — platform absorbs the
        // Shippo cost separately for now since postage is pass-through).
        const itemsCents = validated.reduce((s, v) => s + v.unitPriceCents * v.qty, 0)
        const applicationFee = Math.round(itemsCents * PLATFORM_FEE_BPS / 10000)
        payment_intent_data = {
          application_fee_amount: applicationFee,
          transfer_data: { destination: seller.stripe_account_id },
        }
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl ?? `${siteUrl}?checkout=success`,
      cancel_url:  cancelUrl  ?? `${siteUrl}?checkout=cancelled`,
      ...(payment_intent_data ? { payment_intent_data } : {}),
      // Pass metadata so the webhook can record the order. We pass the
      // CANONICAL (server-validated) items here — productId / sellerId /
      // sizeId / swatchId / unit_price_cents all come from the DB, not the
      // buyer. The webhook trusts metadata only because the session can
      // only be mutated via Stripe with our secret key after creation.
      metadata: {
        items: JSON.stringify(validated.map(v => ({
          productId:      v.productId,
          sellerId:       v.sellerId,
          sizeId:         v.sizeId,
          swatchId:       v.swatchId,
          productName:    v.productName,
          sizeLabel:      v.sizeLabel,
          swatchName:     v.swatchName,
          unitPriceCents: v.unitPriceCents,
          qty:            v.qty,
          typeKey:        v.typeKey,
        }))),
        // Stripe metadata values must be strings; null skipped.
        ...(buyerMood ? { buyer_mood: String(buyerMood).slice(0, 60) } : {}),
        ...(buyerRoom ? { buyer_room_name: String(buyerRoom).slice(0, 100) } : {}),
        // Buyer-paid shipping summary — webhook stamps these on the order
        ...(shipping?.rateId   ? { shippo_rate_id:     String(shipping.rateId).slice(0, 100) } : {}),
        ...(shipping?.amount   ? { shipping_cost_cents: String(Math.round(parseFloat(shipping.amount) * 100)) } : {}),
        ...(shipping?.carrier  ? { shipping_carrier:    String(shipping.carrier).slice(0, 30) } : {}),
        ...(shipping?.service  ? { shipping_service:    String(shipping.service).slice(0, 60) } : {}),
        ...(address           ? { buyer_address:        JSON.stringify(address).slice(0, 500) } : {}),
        ...(buyerUserId       ? { buyer_user_id:        buyerUserId } : {}),
      },
    })

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[create-checkout]', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
