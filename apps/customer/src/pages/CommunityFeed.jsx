import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import CommunityPostDetail from './CommunityPostDetail'
import PostCard from './community/PostCard'

export default function CommunityFeed({ onClose }) {
  const t = useTheme()
  const { user } = useAuth()
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [myHearts, setMyHearts] = useState(new Set())
  const [selectedPost, setSelectedPost] = useState(null)

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
      <div style={{
        padding: '16px 24px', borderBottom: `1px solid ${t.surfaceBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, background: t.navBg, backdropFilter: 'blur(12px)', zIndex: 10,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: t.text }}>Community</h1>
          <p style={{ margin: '2px 0 0', fontSize: 11, color: t.textSoft }}>Room designs from the DaydreamDwelling family</p>
        </div>
        <button onClick={onClose} style={{
          padding: '6px 14px', borderRadius: 8, background: 'transparent',
          border: `1px solid ${t.surfaceBorder}`, color: t.textSoft, cursor: 'pointer', fontSize: 13,
        }}>✕ Close</button>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 20px' }}>
        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="ddd-skeleton" style={{ height: 280, borderRadius: 14, background: t.surface, border: `1px solid ${t.surfaceBorder}` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 20px', maxWidth: 420, margin: '0 auto' }}>
            <div style={{ fontSize: 56, opacity: 0.2, marginBottom: 16 }}>✦</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: '0 0 10px' }}>The community is just getting started</h3>
            <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, margin: '0 0 22px' }}>
              Build a room you love, then share it here. Your design could be the first one the world sees.
            </p>
            <button onClick={onClose} style={{
              padding: '11px 22px', background: t.accent, color: t.accentText,
              border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700,
            }}>Start building →</button>
          </div>
        )}

        {/* Featured section */}
        {featured.length > 0 && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: t.accent, margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Featured</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, marginBottom: 36 }}>
              {featured.map(post => (
                <PostCard key={post.id} post={post} t={t} hearted={myHearts.has(post.id)} onHeart={() => toggleHeart(post.id)} onOpen={() => setSelectedPost(post)} featured />
              ))}
            </div>
          </>
        )}

        {/* All posts */}
        {!loading && regular.length > 0 && (
          <>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: t.textSoft, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Latest Rooms</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {regular.map(post => (
                <PostCard key={post.id} post={post} t={t} hearted={myHearts.has(post.id)} onHeart={() => toggleHeart(post.id)} onOpen={() => setSelectedPost(post)} />
              ))}
            </div>
          </>
        )}
      </div>

      {selectedPost && (
        <CommunityPostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onOpenBuilder={(post) => {
            // Navigate to builder in explore mode for this room
            window.location.href = `${window.location.pathname}?exploreRoom=${post.id}`
          }}
        />
      )}
    </div>
  )
}

