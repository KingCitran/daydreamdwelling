import RaindropIcon from '@shared/RaindropIcon'

const ANIM_CSS = `
@keyframes ddd-sway-1 { 0%,100% { transform: rotate(-2.5deg) } 50% { transform: rotate(2.5deg) } }
@keyframes ddd-sway-2 { 0%,100% { transform: rotate(2deg) } 50% { transform: rotate(-2deg) } }
@keyframes ddd-sway-3 { 0%,100% { transform: rotate(-1.5deg) } 50% { transform: rotate(3deg) } }
@keyframes ddd-shimmer { 0%,100% { filter: drop-shadow(0 0 2px currentColor) } 50% { filter: drop-shadow(0 0 6px currentColor) } }
@keyframes ddd-silver { 0%,100% { filter: drop-shadow(0 0 3px rgba(180,190,240,0.5)) } 50% { filter: drop-shadow(0 0 10px rgba(200,210,255,0.9)) } }
@keyframes ddd-aurora { 0% { filter: hue-rotate(0deg) drop-shadow(0 0 5px rgba(134,239,172,0.6)) } 50% { filter: hue-rotate(40deg) drop-shadow(0 0 10px rgba(134,200,255,0.8)) } 100% { filter: hue-rotate(0deg) drop-shadow(0 0 5px rgba(134,239,172,0.6)) } }
@keyframes ddd-pearl { 0% { filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(220,200,255,0.6)) } 25% { filter: hue-rotate(25deg) drop-shadow(0 0 10px rgba(255,200,220,0.7)) } 50% { filter: hue-rotate(-15deg) drop-shadow(0 0 12px rgba(200,220,255,0.8)) } 75% { filter: hue-rotate(10deg) drop-shadow(0 0 8px rgba(220,255,220,0.6)) } 100% { filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(220,200,255,0.6)) } }
@keyframes ddd-drip-in { 0% { opacity:0; transform: translateY(-8px) scale(0.6) } 60% { opacity:1; transform: translateY(3px) scale(1.05) } 100% { opacity:1; transform: translateY(0) scale(1) } }
@keyframes ddd-rain-cycle { 0% { opacity:1; transform: translateY(0) } 70% { opacity:1; transform: translateY(0) } 82% { opacity:0; transform: translateY(12px) } 84% { opacity:0; transform: translateY(-6px) } 96% { opacity:1; transform: translateY(2px) } 100% { opacity:1; transform: translateY(0) } }
`

const COLOR_SCHEMES = {
  ocean: [
    { min: 100000, color: '#f0e0ff', glow: 'rgba(220,200,255,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#86efac', glow: 'rgba(134,239,172,0.5)', anim: 'ddd-aurora 4s ease-in-out infinite' },
    { min: 10000,  color: '#d8daf0', glow: 'rgba(200,210,255,0.5)', anim: 'ddd-silver 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#fbbf24', glow: 'rgba(251,191,36,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#f472b6', glow: null, anim: null },
    { min: 250,    color: '#d946ef', glow: null, anim: null },
    { min: 100,    color: '#8b5cf6', glow: null, anim: null },
    { min: 50,     color: '#a78bfa', glow: null, anim: null },
    { min: 20,     color: '#c4b5fd', glow: null, anim: null },
    { min: 10,     color: '#5eead4', glow: null, anim: null },
    { min: 5,      color: '#38bdf8', glow: null, anim: null },
    { min: 0,      color: '#60a5fa', glow: null, anim: null },
  ],
  sunset: [
    { min: 100000, color: '#fef3c7', glow: 'rgba(254,243,199,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#fcd34d', glow: 'rgba(252,211,77,0.5)',  anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 10000,  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#f59e0b', glow: 'rgba(245,158,11,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#f97316', glow: 'rgba(249,115,22,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#ef4444', glow: null, anim: null },
    { min: 250,    color: '#f472b6', glow: null, anim: null },
    { min: 100,    color: '#e879f9', glow: null, anim: null },
    { min: 50,     color: '#c084fc', glow: null, anim: null },
    { min: 20,     color: '#a78bfa', glow: null, anim: null },
    { min: 10,     color: '#818cf8', glow: null, anim: null },
    { min: 5,      color: '#6366f1', glow: null, anim: null },
    { min: 0,      color: '#4f46e5', glow: null, anim: null },
  ],
  northern: [
    { min: 100000, color: '#f0fdf4', glow: 'rgba(240,253,244,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#bbf7d0', glow: 'rgba(187,247,208,0.5)', anim: 'ddd-aurora 4s ease-in-out infinite' },
    { min: 10000,  color: '#86efac', glow: 'rgba(134,239,172,0.5)', anim: 'ddd-aurora 3s ease-in-out infinite' },
    { min: 5000,   color: '#4ade80', glow: 'rgba(74,222,128,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#22d3ee', glow: 'rgba(34,211,238,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#2dd4bf', glow: null, anim: null },
    { min: 250,    color: '#34d399', glow: null, anim: null },
    { min: 100,    color: '#6ee7b7', glow: null, anim: null },
    { min: 50,     color: '#67e8f9', glow: null, anim: null },
    { min: 20,     color: '#7dd3fc', glow: null, anim: null },
    { min: 10,     color: '#93c5fd', glow: null, anim: null },
    { min: 5,      color: '#a5b4fc', glow: null, anim: null },
    { min: 0,      color: '#c4b5fd', glow: null, anim: null },
  ],
  ember: [
    { min: 100000, color: '#fffbeb', glow: 'rgba(255,251,235,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#fde68a', glow: 'rgba(253,230,138,0.5)', anim: 'ddd-shimmer 3s ease-in-out infinite' },
    { min: 10000,  color: '#fbbf24', glow: 'rgba(251,191,36,0.5)',  anim: 'ddd-silver 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#fb923c', glow: 'rgba(251,146,60,0.5)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#f87171', glow: 'rgba(248,113,113,0.4)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#ef4444', glow: null, anim: null },
    { min: 250,    color: '#dc2626', glow: null, anim: null },
    { min: 100,    color: '#b91c1c', glow: null, anim: null },
    { min: 50,     color: '#9a3412', glow: null, anim: null },
    { min: 20,     color: '#78350f', glow: null, anim: null },
    { min: 10,     color: '#713f12', glow: null, anim: null },
    { min: 5,      color: '#854d0e', glow: null, anim: null },
    { min: 0,      color: '#a16207', glow: null, anim: null },
  ],
  dreamcloud: [
    { min: 100000, color: '#fdf2f8', glow: 'rgba(253,242,248,0.6)', anim: 'ddd-pearl 6s ease-in-out infinite' },
    { min: 50000,  color: '#f9a8d4', glow: 'rgba(249,168,212,0.5)', anim: 'ddd-aurora 4s ease-in-out infinite' },
    { min: 10000,  color: '#e879f9', glow: 'rgba(232,121,249,0.5)', anim: 'ddd-silver 2.5s ease-in-out infinite' },
    { min: 5000,   color: '#c084fc', glow: 'rgba(192,132,252,0.4)', anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 1000,   color: '#8b5cf6', glow: 'rgba(139,92,246,0.4)',  anim: 'ddd-shimmer 2.5s ease-in-out infinite' },
    { min: 500,    color: '#7c3aed', glow: null, anim: null },
    { min: 250,    color: '#6366f1', glow: null, anim: null },
    { min: 100,    color: '#3b82f6', glow: null, anim: null },
    { min: 50,     color: '#0ea5e9', glow: null, anim: null },
    { min: 20,     color: '#06b6d4', glow: null, anim: null },
    { min: 10,     color: '#67e8f9', glow: null, anim: null },
    { min: 5,      color: '#a5b4fc', glow: null, anim: null },
    { min: 0,      color: '#c4b5fd', glow: null, anim: null },
  ],
}

function peakTierIndex(tiers, count) {
  for (let i = 0; i < tiers.length; i++) {
    if (count >= tiers[i].min) return i
  }
  return tiers.length - 1
}

function colorForDistance(tiers, dist, peakIdx) {
  const range = tiers.length - 1 - peakIdx
  const idx = peakIdx + Math.floor(dist * range)
  return tiers[Math.min(idx, tiers.length - 1)]
}

function scaledDropCount(count, maxCount = 0) {
  if (count <= 20) return count
  if (maxCount > 0 && maxCount > count) {
    const ratio = count / maxCount
    return Math.max(15, Math.floor(ratio * 120))
  }
  if (count <= 100) return Math.floor(20 + (count - 20) * 0.4)
  if (count <= 1000) return Math.floor(52 + (count - 100) * 0.03)
  return Math.min(120, Math.floor(80 + Math.log10(count / 1000) * 25))
}

function seededRandom(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function positionDrop(idx, numDrops, formation, isSmall, dynW, sr) {
  const t = numDrops <= 1 ? 0.5 : idx / (numDrops - 1)
  const r = sr ? sr(idx) : seededRandom(idx)
  const w = dynW || (isSmall ? 180 : 280)
  const h = isSmall ? 100 : 160

  if (formation === 'arc') {
    const angle = Math.PI * (0.08 + t * 0.84)
    const radius = (w * 0.42) + r * (isSmall ? 12 : 20)
    return { x: w / 2 + Math.cos(angle) * radius, y: Math.sin(angle) * radius, h: Math.max(h, radius + 40) }
  }
  if (formation === 'cascade') {
    const col = idx % (isSmall ? 10 : 14)
    const row = Math.floor(idx / (isSmall ? 10 : 14))
    const rowOffset = row * (isSmall ? 4 : 6)
    return {
      x: (w * 0.08) + col * (w * 0.84 / (isSmall ? 9 : 13)) + r * 4,
      y: rowOffset + r * (isSmall ? 8 : 14),
      h: Math.max(h, (row + 1) * (isSmall ? 22 : 34)),
    }
  }
  if (formation === 'scatter') {
    const r2 = sr ? sr(idx + 50) : seededRandom(idx + 50)
    const angle = t * Math.PI
    const spread = Math.sin(angle)
    return {
      x: w / 2 + (t - 0.5) * w * 0.85 + r * 8,
      y: (1 - spread) * h * 0.6 + r2 * h * 0.35,
      h,
    }
  }
  if (formation === 'curtain') {
    return {
      x: w * 0.06 + t * w * 0.88 + r * 6,
      y: r * (isSmall ? 16 : 28),
      h: isSmall ? 50 : 80,
    }
  }
  if (formation === 'rain-arc') {
    const r2 = sr ? sr(idx + 50) : seededRandom(idx + 50)
    const spreadW = w * 1.3
    const offsetX = (w - spreadW) / 2
    const angle = Math.PI * (0.05 + t * 0.9)
    const arcY = Math.sin(angle) * w * 0.15
    const x = offsetX + r2 * spreadW
    const row = Math.floor(idx / Math.max(6, Math.floor(spreadW / (isSmall ? 20 : 28))))
    return {
      x: x,
      y: arcY + row * (isSmall ? 12 : 20) + r * (isSmall ? 20 : 36),
      h: Math.max(h + 80, (row + 1) * (isSmall ? 40 : 60) + w * 0.15 + 80),
    }
  }
  // default: 'rain'
  const cols = isSmall ? 12 : 16
  const col = idx % cols
  const row = Math.floor(idx / cols)
  return {
    x: w * 0.05 + col * (w * 0.9 / (cols - 1)) + r * 3,
    y: row * (isSmall ? 4 : 6) + r * (isSmall ? 10 : 16),
    h: Math.max(h, (row + 1) * (isSmall ? 20 : 28)),
  }
}

export default function RaindropMobile({ count, filled, accentColor, size = 'normal', animated = false, matchWidth = false, maxCount = 0, formation = 'arc', colorScheme = 'ocean', seed = 0, hideCount = false }) {
  const isSmall = size === 'small'
  const baseDropSize = isSmall ? 9 : 13
  const tiers = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.ocean

  if (count === 0) return null

  const numDrops = scaledDropCount(count, maxCount)
  const peak = peakTierIndex(tiers, count)
  const peakTier = tiers[peak]

  const sizeScale = Math.min(2.2, 1 + Math.log10(Math.max(numDrops, 1) / 20) * 0.5)
  const containerW = Math.round((isSmall ? 180 : 280) * Math.max(1, sizeScale))
  const sr = (i) => seededRandom(i + seed * 1000)
  const positions = Array.from({ length: numDrops }).map((_, idx) => positionDrop(idx, numDrops, formation, isSmall, containerW, sr))
  const containerH = Math.max(...positions.map(p => p.h))

  return (
    <div style={{ display: matchWidth ? 'flex' : 'inline-flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible', width: matchWidth ? '100%' : 'auto' }}>
      <style>{ANIM_CSS}</style>

      <div style={{ position: 'relative', width: containerW, height: containerH }}>
        {positions.map((pos, idx) => {
          const r = sr(idx)
          const r2 = sr(idx + 99)
          const t = numDrops <= 1 ? 0.5 : idx / (numDrops - 1)

          const distFromCenter = Math.abs(t - 0.5) * 2
          const tier = colorForDistance(tiers, distFromCenter, peak)
          const sizeBoost = numDrops > 60 ? 2 : 0
          const dropSize = baseDropSize + sizeBoost + (distFromCenter < 0.15 ? 5 : distFromCenter < 0.3 ? 3 : distFromCenter < 0.5 ? 1 : 0)
          const r3 = sr(idx + 170)
          const longString = r3 < 0.1 ? (isSmall ? 50 : 90) : r3 < 0.3 ? (isSmall ? 20 : 40) : 0
          const stringH = (isSmall ? 6 : 10) + r * (isSmall ? 22 : 40) + longString + pos.y

          const swayAnim = `ddd-sway-${(idx % 3) + 1}`
          const dur = (3 + r * 2).toFixed(1)
          const delay = (r2 * 2).toFixed(1)
          const anims = [`${swayAnim} ${dur}s ease-in-out ${delay}s infinite`]
          if (animated) {
            const batch = Math.floor(sr(idx + 200) * Math.ceil(numDrops / 2.5))
            const rainDelay = (batch * 0.15).toFixed(2)
            const cycleOffset = sr(idx + 300)
            const cycleDur = (2.5 + cycleOffset * 2).toFixed(1)
            const cycleDelay = (parseFloat(rainDelay) + 1 + cycleOffset * 1.5).toFixed(2)
            anims.unshift(`ddd-drip-in 0.5s ease-out ${rainDelay}s both`)
            anims.push(`ddd-rain-cycle ${cycleDur}s ease-in-out ${cycleDelay}s 4`)
          }

          const glowStyle = tier.glow ? { filter: `drop-shadow(0 0 4px ${tier.glow})` } : {}
          const animStyle = tier.anim && distFromCenter < 0.35 ? { animation: tier.anim } : {}

          return (
            <div key={idx} style={{
              position: 'absolute',
              left: pos.x - dropSize / 2,
              top: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              transformOrigin: 'top center',
              animation: anims.join(', '),
            }}>
              <div style={{ width: 1, height: stringH, background: `linear-gradient(to bottom, transparent, ${tier.color}35)` }} />
              <div style={{ ...glowStyle, ...animStyle }}>
                <RaindropIcon size={dropSize} filled={filled} color={tier.color} />
              </div>
            </div>
          )
        })}
      </div>

      {!hideCount && (
        <span style={{ fontSize: isSmall ? 10 : 13, fontWeight: 700, color: peakTier.color, marginTop: 5 }}>
          {count.toLocaleString()} <span style={{ fontWeight: 500, color: accentColor, opacity: 0.7 }}>raindrop{count !== 1 ? 's' : ''}</span>
        </span>
      )}
    </div>
  )
}
