#!/usr/bin/env node
/**
 * Generate D-shaped window frame + D-shaped rug via Tripo3D API.
 *
 * Usage:
 *   node scripts/tripo-brand-models.mjs YOUR_TRIPO_API_KEY
 *
 * This submits two text-to-3D jobs. Each takes ~30-60 seconds.
 * When done, it downloads the .glb files to apps/customer/public/brand-models/
 */

const API_KEY = process.argv[2]
if (!API_KEY) {
  console.error('Usage: node scripts/tripo-brand-models.mjs YOUR_TRIPO_API_KEY')
  process.exit(1)
}

const BASE = 'https://api.tripo3d.ai/v2/openapi'
const headers = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' }

const MODELS = [
  {
    name: 'd-window-frame',
    prompt: 'A decorative wooden window frame in the shape of the capital letter D. The left side is a straight vertical edge. The right side curves outward in a smooth half-oval, like the bump of the letter D. The frame is made of warm brown wood (walnut or oak color) with visible wood grain texture. The frame has depth/thickness (about 3 inches). The center is completely open/hollow — it is a frame only, no glass. The overall proportions are about 3 feet wide by 4 feet tall. Simple, elegant, architectural millwork style. No decorations or carvings — just clean smooth wood.',
    filename: 'd-window-frame.glb',
  },
  {
    name: 'd-rug',
    prompt: 'A flat woven area rug in the shape of the capital letter D. The left side is a straight vertical edge. The right side curves outward in a smooth half-oval, like the bump of the letter D. The rug has a brown border (about 2 inches) in a darker brown color around the entire D shape. The interior has a woven crosshatch/basket-weave texture pattern in warm tan/camel/sandy brown tones. The rug is completely flat (no pile height) like a flatweave kilim rug. About 4 feet wide by 5 feet tall. View from above.',
    filename: 'd-rug.glb',
  },
]

import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const OUT_DIR = join(import.meta.dirname, '..', 'apps', 'customer', 'public', 'brand-models')

async function submitJob(prompt) {
  const res = await fetch(`${BASE}/task`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      type: 'text_to_model',
      prompt,
      model_version: 'v2.0-20240919',
    }),
  })
  const data = await res.json()
  if (data.code !== 0) throw new Error(`Submit failed: ${JSON.stringify(data)}`)
  return data.data.task_id
}

async function pollJob(taskId) {
  while (true) {
    const res = await fetch(`${BASE}/task/${taskId}`, { headers })
    const data = await res.json()
    const status = data.data?.status
    console.log(`  Status: ${status} (${data.data?.progress || 0}%)`)
    if (status === 'success') return data.data
    if (status === 'failed') throw new Error(`Job failed: ${JSON.stringify(data.data)}`)
    await new Promise(r => setTimeout(r, 5000))
  }
}

async function downloadGlb(result, filename) {
  // Model URL is in the task output — prefer pbr_model, fall back to model
  const modelUrl = result.output?.pbr_model || result.output?.model
  if (!modelUrl) throw new Error('No model URL in task output: ' + JSON.stringify(result.output))

  console.log(`   Downloading from: ${modelUrl.slice(0, 80)}...`)
  const glbRes = await fetch(modelUrl)
  if (!glbRes.ok) throw new Error(`Download failed: ${glbRes.status}`)
  const buf = Buffer.from(await glbRes.arrayBuffer())
  await writeFile(join(OUT_DIR, filename), buf)
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  for (const model of MODELS) {
    console.log(`\n🎨 Generating: ${model.name}`)
    console.log(`   Prompt: "${model.prompt.slice(0, 80)}..."`)

    const taskId = await submitJob(model.prompt)
    console.log(`   Task ID: ${taskId}`)

    const result = await pollJob(taskId)
    console.log(`   ✅ Generation complete!`)

    try {
      await downloadGlb(result, model.filename)
      console.log(`   📁 Saved to: public/brand-models/${model.filename}`)
    } catch (e) {
      console.log(`   ⚠️  Could not auto-download. Check Tripo dashboard for task ${taskId}`)
      console.log(`   Error: ${e.message}`)
    }
  }

  console.log('\n✨ Done! Models saved to apps/customer/public/brand-models/')
  console.log('Next: update LandingRoomScene.jsx to load these via GlbModel')
}

main().catch(e => { console.error('Error:', e.message); process.exit(1) })
