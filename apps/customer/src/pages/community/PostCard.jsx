import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export { DESIGNER_TIERS, TIER_COLORS }

export default function PostCard({ post, t, hearted, onHeart, onOpen, featured = false, showBuyButton = false, onBuyRoom }) {
  const profile = post.profiles
  const tier = profile?.designer_tier ?? 0
  const tierName = DESIGNER_TIERS[tier] || ''

  return (
    <div className="ddd-tile" style={{
      background: t.surface,
      border: `1.5px solid ${featured ? `${t.accent}40` : t.surfaceBorder}`,
      borderRadius: '24px 28px 26px 22px',
      overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.3s, transform 0.2s',
      boxShadow: '0 4px 20px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
    }} onClick={onOpen}>
      <div style={{
        height: 200, background: t.bg, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
        margin: '10px 10px 0', borderRadius: '18px 22px 14px 16px',
      }}>
        {post.screenshot_url
          ? <img src={post.screenshot_url} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 40, opacity: 0.15 }}>✦</span>}
        {featured && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            padding: '3px 10px', borderRadius: 12,
            background: `${t.accent}cc`, color: t.accentText,
            fontSize: 10, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase',
            backdropFilter: 'blur(4px)',
          }}>✦ Featured</div>
        )}
      </div>

      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: t.accentText, overflow: 'hidden', flexShrink: 0,
          }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (profile?.display_name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>{profile?.display_name || 'Dreamer'}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {tierName && <span style={{ fontSize: 10, color: TIER_COLORS[tier], fontWeight: 600 }}>{tierName}</span>}
              <span style={{ fontSize: 10, color: t.textSoft }}>{timeAgo(post.created_at)}</span>
            </div>
          </div>
        </div>

        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: t.text }}>{post.title}</h3>
        {post.description && (
          <p style={{ margin: '0 0 10px', fontSize: 12, color: t.textSoft, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: `1px solid ${t.surfaceBorder}`, paddingTop: 10 }}>
          <button onClick={e => { e.stopPropagation(); onHeart() }} title="Drop a raindrop" style={{
            background: hearted ? `${t.accent}15` : `${t.accent}08`,
            border: `1.5px solid ${hearted ? t.accent : t.surfaceBorder}`,
            cursor: 'pointer', borderRadius: 10,
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 14, padding: '6px 12px',
            color: hearted ? t.accent : t.text,
            fontWeight: 700, transition: 'all 0.2s',
            transform: hearted ? 'scale(1.05)' : 'scale(1)',
            boxShadow: hearted ? `0 0 0 3px ${t.accent}15` : 'none',
          }}>
            <RaindropIcon size={20} filled={hearted} color={t.accent} />
            {post.heart_count}
          </button>
          <span style={{ fontSize: 11, color: t.textSoft, display: 'flex', alignItems: 'center', gap: 4 }}>
            ◈ {post.placement_count} placed
          </span>
          {showBuyButton && onBuyRoom && (
            <button onClick={e => { e.stopPropagation(); onBuyRoom(post) }} style={{
              marginLeft: 'auto', padding: '6px 14px', borderRadius: 12,
              background: t.accent, color: t.accentText, border: 'none',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
            }}>Buy This Room</button>
          )}
        </div>
      </div>
    </div>
  )
}
