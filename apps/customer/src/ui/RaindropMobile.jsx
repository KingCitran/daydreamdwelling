import RaindropIcon from '@shared/RaindropIcon'
import { COLOR_SCHEMES, MOOD_COLOR_SCHEMES } from './raindropSchemes'

const ANIM_CSS = `
@keyframes ddd-sway-1 { 0%,100% { transform: rotate(-2.5deg) } 50% { transform: rotate(2.5deg) } }
@keyframes ddd-sway-2 { 0%,100% { transform: rotate(2deg) } 50% { transform: rotate(-2deg) } }
@keyframes ddd-sway-3 { 0%,100% { transform: rotate(-1.5deg) } 50% { transform: rotate(3deg) } }
@keyframes ddd-idle-1 { 0%,100% { transform: rotate(-0.6deg) } 50% { transform: rotate(0.6deg) } }
@keyframes ddd-idle-2 { 0%,100% { transform: rotate(0.4deg) } 50% { transform: rotate(-0.5deg) } }
@keyframes ddd-idle-3 { 0%,100% { transform: rotate(-0.3deg) } 50% { transform: rotate(0.7deg) } }
@keyframes ddd-shimmer { 0%,100% { filter: drop-shadow(0 0 2px currentColor) } 50% { filter: drop-shadow(0 0 6px currentColor) } }
@keyframes ddd-silver { 0%,100% { filter: drop-shadow(0 0 3px rgba(180,190,240,0.5)) } 50% { filter: drop-shadow(0 0 10px rgba(200,210,255,0.9)) } }
@keyframes ddd-aurora { 0% { filter: hue-rotate(0deg) drop-shadow(0 0 5px rgba(134,239,172,0.6)) } 50% { filter: hue-rotate(40deg) drop-shadow(0 0 10px rgba(134,200,255,0.8)) } 100% { filter: hue-rotate(0deg) drop-shadow(0 0 5px rgba(134,239,172,0.6)) } }
@keyframes ddd-pearl { 0% { filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(220,200,255,0.6)) } 25% { filter: hue-rotate(25deg) drop-shadow(0 0 10px rgba(255,200,220,0.7)) } 50% { filter: hue-rotate(-15deg) drop-shadow(0 0 12px rgba(200,220,255,0.8)) } 75% { filter: hue-rotate(10deg) drop-shadow(0 0 8px rgba(220,255,220,0.6)) } 100% { filter: hue-rotate(0deg) drop-shadow(0 0 6px rgba(220,200,255,0.6)) } }
@keyframes ddd-drip-in { 0% { opacity:0; transform: translateY(-8px) scale(0.6) } 60% { opacity:1; transform: translateY(3px) scale(1.05) } 100% { opacity:1; transform: translateY(0) scale(1) } }
@keyframes ddd-rain-cycle { 0% { opacity:1; transform: translateY(0) } 70% { opacity:1; transform: translateY(0) } 82% { opacity:0; transform: translateY(12px) } 84% { opacity:0; transform: translateY(-6px) } 96% { opacity:1; transform: translateY(2px) } 100% { opacity:1; transform: translateY(0) } }
@keyframes ddd-flicker { 0%,100% { filter: drop-shadow(0 0 3px rgba(255,255,255,0.7)) brightness(1) } 28% { filter: drop-shadow(0 0 10px rgba(255,255,255,1)) brightness(1.4) } 55% { filter: drop-shadow(0 0 5px rgba(255,255,255,0.85)) brightness(1.1) } 78% { filter: drop-shadow(0 0 8px rgba(255,255,255,1)) brightness(1.3) } }
@keyframes ddd-rainbow { 0% { filter: hue-rotate(0deg) drop-shadow(0 0 8px currentColor) } 50% { filter: hue-rotate(180deg) drop-shadow(0 0 12px currentColor) } 100% { filter: hue-rotate(360deg) drop-shadow(0 0 8px currentColor) } }
/* ROYGBIV cycle: red → orange → yellow → green → blue → indigo → violet → red.
   Apply to a red base color so the rotation lands cleanly on each stop. */
@keyframes ddd-roygbiv {
  0%, 100% { filter: hue-rotate(0deg)   drop-shadow(0 0 8px currentColor) }  /* red */
  14%      { filter: hue-rotate(30deg)  drop-shadow(0 0 10px currentColor) } /* orange */
  28%      { filter: hue-rotate(60deg)  drop-shadow(0 0 9px currentColor) }  /* yellow */
  42%      { filter: hue-rotate(120deg) drop-shadow(0 0 10px currentColor) } /* green */
  57%      { filter: hue-rotate(240deg) drop-shadow(0 0 12px currentColor) } /* blue */
  71%      { filter: hue-rotate(265deg) drop-shadow(0 0 11px currentColor) } /* indigo */
  85%      { filter: hue-rotate(290deg) drop-shadow(0 0 10px currentColor) } /* violet */
}
/* Coal-cool: red ember coal → blush → pale purple-blue → pale blue → back.
   Rotates through magenta/violet side (negative hue) to AVOID green entirely.
   Saturation and brightness shift to keep tones soft/pale during the cool phase. */
@keyframes ddd-coal-cool {
  0%, 100% { filter: hue-rotate(0deg)    saturate(1)   brightness(1)   drop-shadow(0 0 4px currentColor) }
  18%      { filter: hue-rotate(-30deg)  saturate(0.6) brightness(1.3) drop-shadow(0 0 5px rgba(255,200,210,0.6)) }  /* blush */
  38%      { filter: hue-rotate(-90deg)  saturate(0.45) brightness(1.4) drop-shadow(0 0 6px rgba(220,210,255,0.7)) }  /* pale purple-blue */
  52%      { filter: hue-rotate(-130deg) saturate(0.4) brightness(1.5) drop-shadow(0 0 7px rgba(180,210,255,0.8)) }  /* pale blue */
  68%      { filter: hue-rotate(-90deg)  saturate(0.45) brightness(1.4) drop-shadow(0 0 6px rgba(220,210,255,0.7)) }  /* back to pale purple-blue */
  85%      { filter: hue-rotate(-30deg)  saturate(0.6) brightness(1.3) drop-shadow(0 0 5px rgba(255,200,210,0.6)) }  /* back to blush */
}
`

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

// Vote count → rendered drop count.
// Boosted low end so small clouds feel present, slow growth through the
// hundreds and thousands, then linear jumps after 10k so 10k vs 50k entries
// look meaningfully different. Caps at 120 drops around 50k votes.
function scaledDropCount(count, maxCount = 0) {
  if (count <= 0) return 0
  if (maxCount > 0 && maxCount > count) {
    // Legacy relative scaling — only triggered if a caller passes maxCount.
    const ratio = count / maxCount
    return Math.max(15, Math.floor(ratio * 120))
  }
  // 1–20 votes: each vote visible, with a +4 floor so even 1 vote shows ~5 drops.
  if (count <= 20)    return Math.max(5, count + 4)
  // 21–100: linear, 20→24 → 100→49.
  if (count <= 100)   return Math.floor(24 + (count - 20) * 0.32)
  // 100–10,000: slow log growth, 100→48 → 1k→60 → 10k→73.
  // (Only ~25 extra drops over a 100× vote increase — popular but not winners look similar.)
  if (count <= 10000) return Math.floor(48 + Math.log10(count / 100) * 12.5)
  // 10,000+: linear jumps, ~+12 drops per 10k votes. Caps at 120 around 50k.
  return Math.min(120, Math.floor(73 + (count - 10000) * 0.00118))
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

export default function RaindropMobile({ count, filled, accentColor, size = 'normal', animated = false, matchWidth = false, maxCount = 0, formation = 'arc', colorScheme = 'ocean', seed = 0, hideCount = false, isStatic = false }) {
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

          // isStatic skips ALL animations + glow filters (used in dense demo grids).
          // Default: gentle idle sway runs forever. animated=true adds drip-in + rain cycle.
          const anims = []
          if (!isStatic) {
            const idleAnim = `ddd-idle-${(idx % 3) + 1}`
            const idleDur = (8 + r * 6).toFixed(1)
            const idleDelay = (r2 * 5).toFixed(1)
            anims.push(`${idleAnim} ${idleDur}s ease-in-out ${idleDelay}s infinite`)
            if (animated) {
              const swayAnim = `ddd-sway-${(idx % 3) + 1}`
              const dur = (5 + r * 3).toFixed(1)
              const batch = Math.floor(sr(idx + 200) * Math.ceil(numDrops / 2.5))
              const rainDelay = (batch * 0.25).toFixed(2)
              const cycleOffset = sr(idx + 300)
              const cycleDur = (5.5 + cycleOffset * 3.5).toFixed(1)
              const cycleDelay = (parseFloat(rainDelay) + 2 + cycleOffset * 2.5).toFixed(2)
              anims.unshift(`ddd-drip-in 0.7s ease-out ${rainDelay}s both`)
              anims.unshift(`${swayAnim} ${dur}s ease-in-out 0s 3`)
              anims.push(`ddd-rain-cycle ${cycleDur}s ease-in-out ${cycleDelay}s 2`)
            }
          }

          const glowStyle = tier.glow && !isStatic ? { filter: `drop-shadow(0 0 4px ${tier.glow})` } : {}
          // Per-tier anim (e.g., ddd-flicker for ember white sparks). Each drop
          // gets a random delay + duration multiplier so sparks fire sporadically.
          // EXCEPTIONS:
          //   ddd-roygbiv / ddd-rainbow → ROUND: drops within a tier sync together,
          //     but each tier offsets from the previous so the cycle "chases" through
          //     the cluster like a song sung in rounds.
          //   ddd-coal-cool → fully synced within tier (all coals cool together).
          const tierAnimStyle = tier.anim ? (() => {
            const isRound = /ddd-(roygbiv|rainbow)/.test(tier.anim)
            const isCoalCool = /ddd-coal-cool/.test(tier.anim)
            if (isCoalCool) return { animation: tier.anim }
            if (isRound) {
              const cycleDurMatch = tier.anim.match(/(\d+(?:\.\d+)?)s/)
              const cycleDur = cycleDurMatch ? parseFloat(cycleDurMatch[1]) : 18
              // Tier-based phase so each tier is a "round voice" — drops in the
              // tier cycle in unison, but neighboring tiers are offset.
              const tierIdx = tiers.indexOf(tier)
              const phaseRatio = tiers.length > 1 ? tierIdx / tiers.length : 0
              const phase = (-phaseRatio * cycleDur).toFixed(2)
              const phased = tier.anim.replace(/\s+infinite/, ` ${phase}s infinite`)
              return { animation: phased }
            }
            const delay = (sr(idx + 500) * 4.5).toFixed(2)
            const durMult = 0.7 + sr(idx + 600) * 0.9
            const randomized = tier.anim
              .replace(/(\d+(?:\.\d+)?)s/, (_, d) => `${(parseFloat(d) * durMult).toFixed(2)}s`)
              .replace(/\s+infinite/, ` ${delay}s infinite`)
            return { animation: randomized }
          })() : {}

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
              <div style={{ ...glowStyle, ...tierAnimStyle }}>
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
