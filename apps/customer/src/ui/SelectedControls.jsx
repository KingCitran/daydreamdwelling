import { ITEM_CATALOGUE } from '../data/items'
import { styles } from './styles/appStyles'
import { DIAMOND_MAP, roomQuadrant } from '../utils/roomGeometry'
import Stepper from './Stepper'

export default function SelectedControls({
  item, drawerOpen, roomRotation,
  onShowDetails, onRotate, onDelete,
  onResize, onRecolor,
  onToggleOwned, onToggleLocked,
  onToggleWishlist, onAddToCart,
  groupQty, onIncrementQty, onDecrementQty,
  onMoveWall, onChangeWall,
  parallelFaces, onSwapWallFace,
  wallHeight, onAdjustDropLength, onSetPaneConfig, onAdjustWindowSize, onEnterRoom,
}) {
  const def        = ITEM_CATALOGUE[item.typeKey]
  const totalSizes = def.sizes.length
  const curSize    = def.sizes[item.sizeIndex]
  const isWall     = !!item.wall
  const isCeiling  = !!item.ceiling
  const isWindow   = !!def.window
  const isDoor     = !!def.door
  const dmap       = DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)]

  const maxW = 'calc(100% - 40px)'
  return (
    <div style={{
      position: 'absolute', bottom: 20,
      left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{ ...styles.controls, pointerEvents: 'auto', maxWidth: maxW, minWidth: 0 }}>

        {/* ── Row 1: Name / brand (left)  ·  Rating + badges (right) ── */}
        <div style={styles.ctrlNameRow}>
          <div style={styles.ctrlNameLeft}>
            <span style={styles.controlsTitle}>{def.label}</span>
            {def.brand && <span style={styles.controlsBrand}>{def.brand}</span>}
          </div>
          <div style={styles.ctrlNameRight}>
            {def.rating && (
              <span style={styles.ctrlRating}>
                ★ {def.rating}
                {def.reviewCount && <span style={styles.ctrlRatingCount}> ({def.reviewCount})</span>}
              </span>
            )}
            {(item.owned || item.wishlisted || item.locked) && (
              <div style={styles.badgeRow}>
                {item.owned      && <span style={styles.badgeOwned}  title="You own this">✓ owned</span>}
                {item.wishlisted && <span style={styles.badgeWish}   title="On wishlist">♥ wishlist</span>}
                {item.locked     && <span style={styles.badgeLocked} title="Position locked">🔒 locked</span>}
              </div>
            )}
          </div>
        </div>

        <div style={styles.ctrlHDivider} />

        {/* ── Row 2: Position controls  +  Own / Lock / Delete ── */}
        <div style={styles.ctrlRow}>

          {/* Wall: SVG cross D-pad */}
          {isWall && !item.locked && (
            <>
              <div style={styles.wallNudgeGroup}>
                <span style={styles.sizeLabel}>Move item</span>
                <div style={styles.diamondWrap}>
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

              <div style={styles.ctrlDivider} />

              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Switch wall</span>
                <div style={styles.diamondWrap}>
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

              <div style={styles.ctrlDivider} />

              {parallelFaces > 1 && (
                <>
                  <div style={styles.wallSideGroup}>
                    <span style={styles.sizeLabel}>Swap face</span>
                    <button style={styles.swapFaceBtn} onClick={onSwapWallFace}
                      title={`${parallelFaces} parallel faces — cycle between them`}>
                      S
                    </button>
                  </div>
                  <div style={styles.ctrlDivider} />
                </>
              )}
            </>
          )}

          {/* Window pane config + size */}
          {isWindow && (
            <>
              <div style={styles.ctrlDivider} />
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Panes</span>
                <div style={{ display: 'grid', gridTemplateColumns: '26px 48px 26px', gridTemplateRows: '20px 56px 20px', gap: 2, alignItems: 'center', justifyItems: 'center' }}>
                  <div />
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.min(4, (item.paneRows ?? 2) + 1))}>▲</button>
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneRows ?? 2}r</span>
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(Math.max(1, (item.paneCols ?? 1) - 1), item.paneRows ?? 2)}>◀</button>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${item.paneCols ?? 1}, 1fr)`, gridTemplateRows: `repeat(${item.paneRows ?? 2}, 1fr)`, gap: 2, width: 44, height: 52, background: '#c8a870', padding: 3, borderRadius: 3, border: '1.5px solid #8a6840' }}>
                    {Array.from({ length: (item.paneCols ?? 1) * (item.paneRows ?? 2) }).map((_, i) => (
                      <div key={i} style={{ background: '#a8d8f8', opacity: 0.75, borderRadius: 1 }} />
                    ))}
                  </div>
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(Math.min(4, (item.paneCols ?? 1) + 1), item.paneRows ?? 2)}>▶</button>
                  <span style={{ fontSize: 9, color: '#7070a0', whiteSpace: 'nowrap' }}>{item.paneCols ?? 1}c</span>
                  <button style={styles.paneStep} onClick={() => onSetPaneConfig(item.paneCols ?? 1, Math.max(1, (item.paneRows ?? 2) - 1))}>▼</button>
                  <div />
                </div>
              </div>
              <div style={styles.ctrlDivider} />
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Size</span>
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
              <div style={styles.wallSideGroup}>
                <span style={styles.sizeLabel}>Drop length</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="range"
                    min={0.05} max={wallHeight - 0.1} step={0.05}
                    value={item.dropLength ?? curSize.defaultDropLength ?? 0.6}
                    onChange={e => onAdjustDropLength(parseFloat(e.target.value))}
                    style={{ width: 90 }}
                  />
                  <span style={styles.sizeLabel}>{(item.dropLength ?? curSize.defaultDropLength ?? 0.6).toFixed(2)} ft</span>
                </div>
              </div>
              <div style={styles.ctrlDivider} />
            </>
          )}

          {/* Floor: rotate button */}
          {!isWall && !isCeiling && !item.locked && (
            <>
              <button style={styles.rotateBtn} onClick={onRotate} title="Rotate 90°">↻ Rotate</button>
              <div style={styles.ctrlDivider} />
            </>
          )}

          {/* Own / Lock / Delete */}
          <div style={styles.actionRow}>
            <button style={{ ...styles.actionBtn, ...(item.owned ? styles.iconOwned : {}) }}
              onClick={onToggleOwned}
              title={item.owned ? 'Unmark as owned' : 'Mark as owned'}>✓ Own</button>
            <button style={{ ...styles.actionBtn, ...(item.locked ? styles.iconLocked : styles.iconUnlocked) }}
              onClick={onToggleLocked}
              title={item.locked ? 'Click to unlock' : 'Click to lock position'}>
              {item.locked ? '🔒 Locked' : '🔓 Unlocked'}
            </button>
            {!item.owned && (
              <button style={{ ...styles.actionBtn, ...styles.iconDelete }}
                onClick={onDelete} title="Delete">🗑 Delete</button>
            )}
          </div>
          {isDoor && isWall && (
            <button
              style={{ ...styles.actionBtn, borderColor: '#6090ff', color: '#a0c0ff', marginTop: 4 }}
              onClick={onEnterRoom}
              title="Double-click door to enter connected room"
            >
              → Enter Room
            </button>
          )}
        </div>

        <div style={styles.ctrlHDivider} />

        {/* ── Row 3: Color  ·  Size  ·  Qty  ·  Wish  ·  Cart  ·  Details ── */}
        <div style={styles.ctrlRow}>
          <div style={styles.swatchRow}>
            {def.swatches.map((sw, i) => (
              <button key={sw.name} title={sw.name}
                style={{
                  ...styles.swatchBtn,
                  background: sw.hex,
                  ...(i === item.swatchIndex ? styles.swatchBtnActive : {}),
                }}
                onClick={() => onRecolor(i)} />
            ))}
          </div>

          {!item.locked && totalSizes > 1 && (
            <>
              <div style={styles.ctrlDivider} />
              <div style={styles.sizeCycle}>
                <span style={styles.sizeLabel}>Size</span>
                <button style={styles.cycleArrow}
                  onClick={() => onResize((item.sizeIndex - 1 + totalSizes) % totalSizes)}>‹</button>
                <span style={styles.cycleLabel}>{curSize.label}<span style={styles.cyclePrice}> ${curSize.price}</span></span>
                <button style={styles.cycleArrow}
                  onClick={() => onResize((item.sizeIndex + 1) % totalSizes)}>›</button>
              </div>
            </>
          )}

          <div style={styles.ctrlDivider} />
          <div style={styles.qtyRow}>
            <span style={styles.sizeLabel}>Qty</span>
            <button style={styles.qtyBtn} onClick={onDecrementQty} title="Remove one">−</button>
            <span style={styles.qtyNum}>{groupQty}</span>
            <button style={styles.qtyBtn} onClick={onIncrementQty} title="Add one">+</button>
          </div>

          <div style={styles.ctrlDivider} />
          {!item.owned && (
            <button style={{ ...styles.actionBtn, ...styles.iconWish }}
              onClick={onToggleWishlist}
              title={item.wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >{item.wishlisted ? '♥' : '♡'} Wish</button>
          )}
          {!item.owned && (
            <button style={{ ...styles.actionBtn, ...styles.iconCart }}
              onClick={onAddToCart} title="Add to cart">🛒 Cart</button>
          )}
          <button style={{ ...styles.actionBtn, ...styles.iconInfo }}
            onClick={onShowDetails} title="View details">ℹ Details</button>
        </div>

      </div>
    </div>
  )
}
