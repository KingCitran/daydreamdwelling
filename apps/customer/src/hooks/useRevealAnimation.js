import { useEffect, useRef, useCallback } from 'react'

export default function useRevealAnimation({ maxVotes, top, winner, cardRefs, canvasRef, isPodium, setPhase, soundMode = 'all', volumeMultiplier = 1 }) {
  // Live prefs — ref tracks current values so audio callbacks always read fresh
  const prefsRef   = useRef({ soundMode, volumeMultiplier })
  const rainAudio  = useRef(null)
  const thunderAudio = useRef(null)
  const rainTargetRef = useRef(0)
  const thunderTargetRef = useRef(0)
  useEffect(() => { prefsRef.current = { soundMode, volumeMultiplier } }, [soundMode, volumeMultiplier])

  // React to live prefs changes — instantly mute/unmute currently-playing audio
  // (the internal ticks also re-apply this on their next 100ms cycle, but we want snappy response)
  useEffect(() => {
    if (thunderAudio.current) {
      thunderAudio.current.volume = soundMode === 'all' ? thunderAudio.current.volume : 0
    }
    if (rainAudio.current) {
      rainAudio.current.volume = soundMode !== 'none' ? rainAudio.current.volume : 0
    }
  }, [soundMode, volumeMultiplier])

  const audioRef   = useRef(null)
  const goldenRain = useRef([])
  const bolts      = useRef([])
  const boltImages = useRef([])
  const flashRef   = useRef(0)
  const animRef    = useRef(null)
  const tickRef    = useRef(0)

  // Preload PNG bolt assets
  useEffect(() => {
    const count = 12
    boltImages.current = Array.from({ length: count }, (_, i) => {
      const img = new Image()
      img.src = `/fx-lightning/bolt-${i + 1}.png`
      return img
    })
  }, [])

  const playThunder = useCallback(() => {
    if (prefsRef.current.soundMode !== 'all') return
    try {
      const audio = new Audio('/audio/thunder-rumble.mp3')
      audio.loop = true
      thunderAudio.current = audio
      const peakBase = 0.9 + Math.log10(Math.max(maxVotes, 1)) / 6
      thunderTargetRef.current = peakBase
      audio.volume = 0
      audio.play().catch(() => {})
      // progress tracks 0–1 through the ramp; actual volume applied live with current prefs
      let progress = 0, phase = 'in'
      const apply = () => {
        if (prefsRef.current.soundMode !== 'all') { audio.volume = 0; return }
        audio.volume = Math.min(1, peakBase * prefsRef.current.volumeMultiplier * progress)
      }
      const tick = setInterval(() => {
        if (phase === 'in') { progress = Math.min(1, progress + 1 / 12); if (progress >= 1) phase = 'hold' }
        else if (phase === 'low') { if (progress > 0.15) progress = Math.max(0.15, progress - 1 / 200) }
        else if (phase === 'out') { progress = Math.max(0, progress - 1 / 80); if (progress <= 0) { clearInterval(tick); audio.pause(); audio.src = ''; return } }
        apply()
      }, 100)
      audioRef.current = { fadeLow: () => { phase = 'low' }, fadeOut: () => { phase = 'out' }, close: () => { clearInterval(tick); audio.pause(); audio.src = '' } }
    } catch {}
  }, [maxVotes])

  const crackClips = ['/audio/crack-1.mp3', '/audio/crack-2.mp3', '/audio/crack-3.mp3', '/audio/crack-4.mp3']
  function playCrack(vol = 0.3) {
    if (prefsRef.current.soundMode !== 'all') return
    const a = new Audio(crackClips[Math.floor(Math.random() * crackClips.length)])
    a.volume = Math.min(1, vol * prefsRef.current.volumeMultiplier)
    a.play().catch(() => {})
  }

  // cards: which card indices to strike, vol: crack volume, boltsEach: bolts per card
  function spawnLightning(targetY, cards, vol = 0.3, boltsEach = 1) {
    playCrack(vol)
    flashRef.current = Math.min(1, vol * 2)
    const indices = cards || [0, 1, 2]
    const imgs = boltImages.current
    indices.forEach(i => {
      const el = cardRefs.current[i]
      if (!el || !top[i]) return
      const rect = el.getBoundingClientRect()
      for (let b = 0; b < boltsEach; b++) {
        const img = imgs[Math.floor(Math.random() * imgs.length)]
        const cx = rect.left + rect.width * (0.3 + Math.random() * 0.4)
        const boltH = targetY - rect.bottom + 40
        bolts.current.push({
          img, cx, y: rect.bottom - 20, w: boltH * 0.6, h: boltH,
          flip: Math.random() > 0.5,
          life: 1, delay: b * 6 + i * 4,
        })
      }
    })
  }

  function spawnGoldenSparkles(cx, cy, w) {
    const colors = ['#fbbf24', '#fcd34d', '#fde68a', '#ffd700', '#fff5cc', '#fffbe6', '#ffffff']
    for (let i = 0; i < 140; i++) {
      goldenRain.current.push({
        x: cx + (Math.random() - 0.5) * w * 1.1,
        y: cy + (Math.random() - 0.5) * 80,
        vy: 0.9 + Math.random() * 1.6,                    // stronger downward — visible falling
        vx: (Math.random() - 0.5) * 0.4,
        size: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        shimmer: Math.random() * Math.PI * 2,
        shimmerSpeed: 0.08 + Math.random() * 0.1,
        rot: Math.random() * Math.PI,
        rotV: (Math.random() - 0.5) * 0.04,
        life: 1,
        delay: Math.random() * 180,                       // wider stagger so the rain lasts longer
      })
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w, h
    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // End well above the pill — accounts for 6x glow width bleeding past endpoint
    const statsY = () => h * 0.84

    const timers = isPodium ? [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => { setPhase(2); playThunder() }, 2000),
      // Drumroll — source clips are loud, so volumes stay moderate but never weak
      setTimeout(() => spawnLightning(statsY(), [1], 0.55, 1), 2500),
      setTimeout(() => spawnLightning(statsY(), [1], 0.6, 1), 4000),
      setTimeout(() => spawnLightning(statsY(), [1, 0], 0.6, 1), 5200),
      setTimeout(() => spawnLightning(statsY(), [1, 2], 0.65, 1), 6200),
      setTimeout(() => spawnLightning(statsY(), [0, 1, 2], 0.7, 1), 7000),
      setTimeout(() => spawnLightning(statsY(), [1], 0.7, 2), 7600),
      setTimeout(() => spawnLightning(statsY(), [0, 1, 2], 0.75, 2), 8100),
      setTimeout(() => spawnLightning(statsY(), [1, 2], 0.8, 2), 8500),
      setTimeout(() => spawnLightning(statsY(), [0, 1, 2], 0.85, 2), 8800),
      setTimeout(() => spawnLightning(statsY(), [0, 1, 2], 0.9, 3), 9050),
      setTimeout(() => spawnLightning(statsY(), [0, 1, 2], 0.95, 3), 9250),
      setTimeout(() => {
        setPhase(3)
        // Gold sparkle stars rain from the winner's cloud the moment they're revealed.
        // (Was at 15000ms phase 4 timer, but podiumDone fires at 11200ms and cancels
        // remaining timers via effect cleanup — sparkles never spawned.)
        const winIdx = top.findIndex(e => e.id === winner?.id)
        const el = cardRefs.current[winIdx >= 0 ? winIdx : 0]
        if (el) { const r = el.getBoundingClientRect(); spawnGoldenSparkles(r.left + r.width / 2, r.top + r.height * 0.4, r.width) }
      }, 9600),
      setTimeout(() => {
        setPhase(3.5)
        audioRef.current?.fadeLow?.()
        if (prefsRef.current.soundMode === 'none') return
        try {
          const rain = new Audio('/audio/gentle-rain.mp3')
          rain.volume = 0
          rain.play().catch(() => {})
          rainAudio.current = rain
          const baseTarget = 0.05 * 3
          rainTargetRef.current = baseTarget
          let rainProgress = 0, rainPhase = 'in'
          const applyRain = () => {
            if (prefsRef.current.soundMode === 'none') { rain.volume = 0; return }
            rain.volume = Math.min(1, baseTarget * prefsRef.current.volumeMultiplier * rainProgress)
          }
          const rTick = setInterval(() => {
            if (rainPhase === 'in') {
              rainProgress = Math.min(1, rainProgress + 1 / 40)
              if (rainProgress >= 1) rainPhase = 'hold'
            } else if (rainPhase === 'out') {
              rainProgress = Math.max(0, rainProgress - 1 / 450)
              if (rainProgress <= 0) { clearInterval(rTick); rain.pause(); rain.src = ''; return }
            }
            applyRain()
          }, 100)
          // After 40s, storm starts drifting away
          setTimeout(() => { rainPhase = 'out' }, 40000)
          // Thunder drifts away a bit earlier
          setTimeout(() => { audioRef.current?.fadeOut?.() }, 30000)
          const prevClose = audioRef.current?.close
          audioRef.current = { ...audioRef.current, close: () => {
            prevClose?.(); clearInterval(rTick)
            let fv = rain.volume
            const fo = setInterval(() => {
              fv = Math.max(0, fv - 0.01)
              if (prefsRef.current.soundMode !== 'none') rain.volume = fv
              if (fv <= 0) { clearInterval(fo); rain.pause(); rain.src = '' }
            }, 50)
          }}
        } catch {}
      }, 11200),
      setTimeout(() => setPhase(4), 15000),
    ] : []

    const stars = Array.from({ length: 150 }, (_, i) => {
      const seed = Math.sin(i * 127.1 + 311.7) * 43758.5453; const r = seed - Math.floor(seed)
      const seed2 = Math.sin(i * 269.5 + 183.3) * 43758.5453; const r2 = seed2 - Math.floor(seed2)
      return { x: r * w, y: r2 * (h * 0.6), size: 0.6 + r * 1.4, baseAlpha: 0.15 + r2 * 0.35, twinkleSpeed: 0.008 + r * 0.02, twinklePhase: i * 1.7, bright: r > 0.92 }
    })

    function drawBolt(bolt, ctx) {
      if (!bolt.img || !bolt.img.complete) return
      const a = bolt.life
      ctx.save()
      ctx.globalAlpha = a
      ctx.translate(bolt.cx, bolt.y)
      if (bolt.flip) ctx.scale(-1, 1)
      ctx.drawImage(bolt.img, -bolt.w / 2, 0, bolt.w, bolt.h)
      ctx.restore()
    }

    function draw() {
      tickRef.current++
      const tick = tickRef.current
      const hasFx = goldenRain.current.length > 0 || bolts.current.length > 0 || flashRef.current > 0
      if (!hasFx && !isPodium && tick % 4 !== 0) { animRef.current = requestAnimationFrame(draw); return }

      ctx.clearRect(0, 0, w, h)

      if (flashRef.current > 0) {
        ctx.fillStyle = `rgba(220,215,240,${flashRef.current * 0.15})`
        ctx.fillRect(0, 0, w, h)
        flashRef.current = Math.max(0, flashRef.current - 0.05)
      }

      for (const s of stars) {
        const alpha = s.baseAlpha + Math.sin(tick * s.twinkleSpeed + s.twinklePhase) * 0.2
        if (alpha <= 0.02) continue
        ctx.globalAlpha = alpha; ctx.fillStyle = s.bright ? '#e8e0ff' : '#ffffff'
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1

      // Gold sparkles — 4-pointed stars
      goldenRain.current = goldenRain.current.filter(p => p.life > 0)
      for (const p of goldenRain.current) {
        if (p.delay > 0) { p.delay--; continue }
        p.x += p.vx; p.y += p.vy; p.shimmer += p.shimmerSpeed; p.rot += p.rotV; p.life -= 0.0025
        const shimA = 0.5 + Math.sin(p.shimmer) * 0.5
        const scale = 0.7 + Math.sin(p.shimmer * 1.3) * 0.3
        ctx.globalAlpha = Math.min(p.life, 1) * shimA
        ctx.fillStyle = p.color
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        const s = p.size * scale
        ctx.beginPath()
        ctx.moveTo(0, -s); ctx.lineTo(s * 0.22, -s * 0.22); ctx.lineTo(s, 0)
        ctx.lineTo(s * 0.22, s * 0.22); ctx.lineTo(0, s); ctx.lineTo(-s * 0.22, s * 0.22)
        ctx.lineTo(-s, 0); ctx.lineTo(-s * 0.22, -s * 0.22); ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      ctx.globalAlpha = 1

      // Lightning — 3-pass per bolt (glow, core, hot center) + branches
      bolts.current = bolts.current.filter(b => b.life > 0)
      for (const bolt of bolts.current) {
        if (bolt.delay > 0) { bolt.delay--; continue }
        bolt.life -= 0.03
        if (bolt.life > 0) drawBolt(bolt, ctx)
      }

      animRef.current = requestAnimationFrame(draw)
    }
    animRef.current = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(animRef.current); timers.forEach(clearTimeout); window.removeEventListener('resize', resize); if (audioRef.current) audioRef.current.close?.() }
  }, [isPodium])

  return { audioRef }
}
