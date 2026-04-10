import { useShopStyles } from './shopStyles'

export default function ProductCard({ typeKey, def, onPlace, onOpenModal, gridW, gridD, colorFamilies, roomItemKeys, canPlace = true }) {
  const s = useShopStyles()
  const isFinish = def.isFloorFinish || def.isWallFinish
  const roomSqFt = gridW && gridD ? Math.round(gridW * gridD) : null

  const matchedSwatch = colorFamilies
    ? (def.swatches ?? []).find(sw => colorFamilies.includes(sw.family))
    : null
  const thumbBg = matchedSwatch
    ? `linear-gradient(135deg, ${matchedSwatch.hex} 0%, ${matchedSwatch.hex}bb 60%, ${matchedSwatch.hex}55 100%)`
    : def.gradient

  return (
    <div style={s.tile} onClick={() => onOpenModal(typeKey)}>
      <div style={{ ...s.thumb, background: thumbBg, overflow: 'hidden' }}>
        {def.primaryImageUrl && (
          <img
            src={def.primaryImageUrl}
            alt={def.label}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <span style={{ ...s.thumbCategory, position: 'relative', zIndex: 1 }}>
          {def.subcategory ?? def.category}
        </span>
        <span style={{ ...s.thumbRight, position: 'relative', zIndex: 1 }}>
          {matchedSwatch && <span style={{ ...s.thumbSwatchPip, background: matchedSwatch.hex }} title={matchedSwatch.name} />}
          {isFinish && <span style={s.thumbFinishBadge}>{def.isFloorFinish ? '🪵' : '🏠'}</span>}
        </span>
        {roomItemKeys?.has(typeKey) && <span style={{ ...s.inRoomBadge, zIndex: 1 }}>In room</span>}
      </div>
      <div style={s.tileBody}>
        <div style={s.tileMeta}>
          <span style={s.tileBrand}>{def.brand}</span>
          {def.rating > 0 && <span style={s.tileRating}>★ {def.rating}{def.reviewCount ? ` (${def.reviewCount})` : ''}</span>}
        </div>
        <p style={s.tileLabel}>{def.label}</p>
        {isFinish ? (
          <div style={s.tileFinishPrice}>
            <span style={s.tileFinishRate}>${def.pricePerSqFt}<span style={s.tileFinishUnit}>/sq ft</span></span>
            {roomSqFt && <span style={s.tileRoomHint}>~{roomSqFt} sq ft room</span>}
          </div>
        ) : (
          def.price != null && (
            <p style={s.tilePrice}>
              From <strong>${def.price}</strong>
              {def.priceMax && def.priceMax !== def.price && <span style={s.tilePriceMax}> – ${def.priceMax}</span>}
            </p>
          )
        )}
        <div style={s.swatchRow}>
          {(def.swatches ?? []).slice(0, 5).map(sw => <span key={sw.name} title={sw.name} style={{ ...s.swatch, background: sw.hex }} />)}
        </div>
        <div style={s.tileBtns}>
          {(isFinish || canPlace)
            ? <button style={isFinish ? s.tileApply : s.tilePlace} onClick={e => { e.stopPropagation(); onPlace(typeKey, 0, 0) }}>
                {isFinish ? '✓ Apply' : '+ Place'}
              </button>
            : <span style={s.tileDetail}>Shop only</span>
          }
          <span style={s.tileDetail}>Details →</span>
        </div>
      </div>
    </div>
  )
}
