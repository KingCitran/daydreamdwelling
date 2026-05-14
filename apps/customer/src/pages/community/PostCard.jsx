import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

// Mood-to-gradient map for placeholder cards when screenshot is missing
const MOOD_GRADIENTS = {
  'Golden Hour':      'linear-gradient(135deg, #451a03 0%, #78350f 30%, #b45309 60%, #fbbf24 100%)',
  'Bright Day':       'linear-gradient(135deg, #0c4a6e 0%, #0284c7 40%, #38bdf8 70%, #bae6fd 100%)',
  'Vivid Sunset':           'linear-gradient(135deg, #010101 0%, #2a0a56 25%, #b53da1 55%, #ffaa3d 85%, #fff5d4 100%)',
  "Ember's Sunrise":        'linear-gradient(135deg, #15080e 0%, #57191f 25%, #ed6ab8 50%, #ffaa3d 75%, #dcd0f0 100%)',
  'Candlelit Cozy Evening': 'linear-gradient(135deg, #1c1917 0%, #78350f 30%, #f59e0b 60%, #fff7ed 100%)',
  'Moonlight':              'linear-gradient(135deg, #0f172a 0%, #1e3a5f 30%, #6366f1 60%, #c4b5fd 100%)',
  'Northern Lights':        'linear-gradient(135deg, #02060e 0%, #1a1050 30%, #524094 60%, #01efac 100%)',
  'Dark Academia':          'linear-gradient(135deg, #1a1207 0%, #4a2c17 30%, #92400e 60%, #d4a373 100%)',
  'Blush Hour':       'linear-gradient(135deg, #500724 0%, #be185d 30%, #f9a8d4 60%, #fdf2f8 100%)',
  'Coastal Morning':        'linear-gradient(135deg, #0c4a6e 0%, #0369a1 30%, #67e8f9 60%, #ecfeff 100%)',
  'Dream State':            'linear-gradient(135deg, #2e1065 0%, #7c3aed 30%, #c084fc 60%, #f5d0fe 100%)',
  'Neon Nights':            'linear-gradient(135deg, #0a0a0a 0%, #6600ff 25%, #ff00ff 50%, #00ffcc 75%, #ffff00 100%)',
  'Greenhouse':       'linear-gradient(135deg, #052e16 0%, #166534 30%, #4ade80 60%, #ecfdf5 100%)',
  'Studio':           'linear-gradient(135deg, #1e293b 0%, #475569 30%, #94a3b8 60%, #f1f5f9 100%)',
  'Studio Dark':      'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #334155 60%, #64748b 100%)',
}
const DEFAULT_GRADIENT = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)'

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
          : <div style={{
              width: '100%', height: '100%',
              background: MOOD_GRADIENTS[post.mood] || DEFAULT_GRADIENT,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 28, opacity: 0.7 }}>✦</span>
              {post.mood && <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', textTransform: 'uppercase' }}>{post.mood}</span>}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>View room to explore items</span>
            </div>}
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
