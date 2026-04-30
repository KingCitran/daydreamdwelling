import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Music, Eye, ClipboardList, Hammer, Package, Users } from 'lucide-react'

// Side tab strip + dockable panels. State lives here so each panel can ask
// "am I open?", "am I docked or floating?", "where am I floating?" without
// each one re-implementing localStorage and tab order.
//
// Tabs (in default order, with a visual gap after music):
//   music · — · build · place · style · plan · view · social
//
// Per-panel state machine:
//   closed   ← initial
//   docked   ← attached to the right of its tab (default open state)
//   floating ← free-positioned via drag

const STORAGE_KEY = 'ddd_sidetab_v1'

const DEFAULT_TAB_ORDER = ['music', '__gap__', 'view', 'plan', 'build', 'place', 'social']

const TAB_DEFS = {
  music:  { label: 'Music',  Icon: Music,         accent: '#b8a0ff' },
  view:   { label: 'View',   Icon: Eye,           accent: '#c8a8ff' },
  plan:   { label: 'Plan',   Icon: ClipboardList, accent: '#7ac8e0' },
  build:  { label: 'Build',  Icon: Hammer,        accent: '#88d8b0' },
  place:  { label: 'Place',  Icon: Package,       accent: '#f0a8d8' },
  social: { label: 'Social', Icon: Users,         accent: '#ff9ab8' },
}

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function persist(partial) {
  try {
    const prev = loadStored() ?? {}
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prev, ...partial }))
  } catch {}
}

function defaultPanelState() {
  return { open: false, docked: true, position: null }
}

const SideTabContext = createContext(null)

// Module-level dispatchers so components rendered outside the provider's
// hook scope (currently: the legacy bottom bar in App.jsx) can still drive
// panel state. The provider wires these on mount.
let _externalToggle = () => {}
let _externalOpen = () => {}
export function dispatchTogglePanel(id) { _externalToggle(id) }
export function dispatchOpenPanel(id) { _externalOpen(id) }

export function SideTabProvider({ children }) {
  const stored = loadStored()
  // Tab order is locked to DEFAULT_TAB_ORDER for now — drag-to-reorder isn't
  // built yet, so persisting stale orders just fights schema changes (e.g.,
  // when we drop tabs like Style or rearrange). Restore persistence here once
  // user-driven reordering lands.
  const [tabOrder, setTabOrder] = useState(() => DEFAULT_TAB_ORDER)
  const [panelStates, setPanelStates] = useState(() => {
    // Always start panels closed on mount — don't auto-restore floating panels
    // so the canvas is clean on load. Position memory is preserved separately.
    const out = {}
    Object.keys(TAB_DEFS).forEach(id => {
      out[id] = { ...defaultPanelState(), position: stored?.positions?.[id] ?? null }
    })
    return out
  })

  useEffect(() => { persist({ tabOrder }) }, [tabOrder])
  useEffect(() => {
    const positions = {}
    Object.entries(panelStates).forEach(([id, st]) => {
      if (st.position) positions[id] = st.position
    })
    persist({ positions })
  }, [panelStates])

  const openPanel = useCallback((id) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], open: true } }))
  }, [])

  const closePanel = useCallback((id) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], open: false } }))
  }, [])

  const togglePanel = useCallback((id) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], open: !s[id].open } }))
  }, [])

  // Wire the module-level dispatchers
  useEffect(() => {
    _externalToggle = togglePanel
    _externalOpen = openPanel
    return () => {
      _externalToggle = () => {}
      _externalOpen = () => {}
    }
  }, [togglePanel, openPanel])

  const floatPanel = useCallback((id, position) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], docked: false, position, open: true } }))
  }, [])

  const dockPanel = useCallback((id) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], docked: true } }))
  }, [])

  const setPanelPosition = useCallback((id, position) => {
    setPanelStates(s => ({ ...s, [id]: { ...s[id], position } }))
  }, [])

  const value = {
    tabOrder, setTabOrder,
    panelStates, tabDefs: TAB_DEFS,
    openPanel, closePanel, togglePanel, floatPanel, dockPanel, setPanelPosition,
  }

  return <SideTabContext.Provider value={value}>{children}</SideTabContext.Provider>
}

export function useSideTab() {
  const ctx = useContext(SideTabContext)
  if (!ctx) throw new Error('useSideTab must be used inside SideTabProvider')
  return ctx
}

// Helper: return panel anchor coords for the tab with this id, in viewport
// pixels. Used by panels to compute their docked/floating position.
export function getTabAnchor(tabId) {
  const el = document.querySelector(`[data-tab-id="${tabId}"]`)
  if (!el) return { x: 80, y: 100 }
  const rect = el.getBoundingClientRect()
  return { x: rect.right + 8, y: rect.top }
}
