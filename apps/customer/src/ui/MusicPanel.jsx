import { useBuilderStyles } from './styles/appStyles'

// TODO: Replace url: null entries with real embed URLs when stations are ready
const STATIONS = [
  { id: 'cozy',    label: 'Cozy Vibes',   emoji: '🏡', desc: 'Acoustic & soft indie',    url: null },
  { id: 'jazz',    label: 'Jazz Lounge',  emoji: '🎷', desc: 'Smooth jazz & bossa nova', url: null },
  { id: 'lofi',    label: 'Lo-fi Study',  emoji: '📚', desc: 'Chill beats to focus',     url: null },
  { id: 'upbeat',  label: 'Upbeat',       emoji: '✨', desc: 'Pop & feel-good',           url: null },
  { id: 'ambient', label: 'Ambient',      emoji: '🌌', desc: 'Atmospheric & spacious',   url: null },
  { id: 'nature',  label: 'Nature',       emoji: '🌿', desc: 'Rain, forest & calm',      url: null },
]

export default function MusicPanel({ station, onStation, onClose, drawerOpen }) {
  const s = useBuilderStyles()
  const active = STATIONS.find(st => st.id === station) ?? null

  return (
    <div style={{ ...s.musicPanel, right: drawerOpen ? 376 : 16 }}>
      <div style={s.musicHeader}>
        <span style={s.musicTitle}>🎵 Music</span>
        <button style={s.musicClose} onClick={onClose}>✕</button>
      </div>

      <div style={s.stationGrid}>
        {STATIONS.map(st => {
          const isActive = station === st.id
          return (
            <button
              key={st.id}
              onClick={() => onStation(isActive ? null : st.id)}
              style={{ ...s.stationCard, ...(isActive ? s.stationCardActive : {}) }}
            >
              <span style={{ fontSize: 18, lineHeight: 1 }}>{st.emoji}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? s.musicTitle.color : s.musicClose.color }}>{st.label}</span>
              <span style={{ fontSize: 10, color: s.musicClose.color, lineHeight: 1.3 }}>{st.desc}</span>
            </button>
          )
        })}
      </div>

      {active?.url ? (
        <iframe
          key={active.url}
          src={active.url}
          width="100%"
          height={152}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          style={{ borderRadius: 8, display: 'block', border: 'none' }}
        />
      ) : active ? (
        <div style={s.stationComingSoon}>
          <p style={{ margin: 0, fontSize: 12, color: s.musicTitle.color }}>🚧 Coming soon</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: s.musicClose.color }}>{active.label} station launching soon</p>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 11, color: s.musicClose.color, textAlign: 'center' }}>Pick a station above to start playing</p>
      )}
    </div>
  )
}
