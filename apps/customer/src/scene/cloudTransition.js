// Shared cloud theme transition utilities.
// Used by both CloudField (landing) and CloudConveyorDrift (builder)
// for frame-perfect smooth mood transitions.

// ── Gradient interpolation ──
export function parseStops(grad) {
  const stops = []
  const re = /#([0-9a-f]{6})\s+(\d+)%/gi
  let m
  while ((m = re.exec(grad))) {
    stops.push([
      parseInt(m[1].slice(0, 2), 16),
      parseInt(m[1].slice(2, 4), 16),
      parseInt(m[1].slice(4, 6), 16),
      parseInt(m[2]),
    ])
  }
  return stops
}

export function buildGradient(stops) {
  const parts = stops.map(([r, g, b, s]) =>
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')} ${s}%`
  )
  return `linear-gradient(180deg, ${parts.join(', ')})`
}

export function lerpStops(a, b, t) {
  const n = Math.max(a.length, b.length)
  const out = []
  for (let i = 0; i < n; i++) {
    const sa = a[Math.min(i, a.length - 1)]
    const sb = b[Math.min(i, b.length - 1)]
    out.push([
      Math.round(sa[0] + (sb[0] - sa[0]) * t),
      Math.round(sa[1] + (sb[1] - sa[1]) * t),
      Math.round(sa[2] + (sb[2] - sa[2]) * t),
      Math.round(sa[3] + (sb[3] - sa[3]) * t),
    ])
  }
  return out
}

// ── Shadow interpolation ──
export function parseShadows(filter) {
  const shadows = []
  const re = /drop-shadow\(\s*([0-9.-]+)px\s+([0-9.-]+)px\s+([0-9.-]+)px\s+rgba\(([0-9]+),\s*([0-9]+),\s*([0-9]+),\s*([0-9.]+)\)\s*\)/g
  let m
  while ((m = re.exec(filter))) {
    shadows.push({
      x: parseFloat(m[1]), y: parseFloat(m[2]), blur: parseFloat(m[3]),
      r: parseInt(m[4]), g: parseInt(m[5]), b: parseInt(m[6]), a: parseFloat(m[7]),
    })
  }
  return shadows
}

export function lerpShadows(a, b, t) {
  const n = Math.max(a.length, b.length)
  const parts = []
  for (let i = 0; i < n; i++) {
    const sa = a[i] || { ...b[i], a: 0 }
    const sb = b[i] || { ...a[i], a: 0 }
    const x = lerp(sa.x, sb.x, t).toFixed(0)
    const y = lerp(sa.y, sb.y, t).toFixed(0)
    const bl = lerp(sa.blur, sb.blur, t).toFixed(0)
    const r = Math.round(lerp(sa.r, sb.r, t))
    const g = Math.round(lerp(sa.g, sb.g, t))
    const bb = Math.round(lerp(sa.b, sb.b, t))
    const al = lerp(sa.a, sb.a, t).toFixed(3)
    parts.push(`drop-shadow(${x}px ${y}px ${bl}px rgba(${r},${g},${bb},${al}))`)
  }
  return parts.join(' ') || 'none'
}

// ── Filter interpolation ──
export function parseFilter(f) {
  const out = {}
  const re = /(contrast|brightness|sepia|saturate)\(([0-9.]+)\)/g
  let m
  while ((m = re.exec(f))) out[m[1]] = parseFloat(m[2])
  const hr = /hue-rotate\(([0-9.-]+)deg\)/.exec(f)
  if (hr) out['hue-rotate'] = parseFloat(hr[1])
  return out
}

export function buildFilter(vals) {
  const parts = []
  if (vals.contrast != null) parts.push(`contrast(${vals.contrast.toFixed(2)})`)
  if (vals.brightness != null) parts.push(`brightness(${vals.brightness.toFixed(2)})`)
  if (vals.sepia != null) parts.push(`sepia(${vals.sepia.toFixed(2)})`)
  if (vals.saturate != null) parts.push(`saturate(${vals.saturate.toFixed(2)})`)
  if (vals['hue-rotate'] != null) parts.push(`hue-rotate(${vals['hue-rotate'].toFixed(1)}deg)`)
  return parts.join(' ') || 'none'
}

export function lerpFilter(a, b, t) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const out = {}
  for (const k of keys) {
    const va = a[k] ?? (k === 'contrast' || k === 'brightness' || k === 'saturate' ? 1 : 0)
    const vb = b[k] ?? (k === 'contrast' || k === 'brightness' || k === 'saturate' ? 1 : 0)
    out[k] = lerp(va, vb, t)
  }
  return out
}

export function lerp(a, b, t) { return a + (b - a) * t }

// Ease-in-out curve
export function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

export const DEFAULT_GLOW_MASK = 'linear-gradient(180deg, #fff 0%, #fff 38%, transparent 78%)'
export const TRANSITION_MS = 5000

// ── Pre-parse a MOOD_THEMES dict for fast per-frame lookups ──
export function preParseThemes(themes, neutralTheme) {
  const stops = {}, shadows = {}, shadeF = {}, glowF = {}
  for (const [key, val] of Object.entries(themes)) {
    stops[key] = parseStops(val.tintGradient)
    shadows[key] = parseShadows(val.tintShadow)
    shadeF[key] = parseFilter(val.shadeFilter)
    glowF[key] = parseFilter(val.glowFilter)
  }
  if (neutralTheme) {
    stops['__neutral'] = parseStops(neutralTheme.tintGradient)
    shadows['__neutral'] = parseShadows(neutralTheme.tintShadow)
    shadeF['__neutral'] = parseFilter(neutralTheme.shadeFilter)
    glowF['__neutral'] = parseFilter(neutralTheme.glowFilter)
  }
  return { stops, shadows, shadeF, glowF }
}

// ── Compute interpolated theme values for current frame ──
// Returns null if no transition is active (use current theme as-is).
export function interpolateTheme({
  transActive, transStart, now,
  fromTheme, curTheme,
  fromStops, toStops,
  fromShadows, toShadows,
  fromShadeF, toShadeF,
  fromGlowF, toGlowF,
}) {
  if (!transActive || !fromTheme) return null

  const elapsed = now - transStart
  const t = Math.min(elapsed / TRANSITION_MS, 1)
  const e = easeInOut(t)
  const from = fromTheme
  const cur = curTheme

  const gradient = buildGradient(lerpStops(fromStops, toStops, e))
  const shadow = lerpShadows(fromShadows, toShadows, e)
  const shadeOp = lerp(from.shadeOpacity, cur.shadeOpacity, e)
  const glowOp_raw = lerp(from.glowOpacity, cur.glowOpacity, e)
  const shadeFilter = buildFilter(lerpFilter(fromShadeF, toShadeF, e))
  const glowFilter = buildFilter(lerpFilter(fromGlowF, toGlowF, e))

  const fromMask = from.glowMask || DEFAULT_GLOW_MASK
  const toMask = cur.glowMask || DEFAULT_GLOW_MASK
  let glowOp = glowOp_raw
  let glowMask = toMask
  if (fromMask !== toMask) {
    const maskDip = e < 0.5 ? (1 - e * 2) : (e - 0.5) * 2
    glowOp *= maskDip
    glowMask = e < 0.5 ? fromMask : toMask
  }

  return { gradient, shadow, shadeOp, shadeFilter, glowOp, glowFilter, glowMask, done: t >= 1 }
}
