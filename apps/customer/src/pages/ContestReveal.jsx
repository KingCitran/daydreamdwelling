import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

/**
 * Contest Reveal Animation — the TikTok moment.
 *
 * Sequence:
 * 1. Fade in — dark sky with subtle cloud bg
 * 2. Cloud cards zoom into position (top entries on their own clouds)
 * 3. Thunder drum roll builds (Web Audio API)
 * 4. Raindrops fall from each cloud — rain length = vote count
 * 5. Camera zooms to winner — glow + scale up
 * 6. Confetti burst + trophy animation
 *
 * Props:
 *   entries — sorted contest_entries with profiles joined
 *   contest — the contest object
 *   onClose — exit the reveal
 */
export default function ContestReveal({ entries = [], contest, onClose }) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const audioCtx  = useRef(null)
  const [phase, setPhase] = useState(0) // 0=intro, 1=clouds, 2=rain, 3=winner, 4=confetti
  const [showUI, setShowUI] = useState(false)
  const raindrops = useRef([])
  const confetti  = useRef([])
  const animRef   = useRef(null)

  const top = entries.slice(0, Math.min(entries.length, 5))
  const maxVotes = Math.max(...top.map(e => e.vote_count), 1)
  const winner = top[0]

  // Thunder sound using Web Audio API
  const playThunder = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      audioCtx.current = ctx

      // Rumbling bass oscillator
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(40, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 2)
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 3.5)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 2.5)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 4)
      osc.connect(gain).connect(ctx.destination)
      osc.start(); osc.stop(ctx.currentTime + 4)

      // Noise burst for thunder crack
      const bufSize = ctx.sampleRate * 0.5
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.1))
      const noise = ctx.createBufferSource()
      const noiseGain = ctx.createGain()
      noise.buffer = buf
      noiseGain.gain.setValueAtTime(0, ctx.currentTime + 2.3)
      noiseGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 2.5)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5)
      noise.connect(noiseGain).connect(ctx.destination)
      noise.start(ctx.currentTime + 2.3)
    } catch { /* audio not supported */ }
  }, [])

  // Spawn raindrops for an entry
  function spawnRain(entryIdx, voteCount, startX, cloudY) {
    const drops = []
    const count = Math.max(voteCount * 3, 5) // More visual drops than votes
    for (let i = 0; i < count; i++) {
      drops.push({
        x: startX + (Math.random() - 0.5) * 100,
        y: cloudY + 40,
        vy: 2 + Math.random() * 3,
        size: 3 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.5,
        maxY: cloudY + 60 + (voteCount / maxVotes) * 300,
        entryIdx,
        sparkle: Math.random() > 0.7,
      })
    }
    raindrops.current.push(...drops)
  }

  // Spawn confetti
  function spawnConfetti(cx, cy) {
    const colors = [t.accent, '#f0c060', '#70c090', '#9a7aee', '#ff7aa0', '#70a0ff', '#fff']
    for (let i = 0; i < 120; i++) {
      const angle = (Math.random() * Math.PI * 2)
      const speed = 3 + Math.random() * 8
      confetti.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 15,
        life: 1,
      })
    }
  }

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    let tick = 0

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)

    // Cloud positions for top entries
    const spacing = Math.min(w / (top.length + 1), 240)
    const startX = (w - spacing * (top.length - 1)) / 2
    const cloudY = h * 0.28

    // Phase timing
    const phaseTimers = [
      setTimeout(() => setPhase(1), 800),   // clouds appear
      setTimeout(() => { setPhase(2); playThunder() }, 2200), // rain starts
      setTimeout(() => {
        top.forEach((entry, i) => spawnRain(i, entry.vote_count, startX + i * spacing, cloudY))
      }, 2800),
      setTimeout(() => setPhase(3), 5500),   // winner highlight
      setTimeout(() => {
        setPhase(4)
        spawnConfetti(startX + 0 * spacing, cloudY - 40) // confetti from winner cloud
        setShowUI(true)
      }, 7000),
    ]

    function draw() {
      tick++
      ctx.clearRect(0, 0, w, h)

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
      skyGrad.addColorStop(0, '#0a0a1a')
      skyGrad.addColorStop(0.5, '#151530')
      skyGrad.addColorStop(1, '#0f0f2a')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      // Subtle star twinkle
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137.5) % w)
        const sy = ((i * 97.3) % (h * 0.6))
        const blink = 0.3 + Math.sin(tick * 0.03 + i) * 0.3
        ctx.fillStyle = `rgba(255,255,255,${blink})`
        ctx.beginPath()
        ctx.arc(sx, sy, 1, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw clouds + entry info
      top.forEach((entry, i) => {
        const cx = startX + i * spacing
        const cy = cloudY
        const isWinner = i === 0 && (phase >= 3)
        const scale = isWinner ? 1 + Math.sin(tick * 0.05) * 0.05 : 1

        // Cloud entrance animation
        let cloudAlpha = 0
        if (phase >= 1) cloudAlpha = Math.min(1, (tick - 48) / 30) // fade in
        if (cloudAlpha <= 0) return

        ctx.save()
        ctx.globalAlpha = cloudAlpha
        ctx.translate(cx, cy)
        ctx.scale(scale, scale)

        // Cloud glow
        if (isWinner) {
          const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, 80)
          grad.addColorStop(0, `${t.accent}40`)
          grad.addColorStop(1, 'transparent')
          ctx.fillStyle = grad
          ctx.fillRect(-80, -80, 160, 160)
        }

        // Cloud shape
        ctx.fillStyle = isWinner ? `${t.accent}30` : 'rgba(180,180,220,0.12)'
        ctx.beginPath()
        ctx.ellipse(0, 0, 60, 28, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = isWinner ? `${t.accent}20` : 'rgba(180,180,220,0.08)'
        ctx.beginPath()
        ctx.ellipse(-25, -8, 35, 22, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(25, -5, 30, 20, 0, 0, Math.PI * 2)
        ctx.fill()

        // Entry name
        ctx.fillStyle = isWinner ? t.accent : 'rgba(200,200,240,0.8)'
        ctx.font = `${isWinner ? 'bold 14px' : '12px'} system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(entry.profiles?.display_name || 'Dreamer', 0, -38)

        // Vote count
        ctx.fillStyle = isWinner ? t.accent : 'rgba(200,200,240,0.6)'
        ctx.font = `bold ${isWinner ? 20 : 16}px system-ui, sans-serif`
        ctx.fillText(entry.vote_count, 0, 8)

        // Tier badge
        const tier = entry.profiles?.designer_tier ?? 0
        if (tier > 0) {
          ctx.fillStyle = TIER_COLORS[tier]
          ctx.font = '9px system-ui, sans-serif'
          ctx.fillText(DESIGNER_TIERS[tier], 0, 22)
        }

        // Rank number
        ctx.fillStyle = 'rgba(200,200,240,0.3)'
        ctx.font = 'bold 10px system-ui, sans-serif'
        ctx.fillText(`#${i + 1}`, 0, 48)

        ctx.restore()
      })

      // Draw raindrops
      if (phase >= 2) {
        raindrops.current.forEach(drop => {
          if (drop.y < drop.maxY) drop.y += drop.vy
          const alpha = drop.opacity * (drop.y < drop.maxY ? 1 : 0.3)

          // Raindrop teardrop shape
          ctx.save()
          ctx.translate(drop.x, drop.y)
          ctx.fillStyle = `${t.accent}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`
          ctx.beginPath()
          ctx.moveTo(0, -drop.size)
          ctx.bezierCurveTo(drop.size * 0.6, -drop.size * 0.3, drop.size * 0.6, drop.size * 0.5, 0, drop.size)
          ctx.bezierCurveTo(-drop.size * 0.6, drop.size * 0.5, -drop.size * 0.6, -drop.size * 0.3, 0, -drop.size)
          ctx.fill()

          // Star sparkle inside some drops
          if (drop.sparkle && drop.y < drop.maxY) {
            ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`
            const ss = drop.size * 0.3
            ctx.beginPath()
            ctx.moveTo(0, -ss); ctx.lineTo(ss * 0.3, -ss * 0.3)
            ctx.lineTo(ss, 0); ctx.lineTo(ss * 0.3, ss * 0.3)
            ctx.lineTo(0, ss); ctx.lineTo(-ss * 0.3, ss * 0.3)
            ctx.lineTo(-ss, 0); ctx.lineTo(-ss * 0.3, -ss * 0.3)
            ctx.closePath()
            ctx.fill()
          }
          ctx.restore()
        })
      }

      // Draw confetti
      confetti.current = confetti.current.filter(c => c.life > 0)
      confetti.current.forEach(c => {
        c.x += c.vx
        c.y += c.vy
        c.vy += 0.15 // gravity
        c.vx *= 0.99
        c.rotation += c.rotSpeed
        c.life -= 0.005

        ctx.save()
        ctx.translate(c.x, c.y)
        ctx.rotate(c.rotation * Math.PI / 180)
        ctx.globalAlpha = c.life
        ctx.fillStyle = c.color
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2)
        ctx.restore()
      })

      // Winner trophy glow
      if (phase >= 4 && winner) {
        const cx = startX
        const cy = cloudY - 70
        const pulse = 0.5 + Math.sin(tick * 0.08) * 0.3
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 50)
        grad.addColorStop(0, `${t.accent}${Math.round(pulse * 200).toString(16).padStart(2, '0')}`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(cx - 50, cy - 50, 100, 100)

        ctx.fillStyle = t.accent
        ctx.font = 'bold 28px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('★', cx, cy + 10)
      }

      // Lightning flash during thunder
      if (phase === 2 && tick > 70 && tick < 75) {
        ctx.fillStyle = 'rgba(200,200,255,0.06)'
        ctx.fillRect(0, 0, w, h)
      }

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animRef.current)
      phaseTimers.forEach(clearTimeout)
      window.removeEventListener('resize', onResize)
      if (audioCtx.current) audioCtx.current.close().catch(() => {})
    }
  }, [top, maxVotes, phase])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: '#0a0a1a' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

      {/* Contest title overlay */}
      <div style={{
        position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center',
        opacity: phase >= 1 ? 1 : 0, transition: 'opacity 1s',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: `${t.accent}aa`, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 6 }}>
          Contest Results
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#e0e0f0', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
          {contest?.title}
        </h1>
      </div>

      {/* Winner announcement */}
      {phase >= 4 && winner && (
        <div style={{
          position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center',
          animation: 'fadeSlideUp 0.8s ease-out',
        }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '20px 36px', background: 'rgba(20,20,40,0.85)', backdropFilter: 'blur(16px)', borderRadius: 20, border: `1px solid ${t.accent}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RaindropIcon size={24} filled color={t.accent} />
              <span style={{ fontSize: 24, fontWeight: 700, color: t.accent }}>{winner.vote_count}</span>
              <span style={{ fontSize: 13, color: 'rgba(200,200,240,0.6)' }}>raindrops</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#e0e0f0' }}>
              {winner.profiles?.display_name || 'Dreamer'}
            </div>
            <div style={{ fontSize: 12, color: `${t.accent}cc`, fontWeight: 600 }}>
              {contest?.prize_description || 'Winner'}
            </div>
          </div>
        </div>
      )}

      {/* Close / share buttons */}
      {showUI && (
        <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            padding: '8px 18px', borderRadius: 10, background: 'rgba(30,30,60,0.8)',
            border: '1px solid rgba(100,100,150,0.3)', color: '#b0b0d0',
            fontSize: 13, cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}>✕ Close</button>
        </div>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
