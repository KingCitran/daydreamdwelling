// MobileChrome — responsive builder chrome from Claude Design spec.
// Replaces SideTabStrip + TopRightCluster + BottomTabCluster on mobile.
// On desktop (>768px), these components don't render — the existing
// desktop chrome stays. On mobile, they provide:
//   TopBar (84px): logo + room name + budget + undo + cart
//   ToolDock (66px): Place / Build / Style / More bottom bar
//   ViewControls: floating rotate/zoom buttons
//   ActionPill: item name + price + rotate/edit/save/delete
//
// All components use the theme token system via useTheme().

import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import { Icon } from '@shared/ui/Icon'
import { Package, Hammer, Palette, MoreHorizontal, ShoppingCart, Home, Undo2, Trash2, Heart, SlidersHorizontal, RotateCw } from 'lucide-react'

function useIsMobile(bp = 768) {
  const [m, setM] = useState(window.innerWidth <= bp)
  useEffect(() => { const c = () => setM(window.innerWidth <= bp); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c) }, [bp])
  return m
}

const TOOLS = {
  place: { label: 'Place', Icon: Package, tint: '#e87fc8' },
  build: { label: 'Build', Icon: Hammer, tint: '#3fb88a' },
  style: { label: 'Style', Icon: Palette, tint: '#9b7ae0' },
  more:  { label: 'More',  Icon: MoreHorizontal, tint: '#8a78e0' },
}

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
export function MobileTopBar({ roomName, budget, itemCount, cartCount, onUndo, onRedo, onCart, onAccount }) {
  const t = useTheme()
  const u = ui(t)
  const isMobile = useIsMobile()
  if (!isMobile) return null

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 48,
      zIndex: 80, display: 'flex', alignItems: 'center', gap: 8,
      padding: 'max(env(safe-area-inset-top), 4px) 10px 0',
      background: u.nav, borderBottom: `1px solid ${u.line}`,
      fontFamily: "'Outfit',system-ui,sans-serif", color: u.text,
    }}>
      <Logo size={28} color={u.accent} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px',
          borderRadius: 12, border: `1px solid ${u.line}`,
          background: u.card, color: u.text, cursor: 'pointer',
          fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
          overflow: 'hidden', maxWidth: 140,
        }}>
          <Home size={14} style={{ flexShrink: 0, color: u.soft }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomName || 'My Room'}</span>
        </button>
        {budget > 0 && (
          <button style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 9px',
            borderRadius: 12, border: `1px solid ${u.line}`,
            background: u.card, fontSize: 13, fontWeight: 800, color: u.text,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb88a', flexShrink: 0 }} />
            ${budget.toLocaleString()}
          </button>
        )}
      </div>
      <IconButton icon={Undo2} onClick={onUndo} label="Undo" u={u} />
      <IconButton icon={ShoppingCart} onClick={onCart} label="Cart" badge={cartCount} u={u} />
    </header>
  )
}

// ── Tool Dock (bottom bar) ─────────────────────────────────────────
export function MobileToolDock({ active, onPick }) {
  const t = useTheme()
  const u = ui(t)
  const isMobile = useIsMobile()
  if (!isMobile) return null

  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: 54,
      zIndex: 70, display: 'flex', alignItems: 'stretch',
      padding: '6px 8px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      background: u.nav, borderTop: `1px solid ${u.line}`,
      fontFamily: "'Outfit',sans-serif",
    }}>
      {['place', 'build', 'style', 'more'].map(id => {
        const tool = TOOLS[id]
        const on = active === id
        const ToolIcon = tool.Icon
        return (
          <button key={id} onClick={() => onPick(on ? null : id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, border: 'none', background: 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', minWidth: 0, padding: 0,
          }}>
            <span style={{
              width: 46, height: 32, borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? tool.tint : 'transparent',
              color: on ? '#fff' : u.soft,
              transition: 'all .15s',
            }}>
              <ToolIcon size={21} strokeWidth={on ? 2.1 : 1.9} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft }}>
              {tool.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ViewControls removed — swipe rotate + pinch zoom handles everything on mobile

// ── Action Pill (selected item) ────────────────────────────────────
export function MobileActionPill({ item, catalogue, onRotate, onDetails, onDelete, onWishlist, isWishlisted }) {
  const t = useTheme()
  const u = ui(t)
  const isMobile = useIsMobile()
  if (!isMobile || !item) return null

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
      position: 'fixed', bottom: 62, left: '50%', transform: 'translateX(-50%)',
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

export function MobileViewControls() { return null } // stub — swipe handles it
export { useIsMobile }
