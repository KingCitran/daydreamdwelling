import { useTheme } from '@shared/ThemeProvider'
import { useMusicPlayer } from '../contexts/MusicPlayerContext'

// Pill that toggles the music widget on/off. Position adapts to the active
// widget variant: under the logo on community pages, top-right elsewhere.
// Pulses when audio is playing so the user can spot it at a glance.

export default function TopMusicButton() {
  const t = useTheme()
  const { widgetOpen, openWidget, closeWidget, isPlaying } = useMusicPlayer()

  const onClick = () => widgetOpen ? closeWidget() : openWidget()

  // Always under-the-logo, top-left. Community header is 56px tall, builder
  // logo overlay sits at top:10 — top:70 clears both. Sidebar widget is at
  // top:116 so it stacks below this button cleanly.
  return (
    <>
      <style>{`
        @keyframes ddd-music-note { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        @keyframes ddd-music-dot  { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        /* Strip Ember's Sunrise global text-shadow / stroke that blurs the pill text */
        .ddd-music-pill,
        .ddd-music-pill * {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
      `}</style>
      <button
        onClick={onClick}
        className="ddd-music-pill"
        style={{
          position: 'fixed', zIndex: 1000,
          top: 70, left: 16,
          padding: '8px 16px', borderRadius: 18,
          background: widgetOpen ? t.accent : 'rgba(15,12,30,0.6)',
          color: widgetOpen ? t.accentText : '#f0eaff',
          border: `1px solid ${widgetOpen ? t.accent : `${t.accent}50`}`,
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
          backdropFilter: 'blur(10px)',
          fontFamily: "'Outfit', system-ui, sans-serif",
          letterSpacing: '0.3px',
        }}
        title={widgetOpen ? 'Hide music player' : 'Open music player'}
      >
        <span style={{ fontSize: 14, animation: isPlaying ? 'ddd-music-note 1.2s ease-in-out infinite' : 'none' }}>♫</span>
        Music
        {isPlaying && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: widgetOpen ? t.accentText : t.accent,
            animation: 'ddd-music-dot 0.8s ease-in-out infinite',
          }} />
        )}
      </button>
    </>
  )
}
