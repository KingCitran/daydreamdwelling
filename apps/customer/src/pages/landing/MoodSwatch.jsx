import { MOOD_THEMES } from '@shared/themes'

// Cloud-shaped pill swatch that previews a mood. Active state is a slight
// lift + accent-tinted glow + accent border.
export default function MoodSwatch({ moodKey, label, active, onClick }) {
  const t = MOOD_THEMES[moodKey]
  if (!t) return null
  return (
    <button onClick={onClick} aria-pressed={active} style={{
      position: 'relative', padding: 0, border: 'none', cursor: 'pointer',
      background: 'transparent', flexShrink: 0,
      transition: 'transform 0.4s ease',
      transform: active ? 'translateY(-4px)' : 'translateY(0)',
    }}>
      <div style={{
        width: 96, height: 60,
        background: `linear-gradient(180deg, ${t.bg} 0%, ${t.bg} 100%)`,
        borderRadius: '40% 40% 50% 50% / 50%',
        position: 'relative', overflow: 'hidden',
        boxShadow: active
          ? `0 12px 32px ${t.accent}55, 0 0 0 2px ${t.accent}`
          : '0 6px 18px rgba(120,150,200,0.2)',
        border: `1px solid ${active ? t.accent : 'rgba(255,255,255,0.6)'}`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 50% 35%, ${t.accent}88 0%, transparent 65%)`,
        }} />
        <div style={{
          position: 'absolute', bottom: 8, right: 10,
          width: 10, height: 10, borderRadius: '50%', background: t.accent,
          boxShadow: `0 0 12px ${t.accent}`,
        }} />
      </div>
      <div style={{
        marginTop: 8, fontFamily: "'Outfit', system-ui, sans-serif", fontSize: 11,
        color: active ? t.accent : '#5078a8', fontWeight: active ? 600 : 400,
        letterSpacing: '0.3px', textAlign: 'center', maxWidth: 96,
      }}>
        {label}
      </div>
    </button>
  )
}
