import { memo } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useSideTab } from '../contexts/SideTabContext'

// Vertical strip of tabs pinned to the left edge. Click a tab to open its
// panel (default state: docked attached to the right of the tab). Click again
// to close. When a panel is currently floating (undocked), the tab dims as a
// visual indicator of where the panel "belongs."
//
// Drag-to-reorder + auto-snap-on-drag-near come in M8 step v2.

// Side strip starts just below the brand logo cluster so Music (the first
// tab in the strip on the builder) sits tight under the logo.
const STRIP_TOP = 76
const TAB_SIZE = 52
const GAP_HEIGHT = 18

// Memoized — strip takes no props, so re-renders only when its context
// (tab order / panel open state) changes. Skips re-render when AppInner
// re-renders for unrelated state (item moves, etc.).
function SideTabStripImpl() {
  const t = useTheme()
  const { tabOrder, panelStates, tabDefs, togglePanel } = useSideTab()

  return (
    <>
      <style>{`
        /* Strip text isn't subject to the Ember overlay */
        .ddd-side-tab,
        .ddd-side-tab * {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        /* Snap-target indicator. Class is toggled directly on the tab DOM
           element by DockablePanel during drag — no React re-renders. */
        @keyframes ddd-tab-snap-pulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 0 0 rgba(255,255,255,0.0); }
          50%      { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(255,255,255,0.22); }
        }
        .ddd-side-tab.snap-target {
          outline: 2px solid #ffffff;
          outline-offset: 2px;
          animation: ddd-tab-snap-pulse 0.9s ease-in-out infinite;
        }
      `}</style>
      <style>{`
        /* Mobile handled by MobileChrome — SideTabStrip hidden via App.jsx */
      `}</style>
      <aside className="ddd-side-strip" style={{
        position: 'fixed', top: STRIP_TOP, left: 12, zIndex: 90,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {tabOrder.map((id, i) => {
          if (id === '__gap__') return <div key={`gap-${i}`} style={{ height: GAP_HEIGHT }} />
          const def = tabDefs[id]
          if (!def) return null
          const state = panelStates[id]
          const isOpen = state?.open
          const isFloating = isOpen && !state?.docked
          const Icon = def.Icon
          return (
            <button
              key={id}
              data-tab-id={id}
              className="ddd-side-tab"
              onClick={() => togglePanel(id)}
              title={def.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px 10px 12px',
                minHeight: TAB_SIZE,
                borderRadius: 14,
                border: `1px solid ${isOpen ? def.accent : `${def.accent}33`}`,
                background: isOpen ? `${def.accent}28` : 'rgba(15,12,30,0.45)',
                color: isFloating ? `${def.accent}80` : '#f0eaff',
                cursor: 'pointer',
                fontSize: 14, fontWeight: 700,
                fontFamily: "'Outfit', system-ui, sans-serif",
                letterSpacing: '0.3px',
                backdropFilter: 'blur(10px)',
                opacity: isFloating ? 0.55 : 1,
                transition: 'opacity 0.18s ease, background 0.18s ease',
              }}
            >
              <span className="ddd-side-tab-icon" style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: def.accent, color: '#1a0f30',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {Icon && <Icon size={16} strokeWidth={2.2} />}
              </span>
              <span className="ddd-side-tab-label">{def.label}</span>
            </button>
          )
        })}
      </aside>
    </>
  )
}

const SideTabStrip = memo(SideTabStripImpl)
export default SideTabStrip
