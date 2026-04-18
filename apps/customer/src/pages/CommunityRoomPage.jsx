import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import RaindropIcon from '@shared/RaindropIcon'
import { resolveRoomItems } from '../utils/resolveRoomItems'
import { DESIGNER_TIERS, TIER_COLORS, timeAgo } from './community/PostCard'

export default function CommunityRoomPage({ postId, cart, onNavigate }) {
  const t = useTheme()
  const { user } = useAuth()
  const [post, setPost]           = useState(null)
  const [roomItems, setRoomItems] = useState([])
  const [hearted, setHearted]     = useState(false)
  const [loading, setLoading]     = useState(true)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [related, setRelated]     = useState([])
  const [addedAll, setAddedAll]   = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: postData } = await supabase
        .from('community_posts')
        .select('*, profiles(display_name, avatar_url, designer_tier)')
        .eq('id', postId).maybeSingle()
      if (cancelled || !postData) { setLoading(false); return }
      setPost(postData)
      setLoading(false)

      if (user) {
        const { data: h } = await supabase
          .from('community_hearts').select('post_id')
          .eq('user_id', user.id).eq('post_id', postId).maybeSingle()
        if (!cancelled) setHearted(!!h)
      }

      if (postData.room_id) {
        setItemsLoading(true)
        const { data: room } = await supabase
          .from('saved_rooms').select('data')
          .eq('id', postData.room_id).maybeSingle()
        if (!cancelled && room?.data) {
          const resolved = await resolveRoomItems(room.data)
          setRoomItems(resolved.filter(i => i.source !== 'unknown'))
        }
        if (!cancelled) setItemsLoading(false)
      } else {
        setItemsLoading(false)
      }

      const { data: rel } = await supabase
        .from('community_posts')
        .select('id, title, screenshot_url, heart_count, profiles(display_name, avatar_url)')
        .eq('user_id', postData.user_id).neq('id', postId)
        .order('heart_count', { ascending: false }).limit(4)
      if (!cancelled) setRelated(rel ?? [])
    }
    load()
    return () => { cancelled = true }
  }, [postId, user])

  async function toggleHeart() {
    if (!user || !post) return
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

  function handleBuyAll() {
    if (roomItems.length === 0) return
    cart.addRoomItems(roomItems)
    setAddedAll(true)
    setTimeout(() => setAddedAll(false), 2500)
  }

  function handleAddOne(item) {
    cart.addItem(item.typeKey, item.sizeIndex, item.swatchIndex)
  }

  if (loading) {
    return <div style={{ padding: '80px 0', textAlign: 'center', color: t.textSoft }}>Loading room...</div>
  }

  if (!post) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ color: t.text, fontSize: 20, fontWeight: 700 }}>Room not found</h2>
        <button onClick={() => onNavigate('/community')} style={{
          marginTop: 16, padding: '10px 20px', borderRadius: 10,
          background: t.accent, color: t.accentText, border: 'none',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>Back to Community</button>
      </div>
    )
  }

  const profile = post.profiles
  const tier = profile?.designer_tier ?? 0
  const totalPrice = roomItems.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <div style={{ paddingTop: 24, paddingBottom: 48 }}>
      {/* Back link */}
      <button onClick={() => onNavigate('/community')} style={{
        background: 'transparent', border: 'none', color: t.textSoft,
        fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0,
      }}>← Back to Community</button>

      {/* Hero screenshot */}
      <div style={{
        borderRadius: 18, overflow: 'hidden', marginBottom: 24,
        background: t.bg, maxHeight: 440,
        border: `1px solid ${t.surfaceBorder}`,
      }}>
        {post.screenshot_url
          ? <img src={post.screenshot_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', maxHeight: 440 }} />
          : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, opacity: 0.1 }}>✦</div>}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, alignItems: 'start' }}>

        {/* Left — room info */}
        <div>
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: t.accentText, overflow: 'hidden',
              boxShadow: tier > 0 ? `0 0 0 3px ${TIER_COLORS[tier]}40` : 'none',
              cursor: 'pointer',
            }} onClick={() => onNavigate(`/community/profile/${post.user_id}`)}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (profile?.display_name || '?')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>{profile?.display_name || 'Dreamer'}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {tier > 0 && <span style={{ fontSize: 11, color: TIER_COLORS[tier], fontWeight: 600 }}>✦ {DESIGNER_TIERS[tier]}</span>}
                <span style={{ fontSize: 11, color: t.textSoft }}>{timeAgo(post.created_at)}</span>
              </div>
            </div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, color: t.text }}>{post.title}</h1>
          {post.description && (
            <p style={{ margin: '0 0 16px', fontSize: 14, color: t.textSoft, lineHeight: 1.7 }}>{post.description}</p>
          )}

          {/* Tags */}
          {(post.mood || post.music_station) && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {post.mood && <span style={{ padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${t.accent}15`, border: `1px solid ${t.accent}30`, color: t.accent }}>✦ {post.mood}</span>}
              {post.music_station && <span style={{ padding: '5px 12px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: t.bg, border: `1px solid ${t.surfaceBorder}`, color: t.textSoft }}>🎵 {post.music_station}</span>}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
            <button onClick={toggleHeart} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 12,
              background: hearted ? `${t.accent}20` : `${t.accent}10`,
              border: `2px solid ${hearted ? t.accent : `${t.accent}50`}`,
              color: hearted ? t.accent : t.text,
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}>
              <RaindropIcon size={22} filled={hearted} color={t.accent} />
              {post.heart_count} <span style={{ fontSize: 11, fontWeight: 500, color: t.textSoft }}>raindrops</span>
            </button>
            <button onClick={() => { window.location.href = `/?exploreRoom=${post.id}&fromCommunity=1` }} style={{
              padding: '10px 18px', borderRadius: 12,
              background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
              color: t.text, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Explore in 3D →</button>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: t.textSoft, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>More from this designer</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
                {related.map(rp => (
                  <div key={rp.id} onClick={() => onNavigate(`/community/room/${rp.id}`)} style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    border: `1px solid ${t.surfaceBorder}`,
                  }} className="ddd-tile">
                    <div style={{ height: 80, background: t.bg, overflow: 'hidden' }}>
                      {rp.screenshot_url
                        ? <img src={rp.screenshot_url} alt={rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, opacity: 0.15 }}>✦</div>}
                    </div>
                    <div style={{ padding: '6px 10px', fontSize: 11, color: t.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rp.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — item list + buy */}
        <div style={{
          position: 'sticky', top: 72,
          background: t.surface, border: `1px solid ${t.surfaceBorder}`,
          borderRadius: 16, padding: '20px', maxHeight: 'calc(100vh - 88px)', overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: t.text }}>Items in this Room</h3>
            <span style={{ fontSize: 12, color: t.textSoft }}>{roomItems.length} items</span>
          </div>

          {itemsLoading && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: t.textSoft, fontSize: 13 }}>Loading items...</div>
          )}

          {!itemsLoading && roomItems.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center', color: t.textSoft, fontSize: 13 }}>
              No purchasable items found in this room.
            </div>
          )}

          {!itemsLoading && roomItems.length > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {roomItems.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 10,
                    background: t.bg, border: `1px solid ${t.surfaceBorder}`,
                  }}>
                    {item.swatchHex && (
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: item.swatchHex, border: `1px solid ${t.surfaceBorder}`, flexShrink: 0 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 10, color: t.textSoft }}>
                        {item.brand}{item.sizeName ? ` · ${item.sizeName}` : ''}{item.qty > 1 ? ` × ${item.qty}` : ''}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: t.text, flexShrink: 0 }}>
                      ${(item.price * item.qty).toFixed(2)}
                    </div>
                    <button onClick={() => handleAddOne(item)} style={{
                      padding: '4px 8px', borderRadius: 6,
                      background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
                      color: t.accent, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}>+ Cart</button>
                  </div>
                ))}
              </div>

              {/* Total + Buy All */}
              <div style={{ borderTop: `1px solid ${t.surfaceBorder}`, paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: t.text }}>Room Total</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: t.text }}>${totalPrice.toFixed(2)}</span>
                </div>
                <button onClick={handleBuyAll} style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  background: addedAll ? '#22c55e' : t.accent,
                  color: addedAll ? '#fff' : t.accentText,
                  border: 'none', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', transition: 'background 0.3s',
                }}>
                  {addedAll ? '✓ Added to Cart!' : `Buy This Room — $${totalPrice.toFixed(2)}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
