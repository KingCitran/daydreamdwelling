import { useState, useEffect, useMemo } from 'react'

// 15 distinct hand-drawn cumulus silhouettes on a 240×120 viewBox.
// Each is its own composition (varied bump count, asymmetry, scale of bumps).
const CLOUD_PATHS = [
  "M20,92 Q14,76 30,72 Q28,52 52,52 Q56,30 80,38 Q90,18 112,28 Q128,12 148,24 Q164,18 172,38 Q194,38 198,60 Q218,62 220,82 Q222,98 200,98 L28,98 Q14,98 20,92 Z",
  "M14,93 Q10,80 24,78 Q22,62 42,62 Q48,42 72,46 Q78,18 110,18 Q140,16 148,42 Q170,42 176,60 Q198,62 200,80 Q220,82 222,94 Q224,98 208,98 L28,98 Q8,98 14,93 Z",
  "M12,92 Q8,78 22,76 Q24,64 38,64 Q42,52 58,54 Q62,42 80,44 Q86,32 104,36 Q112,22 132,28 Q142,18 158,28 Q172,22 182,38 Q198,38 204,52 Q222,54 226,72 Q230,90 210,94 Q212,98 196,98 L26,98 Q4,98 12,92 Z",
  "M40,93 Q32,80 48,78 Q44,58 70,58 Q66,28 110,24 Q150,22 158,56 Q180,58 184,78 Q200,80 198,92 Q200,98 184,98 L52,98 Q32,98 40,93 Z",
  "M50,90 Q42,76 56,74 Q58,52 84,54 Q92,32 116,38 Q130,32 142,52 Q160,54 162,74 Q172,80 168,90 Q170,98 152,98 L60,98 Q42,98 50,90 Z",
  "M10,90 Q6,76 22,74 Q24,60 42,62 Q48,46 70,50 Q78,38 100,42 Q108,28 128,34 Q140,28 156,40 Q172,38 184,52 Q200,54 208,68 Q224,70 226,84 Q228,98 208,98 L28,98 Q4,98 10,90 Z",
  "M48,94 Q38,80 52,76 Q44,58 64,56 Q56,38 78,34 Q72,16 96,12 Q120,6 138,18 Q156,16 162,38 Q180,42 184,60 Q204,62 206,78 Q220,82 218,92 Q220,98 200,98 L60,98 Q40,98 48,94 Z",
  "M8,92 Q6,82 22,80 Q24,72 38,72 Q42,62 58,64 Q62,56 76,58 Q80,50 96,52 Q102,44 118,48 Q124,42 138,46 Q146,38 160,42 Q172,40 180,52 Q198,54 206,66 Q224,68 226,84 Q228,98 210,98 L26,98 Q4,98 8,92 Z",
  "M16,92 Q12,78 28,76 Q30,66 46,68 Q52,58 68,60 Q72,46 92,48 Q96,30 122,30 Q150,26 162,52 Q186,52 192,72 Q216,72 220,86 Q224,98 204,98 L28,98 Q10,98 16,92 Z",
  "M14,94 Q10,82 24,80 Q26,70 40,70 Q44,56 62,56 Q66,42 86,42 Q92,28 116,28 Q124,16 146,18 Q160,12 172,32 Q190,34 196,52 Q216,56 220,76 Q226,94 206,96 Q208,98 192,98 L28,98 Q8,98 14,94 Z",
  "M30,90 Q22,76 38,72 Q42,52 70,52 Q78,32 110,36 Q140,30 152,54 Q176,56 178,76 Q188,80 184,90 Q186,98 168,98 L42,98 Q22,98 30,90 Z",
  "M10,92 Q6,80 20,78 Q22,68 36,68 Q38,58 50,60 Q54,48 68,50 Q70,38 86,40 Q90,28 104,32 Q108,20 122,24 Q130,12 144,20 Q152,14 164,28 Q176,26 184,40 Q196,38 202,54 Q218,56 222,72 Q228,90 208,94 Q210,98 192,98 L26,98 Q2,98 10,92 Z",
  "M18,92 Q12,80 26,78 Q22,60 50,58 Q56,32 92,30 Q128,28 138,58 Q166,60 172,78 Q186,80 184,92 Q186,98 170,98 L34,98 Q12,98 18,92 Z",
  "M22,93 Q16,80 30,78 Q32,60 54,60 Q60,40 84,42 Q88,14 122,12 Q150,14 154,42 Q176,42 180,60 Q198,62 202,80 Q218,82 220,93 Q222,98 204,98 L34,98 Q14,98 22,93 Z",
  "M12,92 Q8,80 22,78 Q26,68 42,68 Q48,56 64,58 Q70,46 86,48 Q92,38 108,40 Q114,28 132,32 Q140,22 156,30 Q170,28 178,44 Q194,46 200,62 Q220,64 222,80 Q226,96 206,98 L28,98 Q6,98 12,92 Z",
]

function Cloud({ x, y, scale = 1, opacity = 0.95, shape = 0, flip = false }) {
  const path = CLOUD_PATHS[shape % CLOUD_PATHS.length]
  const gid  = `g${shape}-${Math.round(x*10)}-${y}`
  return (
    <div style={{
      position: 'absolute', left: `${x}%`, top: `${y}px`,
      transform: `scale(${scale}) ${flip ? 'scaleX(-1)' : ''}`,
      transformOrigin: 'center',
      opacity, pointerEvents: 'none', willChange: 'transform',
    }}>
      <svg width="240" height="120" viewBox="0 0 240 120" style={{
        filter: 'drop-shadow(0 10px 28px rgba(60,90,140,0.22))',
        overflow: 'visible',
      }}>
        <defs>
          <linearGradient id={`body-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#ffffff"/>
            <stop offset="55%"  stopColor="#f4f8fc"/>
            <stop offset="85%"  stopColor="#cfdef0"/>
            <stop offset="100%" stopColor="#a8c4e0"/>
          </linearGradient>
          <radialGradient id={`hi-${gid}`} cx="0.5" cy="0.25" r="0.6">
            <stop offset="0%"  stopColor="#ffffff" stopOpacity="0.95"/>
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id={`shade-${gid}`} x1="0" y1="0.55" x2="0" y2="1">
            <stop offset="0%"   stopColor="#7fa4c8" stopOpacity="0"/>
            <stop offset="100%" stopColor="#5a7fa8" stopOpacity="0.32"/>
          </linearGradient>
        </defs>
        <path d={path} fill={`url(#body-${gid})`}
          stroke="#3a5878" strokeWidth="1.6" strokeOpacity="0.55"
          strokeLinejoin="round"/>
        <path d={path} fill={`url(#shade-${gid})`}/>
        <ellipse cx="120" cy="40" rx="80" ry="26" fill={`url(#hi-${gid})`}/>
      </svg>
    </div>
  )
}

function Drip({ x, y, size = 8, opacity = 0.85 }) {
  return (
    <div style={{ position: 'absolute', left: `${x}%`, top: `${y}px`, opacity, pointerEvents: 'none' }}>
      <svg width={size*3} height={size*3} viewBox="0 0 30 30"
        style={{ filter: 'drop-shadow(0 4px 8px rgba(60,90,140,0.18))' }}>
        <circle cx="15" cy="15" r="11" fill="#fff" stroke="#3a5878" strokeWidth="1.2" strokeOpacity="0.5"/>
        <circle cx="12" cy="12" r="4.5" fill="#fff" opacity="0.9"/>
        <ellipse cx="15" cy="22" rx="9" ry="3" fill="#cfdef0" opacity="0.7"/>
      </svg>
    </div>
  )
}

export default function CloudField() {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let raf
    const loop = () => { setTick(t => t + 1); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Fixed deterministic cloud field across 4 parallax layers.
  const clouds = useMemo(() => {
    const layers = [
      { count: 50, speed: 0.012, scaleMin: 0.35, scaleMax: 0.7,  opMin: 0.55, opMax: 0.85, yBase: 20,   yRange: 900 },
      { count: 45, speed: 0.028, scaleMin: 0.6,  scaleMax: 1.05, opMin: 0.8,  opMax: 0.98, yBase: 200,  yRange: 1400 },
      { count: 38, speed: 0.05,  scaleMin: 0.85, scaleMax: 1.4,  opMin: 0.9,  opMax: 1.0,  yBase: 600,  yRange: 1800 },
      { count: 26, speed: 0.085, scaleMin: 1.25, scaleMax: 2.1,  opMin: 0.95, opMax: 1.0,  yBase: 1300, yRange: 2200 },
    ]
    const all = []
    layers.forEach((L, li) => {
      for (let i = 0; i < L.count; i++) {
        const seed = li * 1000 + i * 37 + 13
        const r = (n, mod) => ((seed * (n+1) * 7919) % mod) / mod
        all.push({
          xStart:  r(1, 100) * 130 - 15,
          y:       L.yBase + r(2, 100) * L.yRange,
          scale:   L.scaleMin + r(3, 100) * (L.scaleMax - L.scaleMin),
          opacity: L.opMin   + r(4, 100) * (L.opMax - L.opMin),
          shape:   Math.floor(r(5, 100) * CLOUD_PATHS.length),
          flip:    r(6, 100) > 0.5,
          speed:   L.speed * (0.85 + r(7, 100) * 0.3),
        })
      }
    })
    return all
  }, [])

  const drips = useMemo(() => {
    const arr = []
    for (let i = 0; i < 60; i++) {
      const seed = i * 53 + 7
      const r = (n, mod) => ((seed * (n+1) * 7919) % mod) / mod
      arr.push({
        xStart:  r(1, 100) * 130 - 15,
        y:       50 + r(2, 100) * 3500,
        size:    4 + r(3, 100) * 10,
        opacity: 0.5 + r(4, 100) * 0.4,
        speed:   0.02 + r(5, 100) * 0.06,
      })
    }
    return arr
  }, [])

  return (
    <>
      {clouds.map((c, idx) => {
        const x = ((c.xStart + tick * c.speed) % 145) - 20
        return (
          <Cloud key={idx} x={x} y={c.y}
            scale={c.scale} opacity={c.opacity}
            shape={c.shape} flip={c.flip} />
        )
      })}
      {drips.map((d, idx) => {
        const x = ((d.xStart + tick * d.speed) % 140) - 15
        return <Drip key={`d${idx}`} x={x} y={d.y} size={d.size} opacity={d.opacity} />
      })}
    </>
  )
}
