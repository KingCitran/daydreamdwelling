import { useState, useEffect, useMemo } from 'react'
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

  // Normalize category to Title Case so it matches OBJECT_BUCKETS filter keys
  const CAT_MAP = { seating:'Seating', tables:'Tables', storage:'Storage', beds:'Bedroom',
    lighting:'Lighting', surfaces:'Flooring', textiles:'Textiles', decor:'Decor',
    electronics:'Specialty', outdoor:'Specialty', other:'Decor' }
  const category = CAT_MAP[p.category] ?? (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : null)

  // Build model URL if the product has an approved 3D model
  let modelUrl = null
  if (p.model_3d_status === 'approved' && p.model_3d_storage_path) {
    modelUrl = supabase.storage.from('product-models').getPublicUrl(p.model_3d_storage_path).data.publicUrl
  }

  return {
    label:        p.label,
    brand:        p.brand,
    description:  p.description,
    category,
    rating:       p.rating ?? 0,
    reviewCount:  p.review_count ?? 0,
    price:        sizes[0]?.price ?? p.price,
    priceMax:     sizes[sizes.length - 1]?.price ?? p.price_max,
    pricePerSqFt: p.price_per_sqft,
    isFloorFinish: p.is_floor_finish ?? false,
    isWallFinish:  p.is_wall_finish  ?? false,
    textureType:  p.texture_type ?? null,
    paintFinish:  p.paint_finish ?? null,
    materialSheen: p.paint_finish ?? null,
    gradient:     p.gradient,
    shop_url:     p.shop_url ?? null,
    primaryImageUrl,
    modelUrl,
    scaleMultiplier:     p.scale_multiplier ?? 1,
    orientationOffsetDeg: p.orientation_offset_deg ?? 0,
    sizes:        sizes.length ? sizes : undefined,
    swatches:     swatches.length ? swatches : undefined,
    // _liveId / _sellerId let ProductModal open the seller storefront
    _liveId:      p.id,
    _sellerId:    p.seller_id,
  }
}

export default function useShopProducts() {
  const [liveMap, setLiveMap] = useState({})

  useEffect(() => {
    supabase
      .from('products')
      .select('*, seller_id, model_3d_status, model_3d_storage_path, scale_multiplier, orientation_offset_deg, product_sizes(*), product_swatches(*), product_images(storage_path,is_primary,sort_order)')
      .eq('is_active', true)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        for (const p of data) {
          // Always key by UUID so seller products appear alongside (not replacing) static entries.
          // Store _typeKey so geometry can be inherited from the matching static entry.
          map[p.id] = { ...mapLiveProduct(p), _typeKey: p.type_key || null }
        }
        setLiveMap(map)
      })
  }, [])

  return useMemo(() => {
    if (Object.keys(liveMap).length === 0) return ITEM_CATALOGUE
    const merged = { ...ITEM_CATALOGUE }
    for (const [uuid, live] of Object.entries(liveMap)) {
      // Inherit 3D geometry from the matching static entry (via type_key), then overlay live data
      const staticBase = live._typeKey ? (ITEM_CATALOGUE[live._typeKey] ?? {}) : {}
      merged[uuid] = {
        ...staticBase,
        ...Object.fromEntries(Object.entries(live).filter(([, v]) => v !== undefined)),
      }
    }
    return merged
  }, [liveMap])
}
