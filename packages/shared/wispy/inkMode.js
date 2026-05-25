// Wispy reads as either light-ink-on-dark or dark-ink-on-light. Picking
// which to use comes down to the background luminance behind her.
//
// Rule from the art handoff README: background luminance < 0.4 → light
// ink (so she has contrast on dark moods); else dark.
//
// Most callers will pass the current theme's `bg` token (hex/rgb/rgba);
// this helper accepts any of those formats.

const LIGHT_INK_LUMINANCE_THRESHOLD = 0.4

/** 'light' if bg is dark enough that light-ink Wispy is needed, else 'dark'. */
export function inkForBg(bgInput) {
  const rgb = parseColor(bgInput)
  if (!rgb) return 'dark'
  return relativeLuminance(rgb) < LIGHT_INK_LUMINANCE_THRESHOLD ? 'light' : 'dark'
}

function parseColor(input) {
  if (!input || typeof input !== 'string') return null
  const s = input.trim()
  // #rgb / #rrggbb / #rrggbbaa
  if (s.startsWith('#')) {
    const hex = s.slice(1)
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      }
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      }
    }
    return null
  }
  // rgb(...) / rgba(...)
  const m = s.match(/^rgba?\s*\(([^)]+)\)$/i)
  if (m) {
    const parts = m[1].split(',').map(p => parseFloat(p.trim()))
    if (parts.length >= 3) return { r: parts[0], g: parts[1], b: parts[2] }
  }
  return null
}

function relativeLuminance({ r, g, b }) {
  // sRGB → relative luminance, ITU-R BT.709 approximation. Good enough
  // for "which ink to use" decisions; not for accessibility-compliant
  // contrast ratios.
  const norm = c => {
    const x = c / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * norm(r) + 0.7152 * norm(g) + 0.0722 * norm(b)
}
