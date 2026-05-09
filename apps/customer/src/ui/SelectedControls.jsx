import { memo, useMemo } from 'react'
import { ITEM_CATALOGUE } from '../data/items'
import { useBuilderStyles } from './styles/appStyles'
import { DIAMOND_MAP, roomQuadrant } from '../utils/roomGeometry'
import Stepper from './Stepper'
import { Icon } from '@shared/ui/Icon'
import { Heart } from 'lucide-react'

// SelectedControls — item details panel that slides out below the
// TopRightCluster. Layout uses the "stacked cards" pattern: each card is a
// self-contained memoized section that only renders when relevant.
//
// Performance: every section component memos on its DATA props, ignoring
// function refs (handlers change every parent render but don't affect what
// gets rendered). Item drags only update wallU/wallH → only Position card
// re-renders. Header / Size / Color / Quantity / Manage skip.

// Shallow equality. We previously skipped function comparisons here as a
// perf optimization, but that broke any button whose handler was an inline
// closure encoding the selected item's id (Own, Lock, Delete, Wishlist…).
// Stale closures kept toggling the previously-selected item.
const dataEqual = (prev, next) => {
  const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
  for (const k of keys) {
    if (prev[k] !== next[k]) return false
  }
  return true
}

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
  const def        = (catalogue ?? ITEM_CATALOGUE)[item.typeKey] ?? ITEM_CATALOGUE[item.typeKey] ?? {}
  const totalSizes = def.sizes?.length ?? 0
  const curSize    = def.sizes?.[item.sizeIndex] ?? def.sizes?.[0] ?? { label: '', price: null, footprint: [1,1], height: 1 }
  const isWall     = !!item.wall
  const isCeiling  = !!item.ceiling
  const isWindow   = !!def.window
  const isDoor     = !!def.door
  const isFloor    = !isWall && !isCeiling
  // dmap stable across renders unless roomRotation changes
  const dmap       = useMemo(() => DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)], [roomRotation])

  return (
    <div style={{
      position: 'absolute', top: 318, right: 24, width: 360,
      maxHeight: 'calc(100vh - 342px)', overflow: 'auto',
      pointerEvents: 'none', zIndex: 40,
    }}>
      <div style={{
        background: 'rgba(20,15,38,0.94)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: 12,
        boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', gap: 8,
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}>
        <HeaderSection
          label={def.label} brand={def.brand} rating={def.rating} reviewCount={def.reviewCount}
          owned={item.owned} wishlisted={item.wishlisted} locked={item.locked}
          onToggleWishlist={onToggleWishlist} onAddToCart={onAddToCart}
        />

        {isWall && !item.locked && (
          <PositionWallSection
            wallU={item.wallU} wallH={item.wallH} wall={item.wall}
            parallelFaces={parallelFaces} isDoor={isDoor} dmap={dmap}
            onMoveWall={onMoveWall} onChangeWall={onChangeWall} onSwapWallFace={onSwapWallFace}
          />
        )}

        {isCeiling && !item.locked && (
          <DropSection
            dropLength={item.dropLength} defaultDropLength={curSize.defaultDropLength}
            wallHeight={wallHeight} onAdjustDropLength={onAdjustDropLength}
          />
        )}

        {isWindow && (
          <WindowSection
            paneCols={item.paneCols ?? 1} paneRows={item.paneRows ?? 2}
            customW={item.customW ?? curSize.footprint[0]} customH={item.customH ?? curSize.height}
            onSetPaneConfig={onSetPaneConfig} onAdjustWindowSize={onAdjustWindowSize}
          />
        )}

        {isDoor && isWall && <DoorSection onEnterRoom={onEnterRoom} />}

        {totalSizes > 1 && !item.locked && (
          <div style={item.owned ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
               title={item.owned ? "You own this — size is fixed" : undefined}>
            <SizeSection
              sizeIndex={item.sizeIndex} totalSizes={totalSizes}
              label={curSize.label} price={curSize.price}
              onResize={onResize}
            />
          </div>
        )}

        {(def.swatches?.length ?? 0) > 0 && (
          <div style={item.owned ? { opacity: 0.45, pointerEvents: 'none' } : undefined}
               title={item.owned ? "You own this — color is fixed" : undefined}>
            <ColorSection swatches={def.swatches} swatchIndex={item.swatchIndex} onRecolor={onRecolor} />
          </div>
        )}

        <QtyRotateSection
          groupQty={groupQty}
          showRotate={isFloor && !item.locked}
          onRotate={onRotate} onIncrementQty={onIncrementQty} onDecrementQty={onDecrementQty}
        />

        <ManageSection
          owned={item.owned} locked={item.locked}
          onToggleOwned={onToggleOwned} onToggleLocked={onToggleLocked}
          onShowDetails={onShowDetails} onDelete={onDelete}
        />
      </div>
    </div>
  )
}

// ── Section components (memoized) ────────────────────────────────────

const HeaderSection = memo(function HeaderSection({
  label, brand, rating, reviewCount,
  owned, wishlisted, locked,
  onToggleWishlist, onAddToCart,
}) {
  return (
    <Card padded={false}>
      <div style={{ padding: '6px 6px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#f0eaff', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
              {rating && (
                <span style={{ fontSize: 11, color: '#f0c060', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  ★ {rating}{reviewCount && <span style={{ fontSize: 10, color: '#a090c8', fontWeight: 400 }}> ({reviewCount})</span>}
                </span>
              )}
            </div>
            {brand && <div style={{ fontSize: 11, color: '#a090c8', marginTop: 2 }}>{brand}</div>}
          </div>
          {!owned && (
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <button onClick={onToggleWishlist}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${wishlisted ? '#ff9ab8' : 'rgba(255,255,255,0.12)'}`,
                  background: wishlisted ? 'rgba(255,154,184,0.18)' : 'rgba(255,255,255,0.04)',
                  color: wishlisted ? '#ff9ab8' : '#c8b8ee',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <Heart size={14} strokeWidth={2.2} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
              <button onClick={onAddToCart} title="Add to cart"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid #ffc87a55',
                  background: 'rgba(255,200,122,0.18)',
                  color: '#ffc87a',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name="cart" size={14} /></button>
            </div>
          )}
        </div>
        {(owned || locked) && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            {owned  && <Badge color="#88d8b0">✓ owned</Badge>}
            {locked && <Badge color="#ffc87a">🔒 locked</Badge>}
          </div>
        )}
      </div>
    </Card>
  )
}, dataEqual)

const PositionWallSection = memo(function PositionWallSection({
  wallU, wallH, wall, parallelFaces, isDoor, dmap,
  onMoveWall, onChangeWall, onSwapWallFace,
}) {
  const s = useBuilderStyles()
  return (
    <Card title="Position">
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: 8, alignItems: 'flex-start' }}>
        <DpadGroup label="Move">
          <svg width="70" height="70" style={{ display: 'block' }}>
            {[
              { dir: 'up',    pts: '22,22 48,22 35,8',  cb: () => onMoveWall(wallU, wallH + 0.25), hide: isDoor },
              { dir: 'right', pts: '48,22 48,48 62,35', cb: () => onMoveWall(wallU + 0.25, wallH) },
              { dir: 'down',  pts: '48,48 22,48 35,62', cb: () => onMoveWall(wallU, wallH - 0.25), hide: isDoor },
              { dir: 'left',  pts: '22,48 22,22 8,35',  cb: () => onMoveWall(wallU - 0.25, wallH) },
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
        </DpadGroup>

        <DpadGroup label="Wall">
          <svg width="70" height="70" style={{ display: 'block' }}>
            {[
              { pos: 'tl', pts: '8,35 35,8 35,17 17,35' },
              { pos: 'tr', pts: '35,8 62,35 53,35 35,17' },
              { pos: 'br', pts: '62,35 35,62 35,53 53,35' },
              { pos: 'bl', pts: '35,62 8,35 17,35 35,53' },
            ].map(({ pos, pts }) => {
              const targetWall = dmap[pos]
              const active = wall === targetWall
              return (
                <polygon key={pos} points={pts}
                  fill={active ? '#5050aa' : '#2a2a4a'}
                  stroke={active ? '#9898ff' : '#3a3a6a'}
                  strokeWidth="0.75"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onChangeWall(targetWall)} />
              )
            })}
            <path d="M 35,8 L 62,35 L 35,62 L 8,35 Z"
              fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="round"
              style={{ pointerEvents: 'none' }} />
            <path d="M 35,17 L 53,35 L 35,53 L 17,35 Z"
              fill="#1a1a2e" stroke="#2a2a50" strokeWidth="0.75"
              style={{ pointerEvents: 'none' }} />
          </svg>
        </DpadGroup>

        {parallelFaces > 1 && (
          <DpadGroup label="Face">
            <button style={s.swapFaceBtn} onClick={onSwapWallFace}
              title={`${parallelFaces} parallel faces — cycle between them`}>S</button>
          </DpadGroup>
        )}
      </div>
    </Card>
  )
}, dataEqual)

const DropSection = memo(function DropSection({
  dropLength, defaultDropLength, wallHeight, onAdjustDropLength,
}) {
  const value = dropLength ?? defaultDropLength ?? 0.6
  return (
    <Card title="Drop">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input type="range"
          min={0.05} max={wallHeight - 0.1} step={0.05}
          value={value}
          onChange={e => onAdjustDropLength(parseFloat(e.target.value))}
          style={{ flex: 1, minWidth: 0 }}
        />
        <span style={{ fontSize: 11, color: '#c8b8ee', minWidth: 50, textAlign: 'right' }}>
          {value.toFixed(2)} ft
        </span>
      </div>
    </Card>
  )
}, dataEqual)

const WindowSection = memo(function WindowSection({
  paneCols, paneRows, customW, customH,
  onSetPaneConfig, onAdjustWindowSize,
}) {
  const s = useBuilderStyles()
  return (
    <Card title="Window">
      <div style={{ display: 'flex', justifyContent: 'space-around', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={miniLabel}>Panes</span>
          <div style={{ display: 'grid', gridTemplateColumns: '20px 48px 20px', gridTemplateRows: '18px 56px 18px', gap: 2, alignItems: 'center', justifyItems: 'center' }}>
            <div />
            <button style={s.paneStep} onClick={() => onSetPaneConfig(paneCols, Math.min(4, paneRows + 1))}>▲</button>
            <span style={{ fontSize: 9, color: '#8878c8' }}>{paneRows}r</span>
            <button style={s.paneStep} onClick={() => onSetPaneConfig(Math.max(1, paneCols - 1), paneRows)}>◀</button>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${paneCols}, 1fr)`, gridTemplateRows: `repeat(${paneRows}, 1fr)`, gap: 2, width: 44, height: 52, background: '#c8a870', padding: 3, borderRadius: 3, border: '1.5px solid #8a6840' }}>
              {Array.from({ length: paneCols * paneRows }).map((_, i) => (
                <div key={i} style={{ background: '#a8d8f8', opacity: 0.75, borderRadius: 1 }} />
              ))}
            </div>
            <button style={s.paneStep} onClick={() => onSetPaneConfig(Math.min(4, paneCols + 1), paneRows)}>▶</button>
            <span style={{ fontSize: 9, color: '#8878c8' }}>{paneCols}c</span>
            <button style={s.paneStep} onClick={() => onSetPaneConfig(paneCols, Math.max(1, paneRows - 1))}>▼</button>
            <div />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
          <span style={miniLabel}>Size</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#8878c8', minWidth: 14 }}>W</span>
            <Stepper min={1} max={8} step={0.5} value={customW}
              onChange={v => onAdjustWindowSize(v, customH)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 10, color: '#8878c8', minWidth: 14 }}>H</span>
            <Stepper min={1} max={6} step={0.5} value={customH}
              onChange={v => onAdjustWindowSize(customW, v)} />
          </div>
        </div>
      </div>
    </Card>
  )
}, dataEqual)

const DoorSection = memo(function DoorSection({ onEnterRoom }) {
  return (
    <Card title="Door">
      <button onClick={onEnterRoom}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 8,
          border: '1px solid #6090ff', background: 'rgba(96,144,255,0.18)',
          color: '#a0c0ff', cursor: 'pointer',
          fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}
        title="Double-click door to enter connected room">
        Enter Room <Icon name="chevronRight" size={13} />
      </button>
    </Card>
  )
}, dataEqual)

const SizeSection = memo(function SizeSection({
  sizeIndex, totalSizes, label, price, onResize,
}) {
  const s = useBuilderStyles()
  return (
    <Card title="Size">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button style={s.cycleArrow} onClick={() => onResize((sizeIndex - 1 + totalSizes) % totalSizes)}>‹</button>
        <span style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#f0eaff' }}>
          {label}
          {price && <span style={{ color: '#a090c8', fontWeight: 400 }}> · ${price}</span>}
        </span>
        <button style={s.cycleArrow} onClick={() => onResize((sizeIndex + 1) % totalSizes)}>›</button>
      </div>
    </Card>
  )
}, dataEqual)

const ColorSection = memo(function ColorSection({ swatches, swatchIndex, onRecolor }) {
  return (
    <Card title="Color">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {swatches.map((sw, i) => (
          <button key={sw.name} title={sw.name}
            onClick={() => onRecolor(i)}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: sw.hex,
              border: i === swatchIndex
                ? '2px solid #f0eaff'
                : '1px solid rgba(255,255,255,0.15)',
              cursor: 'pointer',
              boxShadow: i === swatchIndex ? '0 0 0 2px rgba(184,160,255,0.5)' : 'none',
            }}
          />
        ))}
      </div>
    </Card>
  )
}, dataEqual)

const QtyRotateSection = memo(function QtyRotateSection({
  groupQty, showRotate,
  onRotate, onIncrementQty, onDecrementQty,
}) {
  return (
    <Card title={showRotate ? 'Rotate · Quantity' : 'Quantity in room'}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        {showRotate && (
          <button onClick={onRotate} style={{ ...halfBtn, width: 'auto', flex: 1, padding: '8px 12px' }} title="Rotate 90°">
            <Icon name="rotate" size={13} /> Rotate
          </button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={qtyBtn} onClick={onDecrementQty} title="Remove one">−</button>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f0eaff', minWidth: 28, textAlign: 'center' }}>{groupQty}</span>
          <button style={qtyBtn} onClick={onIncrementQty} title="Add one">+</button>
        </div>
      </div>
    </Card>
  )
}, dataEqual)

const ManageSection = memo(function ManageSection({
  owned, locked,
  onToggleOwned, onToggleLocked, onShowDetails, onDelete,
}) {
  return (
    <Card title="Manage">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
        <button onClick={onToggleOwned} style={{ ...halfBtn, color: owned ? '#88d8b0' : '#c8b8ee' }}
          title={owned ? 'Unmark as owned' : 'Mark as owned'}>
          <Icon name="check" size={13} /> {owned ? 'owned' : 'I own this'}
        </button>
        <button onClick={onToggleLocked} style={{ ...halfBtn, color: locked ? '#ffc87a' : '#c8b8ee' }}
          title={locked ? 'Click to unlock' : 'Click to lock position'}>
          <Icon name="lock" size={13} /> {locked ? 'Locked' : 'Unlocked'}
        </button>
        <button onClick={onShowDetails} style={halfBtn} title="View details">
          <Icon name="info" size={13} /> Details
        </button>
        {!owned && (
          <button onClick={onDelete} style={{ ...halfBtn, color: '#ff8a8a' }} title="Delete">
            <Icon name="trash" size={13} /> Delete
          </button>
        )}
      </div>
    </Card>
  )
}, dataEqual)

// ── Internal building blocks ────────────────────────────────────────

function Card({ title, padded = true, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: padded ? 10 : 0,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {title && (
        <div style={{
          fontSize: 9, fontWeight: 800,
          color: '#a090c8',
          letterSpacing: '0.7px',
          textTransform: 'uppercase',
        }}>{title}</div>
      )}
      {children}
    </div>
  )
}

function Badge({ color, children }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700,
      padding: '2px 7px', borderRadius: 8,
      background: `${color}25`, color,
      letterSpacing: '0.4px',
    }}>{children}</span>
  )
}

function DpadGroup({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={miniLabel}>{label}</span>
      {children}
    </div>
  )
}

const miniLabel = {
  fontSize: 9, fontWeight: 700, color: '#8878c8',
  letterSpacing: '0.5px', textTransform: 'uppercase',
}

const halfBtn = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
  padding: '8px 10px',
  borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f0eaff', cursor: 'pointer',
  fontSize: 11, fontWeight: 600,
  fontFamily: "'Outfit', system-ui, sans-serif",
}

const qtyBtn = {
  width: 32, height: 32, borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#f0eaff', cursor: 'pointer',
  fontSize: 18, fontWeight: 700,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}
