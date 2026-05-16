import { useEffect, useMemo, useRef } from 'react'
import { useMoodControl } from '@shared/ThemeProvider'
import { shouldDrapeAt, drapeForShape, drapeImgStyle, canDrapeOnCloud, DRAPE_WRAPPER_STYLE } from '../../scene/cloudDrapes'

// Per-mood cloud theming — keep in sync with CloudConveyorPuffs.jsx /
// CloudConveyorDrift.jsx. Only listed moods get the 3-layer themed rendering;
// any other mood renders raw photographic clouds.
const MOOD_THEMES = {
  'Dream State': {
    tintGradient: 'linear-gradient(180deg, #ffe4cf 0%, #ffd1c4 18%, #f0b4c8 40%, #c89cd0 62%, #9579c8 85%, #7a5fb8 100%)',
    tintShadow:   'drop-shadow(0 12px 24px rgba(120,80,180,0.20))',
    shadeOpacity: 0.88,
    shadeFilter:  'contrast(1.45) brightness(1.0)',
    glowOpacity:  0.40,
    glowFilter:   'brightness(1.4) contrast(0.9)',
  },
  'Golden Hour': {
    tintGradient: 'linear-gradient(180deg, #5a2540 0%, #8e3a4a 15%, #d96a40 38%, #f4a25a 60%, #ffd58a 82%, #fff2c8 100%)',
    tintShadow:   'drop-shadow(0 12px 24px rgba(120,40,30,0.25))',
    shadeOpacity: 0.86,
    shadeFilter:  'contrast(1.4) brightness(1.0)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.85) sepia(0.25) saturate(1.3)',
  },
  'Moonlight': {
    tintGradient: 'linear-gradient(180deg, #e8eef8 0%, #c8d4e8 20%, #8898c0 42%, #4a5888 64%, #1f2a50 86%, #0a1230 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(8,12,28,0.55))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.55) brightness(0.92)',
    glowOpacity:  0.28,
    glowFilter:   'brightness(1.25) contrast(0.9) hue-rotate(200deg) saturate(0.55)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 32%, transparent 70%)',
  },
  'Blush Hour': {
    tintGradient: 'linear-gradient(180deg, #fff5f0 0%, #ffd6e0 18%, #f8a8c4 40%, #e87aa0 62%, #b8487a 85%, #7a2858 100%)',
    tintShadow:   'drop-shadow(0 14px 28px rgba(180,72,122,0.28))',
    shadeOpacity: 0.82,
    shadeFilter:  'contrast(1.25) brightness(1.05)',
    glowOpacity:  0.48,
    glowFilter:   'brightness(1.45) contrast(0.85) saturate(1.15)',
  },
  'Coastal Morning': {
    // Inverted: sun rising at horizon, lower-contrast fresh-morning lighting.
    // Cool steel-blue crown → pewter mid → warm peach underbelly.
    tintGradient: 'linear-gradient(180deg, #6a7a96 0%, #8294ac 20%, #b8b8b8 42%, #d8c4b0 62%, #e8b894 80%, #f0a878 92%, #f4b888 100%)',
    tintShadow:   'drop-shadow(0 -3px 14px rgba(255,180,90,0.30)) drop-shadow(0 12px 22px rgba(40,70,110,0.35))',
    shadeOpacity: 0.62,
    shadeFilter:  'contrast(1.15) brightness(1.08)',
    glowOpacity:  0.50,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.22) saturate(1.15) hue-rotate(-4deg)',
    glowMask:     'linear-gradient(180deg, transparent 30%, #fff 70%, #fff 100%)',
  },
  'Greenhouse': {
    // Dappled glasshouse light — sun through glass roof onto cream-green clouds.
    tintGradient: 'linear-gradient(180deg, #fffaee 0%, #f8f0d8 15%, #ece6c8 35%, #d6e0b8 60%, #b8c8a0 80%, #8eaf7a 100%)',
    tintShadow:   'drop-shadow(0 10px 22px rgba(120,160,90,0.30)) drop-shadow(0 4px 14px rgba(255,240,180,0.32))',
    shadeOpacity: 0.78,
    shadeFilter:  'contrast(1.30) brightness(1.02)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.5) contrast(0.9) sepia(0.18) saturate(1.15)',
  },
  'Neon Nights': {
    // Purple cloud bodies LIT BY EXTERNAL NEON — magenta from above, cyan from
    // below. Stacked colored drop-shadows paint light spill into the surrounding
    // sky so each cloud has its own magenta/cyan aura.
    tintGradient: 'linear-gradient(172deg, #ff7ae0 0%, #e060d8 10%, #b048d4 22%, #7a3ec0 38%, #4e2ca0 54%, #2e1c70 70%, #161250 84%, #0a0a32 94%, #1a2470 100%)',
    tintShadow:   'drop-shadow(0 -8px 22px rgba(255,80,220,0.70)) drop-shadow(0 -5px 55px rgba(255,40,180,0.45)) drop-shadow(0 14px 32px rgba(80,160,255,0.55)) drop-shadow(0 6px 75px rgba(80,140,255,0.38)) drop-shadow(0 0 90px rgba(180,40,220,0.32))',
    shadeOpacity: 0.75,
    shadeFilter:  'contrast(1.4) brightness(0.95)',
    glowOpacity:  0.60,
    glowFilter:   'brightness(1.5) contrast(0.9) saturate(1.7) hue-rotate(280deg)',
    glowMask:     'linear-gradient(180deg, #fff 0%, #fff 30%, transparent 70%)',
  },
  'Vivid Sunset': {
    // Inverted: sun below horizon, clouds carry the saturation. Glow mask flipped
    // so the screened highlight lights the underbelly. Warmer-amber rim instead
    // of canary yellow; upward bloom reduced.
    tintGradient: 'linear-gradient(180deg, #1c2858 0%, #4a3878 20%, #8a3878 36%, #d83078 52%, #ff5a78 66%, #ff7a48 78%, #f59428 87%, #e8902c 94%, #d88838 100%)',
    tintShadow:   'drop-shadow(0 -2px 9px rgba(255,140,90,0.28)) drop-shadow(0 14px 24px rgba(20,28,80,0.45))',
    shadeOpacity: 0.50,
    shadeFilter:  'contrast(1.3) brightness(1.1)',
    glowOpacity:  0.55,
    glowFilter:   'brightness(1.4) contrast(0.85) sepia(0.30) saturate(1.3) hue-rotate(-8deg)',
    glowMask:     'linear-gradient(180deg, transparent 35%, #fff 75%, #fff 100%)',
  },
}
const DEFAULT_GLOW_MASK = 'linear-gradient(180deg, #fff 0%, #fff 38%, transparent 78%)'


const CLOUD_COUNT = 150
const EXCLUDED = new Set([37, 49, 51, 59, 68, 104])
const CLOUD_POOL = Array.from({ length: CLOUD_COUNT }, (_, i) => i + 1).filter(n => !EXCLUDED.has(n))

function rand(min, max) { return min + Math.random() * (max - min) }
function pickCloud() { return CLOUD_POOL[Math.floor(Math.random() * CLOUD_POOL.length)] }
function pad(n) { return String(n).padStart(3, '0') }

export default function CloudField() {
  const containerRef = useRef(null)
  const cloudsRef = useRef([])
  const { mood } = useMoodControl()
  const theme = MOOD_THEMES[mood]
  const isThemed = !!theme

  const clouds = useMemo(() => {
    const layers = [
      { count: 55, speed: [0.003, 0.008], scale: [0.45, 0.95], opacity: [0.50, 0.80], yBase: -40,  yRange: 1100 },
      { count: 50, speed: [0.007, 0.016], scale: [0.85, 1.55], opacity: [0.75, 0.95], yBase: 100,  yRange: 1500 },
      { count: 42, speed: [0.014, 0.028], scale: [1.30, 2.20], opacity: [0.88, 1.00], yBase: 500,  yRange: 1900 },
      { count: 28, speed: [0.024, 0.044], scale: [2.00, 3.20], opacity: [0.95, 1.00], yBase: 1200, yRange: 2400 },
      { count: 10, speed: [0.030, 0.055], scale: [3.50, 4.80], opacity: [0.98, 1.00], yBase: 1800, yRange: 2200 },
    ]
    const all = []
    layers.forEach((L) => {
      for (let i = 0; i < L.count; i++) {
        all.push({
          xStart:  rand(-25, 130),
          y:       L.yBase + Math.random() * L.yRange,
          yDrift:  rand(-12, 12),
          yPhase:  rand(0, Math.PI * 2),
          yFreq:   rand(0.0003, 0.0009),
          scale:   rand(L.scale[0], L.scale[1]),
          opacity: rand(L.opacity[0], L.opacity[1]),
          shape:   pickCloud(),
          flip:    Math.random() > 0.5,
          speed:   rand(L.speed[0], L.speed[1]),
        })
      }
    })
    return all
  }, [])

  useEffect(() => {
    let raf
    let tick = 0
    const animate = () => {
      tick += 1
      const nodes = cloudsRef.current
      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i]
        const node = nodes[i]
        if (!node) continue
        const xRaw = c.xStart + tick * c.speed
        const x = ((xRaw % 160) + 160) % 160 - 30
        const yOff = Math.sin(c.yPhase + tick * c.yFreq) * c.yDrift
        node.style.transform =
          `translate3d(${x}vw, ${c.y + yOff}px, 0) scale(${c.scale})${c.flip ? ' scaleX(-1)' : ''}`
        // CSS var for drape counter-scale (uniform on-screen drape size).
        node.style.setProperty('--cs', String(c.scale))
      }
      raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [clouds])

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {clouds.map((c, idx) => {
        const num = pad(c.shape)
        const url = `url("/clouds/cloud-${num}.webp")`
        const layer = { position: 'absolute', inset: 0, backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain', userSelect: 'none' }

        if (!isThemed) {
          // Raw photographic — natural look for non-themed moods.
          return (
            <img
              key={idx}
              ref={el => { cloudsRef.current[idx] = el }}
              src={`/clouds/cloud-${num}.webp`}
              alt=""
              decoding="async"
              draggable={false}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: 240,
                height: 'auto',
                opacity: c.opacity,
                transformOrigin: 'center center',
                willChange: 'transform',
                filter: 'drop-shadow(0 10px 28px rgba(60,90,140,0.22))',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
          )
        }

        // Themed mood: 3-layer rendering.
        return (
          <div
            key={idx}
            ref={el => { cloudsRef.current[idx] = el }}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 240,
              aspectRatio: '3 / 2',
              opacity: c.opacity,
              transformOrigin: 'center center',
              willChange: 'transform',
              userSelect: 'none',
              pointerEvents: 'none',
              isolation: 'isolate',
            }}
          >
            {/* Drape rendered FIRST so cloud body layers below cover its top */}
            {mood === 'Greenhouse' && shouldDrapeAt(c.shape, c.y, 900) && (() => {
              const file = drapeForShape(c.shape)
              if (!canDrapeOnCloud(file, c.shape)) return null
              return (
                <div style={DRAPE_WRAPPER_STYLE}>
                  <img src={`/${file}`} alt="" style={drapeImgStyle(file)} draggable={false} />
                </div>
              )
            })()}
            <div style={{
              ...layer,
              WebkitMaskImage: url, maskImage: url,
              WebkitMaskSize: 'contain', maskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center', maskPosition: 'center',
              background: theme.tintGradient,
              filter: theme.tintShadow,
            }} />
            <div style={{
              ...layer,
              backgroundImage: url,
              mixBlendMode: 'multiply',
              opacity: theme.shadeOpacity,
              filter: theme.shadeFilter,
            }} />
            <div style={{
              ...layer,
              backgroundImage: url,
              mixBlendMode: 'screen',
              opacity: theme.glowOpacity,
              filter: theme.glowFilter,
              WebkitMaskImage: theme.glowMask || DEFAULT_GLOW_MASK,
              maskImage: theme.glowMask || DEFAULT_GLOW_MASK,
            }} />
          </div>
        )
      })}
    </div>
  )
}
