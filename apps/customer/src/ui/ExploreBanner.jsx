import { useTheme } from '@shared/ThemeProvider'

export default function ExploreBanner({ exploreData, waitingCount, onExit }) {
  const t = useTheme()
  if (!exploreData) return null
  const { post, designer } = exploreData

  return (
    <div style={{
      position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, padding: '8px 16px',
      background: 'rgba(20,20,45,0.85)', backdropFilter: 'blur(10px)',
      border: `1px solid ${t.accent}40`, borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: `0 4px 20px ${t.accent}20`,
      fontFamily: "'Outfit', system-ui, sans-serif",
      maxWidth: 'calc(100vw - 40px)',
    }}>
      <span style={{ fontSize: 16 }}>✦</span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Exploring {post.title}
        </div>
        <div style={{ fontSize: 10, color: `${t.accent}cc`, marginTop: 1 }}>
          by {designer} · Items you save go to your inventory
          {waitingCount > 0 && ` · ${waitingCount} saved`}
        </div>
      </div>
      <button onClick={onExit} style={{
        padding: '6px 12px', borderRadius: 8,
        background: 'transparent', border: `1px solid ${t.accent}50`,
        color: t.accent, fontSize: 11, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0,
      }}>Exit ✕</button>
    </div>
  )
}
