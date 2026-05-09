import { useState, useEffect } from 'react'

// Isometric room scenes that match the look of the actual builder —
// grid walls, grid floor, simple block items. Auto-rotates every 5s.

const SCENES = [
  {
    key: 'morning', label: 'morning study', mood: 'Bright Day', desc: 'sun + linen',
    wall: '#cfc6a8', floor: '#cdb692', grout: '#7e6a40', accent: '#ff9b5c',
    sunOpacity: 0.42, lampGlow: false,
    items: [
      { gx: 0.08, gy: 0.55, w: 0.28, d: 0.10, h: 0.30, color: '#1a3548', dark: '#0e1f30' },
      { gx: 0.42, gy: 0.50, w: 0.10, d: 0.10, h: 0.18, color: '#5a7a4a', dark: '#385030' },
      { gx: 0.62, gy: 0.18, w: 0.18, d: 0.14, h: 0.18, color: '#0e1820', dark: '#080e15' },
    ],
  },
  {
    key: 'golden', label: 'golden living', mood: 'Golden Hour', desc: 'amber + oak',
    wall: '#3d2a14', floor: '#5a3d1e', grout: '#1a0e04', accent: '#ffaa3d',
    sunOpacity: 0.85, lampGlow: true,
    items: [
      { gx: 0.08, gy: 0.55, w: 0.28, d: 0.10, h: 0.30, color: '#6a3a1a', dark: '#3d1f0c' },
      { gx: 0.50, gy: 0.55, w: 0.10, d: 0.10, h: 0.55, color: '#ffaa3d', dark: '#c8801f' },
      { gx: 0.55, gy: 0.20, w: 0.16, d: 0.14, h: 0.16, color: '#2a1a0e', dark: '#1a0e08' },
    ],
  },
  {
    key: 'late', label: 'late bedroom', mood: 'Moonlight', desc: 'cool + still',
    wall: '#1a2440', floor: '#0e1730', grout: '#06091a', accent: '#7090d0',
    sunOpacity: 0.30, lampGlow: true,
    items: [
      { gx: 0.08, gy: 0.50, w: 0.40, d: 0.20, h: 0.18, color: '#2a3658', dark: '#181f3a' },
      { gx: 0.10, gy: 0.55, w: 0.10, d: 0.10, h: 0.22, color: '#a8b8d8', dark: '#5a6a90' },
      { gx: 0.55, gy: 0.50, w: 0.10, d: 0.10, h: 0.30, color: '#3a4868', dark: '#1f2a48' },
    ],
  },
  {
    key: 'kitchen', label: 'kitchen, 7am', mood: 'Cottagecore Dawn', desc: 'pink + sage',
    wall: '#f0d8c8', floor: '#c8a89a', grout: '#8a6058', accent: '#d68070',
    sunOpacity: 0.55, lampGlow: false,
    items: [
      { gx: 0.04, gy: 0.50, w: 0.40, d: 0.14, h: 0.32, color: '#ffffff', dark: '#d0c0b8' },
      { gx: 0.18, gy: 0.55, w: 0.08, d: 0.08, h: 0.45, color: '#d68070', dark: '#9a4838' },
      { gx: 0.58, gy: 0.18, w: 0.14, d: 0.14, h: 0.40, color: '#7a8a5a', dark: '#4a5838' },
    ],
  },
]

function IsoRoom({ scene, size }) {
  const W = size, H = size * 0.86
  const cx = W / 2, cy = H * 0.62
  const fw = W * 0.72, fh = fw * 0.5
  const wallH = H * 0.42

  const top    = { x: cx,        y: cy - fh / 2 }
  const right  = { x: cx + fw/2, y: cy }
  const bottom = { x: cx,        y: cy + fh / 2 }
  const left   = { x: cx - fw/2, y: cy }
  const topUp   = { x: top.x,   y: top.y - wallH }
  const rightUp = { x: right.x, y: right.y - wallH }
  const leftUp  = { x: left.x,  y: left.y - wallH }

  const N = 5
  const lines = []
  // left wall verticals + horizontals
  for (let i = 1; i < N; i++) {
    const f = i / N
    lines.push({ k: 'lw-v', x1: top.x + (left.x - top.x) * f, y1: top.y + (left.y - top.y) * f, x2: topUp.x + (leftUp.x - topUp.x) * f, y2: topUp.y + (leftUp.y - topUp.y) * f })
    lines.push({ k: 'lw-h', x1: top.x + (topUp.x - top.x) * f, y1: top.y + (topUp.y - top.y) * f, x2: left.x + (leftUp.x - left.x) * f, y2: left.y + (leftUp.y - left.y) * f })
    lines.push({ k: 'rw-v', x1: top.x + (right.x - top.x) * f, y1: top.y + (right.y - top.y) * f, x2: topUp.x + (rightUp.x - topUp.x) * f, y2: topUp.y + (rightUp.y - topUp.y) * f })
    lines.push({ k: 'rw-h', x1: top.x + (topUp.x - top.x) * f, y1: top.y + (topUp.y - top.y) * f, x2: right.x + (rightUp.x - right.x) * f, y2: right.y + (rightUp.y - right.y) * f })
    lines.push({ k: 'fl', x1: top.x + (right.x - top.x) * f, y1: top.y + (right.y - top.y) * f, x2: left.x + (bottom.x - left.x) * f, y2: left.y + (bottom.y - left.y) * f })
    lines.push({ k: 'fl', x1: top.x + (left.x - top.x) * f, y1: top.y + (left.y - top.y) * f, x2: right.x + (bottom.x - right.x) * f, y2: right.y + (bottom.y - right.y) * f })
  }

  function isoItem({ gx, gy, w, d, h, color, dark }) {
    const fx = top.x + (right.x - top.x) * gx + (left.x - top.x) * gy
    const fy = top.y + (right.y - top.y) * gx + (left.y - top.y) * gy
    const p1 = { x: fx, y: fy }
    const p2 = { x: fx + (right.x - top.x) * w, y: fy + (right.y - top.y) * w }
    const p3 = { x: p2.x + (left.x - top.x) * d, y: p2.y + (left.y - top.y) * d }
    const p4 = { x: fx + (left.x - top.x) * d, y: fy + (left.y - top.y) * d }
    const lift = h * wallH * 0.5
    const t1 = { x: p1.x, y: p1.y - lift }
    const t2 = { x: p2.x, y: p2.y - lift }
    const t3 = { x: p3.x, y: p3.y - lift }
    const t4 = { x: p4.x, y: p4.y - lift }
    return { p1, p2, p3, p4, t1, t2, t3, t4, color, dark }
  }

  const items = scene.items.map(isoItem)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{
      display: 'block', filter: 'drop-shadow(0 24px 48px rgba(60,80,120,0.25))',
      transition: 'all 0.8s ease',
    }}>
      <defs>
        <radialGradient id={`sun-${scene.key}`} cx="50%" cy="20%" r="80%">
          <stop offset="0%"   stopColor={scene.accent} stopOpacity={scene.sunOpacity}/>
          <stop offset="100%" stopColor={scene.accent} stopOpacity="0"/>
        </radialGradient>
        <linearGradient id={`leftshade-${scene.key}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.18"/>
        </linearGradient>
        <linearGradient id={`rightshade-${scene.key}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.10"/>
        </linearGradient>
        <linearGradient id={`floorshade-${scene.key}`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#000" stopOpacity="0"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.20"/>
        </linearGradient>
      </defs>

      <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${leftUp.x},${leftUp.y} ${topUp.x},${topUp.y}`} fill={scene.wall} />
      <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${leftUp.x},${leftUp.y} ${topUp.x},${topUp.y}`} fill={`url(#sun-${scene.key})`} />
      <polygon points={`${top.x},${top.y} ${left.x},${left.y} ${leftUp.x},${leftUp.y} ${topUp.x},${topUp.y}`} fill={`url(#leftshade-${scene.key})`} />

      <polygon points={`${top.x},${top.y} ${right.x},${right.y} ${rightUp.x},${rightUp.y} ${topUp.x},${topUp.y}`} fill={scene.wall} />
      <polygon points={`${top.x},${top.y} ${right.x},${right.y} ${rightUp.x},${rightUp.y} ${topUp.x},${topUp.y}`} fill={`url(#rightshade-${scene.key})`} />

      <polygon points={`${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`} fill={scene.floor} />
      <polygon points={`${top.x},${top.y} ${right.x},${right.y} ${bottom.x},${bottom.y} ${left.x},${left.y}`} fill={`url(#floorshade-${scene.key})`} />

      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={scene.grout} strokeWidth="0.8"
          opacity={l.k === 'fl' ? 0.7 : 0.55} />
      ))}

      {items.map((it, i) => (
        <g key={i}>
          <polygon points={`${it.t1.x},${it.t1.y} ${it.t2.x},${it.t2.y} ${it.t3.x},${it.t3.y} ${it.t4.x},${it.t4.y}`} fill={it.color} opacity="0.95"/>
          <polygon points={`${it.p2.x},${it.p2.y} ${it.p3.x},${it.p3.y} ${it.t3.x},${it.t3.y} ${it.t2.x},${it.t2.y}`} fill={it.dark} opacity="0.85"/>
          <polygon points={`${it.p1.x},${it.p1.y} ${it.p2.x},${it.p2.y} ${it.t2.x},${it.t2.y} ${it.t1.x},${it.t1.y}`} fill={it.dark} opacity="0.7"/>
        </g>
      ))}

      {scene.lampGlow && (
        <circle cx={cx + fw * 0.18} cy={cy - wallH * 0.15} r={wallH * 0.5} fill={scene.accent} opacity="0.18" />
      )}
    </svg>
  )
}

export default function RotatingRoom({ size = 420, onSceneChange }) {
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      setTransitioning(true)
      setTimeout(() => {
        setIdx(i => (i + 1) % SCENES.length)
        setTransitioning(false)
      }, 350)
    }, 5000)
    return () => clearInterval(id)
  }, [paused])

  const scene = SCENES[idx]
  useEffect(() => { onSceneChange?.(scene) }, [idx])

  return (
    <div style={{ position: 'relative', width: size, height: size * 0.86 + 40 }}>
      <div style={{
        opacity: transitioning ? 0 : 1,
        transform: transitioning ? 'scale(0.96) rotateY(-12deg)' : 'scale(1) rotateY(0)',
        transition: 'opacity 0.35s ease, transform 0.55s cubic-bezier(0.6,0,0.3,1)',
        transformStyle: 'preserve-3d', perspective: '2000px',
      }}>
        <IsoRoom scene={scene} size={size} />
      </div>

      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {SCENES.map((s, i) => (
            <button key={s.key} onClick={() => {
              setTransitioning(true)
              setTimeout(() => { setIdx(i); setTransitioning(false) }, 350)
            }} style={{
              width: i === idx ? 22 : 7, height: 7, borderRadius: 4, border: 'none',
              background: i === idx ? scene.accent : 'rgba(60,80,120,0.25)',
              cursor: 'pointer', padding: 0, transition: 'all 0.4s ease',
            }} aria-label={`Show ${s.label}`} />
          ))}
        </div>
        <button onClick={() => setPaused(p => !p)} style={{
          background: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.9)',
          backdropFilter: 'blur(8px)',
          padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
          fontFamily: "'Outfit', system-ui, sans-serif", fontSize: 10,
          color: '#1a2a48', letterSpacing: '1px',
        }}>
          {paused ? '▶ play' : '⏸︎'}
        </button>
      </div>
    </div>
  )
}
