// Supabase Edge Function — submits a product's photos to Tripo3D for
// 3D model generation.
//
// Flow:
// 1. Caller JWT checked — must be the product's seller_id
// 2. Fetch product photos from product_images (sorted by sort_order)
// 3. Build public URLs for each photo
// 4. Submit to Tripo3D (multiview if 4+ photos, single image otherwise)
// 5. Update product: model_3d_status='generating', model_3d_tripo_job_id=task_id
//
// Tripo3D calls our tripo-webhook when the job finishes (or we can poll).
//
// Deploy: supabase functions deploy generate-3d-model
// Env vars: TRIPO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2?target=deno'

const TRIPO_BASE = 'https://api.tripo3d.ai/v2/openapi'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { productId } = await req.json()
    if (!productId) return json({ error: 'Missing productId' }, 400)

    const tripoKey = Deno.env.get('TRIPO_API_KEY')
    if (!tripoKey) return json({ error: 'TRIPO_API_KEY not configured' }, 500)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ error: 'Missing auth' }, 401)

    // Caller client (respects RLS) + admin client (for status updates)
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Verify caller owns this product
    const { data: userData } = await callerClient.auth.getUser()
    const callerId = userData?.user?.id
    if (!callerId) return json({ error: 'Invalid auth token' }, 401)

    const { data: product, error: prodErr } = await adminClient
      .from('products')
      .select('id, seller_id, model_3d_status')
      .eq('id', productId)
      .single()

    if (prodErr || !product) return json({ error: 'Product not found' }, 404)
    if (product.seller_id !== callerId) return json({ error: 'Not your product' }, 403)

    // Don't re-submit if already generating
    if (product.model_3d_status === 'generating') {
      return json({ error: 'Model generation already in progress' }, 409)
    }

    // Fetch product photos
    const { data: images, error: imgErr } = await adminClient
      .from('product_images')
      .select('storage_path')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true })

    if (imgErr || !images?.length) {
      return json({ error: 'No photos found for this product' }, 400)
    }

    // Build public URLs
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const photoUrls = images.map(img =>
      `${supabaseUrl}/storage/v1/object/public/product-images/${img.storage_path}`
    )

    // Determine file extension from first photo
    const ext = photoUrls[0].split('.').pop()?.toLowerCase() ?? 'jpg'
    const imgType = ext === 'png' ? 'png' : 'jpg'

    // Build webhook URL so Tripo calls us back on completion
    const webhookUrl = `${supabaseUrl}/functions/v1/tripo-webhook`

    // Submit to Tripo3D
    let tripoBody: Record<string, unknown>

    if (photoUrls.length >= 4) {
      // Multiview: [front, left, back, right]
      const files = [
        { type: imgType, url: photoUrls[0] },
        { type: imgType, url: photoUrls[1] },
        { type: imgType, url: photoUrls[2] },
        { type: imgType, url: photoUrls[3] },
      ]
      tripoBody = {
        type: 'multiview_to_model',
        model_version: 'v2.5-20250123',
        files,
        texture: true,
        pbr: true,
        texture_quality: 'standard',
        texture_alignment: 'original_image',
        enable_image_autofix: true,
      }
    } else {
      // Single image (use the primary / first photo)
      tripoBody = {
        type: 'image_to_model',
        model_version: 'v2.5-20250123',
        file: { type: imgType, url: photoUrls[0] },
        texture: true,
        pbr: true,
        texture_quality: 'standard',
        texture_alignment: 'original_image',
        enable_image_autofix: true,
      }
    }

    const tripoRes = await fetch(`${TRIPO_BASE}/task`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tripoKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tripoBody),
    })

    const tripoData = await tripoRes.json()

    if (tripoData.code !== 0 || !tripoData.data?.task_id) {
      console.error('Tripo submission failed:', tripoData)
      // Mark as failed so seller can retry
      await adminClient
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId)
      return json({
        error: 'Tripo3D submission failed',
        detail: tripoData.message || 'Unknown error',
      }, 502)
    }

    const taskId = tripoData.data.task_id

    // Update product status to generating
    await adminClient
      .from('products')
      .update({
        model_3d_status: 'generating',
        model_3d_tripo_job_id: taskId,
      })
      .eq('id', productId)

    console.log(`Tripo job ${taskId} submitted for product ${productId} (${photoUrls.length} photos)`)

    return json({
      ok: true,
      taskId,
      photoCount: photoUrls.length,
      mode: photoUrls.length >= 4 ? 'multiview' : 'single_image',
    })

  } catch (err) {
    console.error('generate-3d-model error:', err)
    return json({ error: err.message || 'Internal error' }, 500)
  }
})
