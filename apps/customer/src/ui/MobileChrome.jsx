// BuilderChrome — unified responsive chrome from Claude Design handoff.
// Replaces SideTabStrip + TopRightCluster + BottomTabCluster at all sizes.
//
// Breakpoints (from design README):
//   Mobile  (≤768):  TopBar 84px (incl safe-area) + ToolDock 66px bottom
//   Tablet  (769-1199): TopBar 60px + left rail 64px (icon-only)
//   Desktop (≥1200): TopBar 64px + left rail 192px (icons + labels)
//
// Icons use Lucide (our existing library) mapped to the design's icon names.
// Theme tokens via useTheme() + ui() mapping to match design's token system.

import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import {
  Package, Hammer, Palette, MoreHorizontal, ShoppingCart, Home,
  Undo2, Redo2, Trash2, Heart, SlidersHorizontal, RotateCw, RotateCcw,
  Camera, Share2, User, Music, Eye, ClipboardList, Users,
  ChevronDown, Check, Plus, Minus, Search, Lock, Unlock
} from 'lucide-react'

// ── Mode detection ─────────────────────────────────────────────────
function useMode() {
  const [w, setW] = useState(window.innerWidth)
  useEffect(() => {
    const c = () => setW(window.innerWidth)
    window.addEventListener('resize', c)
    return () => window.removeEventListener('resize', c)
  }, [])
  if (w <= 768) return 'mobile'
  if (w <= 1199) return 'tablet'
  return 'desktop'
}

function useIsMobile() { return useMode() === 'mobile' }

// ── Geometry per breakpoint (from design README) ───────────────────
const GEOM = {
  mobile:  { topH: 52, dockH: 58, railW: 0 },
  tablet:  { topH: 60, dockH: 0,  railW: 64 },
  desktop: { topH: 64, dockH: 0,  railW: 192 },
}

// ── Tool definitions ───────────────────────────────────────────────
const TOOL_META = {
  place:  { label: 'Place',  Icon: Package,        tint: '#e87fc8' },
  build:  { label: 'Build',  Icon: Hammer,         tint: '#3fb88a' },
  style:  { label: 'Style',  Icon: Palette,        tint: '#9b7ae0' },
  view:   { label: 'View',   Icon: Eye,            tint: '#5ea8c8' },
  music:  { label: 'Music',  Icon: Music,          tint: '#8a78e0' },
  plan:   { label: 'Plan',   Icon: ClipboardList,  tint: '#5bb0c8' },
  social: { label: 'Social', Icon: Users,          tint: '#e87fa0' },
  more:   { label: 'More',   Icon: MoreHorizontal, tint: '#8a78e0' },
}

// Tool sets per breakpoint (from design README — no tool duplicated)
const TOOL_SETS = {
  mobile:  ['place', 'build', 'style', 'more'],
  tablet:  ['place', 'build', 'style', 'view', 'music', 'more'],
  desktop: ['place', 'build', 'style', 'view', 'music', 'plan', 'social', 'more'],
}

// ── Theme token derivation (matches design's ui() function) ────────
function ui(t) {
  const dark = !!t.isDark
  return {
    panel: dark ? 'rgba(16,18,32,0.98)' : 'rgba(255,255,255,0.98)',
    card: dark ? 'rgba(255,255,255,0.05)' : 'rgba(120,100,170,0.06)',
    cardHi: dark ? 'rgba(255,255,255,0.09)' : 'rgba(120,100,170,0.11)',
    border: t.surfaceBorder,
    line: dark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,90,0.10)',
    text: t.text, soft: t.textSoft, accent: t.accent, accentText: t.accentText,
    nav: t.navBg, glow: t.glow, dark,
  }
}

// ── Icon Button (design: 38px default, 36px on mobile top bar) ─────
function IconBtn({ icon: LucideIcon, onClick, label, badge, active, size = 38, u, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} title={label} aria-label={label} disabled={disabled} style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0, position: 'relative',
      cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid ${active ? u.accent : u.line}`,
      background: active ? u.accent + '1c' : u.card,
      color: active ? u.accent : u.text,
      opacity: disabled ? 0.35 : 1,
    }}>
      <LucideIcon size={Math.round(size * 0.5)} />
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5, minWidth: 17, height: 17,
          padding: '0 4px', borderRadius: 9, background: u.accent, color: u.accentText,
          fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center',
          justifyContent: 'center', border: `2px solid ${u.nav}`,
        }}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  )
}

// ── Room Switcher ──────────────────────────────────────────────────
function RoomSwitcher({ mode, rooms, room, onPick, onNew, u }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ position: 'relative', minWidth: 0, flexShrink: mode === 'mobile' ? 1 : 0 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: mode === 'mobile' ? '6px 10px' : '8px 13px',
        borderRadius: 12, cursor: 'pointer', border: `1px solid ${u.line}`,
        background: u.card, color: u.text, fontFamily: 'inherit', maxWidth: '100%',
      }}>
        <Home size={15} style={{ color: u.soft, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {room}
        </span>
        <ChevronDown size={14} style={{ color: u.soft, flexShrink: 0 }} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '110%', left: 0, minWidth: 200,
          background: u.panel, border: `1px solid ${u.border}`, borderRadius: 14,
          padding: 6, zIndex: 120, boxShadow: '0 14px 40px rgba(0,0,0,0.28)',
        }}>
          {(rooms || [room]).map(r => (
            <button key={r} onClick={() => { onPick?.(r); setOpen(false) }} style={{
              display: 'flex', width: '100%', alignItems: 'center', gap: 8,
              padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: r === room ? u.accent + '16' : 'transparent',
              color: r === room ? u.accent : u.text,
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, textAlign: 'left',
            }}>
              <Home size={15} /> {r}
              {r === room && <Check size={15} style={{ marginLeft: 'auto' }} />}
            </button>
          ))}
          <div style={{ height: 1, background: u.line, margin: '4px 6px' }} />
          <button onClick={() => { onNew?.(); setOpen(false) }} style={{
            display: 'flex', width: '100%', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: u.soft,
            fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, textAlign: 'left',
          }}>
            <Plus size={15} /> New room
          </button>
        </div>
      )}
    </div>
  )
}

// ── Budget Chip ────────────────────────────────────────────────────
function BudgetChip({ total, count, onClick, compact, u }) {
  return (
    <button onClick={onClick} title="Room budget" style={{
      display: 'flex', alignItems: 'center', gap: compact ? 5 : 7,
      padding: compact ? '6px 9px' : '8px 12px',
      borderRadius: 12, cursor: 'pointer', border: `1px solid ${u.line}`,
      background: u.card, color: u.text, fontFamily: 'inherit', flexShrink: 0,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3fb88a', flexShrink: 0 }} />
      <span style={{ fontSize: compact ? 13 : 14, fontWeight: 800 }}>
        ${(total || 0).toLocaleString()}
      </span>
      {!compact && (
        <span style={{ fontSize: 11.5, color: u.soft, fontWeight: 600 }}>
          · {count || 0} item{count === 1 ? '' : 's'}
        </span>
      )}
    </button>
  )
}

// ── Top Bar ────────────────────────────────────────────────────────
export function BuilderTopBar({
  roomName, rooms, budget, itemCount, cartCount,
  onUndo, onRedo, canUndo, canRedo, onCart, onScreenshot, onShare, onAccount,
  onPickRoom, onNewRoom, onBudget,
}) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const geom = GEOM[mode]

  const barStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, height: geom.topH,
    zIndex: 80, display: 'flex', alignItems: 'center',
    gap: mode === 'mobile' ? 8 : 12,
    padding: mode === 'mobile' ? 'env(safe-area-inset-top, 0px) 10px 0' : '0 16px',
    background: u.nav, borderBottom: `1px solid ${u.line}`,
    fontFamily: "'Outfit',system-ui,sans-serif", color: u.text,
  }

  if (mode === 'mobile') {
    return (
      <header style={barStyle}>
        <Logo size={30} color={u.accent} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
          <RoomSwitcher mode={mode} room={roomName || 'My Room'} rooms={rooms} onPick={onPickRoom} onNew={onNewRoom} u={u} />
          <BudgetChip total={budget} count={itemCount} onClick={onBudget} compact u={u} />
        </div>
        <IconBtn icon={Undo2} onClick={onUndo} label="Undo" size={36} u={u} disabled={!canUndo} />
        <IconBtn icon={ShoppingCart} onClick={onCart} label="Cart" badge={cartCount || null} size={36} u={u} />
      </header>
    )
  }

  // Tablet / Desktop
  return (
    <header style={barStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Logo size={32} color={u.accent} />
        {mode === 'desktop' && (
          <span style={{ fontFamily: "'EB Garamond',Georgia,serif", fontSize: 21, fontWeight: 500, letterSpacing: '-0.01em' }}>
            Daydream<span style={{ color: u.accent, fontStyle: 'italic' }}>Dwelling</span>
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <RoomSwitcher mode={mode} room={roomName || 'My Room'} rooms={rooms} onPick={onPickRoom} onNew={onNewRoom} u={u} />
        <BudgetChip total={budget} count={itemCount} onClick={onBudget} u={u} />
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <IconBtn icon={Undo2} onClick={onUndo} label="Undo" u={u} disabled={!canUndo} />
        <IconBtn icon={Redo2} onClick={onRedo} label="Redo" u={u} disabled={!canRedo} />
        <div style={{ width: 1, height: 26, background: u.line, margin: '0 2px' }} />
        <IconBtn icon={Camera} onClick={onScreenshot} label="Screenshot" u={u} />
        <IconBtn icon={Share2} onClick={onShare} label="Share room" u={u} />
        <IconBtn icon={ShoppingCart} onClick={onCart} label="Cart" badge={cartCount || null} u={u} />
        <IconBtn icon={User} onClick={onAccount} label="Account" u={u} />
      </div>
    </header>
  )
}

// ── Tool Dock ──────────────────────────────────────────────────────
export function BuilderToolDock({ active, onPick }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const geom = GEOM[mode]
  const tools = TOOL_SETS[mode]

  // Mobile: bottom bar
  if (mode === 'mobile') {
    return (
      <nav style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, height: geom.dockH,
        zIndex: 70, display: 'flex', alignItems: 'stretch',
        padding: '6px 8px', paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        background: u.nav, borderTop: `1px solid ${u.line}`,
        fontFamily: "'Outfit',sans-serif",
      }}>
        {tools.map(id => {
          const meta = TOOL_META[id]
          const on = active === id
          const ToolIcon = meta.Icon
          return (
            <button key={id} onClick={() => onPick(on ? null : id)} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 3, border: 'none', background: 'transparent',
              cursor: 'pointer', fontFamily: 'inherit', minWidth: 0, padding: 0,
            }}>
              <span style={{
                width: 46, height: 32, borderRadius: 11,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: on ? meta.tint : 'transparent',
                color: on ? '#fff' : u.soft, transition: 'all .15s',
              }}>
                <ToolIcon size={21} strokeWidth={on ? 2.1 : 1.9} />
              </span>
              <span style={{ fontSize: 10.5, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft }}>
                {meta.label}
              </span>
            </button>
          )
        })}
      </nav>
    )
  }

  // Tablet/Desktop: vertical left rail
  const wide = mode === 'desktop'
  return (
    <nav style={{
      position: 'fixed', top: geom.topH + 12, bottom: 12, left: 12, width: geom.railW,
      zIndex: 70, display: 'flex', flexDirection: 'column', gap: 6, padding: 8,
      background: u.nav, border: `1px solid ${u.border}`, borderRadius: 20,
      fontFamily: "'Outfit',sans-serif", boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
    }}>
      {tools.map(id => {
        const meta = TOOL_META[id]
        const on = active === id
        const ToolIcon = meta.Icon
        return (
          <button key={id} onClick={() => onPick(on ? null : id)} title={meta.label} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: wide ? '10px 12px' : 0,
            justifyContent: wide ? 'flex-start' : 'center',
            height: wide ? 'auto' : 50,
            borderRadius: 14,
            border: `1px solid ${on ? meta.tint + '88' : 'transparent'}`,
            background: on ? meta.tint + '1e' : 'transparent',
            cursor: 'pointer', fontFamily: 'inherit', color: u.text,
          }}>
            <span style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: on ? meta.tint : u.card,
              color: on ? '#fff' : u.soft, transition: 'all .15s',
            }}>
              <ToolIcon size={20} />
            </span>
            {wide && (
              <span style={{ fontSize: 14, fontWeight: on ? 800 : 600, color: on ? u.text : u.soft }}>
                {meta.label}
              </span>
            )}
          </button>
        )
      })}
    </nav>
  )
}

// ── View Controls (on-canvas, all breakpoints) ─────────────────────
export function BuilderViewControls({ zoom, onRotateLeft, onRotateRight, onZoomIn, onZoomOut, onReset }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const geom = GEOM[mode]
  // Mobile has swipe rotate + pinch zoom — no need for buttons
  if (mode === 'mobile') return null
  const bottom = 18

  const btn = (icon, label, onClick, extra) => (
    <button onClick={onClick} title={label} aria-label={label} style={{
      width: 38, height: 38, border: 'none', background: 'transparent',
      cursor: 'pointer', color: u.text, display: 'flex',
      alignItems: 'center', justifyContent: 'center', borderRadius: 11,
      ...extra,
    }}>{icon}</button>
  )
  const divider = <div style={{ height: 1, alignSelf: 'stretch', background: u.line, margin: '2px 7px' }} />

  return (
    <div style={{
      position: 'fixed', right: 14, bottom, zIndex: 72,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4,
      background: u.panel, border: `1px solid ${u.border}`, borderRadius: 16,
      boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
      fontFamily: "'Outfit',sans-serif",
    }}>
      {btn(<RotateCcw size={19} />, 'Rotate left', onRotateLeft)}
      {btn(<RotateCw size={19} />, 'Rotate right', onRotateRight)}
      {divider}
      {btn(<Plus size={19} />, 'Zoom in', onZoomIn)}
      <span style={{ fontSize: 9.5, fontWeight: 800, color: u.soft, padding: '1px 0' }}>
        {Math.round((zoom || 1) * 100)}%
      </span>
      {btn(<Minus size={19} />, 'Zoom out', onZoomOut)}
      {divider}
      {btn(<Home size={19} />, 'Reset view', onReset)}
    </div>
  )
}

// ── Action Pill (selected item) ────────────────────────────────────
export function BuilderActionPill({ item, catalogue, onRotate, onDetails, onDelete, onWishlist, isWishlisted, onLock }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const geom = GEOM[mode]
  if (!item) return null

  const def = catalogue?.[item.typeKey]
  if (!def) return null
  const price = def.sizes?.[item.sizeIndex]?.price ?? def.price ?? 0
  const bottom = mode === 'mobile' ? geom.dockH + 14 : 22

  const aBtn = (icon, label, onClick, tint) => (
    <button onClick={onClick} title={label} aria-label={label} style={{
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
    <div onPointerDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()} style={{
      position: 'fixed', bottom, left: '50%', transform: 'translateX(-50%)',
      zIndex: 75, display: 'flex', alignItems: 'center', gap: 2, padding: 6,
      background: u.panel, border: `1px solid ${u.border}`, borderRadius: 18,
      boxShadow: '0 12px 34px rgba(0,0,0,0.30)',
      fontFamily: "'Outfit',sans-serif", maxWidth: 'calc(100% - 24px)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 10px 4px 8px', minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {def.label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: u.accent }}>
          ${price.toLocaleString()}
        </span>
      </div>
      <div style={{ width: 1, height: 34, background: u.line, flexShrink: 0 }} />
      {!item.locked && aBtn(<RotateCw size={18} />, 'Rotate', onRotate)}
      {aBtn(<SlidersHorizontal size={18} />, 'Edit', onDetails)}
      {aBtn(
        item.locked ? <Unlock size={18} /> : <Lock size={18} />,
        item.locked ? 'Unlock' : 'Lock', onLock
      )}
      {aBtn(
        <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />,
        isWishlisted ? 'Saved' : 'Save', onWishlist,
        isWishlisted ? '#ff9ab8' : u.text
      )}
      {!item.locked && aBtn(<Trash2 size={18} />, 'Delete', onDelete, '#e8736f')}
    </div>
  )
}

// ── Sheet (panel container) ────────────────────────────────────────
export function BuilderSheet({ title, accentDot, onClose, children, footer, height, noPad }) {
  const t = useTheme()
  const u = ui(t)
  const mode = useMode()
  const geom = GEOM[mode]
  const isBottom = mode === 'mobile'

  const wrap = isBottom ? {
    position: 'fixed', left: 0, right: 0, bottom: geom.dockH, zIndex: 60,
    top: geom.topH + 4,
    borderRadius: '22px 22px 0 0',
    boxShadow: '0 -10px 40px rgba(0,0,0,0.28)',
  } : {
    position: 'fixed',
    top: geom.topH + 12, bottom: 12,
    left: 12 + geom.railW + 12,
    width: mode === 'desktop' ? 384 : 352,
    zIndex: 60, borderRadius: 20,
    boxShadow: '0 16px 50px rgba(0,0,0,0.26)',
  }

  return (
    <div style={{
      ...wrap, background: u.panel, border: `1px solid ${u.border}`,
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
      <div className="ddd-sheet-body" style={{ overflow: noPad ? 'hidden' : 'auto', overflowX: 'hidden', padding: noPad ? 0 : '0 16px 16px', flex: 1, WebkitOverflowScrolling: 'touch', display: noPad ? 'flex' : 'block', flexDirection: 'column', minHeight: 0 }}>
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

export { useIsMobile, useMode, GEOM, TOOL_SETS, ui }
