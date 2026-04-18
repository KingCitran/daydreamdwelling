import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import RaindropIcon from '@shared/RaindropIcon'
import RaindropMobile from '../ui/RaindropMobile'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export default function ContestReveal({ entries = [], contest, onClose }) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const audioRef  = useRef(null)
  const cardRefs  = useRef([])
  const confettiP = useRef([])
  const bolts      = useRef([])
  const animRef   = useRef(null)
  const tickRef   = useRef(0)
  const [phase, setPhase] = useState(0)

  const topRaw = entries.slice(0, Math.min(entries.length, 5))
  const maxVotes = Math.max(...topRaw.map(e => e.vote_count), 1)
  const winner = topRaw[0]
  // Reorder so winner is center: [#2, #1(winner), #3, ...]
  const top = topRaw.length >= 3
    ? [topRaw[1], topRaw[0], topRaw[2], ...topRaw.slice(3)]
    : topRaw

  const playThunder = useCallback(() => {
    try {
      const audio = new Audio('/audio/thunder-rumble.mp3')
      audio.loop = true
      const peakVol = Math.min(1, 0.4 + Math.log10(Math.max(maxVotes, 1)) / 6)
      audio.volume = 0
      audio.play().catch(() => {})
      let vol = 0
      let phase = 'in'
      const tick = setInterval(() => {
        if (phase === 'in') {
          vol = Math.min(peakVol, vol + peakVol / 30)
          audio.volume = vol
          if (vol >= peakVol) phase = 'hold'
        } else if (phase === 'out') {
          vol = Math.max(0, vol - peakVol / 120)
          audio.volume = vol
          if (vol <= 0) { clearInterval(tick); audio.pause(); audio.src = '' }
        }
      }, 100)
      audioRef.current = {
        fadeOut: () => { phase = 'out' },
        close: () => { clearInterval(tick); audio.pause(); audio.src = '' },
      }
    } catch { /* audio unsupported */ }
  }, [maxVotes])

  function spawnRainFromCards() {
    cardRefs.current.forEach((el, i) => {
      if (!el || !top[i]) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.bottom
      const count = Math.max(top[i].vote_count * 4, 8)
      for (let j = 0; j < count; j++) {
        raindrops.current.push({
          x: cx + (Math.random() - 0.5) * (rect.width * 0.7),
          y: cy + Math.random() * 20,
          vy: 1.5 + Math.random() * 2.5,
          size: 4 + Math.random() * 5,
          opacity: 0.5 + Math.random() * 0.4,
          maxY: cy + 30 + (top[i].vote_count / maxVotes) * 280,
          sparkle: Math.random() > 0.6,
          delay: Math.random() * 60,
          age: 0,
        })
      }
    })
  }

  function playLightningStrike() {
    const clips = ['/audio/lightning-strike-1.mp3', '/audio/lightning-strike-2.mp3', '/audio/lightning-strike-3.mp3', '/audio/lightning-strike-4.mp3']
    const clip = clips[Math.floor(Math.random() * clips.length)]
    const a = new Audio(clip)
    a.volume = 0.3 + Math.random() * 0.3
    a.play().catch(() => {})
  }

  function spawnLightning() {
    playLightningStrike()
    const intensity = Math.min(1, Math.max(0.3, Math.log10(Math.max(maxVotes, 1)) / 4))
    cardRefs.current.forEach((el, i) => {
      if (!el || !top[i]) return
      const rect = el.getBoundingClientRect()
      const numBolts = i === 0 ? Math.floor(1 + intensity * 2) : (Math.random() < 0.5 ? 1 : 0)
      for (let b = 0; b < numBolts; b++) {
        const points = []
        const startX = rect.left + rect.width * (0.2 + Math.random() * 0.6)
        const startY = rect.bottom
        const boltLen = 60 + intensity * 100 + Math.random() * 60
        let x = startX, y = startY
        points.push({ x, y })
        const segments = 4 + Math.floor(intensity * 3)
        const stepY = boltLen / segments
        for (let s = 0; s < segments; s++) {
          x += (Math.random() - 0.5) * 35
          y += stepY * (0.7 + Math.random() * 0.6)
          points.push({ x, y })
          if (Math.random() < 0.3) {
            const branch = []
            let bx = x, by = y
            for (let j = 0; j < 2; j++) {
              bx += (Math.random() - 0.5) * 25
              by += stepY * 0.5
              branch.push({ x: bx, y: by })
            }
            points.push({ branch })
          }
        }
        bolts.current.push({ points, life: 1, width: 1 + intensity * 1.2, delay: b * 12 + i * 6 })
      }
    })
  }

  function spawnConfetti(cx, cy) {
    const colors = ['#fbbf24', '#f0c060', '#daa520', '#ffd700', '#e8b830', '#fff5cc', '#fffbe6']
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 10
      confettiP.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 6,
        size: 3 + Math.random() * 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 15,
        life: 1,
      })
    }
  }

  // Canvas particle loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const timers = [
      setTimeout(() => setPhase(1), 500),
      // Drumroll begins — lightning fires in waves as it ramps
      setTimeout(() => { setPhase(2); playThunder() }, 2000),
      setTimeout(() => spawnLightning(), 2500),
      setTimeout(() => spawnLightning(), 4000),
      setTimeout(() => spawnLightning(), 5500),
      setTimeout(() => spawnLightning(), 7000),
      setTimeout(() => spawnLightning(), 8000),
      // Pause after drumroll peak
      setTimeout(() => setPhase(3), 9000),
      // Rain drops appear — fade thunder out, fade rain ambient in
      setTimeout(() => {
        setPhase(3.5)
        audioRef.current?.fadeOut?.()
        try {
          const rain = new Audio('/audio/rain-ambient.mp3')
          rain.loop = true
          rain.volume = 0
          rain.play().catch(() => {})
          let rv = 0
          const rFade = setInterval(() => {
            rv = Math.min(0.35, rv + 0.35 / 40)
            rain.volume = rv
            if (rv >= 0.35) clearInterval(rFade)
          }, 100)
          const prevClose = audioRef.current?.close
          audioRef.current = {
            ...audioRef.current,
            close: () => { prevClose?.(); clearInterval(rFade); rain.pause(); rain.src = '' },
          }
        } catch {}
      }, 10200),
      // Winner announcement + confetti
      setTimeout(() => {
        setPhase(4)
        const winIdx = top.findIndex(e => e.id === winner?.id)
        const el = cardRefs.current[winIdx >= 0 ? winIdx : 0]
        if (el) { const r = el.getBoundingClientRect(); spawnConfetti(r.left + r.width / 2, r.top + r.height / 2) }
      }, 12000),
    ]

    function draw() {
      tickRef.current++
      const tick = tickRef.current
      ctx.clearRect(0, 0, w, h)

      // Stars
      for (let i = 0; i < 50; i++) {
        const sx = (i * 137.5) % w, sy = (i * 97.3) % (h * 0.55)
        ctx.fillStyle = `rgba(255,255,255,${0.25 + Math.sin(tick * 0.025 + i * 2) * 0.25})`
        ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill()
      }

      // Confetti
      confettiP.current = confettiP.current.filter(c => c.life > 0)
      confettiP.current.forEach(c => {
        c.x += c.vx; c.y += c.vy; c.vy += 0.15; c.vx *= 0.99
        c.rot += c.rotV; c.life -= 0.004
        ctx.save()
        ctx.translate(c.x, c.y); ctx.rotate(c.rot * Math.PI / 180)
        ctx.globalAlpha = Math.min(c.life, 1)
        ctx.fillStyle = c.color
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
        ctx.restore()
      })

      // Lightning bolts
      bolts.current = bolts.current.filter(b => b.life > 0)
      bolts.current.forEach(bolt => {
        if (bolt.delay > 0) { bolt.delay--; return }
        bolt.life -= 0.04
        const a = bolt.life
        if (a <= 0) return
        // Glow around bolt origin
        if (a > 0.8) {
          const originPt = bolt.points[0]
          if (originPt) {
            const grad = ctx.createRadialGradient(originPt.x, originPt.y, 0, originPt.x, originPt.y, 120)
            grad.addColorStop(0, `rgba(180,190,230,${(a - 0.8) * 0.6})`)
            grad.addColorStop(1, 'transparent')
            ctx.fillStyle = grad
            ctx.fillRect(originPt.x - 120, originPt.y - 60, 240, 180)
          }
        }
        ctx.save()
        ctx.strokeStyle = `rgba(200,210,255,${a})`
        ctx.lineWidth = bolt.width * a
        ctx.shadowColor = `rgba(150,170,255,${a * 0.8})`
        ctx.shadowBlur = 20 * a
        ctx.beginPath()
        let started = false
        for (const pt of bolt.points) {
          if (pt.branch) {
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = `rgba(180,190,255,${a * 0.5})`
            ctx.lineWidth = bolt.width * a * 0.4
            ctx.moveTo(pt.branch[0]?.x ?? 0, pt.branch[0]?.y ?? 0)
            pt.branch.forEach(bp => ctx.lineTo(bp.x, bp.y))
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = `rgba(200,210,255,${a})`
            ctx.lineWidth = bolt.width * a
            started = false
          } else if (!started) {
            ctx.moveTo(pt.x, pt.y)
            started = true
          } else {
            ctx.lineTo(pt.x, pt.y)
          }
        }
        ctx.stroke()
        ctx.restore()
      })

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', resize)
      if (audioRef.current) audioRef.current.close().catch(() => {})
    }
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'linear-gradient(180deg, #080818 0%, #10102a 50%, #0a0a20 100%)', fontFamily: 'system-ui, sans-serif', overflow: 'hidden' }}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />

      {/* Close — always visible */}
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, padding: '8px 18px', borderRadius: 10, background: 'rgba(20,20,50,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(120,120,180,0.25)', color: '#b0b0d0', fontSize: 13, cursor: 'pointer' }}>
        ✕ Close
      </button>

      {/* Title */}
      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center', zIndex: 5, opacity: phase >= 1 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: `${t.accent}99`, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 6 }}>Contest Results</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#ddddf0', margin: 0 }}>{contest?.title}</h1>
      </div>

      {/* Entry cards — cloud-shaped with dangling mobiles */}
      <div style={{ position: 'absolute', top: '12%', left: 0, right: 0, display: 'grid', gridTemplateColumns: `repeat(${top.length}, 280px)`, justifyContent: 'center', gap: 180, zIndex: 2, alignItems: 'start' }}>
        {top.map((entry, i) => {
          const p = entry.profiles
          const tier = p?.designer_tier ?? 0
          const screenshot = entry.community_posts?.screenshot_url
          const isWinner = entry.id === winner?.id && phase >= 3

          return (
            <div key={entry.id} ref={el => cardRefs.current[i] = el} style={{
              width: 280,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1
                ? (isWinner ? 'translateY(0) scale(1.12)' : 'translateY(0) scale(1)')
                : 'translateY(50px) scale(0.9)',
              transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.12}s`,
              zIndex: isWinner ? 5 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* Cloud card */}
              <div style={{ position: 'relative', width: '100%', paddingTop: 40 }}>
                {(() => {
                  const bg = isWinner
                    ? 'rgba(35,30,62,0.92)'
                    : 'rgba(25,23,48,0.88)'
                  const glow = isWinner ? `0 0 30px ${t.accent}18` : '0 0 16px rgba(0,0,0,0.25)'
                  // Cloud bumps — bottom only, fluffy underside
                  // Wide, flat cloud — ellipses not circles
                  const bumps = [
                    // Far outer
                    { left: -90, bottom: -14, w: 110, pt: 44, isBottom: true },
                    { left: 260, bottom: -16, w: 108, pt: 42, isBottom: true },
                    // Outer
                    { left: -50, bottom: -20, w: 120, pt: 48, isBottom: true },
                    { left: 210, bottom: -22, w: 118, pt: 46, isBottom: true },
                    // Main flat bottom row
                    { left: -14, bottom: -26, w: 130, pt: 52, isBottom: true },
                    { left: 60, bottom: -24, w: 126, pt: 50, isBottom: true },
                    { left: 140, bottom: -28, w: 132, pt: 54, isBottom: true },
                  ]
                  return bumps.map((b, bi) => (
                    <div key={bi} style={{
                      position: 'absolute', left: b.left,
                      ...(b.isBottom ? { bottom: b.bottom } : { top: b.top }),
                      width: b.w, paddingTop: b.pt,
                      borderRadius: '50%', background: bg, boxShadow: glow, zIndex: 2,
                    }} />
                  ))
                })()}

                {/* Cloud glow */}
                <div style={{
                  position: 'absolute', top: -40, left: -30, right: -30, bottom: -20,
                  background: isWinner
                    ? `radial-gradient(ellipse at 50% 30%, ${t.accent}15 0%, transparent 55%)`
                    : 'radial-gradient(ellipse at 50% 30%, rgba(140,140,200,0.04) 0%, transparent 55%)',
                  borderRadius: '50%', filter: 'blur(16px)', pointerEvents: 'none',
                }} />

                {/* Cloud body — floats above the flat cloud base */}
                <div style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: '12px 12px 8px 8px',
                  marginBottom: 20,
                  background: isWinner
                    ? 'rgba(35,30,62,0.92)'
                    : 'rgba(25,23,48,0.88)',
                  boxShadow: isWinner
                    ? `0 0 30px ${t.accent}18, 0 8px 32px rgba(0,0,0,0.35)`
                    : '0 8px 32px rgba(0,0,0,0.3)',
                  transition: 'box-shadow 0.5s',
                }}>
                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 3,
                    width: 28, height: 28, borderRadius: '50%',
                    background: entry.id === winner?.id ? t.accent : 'rgba(30,30,60,0.85)',
                    color: entry.id === winner?.id ? '#fff' : 'rgba(180,180,220,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, border: '1.5px solid rgba(120,120,180,0.25)',
                  }}>#{topRaw.indexOf(entry) + 1}</div>

                  {/* Room screenshot — cloud window */}
                  <div style={{
                    margin: '10px 10px 0', borderRadius: '20px 24px 14px 16px',
                    aspectRatio: '16/11', background: '#10102a', overflow: 'hidden', position: 'relative',
                  }}>
                    {screenshot ? (
                      <img src={screenshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 32, opacity: 0.15 }}>✦</span>
                      </div>
                    )}
                    {isWinner && (
                      <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 22, filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.6))' }}>★</div>
                    )}
                  </div>

                  {/* Designer info */}
                  <div style={{ padding: '10px 14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                        background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>
                        {p?.avatar_url
                          ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : (p?.display_name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ddddf0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p?.display_name || 'Dreamer'}
                      </div>
                      {tier > 0 && (
                        <span style={{ fontSize: 9, color: TIER_COLORS[tier], fontWeight: 600 }}>{DESIGNER_TIERS[tier]}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dangling raindrop mobile — falls from within the cloud */}
              {phase >= 3.5 && (
                <div style={{
                  marginTop: 10,
                  position: 'relative',
                  zIndex: 3,
                  opacity: phase >= 3.5 ? 1 : 0,
                  transition: 'opacity 0.6s ease',
                }}>
                  <RaindropMobile
                    count={entry.vote_count}
                    filled
                    accentColor={isWinner ? t.accent : '#8080b0'}
                    size="small"
                    animated
                    maxCount={maxVotes}
                    formation="rain-arc"
                    colorScheme="dreamcloud"
                    seed={i * 7 + 3}
                    hideCount
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Raindrop stats — aligned row */}
      {phase >= 3.5 && (
        <div style={{
          position: 'absolute', bottom: '22%', left: 0, right: 0, zIndex: 10,
          display: 'grid', gridTemplateColumns: `repeat(${top.length}, 280px)`, justifyContent: 'center', gap: 180,
          animation: 'ddd-reveal-up 0.6s ease-out',
        }}>
          {top.map(entry => {
            const isW = entry.id === winner?.id
            return (
              <div key={entry.id} style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <RaindropIcon size={20} filled color={isW ? '#fbbf24' : '#8080b0'} />
                  <span style={{ fontSize: 22, fontWeight: 700, color: isW ? '#fbbf24' : '#c0c0d0' }}>
                    {entry.vote_count.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: '#7070a0', fontWeight: 500 }}>raindrops</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Winner announcement — gold bar with crown */}
      {phase >= 4 && winner && (
        <div style={{
          position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center', zIndex: 10,
          animation: 'ddd-reveal-up 0.8s ease-out',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 20,
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #2a2010 0%, #1a1508 30%, #2a2010 60%, #1a1508 100%)',
            borderRadius: 12,
            border: '1.5px solid rgba(251,191,36,0.4)',
            boxShadow: '0 0 40px rgba(251,191,36,0.15), inset 0 1px 0 rgba(251,191,36,0.2), inset 0 -1px 0 rgba(251,191,36,0.1)',
            justifyContent: 'center',
          }}>
            {/* Crown */}
            <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}>👑</span>
            {/* Name */}
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{winner.profiles?.display_name || 'Dreamer'}</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            {/* Contest title */}
            <span style={{ fontSize: 13, color: '#c0a050', fontWeight: 600 }}>{contest?.title}</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            {/* Winner label */}
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Winner</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            {/* Raindrop count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <RaindropIcon size={16} filled color="#fbbf24" />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>{winner.vote_count.toLocaleString()}</span>
            </div>
            {/* Prize */}
            {contest?.prize_description && (
              <>
                <span style={{ color: '#806830', fontSize: 13 }}>·</span>
                <span style={{ fontSize: 11, color: '#d4a840', fontWeight: 600 }}>✦ {contest.prize_description}</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Audio credit */}
      <div style={{ position: 'absolute', bottom: 8, right: 16, zIndex: 5, fontSize: 9, color: 'rgba(120,120,160,0.5)' }}>
        Thunder: freesound_community via Pixabay · Lightning: danielmcadams, filmscore via Freesound
      </div>

      <style>{`
        @keyframes ddd-reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
