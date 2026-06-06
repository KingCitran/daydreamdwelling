// Supabase Edge Function — receives Tripo3D task completion callbacks.
//
// Called by Tripo when a model generation finishes (success or failure).
// Also supports manual polling via POST { taskId, productId } from the
// seller dashboard for free-tier testing (free tier may not support webhooks).
//
// On success:
// 1. Download the PBR .glb from Tripo's CDN
// 2. Upload to product-models bucket in Supabase Storage
// 3. Update product: model_3d_status='ready', model_3d_storage_path, model_3d_generated_at
//
// On failure:
// 1. Update product: model_3d_status='failed'
//
// Deploy: supabase functions deploy tripo-webhook --no-verify-jwt
// Env vars: TRIPO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

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
    const tripoKey = Deno.env.get('TRIPO_API_KEY')
    if (!tripoKey) return json({ error: 'TRIPO_API_KEY not configured' }, 500)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body = await req.json()

    // Two entry points:
    // A) Tripo webhook callback — body.data.task_id + body.data.status
    // B) Manual poll from seller dashboard — body.taskId + body.productId
    let taskId: string
    let taskStatus: string
    let taskOutput: Record<string, string> | null = null

    if (body.data?.task_id) {
      // Tripo webhook payload
      taskId = body.data.task_id
      taskStatus = body.data.status
      taskOutput = body.data.output || null
    } else if (body.taskId) {
      // Manual poll — fetch status from Tripo
      taskId = body.taskId
      const pollRes = await fetch(`${TRIPO_BASE}/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${tripoKey}` },
      })
      const pollData = await pollRes.json()
      if (pollData.code !== 0) {
        return json({ error: 'Failed to poll Tripo', detail: pollData.message }, 502)
      }
      taskStatus = pollData.data.status
      taskOutput = pollData.data.output || null

      // Still running — return progress info
      if (taskStatus !== 'success' && taskStatus !== 'failed') {
        return json({
          status: taskStatus,
          progress: pollData.data.progress ?? 0,
          queuePosition: pollData.data.queuing_num ?? 0,
          estimatedSeconds: pollData.data.running_left_time ?? null,
        })
      }
    } else {
      return json({ error: 'Missing task_id or taskId' }, 400)
    }

    // Find the product by tripo job id
    const { data: product, error: prodErr } = await adminClient
      .from('products')
      .select('id')
      .eq('model_3d_tripo_job_id', taskId)
      .single()

    if (prodErr || !product) {
      console.error(`No product found for Tripo task ${taskId}`)
      return json({ error: 'Product not found for this task' }, 404)
    }

    const productId = product.id

    if (taskStatus === 'failed' || taskStatus === 'cancelled' || taskStatus === 'banned') {
      await adminClient
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId)
      console.log(`Tripo task ${taskId} ${taskStatus} for product ${productId}`)
      return json({ ok: true, status: taskStatus, productId })
    }

    if (taskStatus !== 'success') {
      // Unexpected status — log and bail
      console.warn(`Tripo task ${taskId} unexpected status: ${taskStatus}`)
      return json({ ok: true, status: taskStatus })
    }

    // --- Task succeeded — download and store the model ---

    // Prefer PBR model (has materials), fall back to base model
    const modelUrl = taskOutput?.pbr_model || taskOutput?.model
    if (!modelUrl) {
      console.error(`Tripo task ${taskId} success but no model URL in output`)
      await adminClient
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId)
      return json({ error: 'No model URL in Tripo output' }, 502)
    }

    // Download the .glb file
    const glbRes = await fetch(modelUrl)
    if (!glbRes.ok) {
      console.error(`Failed to download model from ${modelUrl}: ${glbRes.status}`)
      await adminClient
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId)
      return json({ error: 'Failed to download model from Tripo CDN' }, 502)
    }

    const glbBuffer = await glbRes.arrayBuffer()
    const storagePath = `${productId}/${taskId}.glb`

    // Upload to product-models bucket
    const { error: uploadErr } = await adminClient.storage
      .from('product-models')
      .upload(storagePath, glbBuffer, {
        contentType: 'model/gltf-binary',
        upsert: true,
      })

    if (uploadErr) {
      console.error('Storage upload failed:', uploadErr)
      await adminClient
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId)
      return json({ error: 'Failed to upload model to storage' }, 500)
    }

    // Update product — ready for admin review
    await adminClient
      .from('products')
      .update({
        model_3d_status: 'ready',
        model_3d_storage_path: storagePath,
        model_3d_generated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    console.log(`Model stored for product ${productId} at ${storagePath} (${(glbBuffer.byteLength / 1024).toFixed(0)} KB)`)

    return json({
      ok: true,
      status: 'ready',
      productId,
      storagePath,
      sizeKB: Math.round(glbBuffer.byteLength / 1024),
    })

  } catch (err) {
    console.error('tripo-webhook error:', err)
    return json({ error: err.message || 'Internal error' }, 500)
  }
})
