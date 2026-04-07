import { useState, useMemo, useEffect } from 'react'
import { ITEM_CATALOGUE } from '../../data/items'
import {
  SHOP_MODES, OBJECT_BUCKETS, ROOM_BUCKETS, VIBE_BUCKETS, COLOR_BUCKETS, FUNCTION_BUCKETS,
  CATEGORY_META, SUBCATEGORY_META, MAX_PRICE, initFilters, toggle, matchesFilters, matchesSearch,
} from './shopData'
import { useShopStyles } from './shopStyles'
import ProductCard from './ProductCard'
import FilterPanel from './FilterPanel'

function applySort(items, sort) {
  if (sort === 'price_asc')  return [...items].sort((a, b) => (a[1].price ?? 0) - (b[1].price ?? 0))
  if (sort === 'price_desc') return [...items].sort((a, b) => (b[1].price ?? 0) - (a[1].price ?? 0))
  if (sort === 'rating')     return [...items].sort((a, b) => (b[1].rating ?? 0) - (a[1].rating ?? 0))
  return items
}

function SubcatGrid({ items: srcItems, onSelect }) {
  const s = useShopStyles()
  const subcats = [...new Set(srcItems.map(([, def]) => def.subcategory).filter(Boolean))]
  return (
    <div style={s.subcatGrid}>
      {subcats.map(sub => {
        const count = srcItems.filter(([, def]) => def.subcategory === sub).length
        const meta  = SUBCATEGORY_META[sub] ?? { emoji: '📦' }
        return (
          <div key={sub} style={s.subcatCard} onClick={() => onSelect(sub)}>
            <span style={s.subcatEmoji}>{meta.emoji}</span>
            <span style={s.subcatCardName}>{sub}</span>
            <span style={s.subcatCardCount}>{count}</span>
          </div>
        )
      })}
    </div>
  )
}

function ItemList({ items: srcItems, onPlace, onOpenModal, gridW, gridD, colorFamilies }) {
  const s = useShopStyles()
  return (
    <div style={s.catItemList}>
      {srcItems.length === 0
        ? <p style={s.emptyMsg}>No items match your filters.</p>
        : srcItems.map(([key, def]) => (
            <ProductCard key={key} typeKey={key} def={def} onPlace={onPlace} onOpenModal={onOpenModal} gridW={gridW} gridD={gridD} colorFamilies={colorFamilies} />
          ))
      }
    </div>
  )
}

export default function BrowseTab({ onPlace, onOpenModal, gridW, gridD, roomItemKeys }) {
  const s = useShopStyles()
  // Navigation state
  const [shopMode,       setShopMode]       = useState(null)
  const [modeFilter,     setModeFilter]     = useState(null)
  const [selectedCat,    setSelectedCat]    = useState(null)
  const [selectedSubcat, setSelectedSubcat] = useState(null)

  useEffect(() => { setModeFilter(null); setSelectedCat(null); setSelectedSubcat(null) }, [shopMode])
  useEffect(() => { setSelectedCat(null); setSelectedSubcat(null) }, [modeFilter])
  useEffect(() => { setSelectedSubcat(null) }, [selectedCat])

  // Filter + search state
  const [filters,     setFilters]     = useState(initFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search,      setSearch]      = useState('')
  const [searchScope, setSearchScope] = useState('context')
  const [sort,        setSort]        = useState('featured')
  const [recentKeys,  setRecentKeys]  = useState(
    () => JSON.parse(localStorage.getItem('ddd_recent_viewed') || '[]')
  )

  function trackAndOpen(typeKey) {
    setRecentKeys(prev => {
      const next = [typeKey, ...prev.filter(k => k !== typeKey)].slice(0, 8)
      localStorage.setItem('ddd_recent_viewed', JSON.stringify(next))
      return next
    })
    onOpenModal(typeKey)
  }

  const setFilter   = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const toggleMulti = (key, val) => setFilters(f => ({ ...f, [key]: toggle(f[key], val) }))
  const hasActiveFilters = filters.priceMax < MAX_PRICE || filters.styles.length > 0 || filters.rooms.length > 0 || filters.themes.length > 0 || filters.colorFamilies.length > 0 || filters.types.length > 0

  const searchTerm = search.trim().toLowerCase()

  const allFiltered = useMemo(() =>
    Object.entries(ITEM_CATALOGUE).filter(([, def]) =>
      !def.door && !def.isStairs && matchesFilters(def, filters) && matchesSearch(def, searchTerm)
    ),
    [filters, searchTerm] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const contextItems = useMemo(() => {
    if (!shopMode || !modeFilter) return allFiltered
    let items = allFiltered
    switch (shopMode) {
      case 'object': {
        const cats = OBJECT_BUCKETS[modeFilter]?.categories ?? []
        items = items.filter(([, def]) => cats.includes(def.category))
        if (selectedCat)    items = items.filter(([, def]) => def.category    === selectedCat)
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      }
      case 'room':
        items = items.filter(([, def]) => (def.rooms ?? []).includes(modeFilter))
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      case 'vibe':
        items = items.filter(([, def]) => (def.themes ?? []).includes(modeFilter))
        break
      case 'color': {
        const families = COLOR_BUCKETS.find(b => b.key === modeFilter)?.families ?? []
        items = items.filter(([, def]) => (def.swatches ?? []).some(sw => families.includes(sw.family)))
        break
      }
      case 'function': {
        const fn = FUNCTION_BUCKETS.find(b => b.key === modeFilter)
        if (fn) items = items.filter(([, def]) => fn.match(def))
        if (selectedSubcat) items = items.filter(([, def]) => def.subcategory === selectedSubcat)
        break
      }
    }
    return items
  }, [shopMode, modeFilter, selectedCat, selectedSubcat, allFiltered])

  const searchResults = searchScope === 'context' ? contextItems : allFiltered

  const depth = !shopMode ? 0
    : !modeFilter ? 1
    : shopMode === 'object' && !selectedCat ? 2
    : shopMode === 'object' && !selectedSubcat ? 3
    : shopMode === 'object' ? 4
    : (shopMode === 'room' || shopMode === 'function') && !selectedSubcat ? 2
    : shopMode === 'room' || shopMode === 'function' ? 3
    : 2

  const panelTransform = idx => `translateX(${(idx - depth) * 100}%)`

  const goBack = () => {
    if (selectedSubcat) { setSelectedSubcat(null); return }
    if (selectedCat)    { setSelectedCat(null);    return }
    if (modeFilter)     { setModeFilter(null);      return }
    setShopMode(null)
  }

  const contextLabel = selectedSubcat ?? selectedCat ?? modeFilter ?? (shopMode ? SHOP_MODES.find(m => m.key === shopMode)?.label : null)

  const activeFamilies = shopMode === 'color' && modeFilter
    ? COLOR_BUCKETS.find(b => b.key === modeFilter)?.families ?? null
    : null

  const itemListProps = { onPlace, onOpenModal: trackAndOpen, gridW, gridD, colorFamilies: activeFamilies, roomItemKeys }

  return (<>
    {/* Search bar */}
    <div style={s.searchBar}>
      {depth > 0 && <button style={s.searchBackBtn} onClick={goBack} title="Go back">←</button>}
      <input type="text"
        placeholder={contextLabel ? `Search in ${contextLabel}…` : 'Search all items…'}
        value={search} onChange={e => setSearch(e.target.value)} style={s.searchInput}
      />
      {search && <button style={s.searchClear} onClick={() => setSearch('')}>✕</button>}
    </div>

    {/* Search scope toggle */}
    {searchTerm && contextLabel && (
      <div style={s.scopeRow}>
        <span style={s.scopeLabel}>Search:</span>
        <button style={{ ...s.scopeBtn, ...(searchScope === 'context' ? s.scopeBtnActive : {}) }} onClick={() => setSearchScope('context')}>in {contextLabel}</button>
        <button style={{ ...s.scopeBtn, ...(searchScope === 'all'     ? s.scopeBtnActive : {}) }} onClick={() => setSearchScope('all')}>All items</button>
      </div>
    )}

    {/* Filters (hidden while searching) */}
    {!searchTerm && (
      <FilterPanel filters={filters} filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
        hasActiveFilters={hasActiveFilters} setFilter={setFilter} toggleMulti={toggleMulti} setFilters={setFilters} />
    )}

    {/* Sort row — visible when browsing a category or searching */}
    {(shopMode !== null || searchTerm) && (
      <div style={s.sortRow}>
        {[['featured','Featured'],['price_asc','Price ↑'],['price_desc','Price ↓'],['rating','Top rated']].map(([val, lbl]) => (
          <button key={val} style={{ ...s.sortBtn, ...(sort === val ? s.sortBtnActive : {}) }} onClick={() => setSort(val)}>{lbl}</button>
        ))}
      </div>
    )}

    {/* Flat search results */}
    {searchTerm ? (
      <div style={s.list}>
        {searchResults.length === 0
          ? <p style={s.emptyMsg}>No results for "{search}"</p>
          : applySort(searchResults, sort).map(([key, def]) => <ProductCard key={key} typeKey={key} def={def} {...itemListProps} colorFamilies={activeFamilies} />)
        }
      </div>

    ) : (
      /* 5-panel slide navigation */
      <div style={s.slideContainer}>

        {/* P0: Mode selection (home) */}
        <div style={{ ...s.slidePanel, transform: panelTransform(0) }}>
          {recentKeys.length > 0 && (
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
          <div style={s.modeList}>
            {SHOP_MODES.map(mode => (
              <div key={mode.key} style={{ ...s.modeCard, borderLeftColor: mode.accent }}
                onClick={() => setShopMode(mode.key)}
              >
                <span style={s.modeEmoji}>{mode.emoji}</span>
                <div style={s.modeText}>
                  <span style={s.modeLabel}>{mode.label}</span>
                  <span style={s.modeTagline}>{mode.tagline}</span>
                </div>
                <span style={s.modeArrow}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* P1: Mode sub-options */}
        <div style={{ ...s.slidePanel, transform: panelTransform(1) }}>
          <div style={s.panelHeader}>
            <button style={s.backBtn} onClick={() => setShopMode(null)}>← Back</button>
            <span style={s.panelTitle}>{SHOP_MODES.find(m => m.key === shopMode)?.label ?? ''}</span>
          </div>
          <div style={s.p1Content}>
            {shopMode === 'object' && Object.entries(OBJECT_BUCKETS).map(([name, meta]) => {
              const count = allFiltered.filter(([, def]) => meta.categories.includes(def.category)).length
              return (
                <div key={name} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(name)}>
                  <span style={s.catEmoji}>{meta.emoji}</span>
                  <span style={s.catCardName}>{name}</span>
                  <span style={s.catCardTagline}>{meta.tagline}</span>
                  <span style={s.catCardCount}>{count}</span>
                </div>
              )
            })}
            {shopMode === 'room' && ROOM_BUCKETS.map(rb => {
              const count = allFiltered.filter(([, def]) => (def.rooms ?? []).includes(rb.key)).length
              return (
                <div key={rb.key} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(rb.key)}>
                  <span style={s.catEmoji}>{rb.emoji}</span>
                  <span style={s.catCardName}>{rb.key}</span>
                  <span style={s.catCardTagline}>{rb.tagline}</span>
                  <span style={s.catCardCount}>{count}</span>
                </div>
              )
            })}
            {shopMode === 'function' && FUNCTION_BUCKETS.map(fb => {
              const count = allFiltered.filter(([, def]) => fb.match(def)).length
              return (
                <div key={fb.key} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(fb.key)}>
                  <span style={s.catEmoji}>{fb.emoji}</span>
                  <span style={s.catCardName}>{fb.key}</span>
                  <span style={s.catCardTagline}>{fb.tagline}</span>
                  <span style={s.catCardCount}>{count}</span>
                </div>
              )
            })}
          </div>
          {shopMode === 'vibe' && (
            <div style={s.vibeGrid}>
              {VIBE_BUCKETS.map(vb => {
                const count = allFiltered.filter(([, def]) => (def.themes ?? []).includes(vb.key)).length
                return (
                  <div key={vb.key} style={{ ...s.vibeCard, background: vb.bg, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(vb.key)}>
                    <span style={s.vibeEmoji}>{vb.emoji}</span>
                    <span style={s.vibeName}>{vb.key}</span>
                    <span style={s.vibeCount}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}
          {shopMode === 'color' && (
            <div style={s.colorGrid}>
              {COLOR_BUCKETS.map(cb => {
                const count = allFiltered.filter(([, def]) => (def.swatches ?? []).some(sw => cb.families.includes(sw.family))).length
                return (
                  <div key={cb.key} style={{ ...s.colorCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setModeFilter(cb.key)}>
                    <div style={{ ...s.colorSwatch, background: cb.preview }} />
                    <span style={s.colorName}>{cb.key}</span>
                    <span style={s.colorCount}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* P2: Category cards (Object) / Subcats (Room, Function) / Items (Vibe, Color) */}
        <div style={{ ...s.slidePanel, transform: panelTransform(2) }}>
          <div style={s.panelHeader}>
            <button style={s.backBtn} onClick={() => setModeFilter(null)}>← Back</button>
            <span style={s.panelTitle}>{modeFilter ?? ''}</span>
          </div>
          {shopMode === 'object' && modeFilter && (
            <div style={s.catGrid}>
              {(OBJECT_BUCKETS[modeFilter]?.categories ?? []).map(cat => {
                const count = contextItems.filter(([, def]) => def.category === cat).length
                const meta  = CATEGORY_META[cat] ?? { emoji: '📦', tagline: '' }
                return (
                  <div key={cat} style={{ ...s.catCard, ...(count === 0 ? s.catCardEmpty : {}) }} onClick={() => count > 0 && setSelectedCat(cat)}>
                    <span style={s.catEmoji}>{meta.emoji}</span>
                    <span style={s.catCardName}>{cat}</span>
                    <span style={s.catCardTagline}>{meta.tagline}</span>
                    <span style={s.catCardCount}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}
          {(shopMode === 'room' || shopMode === 'function') && modeFilter && <SubcatGrid items={contextItems} onSelect={setSelectedSubcat} />}
          {(shopMode === 'vibe' || shopMode === 'color') && modeFilter && <ItemList items={applySort(contextItems, sort)} {...itemListProps} />}
        </div>

        {/* P3: Subcats (Object) / Items (Room, Function) */}
        <div style={{ ...s.slidePanel, transform: panelTransform(3) }}>
          <div style={s.panelHeader}>
            <button style={s.backBtn} onClick={() => shopMode === 'object' ? setSelectedCat(null) : setSelectedSubcat(null)}>← Back</button>
            <span style={s.panelTitle}>{shopMode === 'object' ? (selectedCat ?? '') : (selectedSubcat ?? '')}</span>
          </div>
          {shopMode === 'object' && selectedCat && <SubcatGrid items={contextItems} onSelect={setSelectedSubcat} />}
          {(shopMode === 'room' || shopMode === 'function') && <ItemList items={applySort(contextItems, sort)} {...itemListProps} />}
        </div>

        {/* P4: Items (Object final) */}
        <div style={{ ...s.slidePanel, transform: panelTransform(4) }}>
          <div style={s.panelHeader}>
            <button style={s.backBtn} onClick={() => setSelectedSubcat(null)}>← Back</button>
            <span style={s.panelTitle}>{selectedSubcat ?? ''}</span>
          </div>
          {shopMode === 'object' && <ItemList items={applySort(contextItems, sort)} {...itemListProps} />}
        </div>

      </div>
    )}
  </>)
}
