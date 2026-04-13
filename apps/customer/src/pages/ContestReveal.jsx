import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export default function ContestReveal({ entries = [], contest, onClose }) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const audioRef  = useRef(null)
  const cardRefs  = useRef([])
  const raindrops = useRef([])
  const confettiP = useRef([])
  const animRef   = useRef(null)
  const tickRef   = useRef(0)
  const [phase, setPhase] = useState(0)

  const top = entries.slice(0, Math.min(entries.length, 5))
  const maxVotes = Math.max(...top.map(e => e.vote_count), 1)
  const winner = top[0]

  const playThunder = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioRef.current = ctx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(40, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2)
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 3.5)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1)
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.5)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 4)
      const bufSize = ctx.sampleRate * 0.4
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.08))
      const noise = ctx.createBufferSource()
      const ng = ctx.createGain()
      noise.buffer = buf
      ng.gain.setValueAtTime(0, ctx.currentTime + 2.3)
      ng.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2.5)
      ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5)
      noise.connect(ng).connect(ctx.destination)
      noise.start(ctx.currentTime + 2.3)
    } catch { /* audio unsupported */ }
  }, [])

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

  function spawnConfetti(cx, cy) {
    const colors = [t.accent, '#f0c060', '#70c090', '#9a7aee', '#ff7aa0', '#70a0ff', '#fff']
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
      setTimeout(() => { setPhase(2); playThunder() }, 2000),
      setTimeout(() => spawnRainFromCards(), 2600),
      setTimeout(() => setPhase(3), 5200),
      setTimeout(() => {
        setPhase(4)
        const el = cardRefs.current[0]
        if (el) { const r = el.getBoundingClientRect(); spawnConfetti(r.left + r.width / 2, r.top + r.height / 2) }
      }, 6800),
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

      // Raindrops
      raindrops.current.forEach(drop => {
        drop.age++
        if (drop.age < drop.delay) return
        if (drop.y < drop.maxY) drop.y += drop.vy
        const a = drop.opacity * (drop.y < drop.maxY ? 1 : Math.max(0, 1 - (drop.age - drop.delay) * 0.003))
        if (a <= 0) return

        ctx.save()
        ctx.translate(drop.x, drop.y)
        // Teardrop
        ctx.fillStyle = t.accent
        ctx.globalAlpha = a
        ctx.beginPath()
        ctx.moveTo(0, -drop.size)
        ctx.bezierCurveTo(drop.size * 0.7, -drop.size * 0.2, drop.size * 0.7, drop.size * 0.6, 0, drop.size)
        ctx.bezierCurveTo(-drop.size * 0.7, drop.size * 0.6, -drop.size * 0.7, -drop.size * 0.2, 0, -drop.size)
        ctx.fill()
        // Sparkle
        if (drop.sparkle) {
          ctx.fillStyle = '#fff'
          ctx.globalAlpha = a * 0.85
          const ss = drop.size * 0.35
          ctx.beginPath()
          ctx.moveTo(0, -ss); ctx.lineTo(ss * 0.3, -ss * 0.3); ctx.lineTo(ss, 0)
          ctx.lineTo(ss * 0.3, ss * 0.3); ctx.lineTo(0, ss); ctx.lineTo(-ss * 0.3, ss * 0.3)
          ctx.lineTo(-ss, 0); ctx.lineTo(-ss * 0.3, -ss * 0.3); ctx.closePath(); ctx.fill()
        }
        ctx.restore()
      })

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

      // Lightning flash
      if (phase === 2 && tick > 62 && tick < 67) {
        ctx.fillStyle = 'rgba(180,180,255,0.08)'
        ctx.fillRect(0, 0, w, h)
      }

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

      {/* Entry cards — DOM elements on cloud backgrounds */}
      <div style={{ position: 'absolute', top: '18%', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, padding: '0 20px', zIndex: 2 }}>
        {top.map((entry, i) => {
          const p = entry.profiles
          const tier = p?.designer_tier ?? 0
          const screenshot = entry.community_posts?.screenshot_url
          const isWinner = i === 0 && phase >= 3

          return (
            <div key={entry.id} ref={el => cardRefs.current[i] = el} style={{
              width: Math.min(180, (window.innerWidth - 40) / top.length - 16),
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1
                ? (isWinner ? 'translateY(0) scale(1.12)' : 'translateY(0) scale(1)')
                : 'translateY(50px) scale(0.9)',
              transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.12}s`,
              zIndex: isWinner ? 5 : 1,
            }}>
              {/* Cloud glow */}
              <div style={{
                position: 'absolute', top: -20, left: -20, right: -20, bottom: -20,
                background: isWinner
                  ? `radial-gradient(ellipse at center, ${t.accent}25 0%, transparent 70%)`
                  : 'radial-gradient(ellipse at center, rgba(140,140,200,0.08) 0%, transparent 70%)',
                borderRadius: '50%', filter: 'blur(8px)', pointerEvents: 'none',
              }} />

              {/* Card */}
              <div style={{
                position: 'relative', borderRadius: 16, overflow: 'hidden',
                background: 'rgba(20,20,45,0.75)', backdropFilter: 'blur(16px)',
                border: `1.5px solid ${isWinner ? `${t.accent}60` : 'rgba(120,120,180,0.2)'}`,
                boxShadow: isWinner ? `0 0 30px ${t.accent}30, 0 8px 32px rgba(0,0,0,0.4)` : '0 8px 32px rgba(0,0,0,0.3)',
                transition: 'border-color 0.5s, box-shadow 0.5s',
              }}>
                {/* Rank badge */}
                <div style={{
                  position: 'absolute', top: 8, left: 8, zIndex: 3,
                  width: 26, height: 26, borderRadius: '50%',
                  background: i === 0 ? t.accent : 'rgba(30,30,60,0.8)',
                  color: i === 0 ? '#fff' : 'rgba(180,180,220,0.7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, border: '1px solid rgba(120,120,180,0.2)',
                }}>#{i + 1}</div>

                {/* Room screenshot or placeholder */}
                <div style={{ width: '100%', aspectRatio: '16/11', background: '#12122a', position: 'relative', overflow: 'hidden' }}>
                  {screenshot ? (
                    <img src={screenshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #15153a, #1a1a40)' }}>
                      <span style={{ fontSize: 32, opacity: 0.15 }}>✦</span>
                    </div>
                  )}
                  {/* Winner star overlay */}
                  {isWinner && (
                    <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 20, filter: 'drop-shadow(0 0 6px rgba(255,200,50,0.5))' }}>★</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 12px' }}>
                  {/* Designer name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                      background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, color: '#fff',
                    }}>
                      {p?.avatar_url
                        ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (p?.display_name || '?')[0].toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#ddddf0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p?.display_name || 'Dreamer'}
                      </div>
                      {tier > 0 && (
                        <div style={{ fontSize: 9, color: TIER_COLORS[tier], fontWeight: 600 }}>{DESIGNER_TIERS[tier]}</div>
                      )}
                    </div>
                  </div>
                  {/* Vote count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, fontWeight: 700, color: isWinner ? t.accent : '#b0b0d0' }}>
                    <RaindropIcon size={16} filled color={isWinner ? t.accent : '#8080b0'} />
                    {entry.vote_count}
                    <span style={{ fontSize: 10, fontWeight: 400, color: '#7070a0' }}>raindrops</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Winner announcement */}
      {phase >= 4 && winner && (
        <div style={{
          position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', zIndex: 10,
          animation: 'ddd-reveal-up 0.8s ease-out',
        }}>
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '22px 40px', background: 'rgba(15,15,35,0.85)', backdropFilter: 'blur(16px)',
            borderRadius: 20, border: `1.5px solid ${t.accent}50`,
            boxShadow: `0 0 40px ${t.accent}20`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RaindropIcon size={24} filled color={t.accent} />
              <span style={{ fontSize: 26, fontWeight: 700, color: t.accent }}>{winner.vote_count}</span>
              <span style={{ fontSize: 13, color: '#8080b0' }}>raindrops</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e0e0f0' }}>{winner.profiles?.display_name || 'Dreamer'}</div>
            {contest?.prize_description && (
              <div style={{ fontSize: 12, color: `${t.accent}cc`, fontWeight: 600 }}>✦ {contest.prize_description}</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes ddd-reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
