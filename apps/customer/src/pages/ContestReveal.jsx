import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import RaindropIcon from '@shared/RaindropIcon'
import RaindropMobile from '../ui/RaindropMobile'
import { MOOD_COLOR_SCHEMES } from '../ui/raindropSchemes'
import useRevealAnimation from '../hooks/useRevealAnimation'
import { useRevealAudioPrefs } from '../hooks/useRevealAudioPrefs'
import { RevealAudioToggleCorner } from '../ui/RevealAudioToggle'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']
const MEDAL_COLORS   = { 1: { border: '#fbbf24', glow: 'rgba(251,191,36,', label: 'Gold' }, 2: { border: '#c0c0c8', glow: 'rgba(192,192,200,', label: 'Silver' }, 3: { border: '#8b5e3c', glow: 'rgba(139,94,60,', label: 'Bronze' } }

const MOOD_GRADIENTS = {
  'Golden Hour': 'linear-gradient(135deg, #451a03 0%, #b45309 50%, #fbbf24 100%)',
  'Moonlight': 'linear-gradient(135deg, #0f172a 0%, #6366f1 50%, #c4b5fd 100%)',
  'Dream State': 'linear-gradient(135deg, #2e1065 0%, #c084fc 50%, #f5d0fe 100%)',
  'Blush Hour': 'linear-gradient(135deg, #500724 0%, #f9a8d4 50%, #fdf2f8 100%)',
  'Candlelit Cozy Evening': 'linear-gradient(135deg, #1c1917 0%, #f59e0b 50%, #fff7ed 100%)',
  'Vivid Sunset': 'linear-gradient(135deg, #010101 0%, #b53da1 50%, #ffaa3d 100%)',
  "Ember's Sunrise": 'linear-gradient(135deg, #15080e 0%, #ed6ab8 40%, #ffaa3d 75%, #dcd0f0 100%)',
  'Northern Lights': 'linear-gradient(135deg, #02060e 0%, #524094 50%, #01efac 100%)',
  'Neon Nights': 'linear-gradient(135deg, #0a0a0a 0%, #ff00ff 50%, #00ffcc 100%)',
  'Greenhouse': 'linear-gradient(135deg, #052e16 0%, #4ade80 50%, #ecfdf5 100%)',
  'Dark Academia': 'linear-gradient(135deg, #1a1207 0%, #92400e 50%, #d4a373 100%)',
}
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #10102a 0%, #2a2050 100%)'

// ── Real cloud pedestals ──
// Uses the same 3-layer mask technique as CloudField (tint + shade + glow)
// themed for the dark reveal night sky. Medal holders get warm-tinted clouds.
const CLOUD_LAYER = {
  position: 'absolute', inset: 0,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'contain',
  userSelect: 'none', pointerEvents: 'none',
}
// Moonlit cloud palette — rich blue-indigo with silver highlights.
// On a dark background the multiply (shade) layer must be very faint
// or it muddies the clouds; the tint + screen (glow) carry the look.
const NIGHT_TINT    = 'linear-gradient(180deg, #7078a8 0%, #505888 30%, #363870 60%, #1c1e50 100%)'
const NIGHT_SHADOW  = 'drop-shadow(0 6px 18px rgba(0,0,0,0.55))'
// Medal tints removed — user preferred uniform cloud color across all cards
// Deterministic cloud picker — each card gets a unique but consistent set
const PEDESTAL_POOL = [2, 5, 8, 10, 14, 18, 22, 28, 35, 42, 47, 55, 63, 71, 78, 85, 92, 100, 108, 118, 126, 135, 143]
function pickClouds(seed, n = 9) {
  const out = []; let s = (seed + 1) * 2654435761
  for (let i = 0; i < n; i++) { s = ((s >>> 0) * 16807 + 7) >>> 0; out.push(PEDESTAL_POOL[s % PEDESTAL_POOL.length]) }
  return out
}
const pad3 = n => String(n).padStart(3, '0')

// 9 clouds arranged as a thick floating platform under each card (280px wide)
const PEDESTAL_LAYOUT = [
  // Main bed — wide, overlapping, covers the full bottom
  { left: -60,  bottom: -85, width: 250, flip: false },
  { left: 50,   bottom: -95, width: 270, flip: true  },
  { left: 140,  bottom: -80, width: 240, flip: false },
  // Fill layer — plugs gaps between main clouds
  { left: 10,   bottom: -70, width: 220, flip: true  },
  { left: 110,  bottom: -90, width: 230, flip: false },
  // Edge accents — extend platform beyond card edges
  { left: -90,  bottom: -60, width: 200, flip: false },
  { left: 220,  bottom: -65, width: 200, flip: true  },
  // Top fill — higher up, partially behind card for depth
  { left: -30,  bottom: -45, width: 180, flip: true  },
  { left: 180,  bottom: -50, width: 170, flip: false },
]

function CloudPedestal({ seed }) {
  const clouds = pickClouds(seed)
  const tint = { gradient: NIGHT_TINT, shadow: NIGHT_SHADOW }
  const glowOp = 0.35
  return PEDESTAL_LAYOUT.map((pos, i) => {
    const url = `url("/clouds/cloud-${pad3(clouds[i])}.webp")`
    return (
      <div key={i} style={{
        position: 'absolute', left: pos.left, bottom: pos.bottom,
        width: pos.width, aspectRatio: '3 / 2', zIndex: 2,
        transform: pos.flip ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none',
      }}>
        {/* Tint — the cloud's base color (masked to cloud shape) */}
        <div style={{ ...CLOUD_LAYER, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', background: tint.gradient, filter: tint.shadow }} />
        {/* Shade — very faint on dark bg to avoid muddiness */}
        <div style={{ ...CLOUD_LAYER, backgroundImage: url, mixBlendMode: 'multiply', opacity: 0.20, filter: 'contrast(1.1) brightness(1.1)' }} />
        {/* Glow — strong moonlit silver highlights on top edges */}
        <div style={{ ...CLOUD_LAYER, backgroundImage: url, mixBlendMode: 'screen', opacity: glowOp, filter: 'brightness(1.5) contrast(0.8)', WebkitMaskImage: 'linear-gradient(180deg, #fff 0%, #fff 40%, transparent 80%)', maskImage: 'linear-gradient(180deg, #fff 0%, #fff 40%, transparent 80%)' }} />
      </div>
    )
  })
}

// Cloud nest around the stats raindrop count — text sits in the lower
// belly of the cloud so it looks cradled, not floating above.
// Uses 3 overlapping clouds for a full, fluffy look.
const STATS_POOL = [3, 10, 18, 31, 55, 71, 95, 110]
const STATS_LAYOUT = [
  { left: -30, top: -45, width: 180, flip: false },  // left bump
  { left: 20,  top: -55, width: 200, flip: true  },  // center (largest, highest)
  { left: 80,  top: -40, width: 170, flip: false },  // right bump
]
function StatsCloudNest({ seed }) {
  return STATS_LAYOUT.map((pos, i) => {
    const num = STATS_POOL[(seed * 7 + i * 3 + 1) % STATS_POOL.length]
    const url = `url("/clouds/cloud-${pad3(num)}.webp")`
    return (
      <div key={i} style={{
        position: 'absolute', left: pos.left, top: pos.top,
        width: pos.width, aspectRatio: '3 / 2',
        transform: pos.flip ? 'scaleX(-1)' : 'none',
        pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{ ...CLOUD_LAYER, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: 'contain', maskSize: 'contain', WebkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat', WebkitMaskPosition: 'center', maskPosition: 'center', background: NIGHT_TINT, filter: NIGHT_SHADOW }} />
        <div style={{ ...CLOUD_LAYER, backgroundImage: url, mixBlendMode: 'multiply', opacity: 0.20, filter: 'contrast(1.1) brightness(1.1)' }} />
        <div style={{ ...CLOUD_LAYER, backgroundImage: url, mixBlendMode: 'screen', opacity: 0.35, filter: 'brightness(1.5) contrast(0.8)', WebkitMaskImage: 'linear-gradient(180deg, #fff 0%, #fff 40%, transparent 80%)', maskImage: 'linear-gradient(180deg, #fff 0%, #fff 40%, transparent 80%)' }} />
      </div>
    )
  })
}

function RollCounter({ target, active, color, instant = false }) {
  const [val, setVal] = useState(instant && active ? target : 0)
  useEffect(() => {
    if (!active) { setVal(0); return }
    // Non-podium pages skip the roll-up — show the final number right away
    if (instant) { setVal(target); return }
    let start = null
    function step(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / 7000, 1)
      setVal(Math.floor((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [active, target, instant])
  return <span style={{ fontSize: 18, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{val.toLocaleString()}</span>
}

export default function ContestReveal({ entries = [], contest, onClose }) {
  const t = useTheme()
  const canvasRef = useRef(null)
  const cardRefs  = useRef([])
  const [phase, setPhase] = useState(0)
  const [page, setPage]   = useState(0)
  // Once the podium reveal has played, don't replay it when the user flips back
  const [podiumDone, setPodiumDone] = useState(false)
  useEffect(() => { if (phase >= 3.5) setPodiumDone(true) }, [phase])

  const PAGE_SIZE = 3
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const maxVotes = Math.max(...entries.map(e => e.vote_count), 1)
  const winner = entries[0]
  const isPodium = page === 0

  const pageEntries = entries.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const top = isPodium && pageEntries.length >= 3 ? [pageEntries[1], pageEntries[0], pageEntries[2]] : pageEntries

  const { soundMode, volumeMultiplier } = useRevealAudioPrefs()
  // If podium already revealed once, skip the drumroll on re-visit
  const effectivePodium = isPodium && !podiumDone
  useRevealAnimation({ maxVotes, top, winner, cardRefs, canvasRef, isPodium: effectivePodium, setPhase, soundMode, volumeMultiplier })

  // If podium's already been revealed, treat visits like non-podium pages (full content visible)
  const gatePodium = effectivePodium
  const showContent = !gatePodium || phase >= 3.5
  const showStats = !gatePodium || phase >= 1
  const statsRolling = !gatePodium || phase >= 2
  const CLOUD_BG = 'rgb(25,23,48)'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'linear-gradient(180deg, #080818 0%, #10102a 50%, #0a0a20 100%)', fontFamily: "'Commissioner', system-ui, sans-serif", overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} />
      <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, zIndex: 20, padding: '8px 18px', borderRadius: 10, background: 'rgba(20,20,50,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(120,120,180,0.25)', color: '#b0b0d0', fontSize: 13, cursor: 'pointer' }}>✕ Close</button>
      <RevealAudioToggleCorner />

      <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center', zIndex: 5, opacity: !gatePodium || phase >= 1 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: `${t.accent}99`, textTransform: 'uppercase', letterSpacing: '3px', marginBottom: 6 }}>Contest Results</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#ddddf0', margin: 0 }}>{contest?.title}</h1>
        {totalPages > 1 && showStats && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#7070a0' }}>{isPodium ? 'Top 3' : `#${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, entries.length)}`} of {entries.length} entries</div>
        )}
      </div>

      {totalPages > 1 && showStats && (<>
        {page > 0 && <button onClick={() => setPage(p => p - 1)} style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: 48, height: 48, borderRadius: '50%', background: 'rgba(20,20,50,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(120,120,180,0.3)', color: '#c0c0e0', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>←</button>}
        {page < totalPages - 1 && <button onClick={() => setPage(p => p + 1)} style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 20, width: 48, height: 48, borderRadius: '50%', background: 'rgba(20,20,50,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(120,120,180,0.3)', color: '#c0c0e0', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>}
      </>)}

      <div style={{ position: 'absolute', top: '16%', left: 0, right: 0, display: 'grid', gridTemplateColumns: `repeat(${top.length}, 280px)`, justifyContent: 'center', gap: 180, zIndex: 2, alignItems: 'start' }}>
        {top.map((entry, i) => {
          const p = entry.profiles
          const tier = p?.designer_tier ?? 0
          const screenshot = entry.community_posts?.screenshot_url
          const globalRank = entries.indexOf(entry) + 1
          const isWinner = isPodium && globalRank === 1 && (phase >= 3 || podiumDone)
          const medal = MEDAL_COLORS[globalRank]
          const hasMedal = isPodium && medal && (phase >= 4 || podiumDone)
          const border = hasMedal ? `2.5px solid ${medal.border}` : isWinner ? `2px solid ${t.accent}40` : '1px solid rgba(120,120,180,0.15)'
          const shadow = hasMedal
            ? `0 0 16px ${medal.glow}0.2), 0 0 50px ${medal.glow}0.08), 0 8px 32px rgba(0,0,0,0.35)`
            : isWinner ? `0 0 30px ${t.accent}18, 0 8px 32px rgba(0,0,0,0.35)` : '0 8px 32px rgba(0,0,0,0.3)'

          return (
            <div key={entry.id} ref={el => cardRefs.current[i] = el} style={{
              width: 280,
              opacity: !gatePodium || phase >= 1 ? 1 : 0,
              transform: !gatePodium || phase >= 1 ? (isWinner ? 'translateY(0) scale(1.12)' : 'translateY(0) scale(1)') : 'translateY(50px) scale(0.9)',
              transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${i * 0.12}s`,
              zIndex: isWinner ? 5 : 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: 30 }}>
                {/* Real cloud pedestal — card floats on a bed of tinted clouds */}
                <CloudPedestal seed={i} />

                <div style={{
                  position: 'absolute', top: -40, left: -30, right: -30, bottom: -20,
                  background: hasMedal ? `radial-gradient(ellipse at 50% 30%, ${medal.glow}0.06) 0%, transparent 55%)`
                    : 'radial-gradient(ellipse at 50% 30%, rgba(140,140,200,0.04) 0%, transparent 55%)',
                  borderRadius: '50%', filter: 'blur(16px)', pointerEvents: 'none',
                }} />

                <div style={{
                  position: 'relative', overflow: 'hidden',
                  borderRadius: '12px 12px 8px 8px', marginBottom: 16,
                  background: CLOUD_BG, border, boxShadow: shadow,
                  transition: 'border 0.8s ease, box-shadow 1s ease',
                }}>
                  {/* Rank badge */}
                  <div style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 5, width: 28, height: 28, borderRadius: '50%',
                    background: hasMedal ? medal.border : isWinner ? t.accent : 'rgba(30,30,60,0.85)',
                    color: hasMedal || isWinner ? '#fff' : 'rgba(180,180,220,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700,
                    border: hasMedal ? `2px solid ${medal.border}88` : '1.5px solid rgba(120,120,180,0.25)',
                    transition: 'background 0.8s ease',
                  }}>#{globalRank}</div>

                  {/* Room image — fades in at phase 3.5 */}
                  <div style={{
                    margin: '10px 10px 0', borderRadius: '20px 24px 14px 16px', aspectRatio: '16/11',
                    background: '#10102a', overflow: 'hidden', position: 'relative',
                    opacity: showContent ? 1 : 0, transition: 'opacity 1.5s ease-out',
                  }}>
                    {screenshot
                      ? <img src={screenshot} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: MOOD_GRADIENTS[entry.community_posts?.mood] || DEFAULT_GRADIENT, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span style={{ fontSize: 24, opacity: 0.6 }}>✦</span>
                          {entry.community_posts?.mood && <span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '1px', textTransform: 'uppercase' }}>{entry.community_posts.mood}</span>}
                        </div>}
                    {isWinner && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 22, filter: 'drop-shadow(0 0 8px rgba(255,200,50,0.6))', zIndex: 6 }}>★</div>}
                  </div>

                  {/* Designer name — fades in with the room */}
                  <div style={{ padding: '10px 14px 12px', opacity: showContent ? 1 : 0, transition: 'opacity 1.5s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {p?.avatar_url ? <img src={p.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (p?.display_name || '?')[0].toUpperCase()}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#ddddf0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p?.display_name || 'Dreamer'}</div>
                      {tier > 0 && <span style={{ fontSize: 9, color: TIER_COLORS[tier], fontWeight: 600 }}>{DESIGNER_TIERS[tier]}</span>}
                    </div>
                  </div>
                </div>
              </div>

              {(!gatePodium || phase >= 3.5) && (
                <div style={{ marginTop: 6, position: 'relative', zIndex: 3, animation: gatePodium ? `ddd-reveal-up 0.8s ease-out ${i * 0.25}s both` : 'none' }}>
                  <RaindropMobile key={`${entry.id}-${page}`} count={entry.vote_count} filled
                    accentColor={hasMedal ? medal.border : isWinner ? t.accent : '#8080b0'} size="small"
                    animated={true} formation="rain-arc"
                    colorScheme={MOOD_COLOR_SCHEMES[entry.community_posts?.mood] || 'dreamcloud'}
                    seed={i * 7 + 3} hideCount />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Stats — cloud pills, fully visible as lightning targets */}
      {showStats && (
        <div style={{
          position: 'absolute', bottom: '12%', left: 0, right: 0, zIndex: 10,
          display: 'grid', gridTemplateColumns: `repeat(${top.length}, 280px)`, justifyContent: 'center', gap: 180,
        }}>
          {top.map((entry, si) => {
            const rank = entries.indexOf(entry) + 1
            const m = MEDAL_COLORS[rank]
            const hasMdl = isPodium && m && (phase >= 4 || podiumDone)
            return (
              <div key={entry.id} style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  position: 'relative',
                  padding: '10px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  minWidth: 140,
                }}>
                  <StatsCloudNest seed={si} />
                  <RaindropIcon size={16} filled={statsRolling} color={hasMdl ? m.border : statsRolling ? '#fbbf24' : '#50507a'} style={{ position: 'relative', zIndex: 1 }} />
                  <span style={{ position: 'relative', zIndex: 1 }}><RollCounter target={entry.vote_count} active={statsRolling} instant={!gatePodium} color={hasMdl ? m.border : statsRolling ? '#c0c0d0' : '#50507a'} /></span>
                  {statsRolling && <span style={{ fontSize: 11, color: '#b0b0d0', fontWeight: 500, position: 'relative', zIndex: 1 }}>raindrops</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Winner bar — below the raindrop counts */}
      {(phase >= 4 || podiumDone) && isPodium && winner && (
        <div style={{ position: 'absolute', bottom: '4%', left: 0, right: 0, textAlign: 'center', zIndex: 10, animation: 'ddd-reveal-up 0.8s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 20, padding: '10px 24px', background: 'linear-gradient(135deg, #2a2010 0%, #1a1508 30%, #2a2010 60%, #1a1508 100%)', borderRadius: 12, border: '1.5px solid rgba(251,191,36,0.4)', boxShadow: '0 0 40px rgba(251,191,36,0.15), inset 0 1px 0 rgba(251,191,36,0.2)' }}>
            <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.5))' }}>👑</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{winner.profiles?.display_name || 'Dreamer'}</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            <span style={{ fontSize: 13, color: '#c0a050', fontWeight: 600 }}>{contest?.title}</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Winner</span>
            <span style={{ color: '#806830', fontSize: 13 }}>·</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <RaindropIcon size={16} filled color="#fbbf24" />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fbbf24' }}>{winner.vote_count.toLocaleString()}</span>
            </div>
            {contest?.prize_description && (<><span style={{ color: '#806830', fontSize: 13 }}>·</span><span style={{ fontSize: 11, color: '#d4a840', fontWeight: 600 }}>✦ {contest.prize_description}</span></>)}
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', bottom: 8, right: 16, zIndex: 5, fontSize: 9, color: 'rgba(120,120,160,0.5)' }}>Thunder: freesound_community via Pixabay · Lightning: danielmcadams, filmscore via Freesound</div>
      <style>{`@keyframes ddd-reveal-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}
