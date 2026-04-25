import { useState, useRef, useEffect } from 'react'

// Per-mood ambient station mapping (add audio URLs when available)
const MOOD_AMBIENT = {
  'Golden Hour':      { emoji: '🏡', label: 'Cozy Vibes',  url: null },
  'Bright Day':       { emoji: '✨', label: 'Upbeat',      url: null },
  'Vivid Sunset':     { emoji: '🎷', label: 'Jazz Lounge', url: null },
  'Moonlight':        { emoji: '🌌', label: 'Ambient',     url: null },
  'Dark Academia':    { emoji: '📚', label: 'Lo-fi Study', url: null },
  'Cottagecore Dawn': { emoji: '🌿', label: 'Nature',      url: null },
  'Coastal Morning':  { emoji: '🌿', label: 'Nature',      url: null },
  'Dream State':      { emoji: '🌌', label: 'Ambient',     url: null },
  'Neon Nights':      { emoji: '✨', label: 'Upbeat',      url: null },
  'Candlelit Cozy Evening':      { emoji: '🏡', label: 'Cozy Vibes',  url: null },
  'Greenhouse':       { emoji: '🌿', label: 'Nature',      url: null },
  'Studio':           { emoji: '📚', label: 'Lo-fi Study', url: null },
  'Studio Dark':      { emoji: '🎷', label: 'Jazz Lounge', url: null },
}

const KEYFRAMES = `
@keyframes dddWaveBar {
  0%, 100% { height: 4px; }
  50%      { height: 14px; }
}
`

export default function HeroMusic({ mood, accent }) {
  const [muted, setMuted]         = useState(true)
  const [showTooltip, setTooltip] = useState(false)
  const audioRef                  = useRef(null)
  const station = MOOD_AMBIENT[mood] ?? MOOD_AMBIENT['Dream State']

  useEffect(() => {
    if (audioRef.current && station.url) {
      audioRef.current.volume = muted ? 0 : 0.2
      if (!muted) audioRef.current.play().catch(() => {})
      else audioRef.current.pause()
    }
  }, [muted, station.url])

  return (
    <>
      <style>{KEYFRAMES}</style>
      {station.url && (
        <audio ref={audioRef} src={station.url} loop preload="none" />
      )}

      <button
        onClick={() => {
          if (station.url) setMuted(m => !m)
          else { setTooltip(true); setTimeout(() => setTooltip(false), 2500) }
        }}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        title={station.url ? (muted ? 'Unmute ambient music' : 'Mute music') : 'Music coming soon'}
        style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          border: `1px solid ${accent}40`, borderRadius: 20,
          padding: '6px 12px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          color: '#fff', fontSize: 11, fontWeight: 600,
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{ fontSize: 14 }}>{station.emoji}</span>
        {/* Animated wave bars (when "playing") */}
        <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 14 }}>
          {[0, 0.15, 0.3].map(delay => (
            <span key={delay} style={{
              width: 2.5, height: 8, borderRadius: 1.5,
              background: accent,
              animation: muted ? 'none' : `dddWaveBar 0.9s ease-in-out ${delay}s infinite`,
              opacity: muted ? 0.35 : 1,
            }} />
          ))}
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div style={{
          position: 'absolute', top: 46, right: 14, zIndex: 5,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          color: '#fff', fontSize: 11, padding: '6px 10px',
          borderRadius: 8, whiteSpace: 'nowrap',
          border: `1px solid ${accent}30`,
          animation: 'fadeIn 0.2s ease',
        }}>
          {station.url ? `${station.label} · ${muted ? 'Tap to hear' : 'Playing'}` : `${station.label} · Coming soon`}
        </div>
      )}
    </>
  )
}
