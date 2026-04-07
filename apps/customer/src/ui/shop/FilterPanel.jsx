import { useState } from 'react'
import { ALL_STYLES, ALL_ROOMS, ALL_THEMES, ALL_COLOR_FAMILIES } from '../../data/items'
import { MAX_PRICE, ALL_TYPES } from './shopData'
import { useShopStyles } from './shopStyles'

const CHIP_PREVIEW = 4

function SearchableChipGroup({ label, allValues, active, onToggle }) {
  const s = useShopStyles()
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState(false)

  const filtered = q ? allValues.filter(v => v.toLowerCase().includes(q.toLowerCase())) : allValues
  const sorted   = [...filtered.filter(v => active.includes(v)), ...filtered.filter(v => !active.includes(v))]
  const showAll  = expanded || !!q
  const visible  = showAll ? sorted : sorted.slice(0, CHIP_PREVIEW)
  const hiddenCount = sorted.length - CHIP_PREVIEW

  return (
    <>
      <div style={s.filterGroupHeader}>
        <p style={s.filterLabel}>
          {label}
          {active.length > 0 && <span style={s.filterActiveCount}> ·{active.length}</span>}
        </p>
        <input style={s.filterGroupSearch} placeholder="search…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={{ ...s.chipRow, ...(showAll ? s.chipRowScroll : {}) }}>
        {visible.map(v => (
          <button key={v} style={{ ...s.chip, ...(active.includes(v) ? s.chipActive : {}) }} onClick={() => onToggle(v)}>{v}</button>
        ))}
        {filtered.length === 0 && <span style={s.filterNoResults}>No matches</span>}
      </div>
      {!q && hiddenCount > 0 && (
        <button style={s.showMoreBtn} onClick={() => setExpanded(v => !v)}>
          {expanded ? '▲ show less' : `▼ ${hiddenCount} more…`}
        </button>
      )}
    </>
  )
}

export default function FilterPanel({ filters, filtersOpen, setFiltersOpen, hasActiveFilters, setFilter, toggleMulti, setFilters }) {
  const s = useShopStyles()
  return (
    <div style={s.filterSection}>
      <button style={s.filterToggle} onClick={() => setFiltersOpen(v => !v)}>
        <span>Filters{hasActiveFilters && <span style={s.filterDot} />}</span>
        <span style={s.filterChevron}>{filtersOpen ? '▲' : '▼'}</span>
      </button>
      {filtersOpen && (
        <div style={s.filterBody}>
          <p style={s.filterLabel}>Max Price: <span style={s.filterValue}>{filters.priceMax >= MAX_PRICE ? 'Any' : `$${filters.priceMax}`}</span></p>
          <input type="range" min={0} max={MAX_PRICE} step={50} value={filters.priceMax} onChange={e => setFilter('priceMax', Number(e.target.value))} style={s.slider} />
          <SearchableChipGroup label="Type"         allValues={ALL_TYPES}          active={filters.types}         onToggle={v => toggleMulti('types', v)} />
          <SearchableChipGroup label="Room"         allValues={ALL_ROOMS}          active={filters.rooms}         onToggle={v => toggleMulti('rooms', v)} />
          <SearchableChipGroup label="Style"        allValues={ALL_STYLES}         active={filters.styles}        onToggle={v => toggleMulti('styles', v)} />
          <SearchableChipGroup label="Vibe"         allValues={ALL_THEMES}         active={filters.themes}        onToggle={v => toggleMulti('themes', v)} />
          <SearchableChipGroup label="Color Family" allValues={ALL_COLOR_FAMILIES} active={filters.colorFamilies} onToggle={v => toggleMulti('colorFamilies', v)} />
          {hasActiveFilters && <button style={s.clearBtn} onClick={() => setFilters({ priceMax: MAX_PRICE, styles: [], rooms: [], themes: [], colorFamilies: [], types: [] })}>Clear all filters</button>}
        </div>
      )}
    </div>
  )
}
