import { useState, useEffect } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import { supabase } from '@shared/supabase'

function mapLiveProduct(p) {
  const sizes = (p.product_sizes ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(s => ({
      label:    s.label,
      price:    s.price,
      footprint: s.footprint ?? undefined,
      height:   s.height    ?? undefined,
    }))
  const swatches = (p.product_swatches ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(s => ({ name: s.name, hex: s.hex_color ?? s.hex, family: s.family ?? null }))

  const images = (p.product_images ?? []).sort((a, b) => a.sort_order - b.sort_order)
  const primaryImg = images.find(i => i.is_primary) ?? images[0] ?? null
  const primaryImageUrl = primaryImg
    ? supabase.storage.from('product-images').getPublicUrl(primaryImg.storage_path).data.publicUrl
    : null

  const CAT_MAP = { seating: 'Seating', tables: 'Tables', storage: 'Storage', beds: 'Bedroom',
    lighting: 'Lighting', surfaces: 'Flooring', textiles: 'Textiles', decor: 'Decor',
    electronics: 'Specialty', outdoor: 'Specialty', other: 'Decor' }
  const category = CAT_MAP[p.category]
    ?? (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : null)

  return {
    label: p.label, brand: p.brand, description: p.description, category,
    rating: p.rating ?? 0, reviewCount: p.review_count ?? 0,
    price: sizes[0]?.price ?? p.price,
    priceMax: sizes[sizes.length - 1]?.price ?? p.price_max,
    pricePerSqFt: p.price_per_sqft,
    isFloorFinish: p.is_floor_finish ?? false,
    isWallFinish:  p.is_wall_finish  ?? false,
    gradient: p.gradient, shop_url: p.shop_url ?? null,
    primaryImageUrl,
    sizes:    sizes.length    ? sizes    : undefined,
    swatches: swatches.length ? swatches : undefined,
    _liveId:   p.id,
    _sellerId: p.seller_id,
  }
}

// Returns null while loading, then an object keyed by product UUID.
// Only products belonging to sellerId. Static ITEM_CATALOGUE items are NOT included
// (the shop panel should only show this seller's products).
export default function useSellerCatalogue(sellerId) {
  const [catalogue, setCatalogue] = useState(null)

  useEffect(() => {
    if (!sellerId) return
    supabase
      .from('products')
      .select('*, seller_id, product_sizes(*), product_swatches(*), product_images(storage_path,is_primary,sort_order)')
      .eq('seller_id', sellerId)
      .eq('is_active', true)
      .then(({ data }) => {
        const map = {}
        for (const p of data ?? []) {
          const staticBase = p.type_key ? (ITEM_CATALOGUE[p.type_key] ?? {}) : {}
          map[p.id] = {
            ...staticBase,
            ...mapLiveProduct(p),
            _typeKey: p.type_key || null,
          }
        }
        setCatalogue(map)
      })
  }, [sellerId])

  return catalogue
}
