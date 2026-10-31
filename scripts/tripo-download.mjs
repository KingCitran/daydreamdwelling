#!/usr/bin/env node
/**
 * Download completed Tripo tasks by ID.
 * Usage: node scripts/tripo-download.mjs YOUR_API_KEY TASK_ID_1 TASK_ID_2
 */
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'

const API_KEY = process.argv[2]
const TASK_IDS = process.argv.slice(3)
if (!API_KEY || !TASK_IDS.length) {
  console.error('Usage: node scripts/tripo-download.mjs API_KEY TASK_ID1 [TASK_ID2]')
  process.exit(1)
}

const BASE = 'https://api.tripo3d.ai/v2/openapi'
const headers = { 'Authorization': `Bearer ${API_KEY}` }
const OUT = join(import.meta.dirname, '..', 'apps', 'customer', 'public', 'brand-models')
const NAMES = ['d-window-frame.glb', 'd-rug.glb']

await mkdir(OUT, { recursive: true })

for (let i = 0; i < TASK_IDS.length; i++) {
  const taskId = TASK_IDS[i]
  console.log(`\nFetching task: ${taskId}`)

  const res = await fetch(`${BASE}/task/${taskId}`, { headers })
  const data = await res.json()

  console.log('Full output:', JSON.stringify(data.data?.output, null, 2))
  console.log('Status:', data.data?.status)

  // Try every possible URL field
  const output = data.data?.output || {}
  const url = output.pbr_model || output.model || output.rendered_image || output.base_model

  if (url) {
    console.log(`Downloading: ${url.slice(0, 100)}...`)
    const dlRes = await fetch(url)
    const buf = Buffer.from(await dlRes.arrayBuffer())
    const name = NAMES[i] || `model-${i}.glb`
    await writeFile(join(OUT, name), buf)
    console.log(`✅ Saved: public/brand-models/${name} (${(buf.length / 1024).toFixed(0)} KB)`)
  } else {
    console.log('❌ No model URL found in output')
  }
}
