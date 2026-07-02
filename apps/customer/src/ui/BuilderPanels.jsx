// BuilderPanels — Claude Design panel contents.
// Each panel renders inside BuilderSheet. All styled with the design's
// ui() token system. These are the CONTENTS, not the shell — BuilderSheet
// handles the container (bottom sheet / side panel).

import { useState, useMemo, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useMoodControl } from '@shared/ThemeProvider'
import { ITEM_CATALOGUE, CATEGORIES } from '../data/items'
// MoonPicker removed — moon randomizes per visit, no user control
import {
  Palette, Hammer, Home, Grid3x3, Layers, ClipboardList,
  Music, Users, User, Bookmark, Bell, Settings,
  Ruler, Camera, Share2, Undo2, ShoppingCart, Plus, Minus,
  Trash2, Heart, Check, Info, Search, Star, Sparkles, ChevronRight
} from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────
function ui(t) {
  return {
    panel: t.panelBg,
    card: t.panelSurface,
    cardHi: t.panelSurface,
    border: t.panelBorder ?? t.surfaceBorder,
    line: t.panelBorder ?? t.surfaceBorder,
    text: t.panelText ?? t.text, soft: t.panelTextSoft ?? t.textSoft, accent: t.accent,
    accentText: t.accentText,
    nav: t.navBg,
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
  { name: 'Cloud',     hex: '#ece7f5', tex: 'flat',    finish: 'eggshell' },
  { name: 'Blush',     hex: '#f0d8d8', tex: 'flat',    finish: 'eggshell' },
  { name: 'Sage',      hex: '#cdd8c4', tex: 'flat',    finish: 'eggshell' },
  { name: 'Sky',       hex: '#cfe0ee', tex: 'flat',    finish: 'eggshell' },
  { name: 'Butter',    hex: '#f2e6c2', tex: 'flat',    finish: 'eggshell' },
  { name: 'Clay',      hex: '#e0c2ad', tex: 'flat',    finish: 'satin' },
  { name: 'Charcoal',  hex: '#3a3a44', tex: 'flat',    finish: 'satin' },
  { name: 'Plum',      hex: '#5a3f63', tex: 'flat',    finish: 'satin' },
  { name: 'Brick',     hex: '#a04828', tex: 'brick',   finish: null },
  { name: 'Wht Brick', hex: '#f0ece6', tex: 'brick',   finish: null },
  { name: 'Shiplap',   hex: '#f0ece6', tex: 'shiplap', finish: null },
  { name: 'Gry Shiplap',hex:'#c0beb8', tex: 'shiplap', finish: null },
]

const FLOOR_PRESETS = [
  { name: 'Oak',        hex: '#c8a878', tex: 'wood' },
  { name: 'Walnut',     hex: '#7c5a3c', tex: 'wood' },
  { name: 'Ash',        hex: '#d8cdb8', tex: 'wood' },
  { name: 'Carpet',     hex: '#c4b9ad', tex: 'carpet' },
  { name: 'Tile',       hex: '#d2d8dc', tex: 'tile' },
  { name: 'Concrete',   hex: '#b0b0b4', tex: 'concrete' },
  { name: 'Terracotta', hex: '#bd7d5c', tex: 'tile' },
  { name: 'Slate',      hex: '#5a6068', tex: 'tile' },
  { name: 'Marble',     hex: '#e8e4e0', tex: 'marble' },
  { name: 'Navy Crpt',  hex: '#2a3a5a', tex: 'carpet' },
  { name: 'Sage Crpt',  hex: '#8a9a78', tex: 'carpet' },
  { name: 'Dark Oak',   hex: '#5c4033', tex: 'wood' },
]

const SHEEN_OPTIONS = [
  { id: 'flat',      label: 'Matte' },
  { id: 'eggshell',  label: 'Eggshell' },
  { id: 'satin',     label: 'Satin' },
  { id: 'semiGloss', label: 'Semi-Gloss' },
  { id: 'highGloss', label: 'High-Gloss' },
]

const MOOD_LIST = [
  { key: 'Golden Hour',      label: 'Golden Hour',      desc: 'Warm amber sunset',           sky: 'linear-gradient(180deg, #5a2540, #e88a3e, #ffe39a)' },
  { key: 'Bright Day',       label: 'Bright Day',       desc: 'Crisp natural light',         sky: 'linear-gradient(180deg, #e0ecf8, #f0f6fc, #fff)' },
  { key: 'Vivid Sunset',     label: 'Vivid Sunset',     desc: 'Magenta sky, gold horizon',   sky: 'linear-gradient(180deg, #1a2a5a, #a8b8d0, #e8a040)' },
  { key: "Ember's Sunrise",  label: "Ember's Sunrise",  desc: 'Bonfire to pastel dawn',      sky: 'linear-gradient(180deg, #130d07, #8a4020, #ffc880)' },
  { key: 'Moonlight',        label: 'Moonlight',        desc: 'Cool blue-silver night',      sky: 'linear-gradient(180deg, #050918, #16203f, #2a3868)' },
  { key: 'Northern Lights',  label: 'Northern Lights',  desc: 'Aurora midnight sky',         sky: 'linear-gradient(180deg, #040814, #0a3040, #01c8ae)' },
  { key: 'Blush Hour',       label: 'Blush Hour',       desc: 'Warm pink morning',           sky: 'linear-gradient(180deg, #ffe2cf, #f4b0c0, #c8b8dc)' },
  { key: 'Coastal Morning',  label: 'Coastal Morning',  desc: 'Cool breezy blue-white',      sky: 'linear-gradient(180deg, #2a5a8c, #a8c4d8, #ffd896)' },
  { key: 'Dream State',      label: 'Dream State',      desc: 'Soft pastel lavender',        sky: 'linear-gradient(180deg, #ffe8d0, #e8c8e0, #a890d4)' },
  { key: 'Neon Nights',      label: 'Neon Nights',      desc: 'Electric neon nightlife',     sky: 'linear-gradient(180deg, #060318, #160e3a, #2a1862)' },
  { key: 'Greenhouse',       label: 'Greenhouse',       desc: 'Sunlight through leaves',     sky: 'linear-gradient(180deg, #6cb87a, #e0e8b0, #fff5d0)' },
  { key: 'Studio',           label: 'Studio',           desc: 'Neutral flat light',          sky: 'linear-gradient(180deg, #e4e7ec, #eef0f3, #f4f5f7)' },
]

// ── Photo Color Matcher ────────────────────────────────────────────
// Upload a photo of your real wall/floor → click to sample a color →
// pick the lighting condition → get a corrected hex for the builder.
const LIGHTING_ADJUSTMENTS = {
  daylight:    { label: 'Daylight (natural)',   r: 0, g: 0, b: 0 },
  warmIndoor:  { label: 'Warm bulbs (2700K)',   r: -18, g: -8, b: 8 },
  coolLed:     { label: 'Cool LED (4000K)',     r: 4, g: 2, b: -6 },
  evening:     { label: 'Evening / dim lamp',   r: -25, g: -12, b: 12 },
  fluorescent: { label: 'Fluorescent / office', r: 4, g: -4, b: -2 },
}

function PhotoColorPicker({ onPickColor, u }) {
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const [imgSrc, setImgSrc] = useState(null)
  const [pickedHex, setPickedHex] = useState(null)
  const [pickedRaw, setPickedRaw] = useState(null)
  const [lighting, setLighting] = useState('daylight')

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImgSrc(reader.result)
    reader.readAsDataURL(file)
    setPickedHex(null); setPickedRaw(null)
  }, [])

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width))
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height))
    const ctx = canvas.getContext('2d')
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    setPickedRaw({ r, g, b })
    applyLighting({ r, g, b }, lighting)
  }, [lighting])

  const applyLighting = useCallback((raw, lit) => {
    if (!raw) return
    const adj = LIGHTING_ADJUSTMENTS[lit] ?? LIGHTING_ADJUSTMENTS.daylight
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)))
    const r = clamp(raw.r + adj.r)
    const g = clamp(raw.g + adj.g)
    const b = clamp(raw.b + adj.b)
    const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
    setPickedHex(hex)
  }, [])

  const handleLightingChange = useCallback((lit) => {
    setLighting(lit)
    if (pickedRaw) applyLighting(pickedRaw, lit)
  }, [pickedRaw, applyLighting])

  // Draw image to canvas when loaded
  const handleImgLoad = useCallback((e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const img = e.target
    const maxW = 300, maxH = 200
    const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 14px', borderRadius: 13, background: u.card, border: `1px solid ${u.line}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Camera size={16} style={{ color: u.accent }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: u.text }}>Match my wall</div>
          <div style={{ fontSize: 11, color: u.soft }}>Snap a photo, tap the colour you want</div>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} />
      <button onClick={() => fileRef.current?.click()} style={{
        padding: '9px 0', borderRadius: 9, border: `1px dashed ${u.line}`, background: 'transparent',
        color: u.soft, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
      }}>
        {imgSrc ? 'Change photo' : 'Upload or take a photo'}
      </button>

      {imgSrc && (
        <>
          {/* Hidden img to measure + draw to canvas */}
          <img src={imgSrc} alt="" onLoad={handleImgLoad} style={{ display: 'none' }} />

          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: '100%', borderRadius: 9, cursor: 'crosshair',
              border: `1px solid ${u.line}`,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Label u={u}>What lighting was the photo taken in?</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Object.entries(LIGHTING_ADJUSTMENTS).map(([key, { label }]) => (
                <label key={key} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
                  borderRadius: 7, cursor: 'pointer', fontSize: 11.5,
                  background: lighting === key ? u.accent + '18' : 'transparent',
                  color: lighting === key ? u.accent : u.soft,
                }}>
                  <input type="radio" name="lighting" value={key} checked={lighting === key}
                    onChange={() => handleLightingChange(key)} style={{ display: 'none' }} />
                  <div style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: `2px solid ${lighting === key ? u.accent : u.line}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {lighting === key && <div style={{ width: 7, height: 7, borderRadius: '50%', background: u.accent }} />}
                  </div>
                  {label}
                </label>
              ))}
            </div>
          </div>

          {pickedHex && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: pickedHex, border: `1px solid ${u.line}`, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: u.text }}>{pickedHex}</div>
                <div style={{ fontSize: 10, color: u.soft }}>Adjusted for {LIGHTING_ADJUSTMENTS[lighting].label.toLowerCase()}</div>
              </div>
              <button onClick={() => onPickColor(pickedHex)} style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: u.accent, color: '#fff', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>Apply</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Style Panel ────────────────────────────────────────────────────
export function DesignStyleContent({
  wallColor, floorColor, onWallColor, onFloorColor,
  floorTexture, wallTexture, wallFinish,
  onFloorTexture, onWallTexture, onWallFinish,
  paintMode, onPaintMode, onClearOverrides,
}) {
  const t = useTheme()
  const u = ui(t)
  const { mood, setMood, moods: moodList } = useMoodControl()
  const [tab, setTab] = useState('wall')
  // Use real mood list from context, fall back to MOOD_LIST for sky gradients
  const skyLookup = Object.fromEntries(MOOD_LIST.map(m => [m.key, m.sky]))
  const presets = tab === 'wall' ? WALL_PRESETS : FLOOR_PRESETS
  const current = tab === 'wall' ? wallColor : floorColor
  const currentTex = tab === 'wall' ? wallTexture : floorTexture

  const handlePreset = (p) => {
    if (tab === 'wall') {
      onWallColor(p.hex)
      onWallTexture?.(p.tex || 'flat')
      if (p.finish !== undefined) onWallFinish?.(p.finish)
      else if (p.tex && p.tex !== 'flat') onWallFinish?.(null)
    } else {
      onFloorColor(p.hex)
      onFloorTexture?.(p.tex || 'flat')
    }
  }

  const handleCustomColor = (hex) => {
    if (tab === 'wall') { onWallColor(hex); onWallTexture?.('flat') }
    else { onFloorColor(hex); onFloorTexture?.('flat') }
  }

  // Texture preview CSS for preset buttons
  const presetBg = (p) => {
    const tx = p.tex || 'flat'
    if (tx === 'wood')     return `repeating-linear-gradient(90deg, ${shade(p.hex, 0.06)} 0 6px, ${shade(p.hex, -0.08)} 6px 12px)`
    if (tx === 'carpet')   return `radial-gradient(circle at 50% 50%, ${shade(p.hex, -0.06)} 0.5px, ${p.hex} 0.5px)`
    if (tx === 'tile')     return `repeating-conic-gradient(${shade(p.hex, 0.04)} 0% 25%, ${shade(p.hex, -0.06)} 0% 50%) 0 0/20px 20px`
    if (tx === 'marble')   return `linear-gradient(135deg, ${shade(p.hex, 0.06)} 0%, ${shade(p.hex, -0.04)} 40%, ${shade(p.hex, 0.08)} 100%)`
    if (tx === 'concrete') return `linear-gradient(180deg, ${shade(p.hex, 0.03)} 0%, ${shade(p.hex, -0.04)} 100%)`
    if (tx === 'brick')    return `repeating-linear-gradient(0deg, ${p.hex} 0px, ${p.hex} 8px, ${shade(p.hex, -0.15)} 8px, ${shade(p.hex, -0.15)} 9px)`
    if (tx === 'shiplap')  return `repeating-linear-gradient(0deg, ${p.hex} 0px, ${p.hex} 7px, ${shade(p.hex, -0.08)} 7px, ${shade(p.hex, -0.08)} 8px)`
    return `linear-gradient(150deg, ${shade(p.hex, 0.1)}, ${shade(p.hex, -0.1)})`
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Seg u={u} value={tab} onChange={setTab} options={[
        { id: 'wall', label: 'Walls', Icon: Palette },
        { id: 'floor', label: 'Floor', Icon: Grid3x3 },
      ]} />

      {/* Fill All / Paint Individual toggle */}
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={() => onPaintMode?.(false)} style={{
          flex: 1, padding: '7px 0', fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
          background: !paintMode ? u.accent + '22' : 'transparent',
          border: `1px solid ${!paintMode ? u.accent : u.line}`,
          color: !paintMode ? u.accent : u.soft, fontFamily: 'inherit',
        }}>Fill All</button>
        <button onClick={() => onPaintMode?.(true)} style={{
          flex: 1, padding: '7px 0', fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
          background: paintMode ? u.accent + '22' : 'transparent',
          border: `1px solid ${paintMode ? u.accent : u.line}`,
          color: paintMode ? u.accent : u.soft, fontFamily: 'inherit',
        }}>Paint Individual</button>
      </div>
      {paintMode && (
        <div style={{ fontSize: 11, color: u.soft, lineHeight: 1.4 }}>
          Click {tab === 'floor' ? 'floor tiles' : 'wall faces'} to paint them.{' '}
          <button onClick={() => onClearOverrides?.(tab)} style={{
            background: 'none', border: 'none', color: u.accent, cursor: 'pointer', fontSize: 11, padding: 0, textDecoration: 'underline', fontFamily: 'inherit',
          }}>Reset all</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Label u={u}>{tab === 'wall' ? 'Wall material' : 'Floor material'}</Label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
          {presets.map(p => {
            const active = current === p.hex && currentTex === (p.tex || 'flat')
            return (
              <button key={p.name} onClick={() => handlePreset(p)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                padding: 5, borderRadius: 13, cursor: 'pointer',
                border: `1px solid ${active ? u.accent : u.line}`,
                background: active ? u.accent + '14' : 'transparent', fontFamily: 'inherit',
              }}>
                <div style={{
                  width: '100%', height: 40, borderRadius: 9,
                  background: presetBg(p),
                  backgroundSize: (p.tex === 'carpet') ? '3px 3px' : undefined,
                  boxShadow: active ? `0 0 0 2px ${u.accent}55` : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
                }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? u.accent : u.soft }}>{p.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Sheen picker — walls only, when using flat/paint texture */}
      {tab === 'wall' && (!wallTexture || wallTexture === 'flat') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Label u={u}>Paint sheen</Label>
          <div style={{ display: 'flex', gap: 4 }}>
            {SHEEN_OPTIONS.map(s => (
              <button key={s.id} onClick={() => onWallFinish?.(s.id)} style={{
                flex: 1, padding: '6px 0', fontSize: 10, fontWeight: 600, borderRadius: 7, cursor: 'pointer',
                background: wallFinish === s.id ? u.accent + '22' : 'transparent',
                border: `1px solid ${wallFinish === s.id ? u.accent : u.line}`,
                color: wallFinish === s.id ? u.accent : u.soft, fontFamily: 'inherit',
              }}>{s.label}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 13, background: u.card, border: `1px solid ${u.line}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: u.text }}>Custom colour</div>
          <div style={{ fontSize: 11.5, color: u.soft }}>Pick any shade with the eyedropper</div>
        </div>
        <input type="color" value={current || '#cccccc'} onChange={e => handleCustomColor(e.target.value)}
          style={{ width: 40, height: 40, borderRadius: 10, border: `1px solid ${u.line}`, background: 'none', cursor: 'pointer', padding: 2 }} />
      </div>

      <PhotoColorPicker onPickColor={handleCustomColor} u={u} />

      <div style={{ height: 1, background: u.line }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <Sparkles size={15} style={{ color: u.accent }} />
          <Label u={u}>Lighting mood</Label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
          {(moodList || MOOD_LIST).map(m => {
            const active = m.key === mood
            const sky = skyLookup[m.key] || 'linear-gradient(180deg, #ddd 0%, #eee 100%)'
            return (
              <button key={m.key} onClick={() => setMood(m.key)} style={{
                display: 'flex', flexDirection: 'column', gap: 4, padding: 4,
                borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: `2px solid ${active ? u.accent : u.line}`,
                background: active ? u.accent + '12' : 'transparent', fontFamily: 'inherit',
              }}>
                <div style={{
                  height: 30, borderRadius: 7, background: sky,
                  border: `1px solid ${u.line}`, position: 'relative', overflow: 'hidden',
                }}>
                  <img src="/clouds/kngvn/cloud-01.webp" alt=""
                    style={{ position: 'absolute', bottom: -3, left: '10%', width: '80%', height: 18, objectFit: 'contain', opacity: 0.4, filter: 'brightness(1.4)' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, color: active ? u.accent : u.text, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.label}</span>
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

export function DesignBuildContent({ onWindow, onDoor, onStairs, ceilingView, onToggleCeiling, showGrid, onToggleGrid, showMeasurements, onToggleMeasurements }) {
  const t = useTheme()
  const u = ui(t)

  const handlePick = (id) => {
    if (id === 'window') onWindow?.()
    else if (id === 'door') onDoor?.()
    else if (id === 'stairs') onStairs?.()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
      <p style={{ margin: 0, fontSize: 13, color: u.soft, lineHeight: 1.5 }}>
        Tap an element, then tap a wall or floor in the room to place it. Drag the edges to resize.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {BUILD_ITEMS.map(b => (
          <button key={b.id} onClick={() => handlePick(b.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            padding: '20px 8px', borderRadius: 15, cursor: 'pointer',
            border: `1px solid ${u.line}`, background: u.card, color: u.text, fontFamily: 'inherit',
            minHeight: 90,
          }}>
            <span style={{
              width: 48, height: 48, borderRadius: 14, background: u.cardHi,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: u.accent,
            }}>
              <b.Icon size={24} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 700 }}>{b.label}</span>
          </button>
        ))}
      </div>

      <div style={{ height: 1, background: u.line }} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {onToggleCeiling && (
          <button onClick={onToggleCeiling} style={{
            flex: 1, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${ceilingView ? u.accent : u.line}`,
            background: ceilingView ? `${u.accent}18` : u.card,
            color: u.text, fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
          }}>{ceilingView ? '▾ Floor' : '▴ Ceiling'}</button>
        )}
        {onToggleGrid && (
          <button onClick={onToggleGrid} style={{
            flex: 1, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${showGrid ? u.accent : u.line}`,
            background: showGrid ? `${u.accent}18` : u.card,
            color: u.text, fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
          }}>▦ Grid {showGrid ? '✓' : ''}</button>
        )}
        {onToggleMeasurements && (
          <button onClick={onToggleMeasurements} style={{
            flex: 1, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${showMeasurements ? u.accent : u.line}`,
            background: showMeasurements ? `${u.accent}18` : u.card,
            color: u.text, fontSize: 11, fontWeight: 600, fontFamily: 'inherit',
          }}>📏 Measure {showMeasurements ? '✓' : ''}</button>
        )}
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
  { id: 'saved', label: 'Saved rooms', Icon: Bookmark, desc: 'Your designs' },
  { id: 'settings', label: 'Settings', Icon: Settings, desc: 'Preferences' },
]
// Account + Alerts share a row (half-width each)
const MORE_HALF_ITEMS = [
  { id: 'account', label: 'Account', Icon: User },
  { id: 'notifications', label: 'Alerts', Icon: Bell, dot: true },
]

export function DesignMoreContent({ railTools, onTool, showMeasurements, onMeasure, onReset, onShare, onScreenshot, cloudsOn, onToggleClouds, onSummonWispy }) {
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
          </button>
        ))}
        {/* Account + Alerts — two small buttons inside one grid cell */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {MORE_HALF_ITEMS.map(h => (
            <button key={h.id} onClick={() => onTool(h.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px',
              borderRadius: 11, cursor: 'pointer',
              border: `1px solid ${u.line}`, background: u.card, color: u.text,
              fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, position: 'relative',
              minWidth: 0,
            }}>
              <h.Icon size={14} style={{ color: u.accent, flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.label}</span>
              {h.dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e8736f', flexShrink: 0, marginLeft: 'auto' }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: u.line }} />
      <Label u={u}>Quick actions</Label>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { Icon: Camera, label: 'Capture', onClick: onScreenshot },
          { Icon: Share2, label: 'Share', onClick: onShare },
          { Icon: Undo2, label: 'Reset', onClick: onReset },
          ...(onToggleClouds ? [{ emoji: cloudsOn ? '⛅' : '◯', label: cloudsOn ? 'Clouds' : 'Clouds', onClick: onToggleClouds, active: cloudsOn }] : []),
          ...(onSummonWispy ? [{ emoji: '☁', label: 'Wispy', onClick: onSummonWispy }] : []),
        ].map(q => (
          <button key={q.label} onClick={q.onClick} style={{
            minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            padding: '12px 4px', borderRadius: 14, cursor: 'pointer',
            border: `1px solid ${q.active ? u.accent : u.line}`,
            background: q.active ? u.accent + '14' : u.card,
            color: q.active ? u.accent : u.text,
            fontFamily: 'inherit', fontSize: 11, fontWeight: 700,
          }}>
            {q.Icon ? <q.Icon size={18} /> : <span style={{ fontSize: 18 }}>{q.emoji}</span>}
            {q.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Shop Content ───────────────────────────────────────────────────
function ShopChip({ active, onClick, children, u }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 13px', borderRadius: 999, whiteSpace: 'nowrap', cursor: 'pointer',
      border: `1px solid ${active ? u.accent : u.line}`,
      background: active ? u.accent : 'transparent',
      color: active ? u.accentText : u.soft,
      fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit',
      transition: 'all .15s', flexShrink: 0,
    }}>{children}</button>
  )
}

function ProductCardDesign({ typeKey, def, u, inRoom, owned, wished, onPlace, onDetail, onWish }) {
  const price = def.sizes?.[0]?.price ?? def.price ?? 0
  const img = def.primaryImageUrl
  return (
    <div style={{ background: u.card, border: `1px solid ${u.line}`, borderRadius: 12, padding: 5, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ position: 'relative', cursor: 'pointer', height: 64, borderRadius: 8, overflow: 'hidden', background: u.cardHi }} onClick={() => onPlace(typeKey)}>
        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '54%', height: '54%', borderRadius: 10, background: def.swatches?.[0]?.hex || def.color || u.accent, boxShadow: '0 6px 14px rgba(0,0,0,0.18)' }} />
          </div>
        )}
        {(inRoom || owned) && <span style={{ position: 'absolute', top: 7, left: 7, fontSize: 9.5, fontWeight: 800, padding: '3px 7px', borderRadius: 999, background: owned ? '#3fb88a' : u.accent, color: '#fff' }}>{owned ? '✓ Owned' : 'In room'}</span>}
        <button onClick={e => { e.stopPropagation(); onWish(typeKey) }} style={{ position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 9, border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.32)', color: wished ? '#ff9ab8' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Heart size={15} fill={wished ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, padding: '0 2px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: u.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{def.label}</span>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: u.accent, flexShrink: 0 }}>{money(price)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: u.soft, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{def.brand}</span>
          {def.rating > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 9.5, fontWeight: 700, color: '#f0b54a' }}><Star size={9} fill="#f0b54a" stroke="#f0b54a" /> {def.rating}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 1 }}>
        <button onClick={() => onPlace(typeKey)} style={{ flex: 1, padding: '7px 10px', borderRadius: 10, border: `1px solid ${u.accent}`, background: u.accent, color: u.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <Plus size={13} /> Place
        </button>
        <button onClick={() => onDetail(typeKey)} style={{ width: 32, flexShrink: 0, borderRadius: 10, border: `1px solid ${u.line}`, background: 'transparent', color: u.soft, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info size={14} />
        </button>
      </div>
    </div>
  )
}

export function DesignShopContent({ catalogue, placedKeys, ownedKeys, wishlist, onPlace, onDetail, onWish }) {
  const t = useTheme()
  const u = ui(t)
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('featured')
  const [searchOpen, setSearchOpen] = useState(false)
  const cols = typeof window !== 'undefined' && window.innerWidth <= 768 ? 2 : window.innerWidth <= 1199 ? 3 : 2
  const cat_ = catalogue || ITEM_CATALOGUE

  const cats = useMemo(() => ['All', ...new Set(Object.values(cat_).map(d => d.category).filter(Boolean))], [cat_])

  const entries = useMemo(() => {
    let keys = Object.keys(cat_).filter(k => {
      const d = cat_[k]; if (!d?.sizes || d.isFloorFinish || d.isWallFinish) return false
      if (cat !== 'All' && d.category !== cat) return false
      if (q && !(d.label || '').toLowerCase().includes(q.toLowerCase()) && !(d.brand || '').toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
    if (sort === 'priceLow') keys.sort((a, b) => (cat_[a].price ?? 0) - (cat_[b].price ?? 0))
    if (sort === 'priceHigh') keys.sort((a, b) => (cat_[b].price ?? 0) - (cat_[a].price ?? 0))
    if (sort === 'rating') keys.sort((a, b) => (cat_[b].rating ?? 0) - (cat_[a].rating ?? 0))
    return keys
  }, [cat_, cat, q, sort])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      <div style={{ display: 'flex', gap: 6, position: 'sticky', top: 0, background: u.panel, paddingTop: 2, paddingBottom: 4, zIndex: 2 }}>
        {searchOpen ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 12, background: u.card, border: `1px solid ${u.accent}` }}>
            <Search size={16} style={{ color: u.soft, flexShrink: 0 }} />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search furniture, sellers…"
              onBlur={() => { if (!q) setSearchOpen(false) }}
              style={{ border: 'none', background: 'transparent', outline: 'none', color: u.text, fontSize: 13.5, fontFamily: 'inherit', width: '100%' }} />
            <button onClick={() => { setQ(''); setSearchOpen(false) }} style={{ background: 'none', border: 'none', color: u.soft, cursor: 'pointer', padding: 0, fontSize: 16 }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setSearchOpen(true)} style={{
            width: 36, height: 36, borderRadius: 10, border: `1px solid ${u.line}`,
            background: u.card, color: u.soft, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Search size={16} />
          </button>
        )}
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ borderRadius: 10, border: `1px solid ${u.line}`, background: u.card, color: u.text, fontSize: 12, fontWeight: 700, padding: '0 8px', fontFamily: 'inherit', cursor: 'pointer' }}>
          <option value="featured">Featured</option>
          <option value="priceLow">Price ↑</option>
          <option value="priceHigh">Price ↓</option>
          <option value="rating">Top rated</option>
        </select>
      </div>
      <div className="ddd-chips" style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, margin: '0 -16px', padding: '0 16px 2px' }}>
        {cats.map(c => <ShopChip key={c} active={cat === c} onClick={() => setCat(c)} u={u}>{c}</ShopChip>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 7 }}>
        {entries.map(k => <ProductCardDesign key={k} typeKey={k} def={cat_[k]} u={u} inRoom={placedKeys?.has?.(k)} owned={ownedKeys?.has?.(k)} wished={wishlist?.has?.(k)} onPlace={onPlace} onDetail={onDetail} onWish={onWish} />)}
      </div>
      {entries.length === 0 && <div style={{ textAlign: 'center', color: u.soft, padding: '30px 0', fontSize: 13 }}>No matches — try another search.</div>}
    </div>
  )
}
