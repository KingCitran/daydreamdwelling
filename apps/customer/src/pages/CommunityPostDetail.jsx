import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CommunityPostDetail({ post: initialPost, onClose, onOpenBuilder }) {
  const t = useTheme()
  const { user } = useAuth()
  const [post, setPost]           = useState(initialPost)
  const [hearted, setHearted]     = useState(false)
  const [relatedPosts, setRelated] = useState([])
  const [relatedSource, setRelatedSource] = useState('designer') // 'designer' | 'contest' | 'popular'
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('community_hearts').select('post_id').eq('user_id', user.id).eq('post_id', post.id).maybeSingle()
      .then(({ data }) => { setHearted(!!data); setLoading(false) })
  }, [user, post.id])

  // Fetch related posts: designer → contest → popular fallback chain
  useEffect(() => {
    let cancelled = false
    async function loadRelated() {
      // 1. Designer's other posts
      const { data: byDesigner } = await supabase
        .from('community_posts')
        .select('id, title, screenshot_url, heart_count, profiles(display_name, avatar_url)')
        .eq('user_id', post.user_id).neq('id', post.id)
        .order('heart_count', { ascending: false }).limit(4)
      if (cancelled) return
      if (byDesigner && byDesigner.length > 0) {
        setRelated(byDesigner); setRelatedSource('designer'); return
      }

      // 2. Other entries in the same contest (if this post was a contest entry)
      const { data: contestEntries } = await supabase
        .from('contest_entries')
        .select('contest_id, post_id, community_posts(id, title, screenshot_url, heart_count, profiles(display_name, avatar_url))')
        .eq('post_id', post.id).maybeSingle()
      if (cancelled) return
      if (contestEntries?.contest_id) {
        const { data: siblings } = await supabase
          .from('contest_entries')
          .select('community_posts(id, title, screenshot_url, heart_count, profiles(display_name, avatar_url))')
          .eq('contest_id', contestEntries.contest_id).neq('post_id', post.id).limit(4)
        const sibPosts = (siblings ?? []).map(s => s.community_posts).filter(Boolean)
        if (sibPosts.length > 0) {
          setRelated(sibPosts); setRelatedSource('contest'); return
        }
      }

      // 3. Popular rooms (most-hearted overall)
      const { data: popular } = await supabase
        .from('community_posts')
        .select('id, title, screenshot_url, heart_count, profiles(display_name, avatar_url)')
        .neq('id', post.id)
        .order('heart_count', { ascending: false }).limit(4)
      if (cancelled) return
      setRelated(popular ?? []); setRelatedSource('popular')
    }
    loadRelated()
    return () => { cancelled = true }
  }, [post.id, post.user_id])

  async function toggleHeart() {
    if (!user) {
      // Optimistic increment for anonymous; prompt to sign in
      setPost(p => ({ ...p, heart_count: p.heart_count + 1 }))
      alert('✦ Sign in to make your raindrop count permanently!')
      return
    }
    if (hearted) {
      await supabase.from('community_hearts').delete().eq('user_id', user.id).eq('post_id', post.id)
      await supabase.from('community_posts').update({ heart_count: Math.max(0, post.heart_count - 1) }).eq('id', post.id)
      setHearted(false)
      setPost(p => ({ ...p, heart_count: Math.max(0, p.heart_count - 1) }))
    } else {
      await supabase.from('community_hearts').insert({ user_id: user.id, post_id: post.id })
      await supabase.from('community_posts').update({ heart_count: post.heart_count + 1 }).eq('id', post.id)
      setHearted(true)
      setPost(p => ({ ...p, heart_count: p.heart_count + 1 }))
      await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 1, reason: 'raindrop', ref_id: post.id })
    }
  }

  const profile = post.profiles
  const tier = profile?.designer_tier ?? 0
  const tierName = DESIGNER_TIERS[tier] || ''

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 270,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Outfit', system-ui, sans-serif", overflowY: 'auto', padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: t.surface, border: `1px solid ${t.surfaceBorder}`,
        borderRadius: 18, width: 900, maxWidth: '100%', maxHeight: '92vh',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 24, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(20,20,45,0.8)', backdropFilter: 'blur(8px)',
          border: `1px solid ${t.surfaceBorder}`, color: t.text,
          cursor: 'pointer', fontSize: 14,
        }}>✕</button>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', flex: 1, minHeight: 0 }}>
          {/* LEFT — hero screenshot */}
          <div style={{
            background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', minHeight: 400, borderRight: `1px solid ${t.surfaceBorder}`,
          }}>
            {post.screenshot_url
              ? <img src={post.screenshot_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 80, opacity: 0.15 }}>✦</span>}
          </div>

          {/* RIGHT — details */}
          <div style={{ padding: '28px 28px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, fontWeight: 700, color: t.accentText, overflow: 'hidden', flexShrink: 0,
                boxShadow: tier > 0 ? `0 0 0 3px ${TIER_COLORS[tier]}40` : 'none',
              }}>
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (profile?.display_name || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{profile?.display_name || 'Dreamer'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                  {tierName && <span style={{ fontSize: 11, color: TIER_COLORS[tier], fontWeight: 600 }}>✦ {tierName}</span>}
                  <span style={{ fontSize: 11, color: t.textSoft }}>{timeAgo(post.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Title + Featured badge */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: t.text, lineHeight: 1.2, flex: 1, minWidth: 0 }}>
                {post.title}
              </h1>
              {post.is_featured && (
                <span style={{
                  flexShrink: 0, marginTop: 4,
                  padding: '4px 10px', borderRadius: 10,
                  background: `${t.accent}20`, border: `1px solid ${t.accent}50`,
                  fontSize: 10, fontWeight: 700, color: t.accent,
                  letterSpacing: '0.6px', textTransform: 'uppercase',
                }}>★ Featured</span>
              )}
            </div>

            {/* Description */}
            {post.description && (
              <p style={{ margin: 0, fontSize: 14, color: t.textSoft, lineHeight: 1.7 }}>
                {post.description}
              </p>
            )}

            {/* Mood + Music tags */}
            {(post.mood || post.music_station) && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.mood && (
                  <span style={{
                    padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: `${t.accent}15`, border: `1px solid ${t.accent}30`, color: t.accent,
                  }}>✦ {post.mood}</span>
                )}
                {post.music_station && (
                  <span style={{
                    padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: t.bg, border: `1px solid ${t.surfaceBorder}`, color: t.textSoft,
                  }}>🎵 {post.music_station}</span>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', paddingTop: 6, borderTop: `1px solid ${t.surfaceBorder}`, marginTop: 4 }}>
              <button onClick={toggleHeart} disabled={loading} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12,
                background: hearted ? `${t.accent}20` : `${t.accent}10`,
                border: `2px solid ${hearted ? t.accent : `${t.accent}50`}`,
                color: hearted ? t.accent : t.text,
                fontSize: 16, fontWeight: 800, cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit',
              }}>
                <RaindropIcon size={24} filled={hearted} color={t.accent} />
                {post.heart_count}
                <span style={{ fontSize: 11, fontWeight: 500, color: t.textSoft }}>raindrops</span>
              </button>
            </div>

            {/* CTA */}
            {onOpenBuilder && (
              <button onClick={() => onOpenBuilder(post)} style={{
                padding: '12px 18px', borderRadius: 10,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
              }}>
                ✦ Step into this room
              </button>
            )}
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div style={{
            padding: '18px 28px 22px', borderTop: `1px solid ${t.surfaceBorder}`, flexShrink: 0,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.textSoft, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>
              {relatedSource === 'designer' ? 'More from this designer'
                : relatedSource === 'contest' ? 'More from this contest'
                : 'Popular rooms'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {relatedPosts.map(rp => (
                <div key={rp.id} onClick={() => setPost(rp)} style={{
                  borderRadius: 10, overflow: 'hidden',
                  border: `1px solid ${t.surfaceBorder}`, cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }} className="ddd-tile">
                  <div style={{ height: 80, background: t.bg, overflow: 'hidden' }}>
                    {rp.screenshot_url
                      ? <img src={rp.screenshot_url} alt={rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 20, opacity: 0.2 }}>✦</div>}
                  </div>
                  <div style={{ padding: '6px 10px', fontSize: 11, color: t.text, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rp.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
