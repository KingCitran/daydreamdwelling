import { ITEM_CATALOGUE } from '../data/items'
import { useBuilderStyles } from './styles/appStyles'
import { DIAMOND_MAP, roomQuadrant } from '../utils/roomGeometry'
import Stepper from './Stepper'
import { Icon } from '@shared/ui/Icon'

export default function SelectedControls({
  item, catalogue, drawerOpen, roomRotation,
  onShowDetails, onRotate, onDelete,
  onResize, onRecolor,
  onToggleOwned, onToggleLocked,
  onToggleWishlist, onAddToCart,
  groupQty, onIncrementQty, onDecrementQty,
  onMoveWall, onChangeWall,
  parallelFaces, onSwapWallFace,
  wallHeight, onAdjustDropLength, onSetPaneConfig, onAdjustWindowSize, onEnterRoom,
}) {
  const s          = useBuilderStyles()
  const def        = (catalogue ?? ITEM_CATALOGUE)[item.typeKey] ?? ITEM_CATALOGUE[item.typeKey] ?? {}
  const totalSizes = def.sizes?.length ?? 0
  const curSize    = def.sizes?.[item.sizeIndex] ?? def.sizes?.[0] ?? { label: '', price: null, footprint: [1,1], height: 1 }
  const isWall     = !!item.wall
  const isCeiling  = !!item.ceiling
  const isWindow   = !!def.window
  const isDoor     = !!def.door
  const dmap       = DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)]

  return (
    <div style={{
      position: 'absolute', top: 14, right: 20,
      pointerEvents: 'none', zIndex: 40,
    }}>
      <div style={{ ...s.controls, pointerEvents: 'auto' }}>

        {/* ── Name / brand · Rating · Badges ── */}
        <div style={s.ctrlNameRow}>
          <div style={s.ctrlNameLeft}>
            <span style={s.controlsTitle}>{def.label}</span>
            {def.brand && <span style={s.controlsBrand}>{def.brand}</span>}
          </div>
          <div style={s.ctrlNameRight}>
            {def.rating && (
              <span style={s.ctrlRating}>
                ★ {def.rating}
                {def.reviewCount && <span style={s.ctrlRatingCount}> ({def.reviewCount})</span>}
              </span>
            )}
            {(item.owned || item.wishlisted || item.locked) && (
              <div style={s.badgeRow}>
                {item.owned      && <span style={s.badgeOwned}  title="You own this"><Icon name="check" size={11} /> owned</span>}
                {item.wishlisted && <span style={s.badgeWish}   title="On wishlist"><Icon name="wishlist" size={11} /> wishlist</span>}
                {item.locked     && <span style={s.badgeLocked} title="Position locked"><Icon name="lock" size={11} /> locked</span>}
              </div>
            )}
          </div>
        </div>

        <div style={s.ctrlHDivider} />

        {/* ── Position controls  +  Own / Lock / Delete ── */}
        <div style={s.ctrlRow}>

          {/* Wall: SVG cross D-pad */}
          {isWall && !item.locked && (
            <>
              <div style={s.wallNudgeGroup}>
                <span style={s.sizeLabel}>Move item</span>
                <div style={s.diamondWrap}>
                  <svg width="70" height="70" style={{ display: 'block' }}>
                    {[
                      { dir: 'up',    pts: '22,22 48,22 35,8',  cb: () => onMoveWall(item.wallU, item.wallH + 0.25), hide: isDoor },
                      { dir: 'right', pts: '48,22 48,48 62,35', cb: () => onMoveWall(item.wallU + 0.25, item.wallH) },
                      { dir: 'down',  pts: '48,48 22,48 35,62', cb: () => onMoveWall(item.wallU, item.wallH - 0.25), hide: isDoor },
                      { dir: 'left',  pts: '22,48 22,22 8,35',  cb: () => onMoveWall(item.wallU - 0.25, item.wallH) },
                    ].map(({ dir, pts, cb, hide }) => (
                      <polygon key={dir} points={pts}
                        fill={hide ? '#1a1a2e' : '#2a2a4a'} stroke="none"
                        style={{ cursor: hide ? 'default' : 'pointer', pointerEvents: hide ? 'none' : 'auto' }}
                        onClick={hide ? undefined : cb} />
                    ))}
                    <path d="M 35,8 L 48,22 L 62,35 L 48,48 L 35,62 L 22,48 L 8,35 L 22,22 Z"
                      fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="miter"
                      style={{ pointerEvents: 'none' }} />
                    <rect x="22" y="22" width="26" height="26"
                      fill="#1a1a2e" stroke="#2a2a50" strokeWidth="2.5"
                      style={{ pointerEvents: 'none' }} />
                  </svg>
                </div>
              </div>

              <div style={s.ctrlDivider} />

              <div style={s.wallSideGroup}>
                <span style={s.sizeLabel}>Switch wall</span>
                <div style={s.diamondWrap}>
                  <svg width="70" height="70" style={{ display: 'block' }}>
                    {[
                      { pos: 'tl', pts: '8,35 35,8 35,17 17,35' },
                      { pos: 'tr', pts: '35,8 62,35 53,35 35,17' },
                      { pos: 'br', pts: '62,35 35,62 35,53 53,35' },
                      { pos: 'bl', pts: '35,62 8,35 17,35 35,53' },
                    ].map(({ pos, pts }) => {
                      const wall = dmap[pos]
                      const active = item.wall === wall
                      return (
                        <polygon key={pos} points={pts}
                          fill={active ? '#5050aa' : '#2a2a4a'}
                          stroke={active ? '#9898ff' : '#3a3a6a'}
                          strokeWidth="0.75"
                          style={{ cursor: 'pointer' }}
                          onClick={() => onChangeWall(wall)} />
                      )
                    })}
                    <path d="M 35,8 L 62,35 L 35,62 L 8,35 Z"
                      fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="round"
                      style={{ pointerEvents: 'none' }} />
                    <path d="M 35,17 L 53,35 L 35,53 L 17,35 Z"
                      fill="#1a1a2e" stroke="#2a2a50" strokeWidth="0.75"
                      style={{ pointerEvents: 'none' }} />
                  </svg>
                </div>
              </div>

              <div style={s.ctrlDivider} />

              {parallelFaces > 1 && (
                <>
                  <div style={s.wallSideGroup}>
                    <span style={s.sizeLabel}>Swap face</span>
                    <button style={s.swapFaceBtn} onClick={onSwapWallFace}
                      title={`${parallelFaces} parallel faces — cycle between them`}>
                      S
                    </button>
                  </div>
                  <div style={s.ctrlDivider} />
                </>
              )}
            </>
          )}

          {/* Window pane config + size */}
          {isWindow && (
            <>
              <div style={s.ctrlDivider} />
              <div style={s.wallSideGroup}>
                <span style={s.sizeLabel}>Panes</span>
                <div style={{ display: 'grid', gridTemplateColumns: '26px 48px 26px', gridTemplateRows: '20px 56px 20px', gap: 2, alignItems: 'center', justifyItems: 'center' }}>
                  <div />
                  <button style={s.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.min(4, (item.paneRows ?? 2) + 1))}>▲</button>
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneRows ?? 2}r</span>
                  <button style={s.paneStep} onClick={() => onSetPaneConfig(Math.max(1, (item.paneCols ?? 1) - 1), item.paneRows ?? 2)}>◀</button>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.paneCols ?? 1}, 1fr)`, gridTemplateRows: `repeat(${item.paneRows ?? 2}, 1fr)`, gap: 2, width: 44, height: 52, background: '#c8a870', padding: 3, borderRadius: 3, border: '1.5px solid #8a6840' }}>
                    {Array.from({ length: (item.paneCols ?? 1) * (item.paneRows ?? 2) }).map((_, i) => (
                      <div key={i} style={{ background: '#a8d8f8', opacity: 0.75, borderRadius: 1 }} />
                    ))}
                  </div>
                  <button style={s.paneStep} onClick={() => onSetPaneConfig(Math.min(4, (item.paneCols ?? 1) + 1), item.paneRows ?? 2)}>▶</button>
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneCols ?? 1}c</span>
                  <button style={s.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.max(1, (item.paneRows ?? 2) - 1))}>▼</button>
                  <div />
                </div>
              </div>
              <div style={s.ctrlDivider} />
              <div style={s.wallSideGroup}>
                <span style={s.sizeLabel}>Size</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#7070a0', minWidth: 14 }}>W</span>
                    <Stepper min={1} max={8} step={0.5}
                      value={item.customW ?? curSize.footprint[0]}
                      onChange={v => onAdjustWindowSize(v, item.customH ?? curSize.height)} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: '#7070a0', minWidth: 14 }}>H</span>
                    <Stepper min={1} max={6} step={0.5}
                      value={item.customH ?? curSize.height}
                      onChange={v => onAdjustWindowSize(item.customW ?? curSize.footprint[0], v)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Ceiling: drop length slider */}
          {isCeiling && !item.locked && (
            <>
              <div style={s.wallSideGroup}>
                <span style={s.sizeLabel}>Drop length</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="range"
                    min={0.05} max={wallHeight - 0.1} step={0.05}
                    value={item.dropLength ?? curSize.defaultDropLength ?? 0.6}
                    onChange={e => onAdjustDropLength(parseFloat(e.target.value))}
                    style={{ width: 90 }}
                  />
                  <span style={s.sizeLabel}>{(item.dropLength ?? curSize.defaultDropLength ?? 0.6).toFixed(2)} ft</span>
                </div>
              </div>
              <div style={s.ctrlDivider} />
            </>
          )}

          {/* Floor: rotate button */}
          {!isWall && !isCeiling && !item.locked && (
            <>
              <button style={s.rotateBtn} onClick={onRotate} title="Rotate 90°"><Icon name="rotate" size={13} /> Rotate</button>
              <div style={s.ctrlDivider} />
            </>
          )}

          {/* Own / Lock / Delete */}
          <div style={s.actionRow}>
            <button style={{ ...s.actionBtn, ...(item.owned ? s.iconOwned : {}) }}
              onClick={onToggleOwned}
              title={item.owned ? 'Unmark as owned' : 'Mark as owned'}><Icon name="check" size={13} /> Own</button>
            <button style={{ ...s.actionBtn, ...(item.locked ? s.iconLocked : s.iconUnlocked) }}
              onClick={onToggleLocked}
              title={item.locked ? 'Click to unlock' : 'Click to lock position'}>
              <Icon name="lock" size={13} /> {item.locked ? 'Locked' : 'Unlocked'}
            </button>
            {!item.owned && (
              <button style={{ ...s.actionBtn, ...s.iconDelete }}
                onClick={onDelete} title="Delete"><Icon name="trash" size={13} /> Delete</button>
            )}
          </div>
          {isDoor && isWall && (
            <button
              style={{ ...s.actionBtn, borderColor: '#6090ff', color: '#a0c0ff', marginTop: 4 }}
              onClick={onEnterRoom}
              title="Double-click door to enter connected room"
            >
              Enter Room <Icon name="chevronRight" size={13} />
            </button>
          )}
        </div>

        {/* ── Row 2: Color  ·  Size  ·  Qty  ·  Wish  ·  Cart  ·  Details ── */}
        <div style={s.ctrlRow}>
          <div style={s.swatchRow}>
            {(def.swatches ?? []).map((sw, i) => (
              <button key={sw.name} title={sw.name}
                style={{
                  ...s.swatchBtn,
                  background: sw.hex,
                  ...(i === item.swatchIndex ? s.swatchBtnActive : {}),
                }}
                onClick={() => onRecolor(i)} />
            ))}
          </div>

          {!item.locked && totalSizes > 1 && (
            <>
              <div style={s.ctrlDivider} />
              <div style={s.sizeCycle}>
                <span style={s.sizeLabel}>Size</span>
                <button style={s.cycleArrow}
                  onClick={() => onResize((item.sizeIndex - 1 + totalSizes) % totalSizes)}>‹</button>
                <span style={s.cycleLabel}>{curSize.label}<span style={s.cyclePrice}> ${curSize.price}</span></span>
                <button style={s.cycleArrow}
                  onClick={() => onResize((item.sizeIndex + 1) % totalSizes)}>›</button>
              </div>
            </>
          )}

          <div style={s.ctrlDivider} />
          <div style={s.qtyRow}>
            <span style={s.sizeLabel}>Qty</span>
            <button style={s.qtyBtn} onClick={onDecrementQty} title="Remove one">−</button>
            <span style={s.qtyNum}>{groupQty}</span>
            <button style={s.qtyBtn} onClick={onIncrementQty} title="Add one">+</button>
          </div>

          <div style={s.ctrlDivider} />
          {!item.owned && (
            <button style={{ ...s.actionBtn, ...s.iconWish }}
              onClick={onToggleWishlist}
              title={item.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            ><Icon name="wishlist" size={13} /> Wish</button>
          )}
          {!item.owned && (
            <button style={{ ...s.actionBtn, ...s.iconCart }}
              onClick={onAddToCart} title="Add to cart"><Icon name="cart" size={13} /> Cart</button>
          )}
          <button style={{ ...s.actionBtn, ...s.iconInfo }}
            onClick={onShowDetails} title="View details"><Icon name="info" size={13} /> Details</button>
        </div>

      </div>
    </div>
  )
}
