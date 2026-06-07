// BuilderPanels — Claude Design panel contents.
// Each panel renders inside BuilderSheet. All styled with the design's
// ui() token system. These are the CONTENTS, not the shell — BuilderSheet
// handles the container (bottom sheet / side panel).

import { useState, useMemo } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useMoodControl } from '@shared/ThemeProvider'
import { ITEM_CATALOGUE } from '../data/items'
import {
  Palette, Hammer, Home, Grid3x3, Layers, ClipboardList,
  Music, Users, User, Bookmark, Bell, Settings,
  Ruler, Camera, Share2, Undo2, ShoppingCart, Plus, Minus,
  Trash2, Heart, Check, Info, Search, Star, Sparkles
} from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────
function ui(t) {
  const dark = !!t.isDark
  return {
    panel: dark ? 'rgba(20,23,42,0.97)' : 'rgba(255,255,255,0.97)',
    card: dark ? 'rgba(255,255,255,0.05)' : 'rgba(120,100,170,0.06)',
    cardHi: dark ? 'rgba(255,255,255,0.09)' : 'rgba(120,100,170,0.11)',
    border: t.surfaceBorder, line: dark ? 'rgba(255,255,255,0.08)' : 'rgba(60,40,90,0.10)',
    text: t.text, soft: t.textSoft, accent: t.accent, accentText: t.accentText,
    nav: t.navBg, dark,
  }
}

function shade(hex, amt) {
  let h = ('' + hex).replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16); let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  if (amt >= 0) { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt }
  else { r *= (1 + amt); g *= (1 + amt); b *= (1 + amt) }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
}

const money = n => '$' + (n || 0).toLocaleString()

const Label = ({ u, children }) => (
  <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: u.soft }}>{children}</span>
)

function Seg({ options, value, onChange, u }) {
  return (
    <div style={{ display: 'flex', gap: 4, padding: 4, background: u.card, borderRadius: 13, border: `1px solid ${u.line}` }}>
      {options.map(o => (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          flex: 1, padding: '9px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
          background: value === o.id ? u.accent : 'transparent',
          color: value === o.id ? u.accentText : u.soft,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {o.Icon && <o.Icon size={15} />}
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Presets ─────────────────────────────────────────────────────────
const WALL_PRESETS = [
  { name: 'Cloud', hex: '#ece7f5' }, { name: 'Blush', hex: '#f0d8d8' },
  { name: 'Sage', hex: '#cdd8c4' }, { name: 'Sky', hex: '#cfe0ee' },
  { name: 'Butter', hex: '#f2e6c2' }, { name: 'Clay', hex: '#e0c2ad' },
  { name: 'Charcoal', hex: '#3a3a44' }, { name: 'Plum', hex: '#5a3f63' },
]

const FLOOR_PRESETS = [
  { name: 'Oak', hex: '#c8a878', tex: 'wood' }, { name: 'Walnut', hex: '#7c5a3c', tex: 'wood' },
  { name: 'Ash', hex: '#d8cdb8', tex: 'wood' }, { name: 'Carpet', hex: '#c4b9ad', tex: 'soft' },
  { name: 'Tile', hex: '#d2d8dc', tex: 'tile' }, { name: 'Concrete', hex: '#b0b0b4', tex: 'flat' },
  { name: 'Terracotta', hex: '#bd7d5c', tex: 'tile' }, { name: 'Slate', hex: '#5a6068', tex: 'tile' },
]

const MOOD_LIST = [
  { key: 'Dream State', label: 'Dream State', desc: 'Soft pastel lavender', sky: 'linear-gradient(180deg, #ddd2ff 0%, #f3e6ff 55%, #fde6f2 100%)' },
  { key: 'Golden Hour', label: 'Golden Hour', desc: 'Warm amber sunset', sky: 'linear-gradient(180deg, #ffe6b8 0%, #ffeccb 50%, #ffe0d0 100%)' },
  { key: 'Moonlight', label: 'Moonlight', desc: 'Cool blue-silver night', sky: 'linear-gradient(180deg, #0a0e1c 0%, #131a32 60%, #1d2440 100%)' },
]

// ── Style Panel ────────────────────────────────────────────────────
export function DesignStyleContent({ wallColor, floorColor, onWallColor, onFloorColor }) {
  const t = useTheme()
  const u = ui(t)
  const { mood, setMood } = useMoodControl()
  const [tab, setTab] = useState('wall')
  const presets = tab === 'wall' ? WALL_PRESETS : FLOOR_PRESETS
  const current = tab === 'wall' ? wallColor : floorColor
  const setColor = tab === 'wall' ? onWallColor : onFloorColor

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Seg u={u} value={tab} onChange={setTab} options={[
        { id: 'wall', label: 'Walls', Icon: Palette },
        { id: 'floor', label: 'Floor', Icon: Grid3x3 },
      ]} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Label u={u}>{tab === 'wall' ? 'Wall colour' : 'Floor material'}</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
          {presets.map(p => {
            const active = current === p.hex
            return (
              <button key={p.name} onClick={() => setColor(p.hex)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: 5, borderRadius: 13, cursor: 'pointer',
                border: `1px solid ${active ? u.accent : u.line}`,
                background: active ? u.accent + '14' : 'transparent', fontFamily: 'inherit',
              }}>
                <div style={{
                  width: '100%', height: 40, borderRadius: 9,
                  background: tab === 'floor'
                    ? `repeating-linear-gradient(90deg, ${shade(p.hex, 0.06)} 0 6px, ${shade(p.hex, -0.08)} 6px 12px)`
                    : `linear-gradient(150deg, ${shade(p.hex, 0.1)}, ${shade(p.hex, -0.1)})`,
                  boxShadow: active ? `0 0 0 2px ${u.accent}55` : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? u.accent : u.soft }}>{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 13, background: u.card, border: `1px solid ${u.line}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: u.text }}>Custom colour</div>
          <div style={{ fontSize: 11.5, color: u.soft }}>Pick any shade with the eyedropper</div>
        </div>
        <input type="color" value={current || '#cccccc'} onChange={e => setColor(e.target.value)}
          style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${u.line}`, background: 'none', cursor: 'pointer', padding: 2 }} />
      </div>

      <div style={{ height: 1, background: u.line }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={15} style={{ color: u.accent }} />
          <Label u={u}>Lighting mood</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9 }}>
          {MOOD_LIST.map(m => {
            const active = m.key === mood
            return (
              <button key={m.key} onClick={() => setMood(m.key)} style={{
                display: 'flex', flexDirection: 'column', gap: 6, padding: 8,
                borderRadius: 13, cursor: 'pointer', textAlign: 'left',
                border: `1px solid ${active ? u.accent : u.line}`,
                background: active ? u.accent + '12' : 'transparent', fontFamily: 'inherit',
              }}>
                <div style={{ height: 34, borderRadius: 8, background: m.sky, border: `1px solid ${u.line}` }} />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: u.text }}>{m.label}</span>
                <span style={{ fontSize: 10, color: u.soft, lineHeight: 1.2 }}>{m.desc}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Build Panel ────────────────────────────────────────────────────
const BUILD_ITEMS = [
  { id: 'wall', label: 'Wall', Icon: Palette },
  { id: 'door', label: 'Door', Icon: Hammer },
  { id: 'window', label: 'Window', Icon: Grid3x3 },
  { id: 'opening', label: 'Opening', Icon: Layers },
  { id: 'stairs', label: 'Stairs', Icon: ClipboardList },
  { id: 'closet', label: 'Closet', Icon: Home },
]

export function DesignBuildContent({ onWindow, onDoor }) {
  const t = useTheme()
  const u = ui(t)

  const handlePick = (id) => {
    if (id === 'window') onWindow?.()
    else if (id === 'door') onDoor?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <p style={{ margin: 0, fontSize: 13, color: u.soft, lineHeight: 1.5 }}>
        Tap an element, then tap a wall or floor in the room to place it. Drag the edges to resize.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {BUILD_ITEMS.map(b => (
          <button key={b.id} onClick={() => handlePick(b.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '16px 8px', borderRadius: 15, cursor: 'pointer',
            border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit',
          }}>
            <span style={{
              width: 42, height: 42, borderRadius: 12, background: u.cardHi,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent,
            }}>
              <b.Icon size={21} />
            </span>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{b.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Plan / Budget Panel ────────────────────────────────────────────
export function DesignPlanContent({ items, catalogue, onAddAll, showMeasurements, onToggleMeasurements }) {
  const t = useTheme()
  const u = ui(t)

  const { budget, byCat } = useMemo(() => {
    const cats = {}
    let total = 0
    for (const it of items) {
      const def = (catalogue ?? ITEM_CATALOGUE)[it.typeKey] ?? ITEM_CATALOGUE[it.typeKey]
      const price = def?.sizes?.[it.sizeIndex]?.price ?? def?.price ?? 0
      total += price
      const cat = def?.category || 'Other'
      cats[cat] = (cats[cat] || 0) + price
    }
    return { budget: total, byCat: cats }
  }, [items, catalogue])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '14px 16px', borderRadius: 15, background: u.card, border: `1px solid ${u.line}`,
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: u.soft }}>Room total</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: u.accent, letterSpacing: '-0.02em' }}>{money(budget)}</div>
        </div>
        <div style={{ fontSize: 12.5, color: u.soft, fontWeight: 600 }}>{items.length} pieces</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {Object.entries(byCat).map(([cat, val]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12.5, color: u.text, width: 86, flexShrink: 0 }}>{cat}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: u.card, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, budget > 0 ? (val / budget) * 100 : 0)}%`, height: '100%', background: u.accent, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: u.soft, width: 56, textAlign: 'right' }}>{money(val)}</span>
          </div>
        ))}
      </div>

      <button onClick={onAddAll} style={{
        width: '100%', padding: '11px 16px', borderRadius: 12, border: `1px solid ${u.accent}`,
        background: u.accent, color: u.accentText, fontSize: 13.5, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <ShoppingCart size={16} /> Buy everything in this room
      </button>

      <button onClick={onToggleMeasurements} style={{
        width: '100%', padding: '11px 16px', borderRadius: 12,
        border: `1px solid ${showMeasurements ? u.accent : u.line}`,
        background: showMeasurements ? u.accent + '14' : u.card,
        color: showMeasurements ? u.accent : u.soft,
        fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <Ruler size={16} /> {showMeasurements ? 'Hide measurements' : 'Show measurements'}
      </button>
    </div>
  )
}

// ── More Menu ──────────────────────────────────────────────────────
const MORE_TOOL_ITEMS = [
  { id: 'music', label: 'Music', Icon: Music, desc: 'Stations & playlists' },
  { id: 'plan', label: 'Plan', Icon: ClipboardList, desc: 'Budget & measure' },
  { id: 'social', label: 'Social', Icon: Users, desc: 'Community & contests' },
]
const MORE_SYSTEM_ITEMS = [
  { id: 'account', label: 'Account', Icon: User, desc: 'Profile & orders' },
  { id: 'saved', label: 'Saved rooms', Icon: Bookmark, desc: 'Your designs' },
  { id: 'notifications', label: 'Alerts', Icon: Bell, desc: 'New updates' },
  { id: 'settings', label: 'Settings', Icon: Settings, desc: 'Preferences' },
]

export function DesignMoreContent({ railTools, onTool, showMeasurements, onMeasure, onReset, onShare, onScreenshot }) {
  const t = useTheme()
  const u = ui(t)
  const rail = railTools || []
  const tiles = [...MORE_TOOL_ITEMS.filter(mt => !rail.includes(mt.id)), ...MORE_SYSTEM_ITEMS]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
        {tiles.map(tile => (
          <button key={tile.id} onClick={() => onTool(tile.id)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 12,
            borderRadius: 15, cursor: 'pointer', border: `1px solid ${u.line}`,
            background: u.card, color: u.text, fontFamily: 'inherit', textAlign: 'left',
            position: 'relative', minWidth: 0,
          }}>
            <span style={{
              width: 38, height: 38, borderRadius: 11, background: u.cardHi,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent, flexShrink: 0,
            }}>
              <tile.Icon size={19} />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.label}</span>
              <span style={{ fontSize: 10.5, color: u.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.desc}</span>
            </span>
            {tile.id === 'notifications' && (
              <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: '50%', background: '#e8736f' }} />
            )}
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: u.line }} />
      <Label u={u}>Quick actions</Label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { Icon: Ruler, label: 'Measure', onClick: onMeasure, active: showMeasurements },
          { Icon: Camera, label: 'Capture', onClick: onScreenshot },
          { Icon: Share2, label: 'Share', onClick: onShare },
          { Icon: Undo2, label: 'Reset', onClick: onReset },
        ].map(q => (
          <button key={q.label} onClick={q.onClick} style={{
            minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '12px 4px', borderRadius: 14, cursor: 'pointer',
            border: `1px solid ${q.active ? u.accent : u.line}`,
            background: q.active ? u.accent + '14' : u.card,
            color: q.active ? u.accent : u.text,
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
          }}>
            <q.Icon size={18} />
            {q.label}
          </button>
        ))}
      </div>
    </div>
  )
}
