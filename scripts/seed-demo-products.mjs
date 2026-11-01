#!/usr/bin/env node
/**
 * Reads ITEM_CATALOGUE from items.js and outputs SQL to insert every priced
 * item as a real product row (+ product_sizes + product_swatches).
 *
 * Usage:  node scripts/seed-demo-products.mjs > seed.sql
 */

import { ITEM_CATALOGUE } from '../apps/customer/src/data/items.js'

const SELLER_ID = 'f1e84da0-cfb9-40d4-b079-633dcd7a5cc9'

const esc = s => (s ?? '').replace(/'/g, "''")

const lines = []
lines.push("-- Auto-generated demo product seed")
lines.push("-- Assigns all items to the owner's seller account\n")

let productIdx = 0
for (const [typeKey, item] of Object.entries(ITEM_CATALOGUE)) {
  // Skip free structural items
  const minPrice = item.sizes?.[0]?.price ?? item.price ?? 0
  if (minPrice <= 0) continue

  // Skip floor/wall finishes (per-sqft pricing, different model)
  if (item.isFloorFinish || item.isWallFinish || item.is_floor_finish || item.is_wall_finish) continue

  productIdx++

  const name = esc(item.label)
  const brand = esc(item.brand ?? '')
  const desc = esc(item.description ?? '')
  const cat = esc(item.category ?? '')
  const subcat = esc(item.subcategory ?? '')
  const price = item.price ?? minPrice
  const priceMax = item.priceMax ?? price
  const rating = item.rating ?? 0
  const reviewCount = item.reviewCount ?? 0
  const guarantee = esc(item.guarantee ?? '')
  const materials = esc((item.materials ?? []).join(', '))
  const weightOz = Math.round((price / 10) + 16) // rough estimate for shipping
  const lengthIn = Math.round((item.footprint?.[0] ?? 1) * 12)
  const widthIn = Math.round((item.footprint?.[1] ?? 1) * 12)
  const heightIn = Math.round((item.height ?? 1) * 12)

  lines.push(`-- ${productIdx}. ${item.label} (${typeKey})`)
  lines.push(`INSERT INTO products (
  seller_id, type_key, name, label, brand, description, category, subcategory,
  status, price, price_max, rating, review_count, guarantee, is_active,
  shipping_type, weight_oz, length_in, width_in, height_in,
  primary_material, processing_days
) VALUES (
  '${SELLER_ID}', '${esc(typeKey)}', '${name}', '${name}', '${brand}',
  '${desc}', '${cat}', '${subcat}',
  'active', ${price}, ${priceMax}, ${rating}, ${reviewCount},
  '${guarantee}', true,
  'calculated', ${weightOz}, ${lengthIn}, ${widthIn}, ${heightIn},
  '${esc((item.materials ?? [])[0] ?? '')}', 3
);`)

  // Sizes
  const sizes = item.sizes ?? [{ label: 'Standard', price: item.price ?? 0 }]
  for (let si = 0; si < sizes.length; si++) {
    const s = sizes[si]
    lines.push(`INSERT INTO product_sizes (product_id, label, price, sort_order)
  SELECT id, '${esc(s.label)}', ${s.price}, ${si}
  FROM products WHERE type_key = '${esc(typeKey)}' AND seller_id = '${SELLER_ID}';`)
  }

  // Swatches
  const swatches = item.swatches ?? []
  for (let wi = 0; wi < swatches.length; wi++) {
    const w = swatches[wi]
    lines.push(`INSERT INTO product_swatches (product_id, name, hex, sort_order)
  SELECT id, '${esc(w.name)}', '${esc(w.hex)}', ${wi}
  FROM products WHERE type_key = '${esc(typeKey)}' AND seller_id = '${SELLER_ID}';`)
  }

  lines.push('')
}

console.log(lines.join('\n'))
console.error(`Generated SQL for ${productIdx} products`)
