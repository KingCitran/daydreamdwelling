import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const TIER_NAMES  = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']
const RANK_ICONS  = ['', '✦', '✧', '✦']

export default function DesignerLeaderboard({ compact = false }) {
  const t = useTheme()
  const [designers, setDesigners] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    // Aggregate hearts + placements across all community_posts per user
    supabase
      .from('community_posts')
      .select('user_id, heart_count, placement_count, profiles(display_name, avatar_url, designer_tier)')
      .then(({ data }) => {
        if (!data) { setLoading(false); return }

        // Aggregate per user
        const byUser = {}
        for (const post of data) {
          const uid = post.user_id
          if (!byUser[uid]) {
            byUser[uid] = {
              user_id: uid,
              display_name: post.profiles?.display_name || 'Designer',
              avatar_url: post.profiles?.avatar_url,
              designer_tier: post.profiles?.designer_tier || 0,
              total_hearts: 0,
              total_placements: 0,
              post_count: 0,
            }
          }
          byUser[uid].total_hearts += post.heart_count ?? 0
          byUser[uid].total_placements += post.placement_count ?? 0
          byUser[uid].post_count += 1
        }

        // Score = hearts + (placements × 3) — placements are rarer, worth more
        const ranked = Object.values(byUser)
          .map(d => ({ ...d, score: d.total_hearts + d.total_placements * 3 }))
          .sort((a, b) => b.score - a.score)
          .slice(0, compact ? 5 : 20)

        setDesigners(ranked)
        setLoading(false)
      })
  }, [compact])

  if (loading) return <p style={{ color: t.textSoft, textAlign: 'center', padding: 20, fontSize: 13 }}>Loading leaderboard...</p>
  if (designers.length === 0) return null

  return (
    <div style={{ width: '100%' }}>
      {!compact && (
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8, marginTop: 0 }}>Community</p>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: 0 }}>Designer Leaderboard</h2>
          <p style={{ fontSize: 13, color: t.textSoft, marginTop: 8 }}>Top designers this month by hearts + placements</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 6 : 8 }}>
        {designers.map((d, i) => {
          const rank = i + 1
          const isTop3 = rank <= 3
          const tierColor = TIER_COLORS[d.designer_tier] || t.textSoft
          const tierName = TIER_NAMES[d.designer_tier] || ''

          return (
            <div
              key={d.user_id}
              className="ddd-card"
              style={{
                display: 'flex', alignItems: 'center', gap: compact ? 10 : 14,
                padding: compact ? '8px 12px' : '12px 16px',
                background: isTop3 ? `${t.accent}08` : t.surface,
                border: `1px solid ${isTop3 ? `${t.accent}30` : t.surfaceBorder}`,
                borderRadius: 12,
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Rank */}
              <div style={{
                width: compact ? 24 : 32, height: compact ? 24 : 32,
                borderRadius: '50%',
                background: isTop3 ? `${t.accent}20` : t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isTop3 ? (compact ? 12 : 14) : (compact ? 11 : 12),
                fontWeight: 700,
                color: isTop3 ? t.accent : t.textSoft,
                flexShrink: 0,
              }}>
                {isTop3 ? (RANK_ICONS[rank] || rank) : rank}
              </div>

              {/* Avatar */}
              {d.avatar_url ? (
                <img src={d.avatar_url} alt="" style={{
                  width: compact ? 28 : 36, height: compact ? 28 : 36,
                  borderRadius: '50%', objectFit: 'cover', flexShrink: 0,
                }} />
              ) : (
                <div style={{
                  width: compact ? 28 : 36, height: compact ? 28 : 36,
                  borderRadius: '50%', background: t.bg, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: compact ? 12 : 14, color: t.textSoft,
                }}>✦</div>
              )}

              {/* Name + tier */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {d.display_name}
                </div>
                {tierName && !compact && (
                  <span style={{ fontSize: 11, color: tierColor, fontWeight: 600 }}>{tierName}</span>
                )}
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: compact ? 8 : 14, alignItems: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: compact ? 11 : 12, color: t.textSoft }}>
                  ✧ {d.total_hearts}
                </span>
                {!compact && (
                  <span style={{ fontSize: 12, color: t.textSoft }}>
                    ◈ {d.total_placements} placed
                  </span>
                )}
                {!compact && (
                  <span style={{ fontSize: 12, color: t.textSoft }}>
                    {d.post_count} {d.post_count === 1 ? 'room' : 'rooms'}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
