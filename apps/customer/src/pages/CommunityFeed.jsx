import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export default function CommunityFeed({ onClose }) {
  const t = useTheme()
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [myHearts, setMyHearts] = useState(new Set())

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('community_posts')
      .select('*, profiles(display_name, avatar_url, designer_tier)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(data ?? [])
    setLoading(false)

    if (user) {
      const { data: hearts } = await supabase
        .from('community_hearts')
        .select('post_id')
        .eq('user_id', user.id)
      setMyHearts(new Set((hearts ?? []).map(h => h.post_id)))
    }
  }, [user])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  async function toggleHeart(postId) {
    if (!user) return
    const hearted = myHearts.has(postId)
    if (hearted) {
      await supabase.from('community_hearts').delete().eq('user_id', user.id).eq('post_id', postId)
      await supabase.from('community_posts').update({ heart_count: Math.max(0, (posts.find(p => p.id === postId)?.heart_count ?? 1) - 1) }).eq('id', postId)
      setMyHearts(prev => { const n = new Set(prev); n.delete(postId); return n })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, heart_count: Math.max(0, p.heart_count - 1) } : p))
    } else {
      await supabase.from('community_hearts').insert({ user_id: user.id, post_id: postId })
      await supabase.from('community_posts').update({ heart_count: (posts.find(p => p.id === postId)?.heart_count ?? 0) + 1 }).eq('id', postId)
      setMyHearts(prev => new Set([...prev, postId]))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, heart_count: p.heart_count + 1 } : p))

      // Award loyalty point for raindrop vote
      await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 1, reason: 'raindrop', ref_id: postId })
    }
  }

  const featured = posts.filter(p => p.is_featured)
  const regular  = posts.filter(p => !p.is_featured)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, background: t.bg, overflowY: 'auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '14px 24px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: t.bg, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>Community</h1>
        <button onClick={onClose} style={{ padding: '6px 14px', borderRadius: 8, background: 'transparent', border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, cursor: 'pointer', fontSize: 13 }}>
          ✕ Close
        </button>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px' }}>
        {loading && <p style={{ color: t.textSoft, textAlign: 'center' }}>Loading…</p>}

        {/* Featured section */}
        {featured.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: t.accent, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Featured</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 32 }}>
              {featured.map(post => <PostCard key={post.id} post={post} t={t} hearted={myHearts.has(post.id)} onHeart={() => toggleHeart(post.id)} />)}
            </div>
          </>
        )}

        {/* All posts */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: t.textSoft, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Latest Rooms</h2>
        {!loading && regular.length === 0 && <p style={{ color: t.textSoft, textAlign: 'center', padding: '40px 0' }}>No posts yet. Be the first to share your room!</p>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {regular.map(post => <PostCard key={post.id} post={post} t={t} hearted={myHearts.has(post.id)} onHeart={() => toggleHeart(post.id)} />)}
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, t, hearted, onHeart }) {
  const profile = post.profiles
  const tier = profile?.designer_tier ?? 0
  const tierName = DESIGNER_TIERS[tier] || ''

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
      {/* Screenshot */}
      <div style={{ height: 200, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {post.screenshot_url
          ? <img src={post.screenshot_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 40, opacity: 0.2 }}>🏠</span>}
      </div>

      <div style={{ padding: '14px 16px' }}>
        {/* Author row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: t.accentText, overflow: 'hidden', flexShrink: 0 }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (profile?.display_name || '?')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>{profile?.display_name || 'Dreamer'}</p>
            {tierName && <p style={{ margin: 0, fontSize: 10, color: TIER_COLORS[tier], fontWeight: 600 }}>{tierName}</p>}
          </div>
        </div>

        <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: t.text }}>{post.title}</h3>
        {post.description && <p style={{ margin: '0 0 10px', fontSize: 13, color: t.textSoft, lineHeight: 1.5 }}>{post.description}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={onHeart} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 13, padding: '2px 0',
            color: hearted ? t.accent : t.textSoft,
            fontWeight: hearted ? 700 : 400,
            transition: 'color 0.2s, transform 0.15s',
            transform: hearted ? 'scale(1.1)' : 'scale(1)',
          }}>
            <RaindropIcon size={18} filled={hearted} color={hearted ? t.accent : t.textSoft} />
            {post.heart_count}
          </button>
          <span style={{ fontSize: 12, color: t.textSoft }}>◈ {post.placement_count} placed</span>
        </div>
      </div>
    </div>
  )
}
