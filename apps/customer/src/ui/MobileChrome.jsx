// BuilderChrome — unified responsive builder chrome from Claude Design spec.
// Replaces SideTabStrip + TopRightCluster + BottomTabCluster across all sizes.
// Three breakpoints:
//   Mobile  (≤768):  TopBar 48px + ToolDock 54px bottom bar (4 tabs)
//   Tablet  (769-1199): TopBar 60px + left rail 64px (icon-only)
//   Desktop (≥1200): TopBar 64px + left rail 192px (icons + labels)
//
// All components use the theme token system via useTheme() + ui() mapping.

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import { Icon } from '@shared/ui/Icon'
import { Package, Hammer, Palette, MoreHorizontal, ShoppingCart, Home, Undo2, Redo2, Trash2, Heart, SlidersHorizontal, RotateCw, Camera, Share2, User, Music, Eye, ClipboardList, Users } from 'lucide-react'

function useMode() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => { const c = () => setW(window.innerWidth); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c) }, [])
  if (w <= 768) return 'mobile'
  if (w <= 1199) return 'tablet'
  return 'desktop'
}

function useIsMobile(bp = 768) {
  const mode = useMode()
  return mode === 'mobile'
}

const TOOLS = {
  place:  { label: 'Place',  Icon: Package,       tint: '#e87fc8' },
  build:  { label: 'Build',  Icon: Hammer,        tint: '#3fb88a' },
  style:  { label: 'Style',  Icon: Palette,       tint: '#9b7ae0' },
  music:  { label: 'Music',  Icon: Music,         tint: '#8a78e0' },
  plan:   { label: 'Plan',   Icon: ClipboardList, tint: '#5bb0c8' },
  social: { label: 'Social', Icon: Users,         tint: '#e87fa0' },
  more:   { label: 'More',   Icon: MoreHorizontal,tint: '#8a78e0' },
}

const MOBILE_TOOLS  = ['place', 'build', 'style', 'more']
const TABLET_TOOLS  = ['place', 'build', 'style', 'music', 'more']
const DESKTOP_TOOLS = ['place', 'build', 'style', 'music', 'plan', 'social', 'more']

// Derive chrome tokens from theme (matches Claude Design's ui() function)
function ui(t) {
  const dark = !!(t.bg && t.bg.match && t.bg.match(/^#[0-3]/))
  return {
    panel: dark ? 'rgba(20,23,42,0.97)' : 'rgba(255,255,255,0.97)',
    card: dark ? 'rgba(255,255,255,0.05)' : 'rgba(120,100,170,0.06)',
    line: dark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,90,0.10)',
    border: t.surfaceBorder,
    text: t.text, soft: t.textSoft, accent: t.accent, accentText: t.accentText,
    nav: t.navBg, dark,
  }
}

// ── Top Bar ────────────────────────────────────────────────────────
export function BuilderTopBar({ roomName, budget, itemCount, cartCount, onUndo, onRedo, onCart, onScreenshot, onShare, onAccount }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const heights = { mobile: 48, tablet: 56, desktop: 60 }
  const h = heights[mode]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: h,
      zIndex: 80, display: 'flex', alignItems: 'center', gap: mode === 'mobile' ? 8 : 12,
      padding: mode === 'mobile' ? 'max(env(safe-area-inset-top), 4px) 10px 0' : '0 16px',
      background: u.nav, borderBottom: `1px solid ${u.line}`,
      fontFamily: "'Outfit',system-ui,sans-serif", color: u.text,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Logo size={mode === 'mobile' ? 26 : 32} color={u.accent} />
        {mode === 'desktop' && (
          <span style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 21, fontWeight: 500 }}>
            Daydream<span style={{ color: u.accent, fontStyle: 'italic' }}>Dwelling</span>
          </span>
        )}
      </div>

      {/* Room + budget */}
      <div style={{ display: 'flex', alignItems: 'center', gap: mode === 'mobile' ? 6 : 9, flex: mode === 'mobile' ? 1 : undefined, justifyContent: mode === 'mobile' ? 'center' : undefined, minWidth: 0 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: mode === 'mobile' ? '5px 10px' : '8px 13px',
          borderRadius: 12, border: `1px solid ${u.line}`,
          background: u.card, color: u.text, cursor: 'pointer',
          fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          overflow: 'hidden', maxWidth: mode === 'mobile' ? 130 : 200,
        }}>
          <Home size={15} style={{ flexShrink: 0, color: u.soft }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomName || 'My Room'}</span>
        </button>
        <button style={{
          display: 'flex', alignItems: 'center', gap: mode === 'mobile' ? 5 : 7, padding: mode === 'mobile' ? '5px 9px' : '8px 12px',
          borderRadius: 12, border: `1px solid ${u.line}`,
          background: u.card, fontSize: mode === 'mobile' ? 13 : 14, fontWeight: 800, color: u.text,
          cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb88a', flexShrink: 0 }} />
          ${(budget || 0).toLocaleString()}
          {mode !== 'mobile' && <span style={{ fontSize: 11.5, color: u.soft, fontWeight: 600 }}>· {itemCount || 0} item{itemCount === 1 ? '' : 's'}</span>}
        </button>
      </div>

      {mode !== 'mobile' && <div style={{ flex: 1 }} />}

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <IconButton icon={Undo2} onClick={onUndo} label="Undo" u={u} />
        {mode !== 'mobile' && <IconButton icon={Redo2} onClick={onRedo} label="Redo" u={u} />}
        {mode !== 'mobile' && <div style={{ width: 1, height: 26, background: u.line, margin: '0 2px' }} />}
        {mode !== 'mobile' && <IconButton icon={Camera} onClick={onScreenshot} label="Screenshot" u={u} />}
        {mode !== 'mobile' && <IconButton icon={Share2} onClick={onShare} label="Share" u={u} />}
        <IconButton icon={ShoppingCart} onClick={onCart} label="Cart" badge={cartCount} u={u} />
        {mode !== 'mobile' && <IconButton icon={User} onClick={onAccount} label="Account" u={u} />}
      </div>
    </header>
  )
}

// ── Tool Dock (bottom bar) ─────────────────────────────────────────
export function BuilderToolDock({ active, onPick }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const toolIds = mode === 'mobile' ? MOBILE_TOOLS : mode === 'tablet' ? TABLET_TOOLS : DESKTOP_TOOLS
  const topH = { mobile: 48, tablet: 56, desktop: 60 }[mode]

  // Mobile: bottom bar
  if (mode === 'mobile') {
    return (
      <nav style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: 54,
        zIndex: 70, display: 'flex', alignItems: 'stretch',
        padding: '4px 8px', paddingBottom: 'max(4px, env(safe-area-inset-bottom))',
        background: u.nav, borderTop: `1px solid ${u.line}`,
        fontFamily: "'Outfit',sans-serif",
      }}>
        {toolIds.map(id => {
          const tool = TOOLS[id]
          const on = active === id
          const ToolIcon = tool.Icon
          return (
            <button key={id} onClick={() => onPick(on ? null : id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 2, border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', minWidth: 0, padding: 0,
            }}>
              <span style={{
                width: 44, height: 30, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? tool.tint : 'transparent',
                color: on ? '#fff' : u.soft,
                transition: 'all .15s',
              }}>
                <ToolIcon size={20} strokeWidth={on ? 2.1 : 1.9} />
              </span>
              <span style={{ fontSize: 10, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft }}>
                {tool.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  // Tablet/Desktop: vertical left rail
  const railW = mode === 'desktop' ? 192 : 64
  const wide = mode === 'desktop'

  return (
    <nav style={{
      position: 'fixed', top: topH + 12, bottom: 12, left: 12, width: railW,
      zIndex: 70, display: 'flex', flexDirection: 'column', gap: 6, padding: 8,
      background: u.nav, border: `1px solid ${u.border}`,
      borderRadius: 20, fontFamily: "'Outfit',sans-serif",
      boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
    }}>
      {toolIds.map(id => {
        const tool = TOOLS[id]
        const on = active === id
        const ToolIcon = tool.Icon
        return (
          <button key={id} onClick={() => onPick(on ? null : id)} title={tool.label} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: wide ? '10px 12px' : 0,
            justifyContent: wide ? 'flex-start' : 'center',
            height: wide ? 'auto' : 50,
            borderRadius: 14,
            border: `1px solid ${on ? tool.tint + '88' : 'transparent'}`,
            background: on ? tool.tint + '1e' : 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', color: u.text,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? tool.tint : u.card,
              color: on ? '#fff' : u.soft,
              transition: 'all .15s',
            }}>
              <ToolIcon size={20} />
            </span>
            {wide && <span style={{ fontSize: 14, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft }}>{tool.label}</span>}
          </button>
        )
      })}
    </nav>
  )
}

// ViewControls removed — swipe rotate + pinch zoom handles everything on mobile

// ── Action Pill (selected item) ────────────────────────────────────
export function BuilderActionPill({ item, catalogue, onRotate, onDetails, onDelete, onWishlist, isWishlisted }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  if (!item) return null
  const bottom = mode === 'mobile' ? 62 : 22

  const def = catalogue?.[item.typeKey]
  if (!def) return null
  const price = def.sizes?.[item.sizeIndex]?.price ?? def.price ?? 0

  const aBtn = (icon, label, onClick, tint) => (
    <button onClick={onClick} title={label} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '6px 12px', borderRadius: 12, border: 'none',
      background: 'transparent', cursor: 'pointer',
      color: tint || u.text, fontFamily: 'inherit', minWidth: 52,
    }}>
      {icon}
      <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
    </button>
  )

  return (
    <div style={{
      position: 'fixed', bottom, left: '50%', transform: 'translateX(-50%)',
      zIndex: 75, display: 'flex', alignItems: 'center', gap: 2, padding: 6,
      background: u.panel,
      border: `1px solid ${u.border}`, borderRadius: 18,
      boxShadow: '0 12px 34px rgba(0,0,0,0.30)',
      fontFamily: "'Outfit',sans-serif",
      maxWidth: 'calc(100% - 24px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 12px 4px 10px', minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {def.label}
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: u.accent }}>
          ${price.toLocaleString()}
        </span>
      </div>
      <div style={{ width: 1, height: 34, background: u.line, flexShrink: 0 }} />
      {aBtn(<RotateCw size={20} />, 'Rotate', onRotate)}
      {aBtn(<SlidersHorizontal size={20} />, 'Edit', onDetails)}
      {aBtn(<Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />, isWishlisted ? 'Saved' : 'Save', onWishlist, isWishlisted ? '#ff9ab8' : u.text)}
      {aBtn(<Trash2 size={20} />, 'Delete', onDelete, '#e8736f')}
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────────
function IconButton({ icon: LucideIcon, onClick, label, badge, u }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 36, height: 36, borderRadius: 12, flexShrink: 0, position: 'relative',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${u.line}`, background: u.card, color: u.text,
    }}>
      <LucideIcon size={18} />
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17,
          padding: '0 4px', borderRadius: 9, background: u.accent, color: u.accentText,
          fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${u.nav}`,
        }}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  )
}

// ── Sheet (panel window) ───────────────────────────────────────────
// Bottom sheet on mobile, side panel on tablet/desktop.
export function BuilderSheet({ title, accentDot, onClose, children, footer, height }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const isBottom = mode === 'mobile'

  const topH = { mobile: 48, tablet: 56, desktop: 60 }[mode]
  const railW = mode === 'desktop' ? 192 : mode === 'tablet' ? 64 : 0

  const wrap = isBottom ? {
    position: 'fixed', left: 0, right: 0, bottom: 54, zIndex: 60,
    maxHeight: height || '70%', borderRadius: '22px 22px 0 0',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
  } : {
    position: 'fixed', top: topH + 12, bottom: 12, left: 12 + railW + 12,
    width: mode === 'desktop' ? 384 : 340, zIndex: 60, borderRadius: 20,
    boxShadow: '0 16px 50px rgba(0,0,0,0.26)',
  }

  return (
    <div style={{
      ...wrap, background: u.panel,
      border: `1px solid ${u.border}`,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'Outfit',system-ui,sans-serif", color: u.text,
    }}>
      {isBottom && (
        <div onClick={onClose} style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 2px', cursor: 'pointer', flexShrink: 0 }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: u.soft, opacity: 0.5 }} />
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: isBottom ? '6px 16px 10px' : '15px 16px 11px', flexShrink: 0 }}>
        {accentDot && <span style={{ width: 9, height: 9, borderRadius: '50%', background: accentDot, flexShrink: 0 }} />}
        <h3 style={{ margin: 0, fontSize: 16.5, fontWeight: 800, letterSpacing: '-0.01em', flex: 1 }}>{title}</h3>
        <button onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 9, border: `1px solid ${u.line}`,
          background: u.card, color: u.soft, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>✕</button>
      </div>
      <div style={{ overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 16px', flex: 1, WebkitOverflowScrolling: 'touch' }}>
        {children}
      </div>
      {footer && (
        <div style={{ padding: 14, borderTop: `1px solid ${u.line}`, flexShrink: 0, background: u.panel }}>
          {footer}
        </div>
      )}
    </div>
  )
}

export { useIsMobile, useMode }
