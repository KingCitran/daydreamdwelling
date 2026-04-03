import { styles } from './styles/appStyles'

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
  const active = STATIONS.find(s => s.id === station) ?? null

  return (
    <div style={{ ...styles.musicPanel, right: drawerOpen ? 376 : 16 }}>
      <div style={styles.musicHeader}>
        <span style={styles.musicTitle}>🎵 Music</span>
        <button style={styles.musicClose} onClick={onClose}>✕</button>
      </div>

      <div style={styles.stationGrid}>
        {STATIONS.map(s => (
          <button
            key={s.id}
            onClick={() => onStation(station === s.id ? null : s.id)}
            style={{
              ...styles.stationCard,
              ...(station === s.id ? styles.stationCardActive : {}),
            }}
          >
            <span style={{ fontSize: 18, lineHeight: 1 }}>{s.emoji}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: station === s.id ? '#c4a8ff' : '#e0d9ff' }}>{s.label}</span>
            <span style={{ fontSize: 10, color: '#7878aa', lineHeight: 1.3 }}>{s.desc}</span>
          </button>
        ))}
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
        <div style={styles.stationComingSoon}>
          <p style={{ margin: 0, fontSize: 12, color: '#9898cc' }}>🚧 Coming soon</p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6666aa' }}>{active.label} station launching soon</p>
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 11, color: '#6666aa', textAlign: 'center' }}>Pick a station above to start playing</p>
      )}
    </div>
  )
}
