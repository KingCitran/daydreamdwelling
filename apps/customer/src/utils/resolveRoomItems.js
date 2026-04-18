import { ITEM_CATALOGUE } from '../data/items'
import { supabase } from '@shared/supabase'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function resolveRoomItems(roomData) {
  const placed = roomData?.items ?? []
  if (placed.length === 0) return []

  const seen = new Map()
  for (const item of placed) {
    const key = `${item.typeKey}|${item.swatchIndex ?? 0}|${item.sizeIndex ?? 0}`
    if (!seen.has(key)) {
      seen.set(key, { typeKey: item.typeKey, swatchIndex: item.swatchIndex ?? 0, sizeIndex: item.sizeIndex ?? 0, qty: 1 })
    } else {
      seen.get(key).qty += 1
    }
  }

  const entries = [...seen.values()]
  const uuidKeys = [...new Set(entries.filter(e => UUID_RE.test(e.typeKey)).map(e => e.typeKey))]

  let sellerProducts = {}
  if (uuidKeys.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id, name, brand, price, gradient, product_sizes(label, price, sort_order), product_swatches(name, hex, sort_order)')
      .in('id', uuidKeys)
    for (const p of (data ?? [])) {
      const sizes = (p.product_sizes ?? []).sort((a, b) => a.sort_order - b.sort_order)
      const swatches = (p.product_swatches ?? []).sort((a, b) => a.sort_order - b.sort_order)
      sellerProducts[p.id] = { ...p, sizes, swatches }
    }
  }

  return entries.map(entry => {
    const { typeKey, swatchIndex, sizeIndex, qty } = entry
    const catalogItem = ITEM_CATALOGUE[typeKey]
    const sellerItem = sellerProducts[typeKey]

    if (catalogItem) {
      const size = catalogItem.sizes?.[sizeIndex]
      const swatch = catalogItem.swatches?.[swatchIndex]
      return {
        typeKey, swatchIndex, sizeIndex, qty,
        label: catalogItem.label,
        brand: catalogItem.brand ?? 'DaydreamDwelling',
        price: size?.price ?? catalogItem.price ?? 0,
        sizeName: size?.label ?? '',
        swatchName: swatch?.name ?? '',
        swatchHex: swatch?.hex ?? '',
        gradient: catalogItem.gradient ?? '',
        source: 'catalogue',
      }
    }

    if (sellerItem) {
      const size = sellerItem.sizes?.[sizeIndex]
      const swatch = sellerItem.swatches?.[swatchIndex]
      return {
        typeKey, swatchIndex, sizeIndex, qty,
        label: sellerItem.name,
        brand: sellerItem.brand ?? '',
        price: size?.price ?? sellerItem.price ?? 0,
        sizeName: size?.label ?? '',
        swatchName: swatch?.name ?? '',
        swatchHex: swatch?.hex ?? '',
        gradient: sellerItem.gradient ?? '',
        source: 'seller',
      }
    }

    return {
      typeKey, swatchIndex, sizeIndex, qty,
      label: typeKey, brand: '', price: 0,
      sizeName: '', swatchName: '', swatchHex: '', gradient: '',
      source: 'unknown',
    }
  })
}
