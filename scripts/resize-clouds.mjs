import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const SOURCES = [
  'D:/Hayley/DaydreamDwelling/Bought files for DDD landing page/Clouds KNGVN',
  'D:/Hayley/DaydreamDwelling/Bought files for DDD landing page/Clouds Silver Party',
]
const OUT_DIR = 'D:/Hayley/DaydreamDwelling/room-platform/apps/customer/public/clouds'
const TARGET_WIDTH = 480
const QUALITY = 78

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true })

const files = []
for (const dir of SOURCES) {
  const entries = await readdir(dir)
  for (const f of entries) {
    if (f.toLowerCase().endsWith('.png')) files.push(path.join(dir, f))
  }
}

console.log(`Found ${files.length} PNGs. Converting to WebP @ ${TARGET_WIDTH}px wide…`)

let i = 0
let totalIn = 0
let totalOut = 0
for (const src of files) {
  i++
  const num = String(i).padStart(3, '0')
  const out = path.join(OUT_DIR, `cloud-${num}.webp`)
  const inMeta = await sharp(src).metadata()
  const info = await sharp(src)
    .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 90, effort: 5 })
    .toFile(out)
  totalIn += inMeta.size || 0
  totalOut += info.size
  if (i % 10 === 0 || i === files.length) {
    console.log(`  ${i}/${files.length} — ${path.basename(src)} → cloud-${num}.webp (${(info.size/1024).toFixed(1)} KB)`)
  }
}

console.log(`\nDone. ${files.length} files written to ${OUT_DIR}`)
console.log(`Total output size: ${(totalOut/1024/1024).toFixed(1)} MB (avg ${(totalOut/files.length/1024).toFixed(1)} KB/file)`)
