import { useState, useMemo, useRef } from 'react'
import { ITEM_CATALOGUE as STATIC_CATALOGUE } from '../../data/items'
import {
  SHOP_MODES, OBJECT_BUCKETS, ROOM_BUCKETS, VIBE_BUCKETS, COLOR_BUCKETS, FUNCTION_BUCKETS,
  matchesSearch,
} from './shopData'
import { useShopStyles } from './shopStyles'
import { useTheme } from '@shared/ThemeProvider'
import ProductCard from './ProductCard'
import ShopIcon from './ShopIcon'

function getSubOptions(mode) {
  if (mode === 'object')   return Object.entries(OBJECT_BUCKETS).map(([key, m]) => ({ key, icon: m.icon, emoji: m.emoji, label: key }))
  if (mode === 'room')     return ROOM_BUCKETS.map(b => ({ key: b.key, icon: b.icon, emoji: b.emoji, label: b.key }))
  if (mode === 'vibe')     return VIBE_BUCKETS.map(b => ({ key: b.key, icon: b.icon, emoji: b.emoji, label: b.key }))
  if (mode === 'color')    return COLOR_BUCKETS.map(b => ({ key: b.key, emoji: b.emoji, label: b.key, preview: b.preview }))
  if (mode === 'function') return FUNCTION_BUCKETS.map(b => ({ key: b.key, icon: b.icon, emoji: b.emoji, label: b.key }))
  return []
}

function filterByMode(items, mode, sub) {
  if (!mode || !sub) return items
  if (mode === 'object') {
    const cats = OBJECT_BUCKETS[sub]?.categories ?? []
    return items.filter(([, d]) => cats.includes(d.category))
  }
  if (mode === 'room')     return items.filter(([, d]) => (d.rooms   ?? []).includes(sub))
  if (mode === 'vibe')     return items.filter(([, d]) => (d.themes  ?? []).includes(sub))
  if (mode === 'color') {
    const fams = COLOR_BUCKETS.find(b => b.key === sub)?.families ?? []
    return items.filter(([, d]) => (d.swatches ?? []).some(sw => fams.includes(sw.family)))
  }
  if (mode === 'function') {
    const fn = FUNCTION_BUCKETS.find(b => b.key === sub)
    return fn ? items.filter(([, d]) => fn.match(d)) : items
  }
  return items
}

function applySort(items, sort) {
  if (sort === 'price_asc')  return [...items].sort((a, b) => (a[1].price ?? 0) - (b[1].price ?? 0))
  if (sort === 'price_desc') return [...items].sort((a, b) => (b[1].price ?? 0) - (a[1].price ?? 0))
  if (sort === 'rating')     return [...items].sort((a, b) => (b[1].rating ?? 0) - (a[1].rating ?? 0))
  return items
}

export default function BrowseTab({ onPlace, onOpenModal, catalogue, gridW, gridD, roomItemKeys, ownedKeys }) {
  const ITEM_CATALOGUE = catalogue ?? STATIC_CATALOGUE
  const s = useShopStyles()

  const [activeMode,   setActiveMode]   = useState(null)
  const [activeSub,    setActiveSub]    = useState(null)
  const [colorSubTag,  setColorSubTag]  = useState(null)
  const [search,       setSearch]       = useState('')
  const [sort,         setSort]         = useState('featured')
  const [recentKeys,   setRecentKeys]   = useState(
    () => JSON.parse(localStorage.getItem('ddd_recent_viewed') || '[]')
  )

  function selectMode(key) {
    if (activeMode === key) { setActiveMode(null); setActiveSub(null); setColorSubTag(null) }
    else { setActiveMode(key); setActiveSub(null); setColorSubTag(null) }
  }

  function selectSub(key) {
    if (activeSub === key) { setActiveSub(null); setColorSubTag(null) }
    else { setActiveSub(key); setColorSubTag(null) }
  }

  function trackAndOpen(typeKey) {
    setRecentKeys(prev => {
      const next = [typeKey, ...prev.filter(k => k !== typeKey)].slice(0, 8)
      localStorage.setItem('ddd_recent_viewed', JSON.stringify(next))
      return next
    })
    onOpenModal(typeKey)
  }

  const searchTerm = search.trim().toLowerCase()

  const allItems = useMemo(() =>
    Object.entries(ITEM_CATALOGUE).filter(([, d]) => !d.door && !d.isStairs),
    [ITEM_CATALOGUE]
  )

  const modeFiltered = useMemo(() =>
    filterByMode(allItems, activeMode, activeSub),
    [activeMode, activeSub, allItems]
  )

  const visibleItems = useMemo(() => {
    let items = modeFiltered
    if (searchTerm) items = items.filter(([, d]) => matchesSearch(d, searchTerm))
    if (activeMode === 'color' && activeSub && colorSubTag) {
      items = items.filter(([, d]) => (d.swatches ?? []).some(sw => sw.name === colorSubTag))
    }
    return applySort(items, sort)
  }, [modeFiltered, searchTerm, colorSubTag, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  const colorSubTags = useMemo(() => {
    if (activeMode !== 'color' || !activeSub) return []
    const fams = COLOR_BUCKETS.find(b => b.key === activeSub)?.families ?? []
    const names = new Set()
    modeFiltered.forEach(([, d]) => {
      ;(d.swatches ?? []).filter(sw => fams.includes(sw.family)).forEach(sw => names.add(sw.name))
    })
    return [...names].sort()
  }, [activeMode, activeSub, modeFiltered])

  const subOptions     = activeMode ? getSubOptions(activeMode) : []
  const subPanelOpen   = activeMode !== null
  const activeFamilies = activeMode === 'color' && activeSub
    ? COLOR_BUCKETS.find(b => b.key === activeSub)?.families ?? null
    : null
  const gridCols = subPanelOpen ? 1 : 2

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  return (
    <>
    <style>{`
      @keyframes ddd-shop-tip-pop {
        0%   { opacity: 0; transform: translate(-100%, -50%) scale(0.82); }
        70%  { opacity: 1; transform: translate(-100%, -50%) scale(1.06); }
        100% { opacity: 1; transform: translate(-100%, -50%) scale(1); }
      }
      .ddd-shop-tooltip { animation: ddd-shop-tip-pop 0.16s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .ddd-mode-scroll::-webkit-scrollbar { display: none; }
    `}</style>

    {isMobile ? (
      /* ══ MOBILE: horizontal filters at top, grid below ══ */
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        {/* Search */}
        <div style={s.searchBar}>
          <input type="text"
            placeholder={activeSub ? `Search in ${activeSub}…` : 'Search all items…'}
            value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
          {search && <button style={s.searchClear} onClick={() => setSearch('')}>✕</button>}
        </div>

        {/* Mode chips — horizontal scroll */}
        <div className="ddd-mode-scroll" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '4px 8px', flexShrink: 0, scrollbarWidth: 'none' }}>
          {SHOP_MODES.map(mode => (
            <button key={mode.key} onClick={() => selectMode(mode.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
              borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer',
              border: `1px solid ${activeMode === mode.key ? '#9a7aee' : 'rgba(180,158,220,0.25)'}`,
              background: activeMode === mode.key ? 'rgba(154,122,238,0.2)' : 'transparent',
              color: activeMode === mode.key ? '#e0d9ff' : '#b0a8d0',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}>
              {mode.emoji} {mode.label}
            </button>
          ))}
        </div>

        {/* Sub-option chips — horizontal scroll (when mode selected) */}
        {subPanelOpen && (
          <div className="ddd-mode-scroll" style={{ display: 'flex', gap: 5, overflowX: 'auto', padding: '3px 8px', flexShrink: 0, scrollbarWidth: 'none' }}>
            {subOptions.map(opt => {
              const count = filterByMode(allItems, activeMode, opt.key).length
              return (
                <button key={opt.key} onClick={() => count > 0 && selectSub(opt.key)} style={{
                  display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                  borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0, cursor: count ? 'pointer' : 'default',
                  border: `1px solid ${activeSub === opt.key ? '#9a7aee' : 'rgba(180,158,220,0.2)'}`,
                  background: activeSub === opt.key ? 'rgba(154,122,238,0.18)' : 'transparent',
                  color: activeSub === opt.key ? '#e0d9ff' : '#8a80b0',
                  fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
                  opacity: count ? 1 : 0.35,
                }}>
                  {opt.preview
                    ? <span style={{ width: 14, height: 14, borderRadius: '50%', background: opt.preview, display: 'inline-block' }} />
                    : null}
                  {opt.label}
                </button>
              )
            })}
          </div>
        )}

        {colorSubTags.length > 0 && (
          <div style={st.subTagRow}>
            {colorSubTags.map(tag => (
              <button key={tag}
                style={{ ...st.subTagChip, ...(colorSubTag === tag ? st.subTagActive : {}) }}
                onClick={() => setColorSubTag(prev => prev === tag ? null : tag)}>
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Sort row */}
        <div style={{ ...s.sortRow, flexShrink: 0 }}>
          {[['featured','Featured'],['price_asc','$ ↑'],['price_desc','$ ↓'],['rating','★']].map(([val, lbl]) => (
            <button key={val} style={{ ...s.sortBtn, ...(sort === val ? s.sortBtnActive : {}) }} onClick={() => setSort(val)}>{lbl}</button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8a78a8', alignSelf: 'center', paddingRight: 4 }}>
            {visibleItems.length}
          </span>
        </div>

        {/* Product grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px 16px' }}>
          {visibleItems.length === 0
            ? <p style={s.emptyMsg}>No items{activeSub ? ` in ${activeSub}` : ''}{searchTerm ? ` matching "${search}"` : ''}.</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 7 }}>
                {visibleItems.map(([key, def]) => (
                  <ProductCard key={key} typeKey={key} def={def}
                    onPlace={onPlace} onOpenModal={trackAndOpen}
                    gridW={gridW} gridD={gridD}
                    colorFamilies={activeFamilies}
                    roomItemKeys={roomItemKeys}
                    ownedKeys={ownedKeys}
                    canPlace={!!STATIC_CATALOGUE[key]}
                  />
                ))}
              </div>
            )
          }
        </div>
      </div>
    ) : (
      /* ══ DESKTOP/TABLET: original vertical strips ══ */
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
        <div style={st.gridCol}>
          <div style={s.searchBar}>
            <input type="text"
              placeholder={activeSub ? `Search in ${activeSub}…` : activeMode ? 'Search…' : 'Search all items…'}
              value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput} />
            {search && <button style={s.searchClear} onClick={() => setSearch('')}>✕</button>}
          </div>

          {colorSubTags.length > 0 && (
            <div style={st.subTagRow}>
              {colorSubTags.map(tag => (
                <button key={tag}
                  style={{ ...st.subTagChip, ...(colorSubTag === tag ? st.subTagActive : {}) }}
                  onClick={() => setColorSubTag(prev => prev === tag ? null : tag)}>
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div style={{ ...s.sortRow, flexShrink: 0 }}>
            {[['featured','Featured'],['price_asc','$ ↑'],['price_desc','$ ↓'],['rating','★']].map(([val, lbl]) => (
              <button key={val} style={{ ...s.sortBtn, ...(sort === val ? s.sortBtnActive : {}) }} onClick={() => setSort(val)}>{lbl}</button>
            ))}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: '#8a78a8', alignSelf: 'center', paddingRight: 4 }}>
              {visibleItems.length}
            </span>
          </div>

          {!activeMode && !searchTerm && recentKeys.length > 0 && (
            <div style={s.recentRow}>
              <span style={s.recentLabel}>Recently viewed</span>
              <div style={s.recentScroll}>
                {recentKeys.map(key => {
                  const def = ITEM_CATALOGUE[key]
                  if (!def) return null
                  return (
                    <div key={key} style={s.recentCard} onClick={() => trackAndOpen(key)}>
                      <div style={{ ...s.recentThumb, background: def.gradient }} />
                      <span style={s.recentCardLabel}>{def.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px 16px' }}>
            {visibleItems.length === 0
              ? <p style={s.emptyMsg}>No items{activeSub ? ` in ${activeSub}` : ''}{searchTerm ? ` matching "${search}"` : ''}.</p>
              : (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gap: 8 }}>
                  {visibleItems.map(([key, def]) => (
                    <ProductCard key={key} typeKey={key} def={def}
                      onPlace={onPlace} onOpenModal={trackAndOpen}
                      gridW={gridW} gridD={gridD}
                      colorFamilies={activeFamilies}
                      roomItemKeys={roomItemKeys}
                      ownedKeys={ownedKeys}
                      canPlace={!!STATIC_CATALOGUE[key]}
                    />
                  ))}
                </div>
              )
            }
          </div>
        </div>

        <div style={{ ...st.subStrip, width: subPanelOpen ? 52 : 0 }}>
          {subPanelOpen && subOptions.map(opt => {
            const count = filterByMode(allItems, activeMode, opt.key).length
            return (
              <StripBtn key={opt.key}
                label={opt.label}
                active={activeSub === opt.key}
                disabled={count === 0}
                onClick={() => count > 0 && selectSub(opt.key)}
              >
                {opt.preview
                  ? <div style={{ width: 26, height: 26, borderRadius: '50%', background: opt.preview, border: '2px solid rgba(255,255,255,0.2)' }} />
                  : opt.icon
                    ? <ShopIcon name={opt.icon} size={26} />
                    : <span style={st.stripEmoji}>{opt.emoji}</span>
                }
              </StripBtn>
            )
          })}
        </div>

        <div style={st.modeStrip}>
          {SHOP_MODES.map(mode => (
            <StripBtn key={mode.key}
              label={mode.label}
              active={activeMode === mode.key}
              onClick={() => selectMode(mode.key)}
              activeBar
            >
              {mode.icon
                ? <ShopIcon name={mode.icon} size={26} />
                : <span style={st.stripEmoji}>{mode.emoji}</span>
              }
            </StripBtn>
          ))}
        </div>
      </div>
    )}
    </>
  )
}

// ── Instant hover tooltip strip button ─────────────────────────────────────
// Tooltip uses position:fixed so it escapes the strip's overflow clipping and
// always lands at the same horizontal offset to the left of the button.

function StripBtn({ label, active, disabled, onClick, activeBar, children }) {
  const t = useTheme()
  const btnRef = useRef(null)
  const [tipPos, setTipPos] = useState(null)
  const baseOpacity = disabled ? 0.3 : (active ? 1 : 0.78)

  function onEnter() {
    const r = btnRef.current?.getBoundingClientRect()
    if (r) setTipPos({ left: r.left - 12, top: r.top + r.height / 2 })
  }
  function onLeave() { setTipPos(null) }

  return (
    <button
      ref={btnRef}
      aria-label={label}
      style={{
        ...st.modeBtn,
        ...(active ? st.modeBtnActive : {}),
        opacity: baseOpacity,
        color: t.text,
        cursor: disabled ? 'default' : 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {activeBar && active && <div style={st.modeActiveBar} />}
      {children}
      {tipPos && (
        <div
          className="ddd-shop-tooltip"
          style={{
            position: 'fixed',
            left: tipPos.left, top: tipPos.top,
            transform: 'translate(-100%, -50%)',
            background: t.accent, color: t.accentText,
            fontFamily: "'Outfit', system-ui, sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: '0.3px',
            padding: '6px 13px', borderRadius: 999,
            whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 9999,
            boxShadow: `0 4px 16px ${t.accent}66, 0 0 0 1.5px ${t.accent}40`,
          }}
        >
          {label}
          <span style={{
            position: 'absolute', left: '100%', top: '50%',
            marginTop: -5, width: 0, height: 0,
            borderTop: '5px solid transparent',
            borderBottom: '5px solid transparent',
            borderLeft: `6px solid ${t.accent}`,
          }} />
        </div>
      )}
    </button>
  )
}

const st = {
  gridCol:  { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },

  subStrip: {
    flexShrink: 0, display: 'flex', flexDirection: 'column',
    borderLeft: '1px solid rgba(180,158,220,0.18)', overflowY: 'auto', overflowX: 'visible',
    background: 'rgba(0,0,0,0.10)', transition: 'width 0.2s ease',
  },
  subBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 4px', background: 'none', border: 'none', cursor: 'pointer',
    opacity: 0.5, transition: 'opacity 0.15s, background 0.15s', flexShrink: 0,
    borderBottom: '1px solid rgba(180,158,220,0.1)', width: '100%',
  },
  subBtnActive: { opacity: 1, background: 'rgba(154,122,238,0.15)' },

  modeStrip: {
    width: 52, flexShrink: 0, display: 'flex', flexDirection: 'column',
    borderLeft: '1px solid rgba(180,158,220,0.18)', overflowY: 'auto', overflowX: 'visible',
    background: 'rgba(0,0,0,0.18)',
  },
  modeBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 4px', background: 'none', border: 'none',
    position: 'relative', transition: 'opacity 0.15s', flexShrink: 0, width: '100%',
  },
  modeBtnActive: { opacity: 1, background: 'rgba(154,122,238,0.14)' },
  modeActiveBar: { position: 'absolute', left: 0, top: '20%', bottom: '20%', width: 2, borderRadius: 2, background: '#9a7aee' },
  stripEmoji:    { fontSize: 26, lineHeight: 1 },

  subTagRow:    { display: 'flex', flexWrap: 'wrap', gap: 4, padding: '6px 8px 2px', flexShrink: 0, borderBottom: '1px solid rgba(180,158,220,0.15)' },
  subTagChip:   { padding: '3px 8px', background: 'transparent', border: '1px solid rgba(180,158,220,0.3)', borderRadius: 12, cursor: 'pointer', fontSize: 10, color: '#c0b8e8' },
  subTagActive: { background: 'rgba(154,122,238,0.2)', borderColor: '#9a7aee', color: '#e0d9ff', fontWeight: 600 },
}
