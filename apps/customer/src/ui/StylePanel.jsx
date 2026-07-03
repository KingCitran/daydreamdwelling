import { useState, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { Icon } from '@shared/ui/Icon'

function useStyles() {
  const t = useTheme()
  return makeStyles(t)
}

const PALETTE = [
  { label: 'Whites',       chips: ['#f7f3ee','#ede8df','#e0d8cc','#d4cab8','#c8bca8','#b8a890'] },
  { label: 'Warm Grays',   chips: ['#e8e4dc','#d0c8bc','#b8b0a4','#9a9288','#7a7268','#5c5450'] },
  { label: 'Cool Grays',   chips: ['#eaeaee','#c8c8d2','#a0a0b0','#80808e','#60606e','#404050'] },
  { label: 'Blues',        chips: ['#d8e4f0','#b0c8e0','#7ca8d0','#4882b8','#2060a0','#0a3878'] },
  { label: 'Greens',       chips: ['#d4ddd0','#adc4a8','#7ea87a','#508050','#305c30','#7a9060'] },
  { label: 'Yellows',      chips: ['#f5e8c0','#e8d090','#d0b060','#b89040','#907020','#c8a848'] },
  { label: 'Terracotta',   chips: ['#f0d8c8','#dca890','#c07858','#a05030','#783020','#d49090'] },
  { label: 'Wood & Earth', chips: ['#e8d8b8','#d4b880','#b89050','#8a6838','#5a4020','#3a2810'] },
]

// ── HSV helpers ────────────────────────────────────────────────
function hsvToHex(h, s, v) {
  s /= 100; v /= 100
  const f = n => {
    const k = (n + h / 60) % 6
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1))
  }
  return '#' + [f(5), f(3), f(1)]
    .map(x => Math.round(255 * x).toString(16).padStart(2, '0'))
    .join('')
}

function hexToHsv(hex) {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min
    let h = 0
    if (d) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break
        case g: h = ((b - r) / d + 2) * 60; break
        case b: h = ((r - g) / d + 4) * 60; break
      }
    }
    return [Math.round(h), max ? Math.round(d / max * 100) : 0, Math.round(max * 100)]
  } catch { return [0, 0, 50] }
}

// ── Gradient color picker (lazy — only mounted when expanded) ──
function GradientPicker({ value, onChange }) {
  const s = useStyles()
  const [hue, setHue] = useState(() => hexToHsv(value)[0])
  const [sat, setSat] = useState(() => hexToHsv(value)[1])
  const [bri, setBri] = useState(() => hexToHsv(value)[2])
  const lastEmitted = useRef(value)

  // Sync when parent changes (undo/redo, palette click).
  // Calling setState during render is the React-approved pattern for derived state —
  // React aborts the current render and immediately re-renders with the new values.
  // The lastEmitted guard prevents a feedback loop when we're the ones who called onChange.
  const prevValue = useRef(value)
  if (value !== prevValue.current && value !== lastEmitted.current) {
    prevValue.current = value
    const [h, sv, b] = hexToHsv(value)
    setHue(h); setSat(sv); setBri(b)
  }

  const gradRef = useRef()
  const hueRef  = useRef()

  const emit = useCallback((h, sv, b) => {
    const hex = hsvToHex(h, sv, b)
    lastEmitted.current = hex
    onChange(hex)
  }, [onChange])

  const pickGrad = useCallback((e) => {
    if (!gradRef.current) return
    const rect = gradRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top)  / rect.height))
    const ns = Math.round(x * 100), nb = Math.round((1 - y) * 100)
    setSat(ns); setBri(nb); emit(hue, ns, nb)
  }, [hue, emit])

  const pickHue = useCallback((e) => {
    if (!hueRef.current) return
    const rect = hueRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    const nh = Math.round(x * 360)
    setHue(nh); emit(nh, sat, bri)
  }, [sat, bri, emit])

  const startDrag = (pickFn) => (e) => {
    pickFn(e.nativeEvent)
    const onMove = (ev) => pickFn(ev)
    const onUp   = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup',   onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup',   onUp)
  }

  return (
    <div style={s.gradWrap}>
      {/* 2D saturation / brightness */}
      <div
        ref={gradRef}
        style={{ ...s.gradArea, background: `hsl(${hue},100%,50%)` }}
        onMouseDown={startDrag(pickGrad)}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,#fff,transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom,transparent,#000)' }} />
        <div style={{
          position: 'absolute', left: `${sat}%`, top: `${100 - bri}%`,
          transform: 'translate(-50%,-50%)',
          width: 12, height: 12, borderRadius: '50%',
          border: '2px solid #fff', boxShadow: '0 0 0 1px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Hue strip */}
      <div
        ref={hueRef}
        style={s.hueStrip}
        onMouseDown={startDrag(pickHue)}
      >
        <div style={{
          position: 'absolute', left: `${hue / 360 * 100}%`, top: -1, bottom: -1,
          width: 8, transform: 'translateX(-50%)',
          borderRadius: 3, border: '2px solid #fff',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          background: `hsl(${hue},100%,50%)`, pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}

// ── Combined palette + optional gradient picker ────────────────
function PaintPalette({ value, onChange }) {
  const s = useStyles()
  const [hexInput, setHexInput]   = useState(value)
  const [showMore, setShowMore]   = useState(false)

  const prevValue = useRef(value)
  if (value !== prevValue.current) {
    prevValue.current = value
    setHexInput(value)
  }

  return (
    <div>
      {PALETTE.map(({ label, chips }) => (
        <div key={label} style={s.row}>
          <span style={s.rowLabel}>{label}</span>
          <div style={s.chips}>
            {chips.map(hex => (
              <button
                key={hex}
                title={hex}
                style={{
                  ...s.chip, background: hex,
                  ...(value.toLowerCase() === hex ? s.chipActive : {}),
                }}
                onClick={() => { setHexInput(hex); onChange(hex) }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Hex + preview */}
      <div style={s.customRow}>
        <div style={{ ...s.preview, background: value }} />
        <input
          type="text" value={hexInput} maxLength={7}
          spellCheck={false} placeholder="#rrggbb"
          onChange={e => {
            const v = e.target.value
            setHexInput(v)
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v)
          }}
          style={s.hexInput}
        />
      </div>

      {/* More Colors toggle */}
      <button style={s.moreBtn} onClick={() => setShowMore(v => !v)}>
        <Icon name={showMore ? 'chevronUp' : 'chevronDown'} size={11} /> {showMore ? 'Fewer Colors' : 'More Colors'}
      </button>

      {/* Gradient picker — only mounted when expanded */}
      {showMore && <GradientPicker value={value} onChange={(hex) => { setHexInput(hex); onChange(hex) }} />}
    </div>
  )
}

// ── Texture presets ────────────────────────────────────────────
const FLOOR_TEXTURES = [
  { label: 'Light Oak',      color: '#d4b880', accent: '#c4a060', pattern: 'wood' },
  { label: 'Dark Walnut',    color: '#5c4033', accent: '#4a3028', pattern: 'wood' },
  { label: 'Honey Maple',    color: '#d4a76a', accent: '#c09050', pattern: 'wood' },
  { label: 'Gray Wash',      color: '#b0a898', accent: '#9a9080', pattern: 'wood' },
  { label: 'White Oak',      color: '#e0d4c0', accent: '#d0c4a8', pattern: 'wood' },
  { label: 'Cream Carpet',   color: '#e8e0d0', accent: '#d8d0c0', pattern: 'carpet' },
  { label: 'Gray Carpet',    color: '#a0a0a0', accent: '#909090', pattern: 'carpet' },
  { label: 'Navy Carpet',    color: '#2a3a5a', accent: '#1a2a4a', pattern: 'carpet' },
  { label: 'Sage Carpet',    color: '#8a9a78', accent: '#7a8a68', pattern: 'carpet' },
  { label: 'White Tile',     color: '#f0f0f0', accent: '#e0e0e0', pattern: 'tile' },
  { label: 'Marble',         color: '#e8e4e0', accent: '#d0c8c0', pattern: 'marble' },
  { label: 'Slate',          color: '#606068', accent: '#505058', pattern: 'tile' },
  { label: 'Terracotta Tile',color: '#c07858', accent: '#a86040', pattern: 'tile' },
  { label: 'Concrete',       color: '#b0b0b0', accent: '#a0a0a0', pattern: 'concrete' },
]

const WALL_TEXTURES = [
  { label: 'Smooth White',   color: '#f0ece6', accent: null, pattern: 'flat' },
  { label: 'Warm Cream',     color: '#ede8df', accent: null, pattern: 'flat' },
  { label: 'Soft Gray',      color: '#d8d8d8', accent: null, pattern: 'flat' },
  { label: 'Sage',           color: '#c0c8b0', accent: null, pattern: 'flat' },
  { label: 'Dusty Blue',     color: '#b0c0d0', accent: null, pattern: 'flat' },
  { label: 'Blush',          color: '#e8ccc4', accent: null, pattern: 'flat' },
  { label: 'White Brick',    color: '#f0ece6', accent: '#e0d8cc', pattern: 'brick' },
  { label: 'Red Brick',      color: '#a04828', accent: '#883820', pattern: 'brick' },
  { label: 'Gray Brick',     color: '#888888', accent: '#787878', pattern: 'brick' },
  { label: 'Shiplap White',  color: '#f0ece6', accent: '#e0d8cc', pattern: 'shiplap' },
  { label: 'Shiplap Gray',   color: '#c0beb8', accent: '#b0aea8', pattern: 'shiplap' },
  { label: 'Beadboard',      color: '#ece8e0', accent: '#dcd4c8', pattern: 'beadboard' },
]

function TexturePresets({ presets, onSelect, selected, selectedTexture }) {
  const t = useTheme()
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{ fontSize: 9, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Presets</span>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
        {presets.map(p => {
          const isActive = selected === p.color && selectedTexture === p.pattern
          return (
            <button
              key={p.label}
              title={p.label}
              onClick={() => onSelect(p.color, p.pattern, p.finish)}
              style={{
                width: 28, height: 28, borderRadius: 4, cursor: 'pointer', padding: 0,
                background: p.pattern === 'wood' ? `repeating-linear-gradient(90deg, ${p.color} 0px, ${p.accent} 3px, ${p.color} 6px)` :
                           p.pattern === 'brick' ? `repeating-linear-gradient(0deg, ${p.color} 0px, ${p.color} 8px, ${p.accent} 8px, ${p.accent} 9px)` :
                           p.pattern === 'carpet' ? `radial-gradient(circle at 50% 50%, ${p.accent} 0.5px, ${p.color} 0.5px)` :
                           p.pattern === 'shiplap' ? `repeating-linear-gradient(0deg, ${p.color} 0px, ${p.color} 6px, ${p.accent} 6px, ${p.accent} 7px)` :
                           p.pattern === 'marble' ? `linear-gradient(135deg, ${p.color} 0%, ${p.accent} 50%, ${p.color} 100%)` :
                           p.pattern === 'concrete' ? `linear-gradient(180deg, ${p.color} 0%, ${p.accent} 100%)` :
                           p.color,
                backgroundSize: p.pattern === 'carpet' ? '3px 3px' : undefined,
                border: isActive ? `2px solid #fff` : `1px solid rgba(0,0,0,0.15)`,
                outline: isActive ? '2px solid rgba(128,128,128,0.6)' : 'none',
                outlineOffset: 1,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Paint finish selector ─────────────────────────────────────
const PAINT_FINISHES = [
  { value: 'flat',      label: 'Flat / Matte' },
  { value: 'eggshell',  label: 'Eggshell' },
  { value: 'satin',     label: 'Satin' },
  { value: 'semiGloss', label: 'Semi-Gloss' },
  { value: 'highGloss', label: 'High-Gloss' },
]

function FinishPicker({ value, onChange }) {
  const t = useTheme()
  return (
    <div style={{ marginBottom: 8 }}>
      <span style={{ fontSize: 9, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Paint Finish</span>
      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
        {PAINT_FINISHES.map(f => (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            style={{
              padding: '4px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer',
              background: value === f.value ? `${t.accent}22` : t.surface,
              border: `1px solid ${value === f.value ? t.accent : t.surfaceBorder}`,
              color: value === f.value ? t.accent : t.text,
              fontWeight: value === f.value ? 600 : 400,
            }}
          >{f.label}</button>
        ))}
      </div>
    </div>
  )
}

// ── StylePanel ─────────────────────────────────────────────────
export default function StylePanel({
  floorColor, wallColor, onFloorColor, onWallColor,
  floorTexture, wallTexture, wallFinish,
  onFloorTexture, onWallTexture, onWallFinish,
  onClearOverrides,
}) {
  const s = useStyles()
  const [target, setTarget] = useState('floor')

  const handleFloorPreset = (color, pattern) => {
    onFloorColor(color)
    onFloorTexture?.(pattern || 'flat')
  }
  const handleWallPreset = (color, pattern, finish) => {
    onWallColor(color)
    onWallTexture?.(pattern || 'flat')
    // Paint presets clear the finish; textured presets clear finish too
    if (pattern === 'flat') onWallFinish?.(finish || 'eggshell')
    else onWallFinish?.(null)
  }
  const handleFloorPaletteChange = (hex) => {
    onFloorColor(hex)
    onFloorTexture?.('flat')
  }
  const handleWallPaletteChange = (hex) => {
    onWallColor(hex)
    onWallTexture?.('flat')
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>
        <p style={s.title}>Room Style</p>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(target === 'floor' ? s.tabActive : {}) }} onClick={() => setTarget('floor')}>
            <Icon name="floor" size={12} /> Floor
          </button>
          <button style={{ ...s.tab, ...(target === 'wall'  ? s.tabActive : {}) }} onClick={() => setTarget('wall') }>
            <Icon name="wall" size={12} /> Walls
          </button>
        </div>
      </div>


      <div style={{ marginTop: 0 }}>
        <TexturePresets
          presets={target === 'floor' ? FLOOR_TEXTURES : WALL_TEXTURES}
          onSelect={target === 'floor' ? handleFloorPreset : handleWallPreset}
          selected={target === 'floor' ? floorColor : wallColor}
          selectedTexture={target === 'floor' ? floorTexture : wallTexture}
        />
        {target === 'wall' && (!wallTexture || wallTexture === 'flat') && (
          <FinishPicker value={wallFinish || 'eggshell'} onChange={v => onWallFinish?.(v)} />
        )}
        {target === 'floor'
          ? <PaintPalette key="floor" value={floorColor} onChange={handleFloorPaletteChange} />
          : <PaintPalette key="wall"  value={wallColor}  onChange={handleWallPaletteChange}  />
        }
      </div>

    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────
function makeStyles(t) {
  const accentTint = `${t.accent}22`
  return {
    panel: {
      position: 'absolute', top: 20, left: 20, width: 248,
      background: t.navBg, border: `1.5px solid ${t.surfaceBorder}`,
      borderRadius: 10, padding: '14px 14px 16px',
      userSelect: 'none', maxHeight: 'calc(100vh - 48px)',
      overflowY: 'auto', scrollbarWidth: 'thin',
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    },
    header:   { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    title:    { margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: t.textSoft },
    tabs:     { display: 'flex', gap: 4 },
    tab: {
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', background: t.surface, color: t.textSoft,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 5, cursor: 'pointer', fontSize: 11,
    },
    tabActive: { background: accentTint, color: t.text, borderColor: t.accent },
    row:      { marginBottom: 5 },
    rowLabel: { display: 'block', fontSize: 9, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 3 },
    chips:    { display: 'flex', gap: 3 },
    chip: {
      flex: 1, height: 22, borderRadius: 3,
      border: '2px solid transparent', cursor: 'pointer', padding: 0,
      transition: 'transform 0.1s',
    },
    chipActive: {
      border: '2px solid #fff', outline: '2px solid rgba(128,128,128,0.6)',
      outlineOffset: 1, transform: 'scale(1.12)', zIndex: 1, position: 'relative',
    },
    customRow: { display: 'flex', gap: 7, marginTop: 8, alignItems: 'center' },
    preview:  { width: 28, height: 28, borderRadius: 5, flexShrink: 0, border: `1px solid ${t.surfaceBorder}` },
    hexInput: {
      flex: 1, background: t.bg, color: t.text,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 4,
      padding: '5px 8px', fontSize: 12, fontFamily: 'monospace',
    },
    moreBtn: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5,
      width: '100%', marginTop: 8, padding: '6px 0',
      background: t.surface, color: t.textSoft,
      border: `1px solid ${t.surfaceBorder}`, borderRadius: 5,
      cursor: 'pointer', fontSize: 11,
    },
    gradWrap: { marginTop: 10 },
    gradArea: {
      position: 'relative', width: '100%', height: 110,
      borderRadius: 5, overflow: 'hidden', cursor: 'crosshair',
    },
    hueStrip: {
      position: 'relative', height: 14, marginTop: 6, borderRadius: 7, cursor: 'crosshair',
      background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)',
    },
  }
}
