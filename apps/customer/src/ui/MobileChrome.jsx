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
  place: { label: 'Place', Icon: Package, tint: '#c87adf' },
  build: { label: 'Build', Icon: Hammer, tint: '#3fb88a' },
  style: { label: 'Style', Icon: Palette, tint: '#e8a34c' },
  more:  { label: 'More',  Icon: MoreHorizontal, tint: '#8888cc' },
}

// ── Top Bar ────────────────────────────────────────────────────────
export function MobileTopBar({ roomName, budget, itemCount, cartCount, onUndo, onRedo, onCart, onAccount }) {
  const t = useTheme()
  const isMobile = useIsMobile()
  if (!isMobile) return null

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56,
      zIndex: 80, display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 10px',
      background: `${t.navBg}ee`,
      borderBottom: `1px solid ${t.surfaceBorder}`,
      fontFamily: "'Outfit',system-ui,sans-serif",
    }}>
      <Logo size={28} color={t.accent} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
          borderRadius: 10, border: `1px solid ${t.surfaceBorder}`,
          background: t.surface, color: t.text, cursor: 'pointer',
          fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          overflow: 'hidden', maxWidth: 140,
        }}>
          <Home size={13} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomName || 'My Room'}</span>
        </button>
        {budget > 0 && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '5px 8px',
            borderRadius: 10, border: `1px solid ${t.surfaceBorder}`,
            background: t.surface, fontSize: 12, fontWeight: 800, color: t.text,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3fb88a' }} />
            ${budget.toLocaleString()}
          </span>
        )}
      </div>
      <IconButton icon={Undo2} onClick={onUndo} label="Undo" t={t} />
      <IconButton icon={ShoppingCart} onClick={onCart} label="Cart" badge={cartCount} t={t} />
    </header>
  )
}

// ── Tool Dock (bottom bar) ─────────────────────────────────────────
export function MobileToolDock({ active, onPick }) {
  const t = useTheme()
  const isMobile = useIsMobile()
  if (!isMobile) return null

  return (
    <nav style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, height: 66,
      zIndex: 70, display: 'flex', alignItems: 'stretch',
      padding: '6px 8px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      background: `${t.navBg}ee`,
      borderTop: `1px solid ${t.surfaceBorder}`,
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
            cursor: 'pointer', fontFamily: 'inherit', padding: 0,
          }}>
            <span style={{
              width: 46, height: 32, borderRadius: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? tool.tint : 'transparent',
              color: on ? '#fff' : t.textSoft,
              transition: 'all .15s',
            }}>
              <ToolIcon size={21} strokeWidth={on ? 2.1 : 1.9} />
            </span>
            <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? t.text : t.textSoft }}>
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
      color: tint || t.text, fontFamily: 'inherit', minWidth: 52,
    }}>
      {icon}
      <span style={{ fontSize: 10.5, fontWeight: 700 }}>{label}</span>
    </button>
  )

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      zIndex: 75, display: 'flex', alignItems: 'center', gap: 2, padding: 6,
      background: `${t.navBg}f0`,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 18,
      boxShadow: '0 12px 34px rgba(0,0,0,0.30)',
      fontFamily: "'Outfit',sans-serif",
      maxWidth: 'calc(100% - 24px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 12px 4px 10px', minWidth: 0 }}>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {def.label}
        </span>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.accent }}>
          ${price.toLocaleString()}
        </span>
      </div>
      <div style={{ width: 1, height: 34, background: t.surfaceBorder, flexShrink: 0 }} />
      {aBtn(<RotateCw size={20} />, 'Rotate', onRotate)}
      {aBtn(<SlidersHorizontal size={20} />, 'Edit', onDetails)}
      {aBtn(<Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />, isWishlisted ? 'Saved' : 'Save', onWishlist, isWishlisted ? '#ff9ab8' : t.text)}
      {aBtn(<Trash2 size={20} />, 'Delete', onDelete, '#e8736f')}
    </div>
  )
}

// ── Helper ─────────────────────────────────────────────────────────
function IconButton({ icon: LucideIcon, onClick, label, badge, t }) {
  return (
    <button onClick={onClick} title={label} style={{
      width: 36, height: 36, borderRadius: 10, flexShrink: 0, position: 'relative',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${t.surfaceBorder}`, background: t.surface, color: t.text,
    }}>
      <LucideIcon size={18} />
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17,
          padding: '0 4px', borderRadius: 9, background: t.accent, color: t.accentText,
          fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${t.navBg}`,
        }}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  )
}

export function MobileViewControls() { return null } // stub — swipe handles it
export { useIsMobile }
