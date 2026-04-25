import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { MOODS } from '@shared/useMood'
import PostCard from './community/PostCard'
import RaindropMobile from '../ui/RaindropMobile'
import ContestReveal from './ContestReveal'

const DEMO_COUNTS = [7, 23, 68, 149, 312, 876, 1543, 5280, 12750, 53400, 166297]

// Toggle: true = 100-entry stress test (every scheme at 100k+ peak, dwindling tail)
//         false = original 11 hand-picked entries
const HIGH_VOLUME_DEMO = true

// Original 11 — varied moods/tiers, tests pagination + medal frames + mood schemes
const MOCK_ENTRIES_ORIGINAL = [
  { id: '1',  vote_count: 47821, profiles: { display_name: 'Ember',       avatar_url: null, designer_tier: 5 }, community_posts: { screenshot_url: null, title: "Ember's Sunrise",          mood: "Ember's Sunrise" } },
  { id: '2',  vote_count: 9844,  profiles: { display_name: 'Ivy Rose',    avatar_url: null, designer_tier: 4 }, community_posts: { screenshot_url: null, title: 'Cottage Garden Bedroom',    mood: 'Cottagecore Dawn' } },
  { id: '3',  vote_count: 8217,  profiles: { display_name: 'Luna',        avatar_url: null, designer_tier: 4 }, community_posts: { screenshot_url: null, title: 'Moonlight Study',           mood: 'Moonlight' } },
  { id: '4',  vote_count: 6103,  profiles: { display_name: 'Wren',        avatar_url: null, designer_tier: 3 }, community_posts: { screenshot_url: null, title: 'The Professor Nook',        mood: 'Dark Academia' } },
  { id: '5',  vote_count: 5482,  profiles: { display_name: 'Marigold',    avatar_url: null, designer_tier: 3 }, community_posts: { screenshot_url: null, title: 'Golden Hour Reading Chair', mood: 'Golden Hour' } },
  { id: '6',  vote_count: 4198,  profiles: { display_name: 'Tide',        avatar_url: null, designer_tier: 3 }, community_posts: { screenshot_url: null, title: 'Morning Shoreline',         mood: 'Coastal Morning' } },
  { id: '7',  vote_count: 3376,  profiles: { display_name: 'Fern',        avatar_url: null, designer_tier: 2 }, community_posts: { screenshot_url: null, title: 'Conservatory Loft',         mood: 'Greenhouse' } },
  { id: '8',  vote_count: 2658,  profiles: { display_name: 'KingCitran',  avatar_url: null, designer_tier: 2 }, community_posts: { screenshot_url: null, title: 'Dream Cloud Studio',        mood: 'Dream State' } },
  { id: '9',  vote_count: 1947,  profiles: { display_name: 'Flux',        avatar_url: null, designer_tier: 2 }, community_posts: { screenshot_url: null, title: 'Neon Cyber Den',            mood: 'Neon Nights' } },
  { id: '10', vote_count: 1244,  profiles: { display_name: 'Harbor',      avatar_url: null, designer_tier: 1 }, community_posts: { screenshot_url: null, title: 'Cozy Winter Cabin',         mood: 'Vivid Sunset' } },
  { id: '11', vote_count: 876,   profiles: { display_name: 'Aster',       avatar_url: null, designer_tier: 1 }, community_posts: { screenshot_url: null, title: 'Bright Morning Kitchen',    mood: 'Bright Day' } },
]

// 100-entry stress test — every scheme gets a 100k+ peak entry, then dwindle.
const MOCK_ENTRIES_HIGH_VOL = (() => {
  // Top 14: one per scheme, 200k → 109k
  const top = [
    { mood: "Ember's Sunrise",          name: 'Ember',     title: "Ember's Sunrise" },
    { mood: 'Vivid Sunset',             name: 'Crimson',   title: 'Sunset Cathedral' },
    { mood: 'Northern Lights',          name: 'Aurora',    title: 'Borealis Ballroom' },
    { mood: 'Golden Hour',              name: 'Marigold',  title: 'Golden Hour Atelier' },
    { mood: 'Bright Day',               name: 'Solstice',  title: 'Midday Veranda' },
    { mood: 'Greenhouse',               name: 'Fern',      title: 'Conservatory Royale' },
    { mood: 'Moonlight',                name: 'Luna',      title: 'Lunar Library' },
    { mood: 'Cottagecore Dawn',         name: 'Ivy Rose',  title: 'Dawn Cottage' },
    { mood: 'Coastal Morning',          name: 'Tide',      title: 'Morning Shoreline' },
    { mood: 'Dream State',              name: 'KingCitran',title: 'Dream Cloud Studio' },
    { mood: 'Candlelit Cozy Evening',   name: 'Wax',       title: 'Candlelit Sanctum' },
    { mood: 'Dark Academia',            name: 'Wren',      title: 'Professor Nook' },
    { mood: 'Neon Nights',              name: 'Flux',      title: 'Neon Cyber Den' },
    { mood: 'Studio',                   name: 'Atelier',   title: 'Studio Showcase' },
  ]
  const moods = top.map(t => t.mood)
  const entries = top.map((t, i) => ({
    id: `top-${i}`,
    vote_count: 200000 - i * 7000,                                                 // 200k → 109k
    profiles: { display_name: t.name, avatar_url: null, designer_tier: 5 },
    community_posts: { screenshot_url: null, title: t.title, mood: t.mood },
  }))
  // Mid: 50 entries 95k → 10k, cycling through moods
  for (let i = 0; i < 50; i++) {
    entries.push({
      id: `mid-${i}`,
      vote_count: Math.floor(95000 - (i / 49) * 85000),
      profiles: { display_name: `Designer ${i + 15}`, avatar_url: null, designer_tier: 3 + (i % 2) },
      community_posts: { screenshot_url: null, title: `Entry ${i + 15}`, mood: moods[i % moods.length] },
    })
  }
  // Tail: 36 entries 9.5k → 800, cycling through moods
  for (let i = 0; i < 36; i++) {
    entries.push({
      id: `tail-${i}`,
      vote_count: Math.floor(9500 - (i / 35) * 8700),
      profiles: { display_name: `Designer ${i + 65}`, avatar_url: null, designer_tier: 1 + (i % 2) },
      community_posts: { screenshot_url: null, title: `Entry ${i + 65}`, mood: moods[(i + 7) % moods.length] },
    })
  }
  return entries
})()

const MOCK_ENTRIES = HIGH_VOLUME_DEMO ? MOCK_ENTRIES_HIGH_VOL : MOCK_ENTRIES_ORIGINAL

export default function CommunityHome({ cart, onNavigate }) {
  const t = useTheme()
  const { user } = useAuth()
  const [posts, setPosts]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [myHearts, setMyHearts]   = useState(new Set())
  const [moodFilter, setMoodFilter] = useState(null)
  const [designers, setDesigners] = useState([])
  const [featuredRoom, setFeatured] = useState(null)
  const [showReveal, setShowReveal] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('community_posts')
      .select('*, profiles(display_name, avatar_url, designer_tier)')
      .order('created_at', { ascending: false })
      .limit(36)
    if (moodFilter) query = query.eq('mood', moodFilter)

    const { data } = await query
    const rows = data ?? []
    setPosts(rows)
    setFeatured(rows.find(p => p.is_featured) ?? rows[0] ?? null)
    setLoading(false)

    if (user) {
      const { data: hearts } = await supabase
        .from('community_hearts').select('post_id').eq('user_id', user.id)
      setMyHearts(new Set((hearts ?? []).map(h => h.post_id)))
    }
  }, [user, moodFilter])

  useEffect(() => { fetchPosts() }, [fetchPosts])

  useEffect(() => {
    supabase.from('profiles')
      .select('id, display_name, avatar_url, designer_tier')
      .gt('designer_tier', 0)
      .order('designer_tier', { ascending: false })
      .limit(12)
      .then(({ data }) => setDesigners(data ?? []))
  }, [])

  async function toggleHeart(postId) {
    if (!user) return
    const hearted = myHearts.has(postId)
    if (hearted) {
      await supabase.from('community_hearts').delete().eq('user_id', user.id).eq('post_id', postId)
      await supabase.from('community_posts').update({
        heart_count: Math.max(0, (posts.find(p => p.id === postId)?.heart_count ?? 1) - 1),
      }).eq('id', postId)
      setMyHearts(prev => { const n = new Set(prev); n.delete(postId); return n })
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, heart_count: Math.max(0, p.heart_count - 1) } : p))
    } else {
      await supabase.from('community_hearts').insert({ user_id: user.id, post_id: postId })
      await supabase.from('community_posts').update({
        heart_count: (posts.find(p => p.id === postId)?.heart_count ?? 0) + 1,
      }).eq('id', postId)
      setMyHearts(prev => new Set([...prev, postId]))
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, heart_count: p.heart_count + 1 } : p))
      await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 1, reason: 'raindrop', ref_id: postId })
    }
  }

  function handleBuyRoom(post) {
    onNavigate(`/community/room/${post.id}`)
  }

  const TIER_COLORS = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']
  const TIER_NAMES  = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']

  return (
    <div style={{ paddingTop: 32, paddingBottom: 48 }}>

      {/* Hero — featured room */}
      {featuredRoom && !moodFilter && (
        <div style={{
          borderRadius: 18, overflow: 'hidden', marginBottom: 36,
          border: `1px solid ${t.surfaceBorder}`, background: t.surface,
          display: 'grid', gridTemplateColumns: '1.4fr 1fr', minHeight: 280,
        }} className="ddd-tile">
          <div style={{ background: t.bg, overflow: 'hidden' }}>
            {featuredRoom.screenshot_url
              ? <img src={featuredRoom.screenshot_url} alt={featuredRoom.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 80, opacity: 0.1 }}>✦</div>}
          </div>
          <div style={{ padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            {featuredRoom.is_featured && (
              <span style={{ fontSize: 10, fontWeight: 700, color: t.accent, letterSpacing: '1.5px', textTransform: 'uppercase' }}>✦ Featured Room</span>
            )}
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: t.text, lineHeight: 1.3 }}>{featuredRoom.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: t.textSoft }}>
              by {featuredRoom.profiles?.display_name || 'Dreamer'}
            </p>
            {featuredRoom.description && (
              <p style={{ margin: 0, fontSize: 13, color: t.textSoft, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {featuredRoom.description}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => onNavigate(`/community/room/${featuredRoom.id}`)} style={{
                padding: '10px 20px', borderRadius: 10,
                background: t.accent, color: t.accentText, border: 'none',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>View Room + Buy Items</button>
              <button onClick={() => { window.location.href = `/?exploreRoom=${featuredRoom.id}&fromCommunity=1` }} style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'transparent', color: t.accent,
                border: `1px solid ${t.accent}40`,
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Explore in 3D</button>
            </div>
          </div>
        </div>
      )}

      {/* Trending designers */}
      {designers.length > 0 && !moodFilter && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: t.textSoft, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Trending Designers</h3>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
            {designers.map(d => (
              <button key={d.id} onClick={() => onNavigate(`/community/profile/${d.id}`)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none', cursor: 'pointer',
                minWidth: 72, padding: 0,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: t.accentText, overflow: 'hidden',
                  boxShadow: `0 0 0 3px ${TIER_COLORS[d.designer_tier]}40`,
                }}>
                  {d.avatar_url
                    ? <img src={d.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (d.display_name || '?')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: 10, color: t.text, fontWeight: 600, maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.display_name || 'Dreamer'}
                </span>
                <span style={{ fontSize: 9, color: TIER_COLORS[d.designer_tier], fontWeight: 600 }}>
                  {TIER_NAMES[d.designer_tier]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dev demo toggle */}
      <button onClick={() => setShowDemo(d => !d)} style={{
        marginBottom: 12, padding: '4px 12px', borderRadius: 8, fontSize: 10,
        background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
        color: t.textSoft, cursor: 'pointer', opacity: 0.5,
      }}>{showDemo ? 'Hide' : 'Show'} Dev Preview</button>

      {showDemo && <div style={{ marginBottom: 32, padding: '20px 16px', background: t.surface, borderRadius: 18, border: `1px solid ${t.surfaceBorder}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: t.textSoft, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Formation + Color Options (demo)</h3>
        <p style={{ fontSize: 11, color: t.textSoft, margin: '0 0 16px' }}>Rain+Arc hybrid in dreamcloud. Different vote counts to compare.</p>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[42, 312, 1543, 5280, 12750, 53400].map(n => (
            <div key={n} style={{ textAlign: 'center' }}>
              <RaindropMobile isStatic count={n} filled accentColor={t.accent} size="small" formation="rain-arc" colorScheme="dreamcloud" />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <p style={{ fontSize: 11, color: t.textSoft, width: '100%', textAlign: 'center', margin: '0 0 8px' }}>Same count (5,280) across all color schemes with rain-arc:</p>
          {['daylight', 'sunset', 'northern', 'ember', 'dreamcloud'].map(cs => (
            <div key={cs} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: t.textSoft, marginBottom: 4, textTransform: 'capitalize' }}>{cs}</div>
              <RaindropMobile isStatic count={5280} filled accentColor={t.accent} size="small" formation="rain-arc" colorScheme={cs} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <p style={{ fontSize: 11, color: t.textSoft, width: '100%', textAlign: 'center', margin: '0 0 8px' }}>Mood-themed schemes (5,280 count):</p>
          {['goldenhour', 'daylight', 'vividsunset', 'ember', 'candlelight', 'moonlight', 'northern', 'neon', 'greenhouse', 'cottagedawn', 'coastal', 'dreamcloud', 'academia', 'studio'].map(cs => (
            <div key={cs} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: t.textSoft, marginBottom: 4, textTransform: 'capitalize' }}>{cs}</div>
              <RaindropMobile isStatic count={5280} filled accentColor={t.accent} size="small" formation="rain-arc" colorScheme={cs} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => setShowReveal(true)} style={{
            padding: '10px 24px', borderRadius: 10,
            background: t.accent, color: t.accentText, border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}>Preview Contest Reveal</button>
        </div>
      </div>}
      {showReveal && (
        <ContestReveal
          entries={MOCK_ENTRIES}
          contest={{ title: 'Golden Hour Living Room', prize_description: 'Featured on homepage + store credit' }}
          onClose={() => setShowReveal(false)}
        />
      )}

      {/* Browse by theme */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: t.textSoft, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Browse by Theme</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setMoodFilter(null)} style={{
            padding: '7px 16px', borderRadius: 20,
            background: !moodFilter ? t.accent : 'transparent',
            color: !moodFilter ? t.accentText : t.textSoft,
            border: `1px solid ${!moodFilter ? t.accent : t.surfaceBorder}`,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>All</button>
          {MOODS.map(m => (
            <button key={m.key} onClick={() => setMoodFilter(moodFilter === m.key ? null : m.key)} style={{
              padding: '7px 16px', borderRadius: 20,
              background: moodFilter === m.key ? t.accent : 'transparent',
              color: moodFilter === m.key ? t.accentText : t.textSoft,
              border: `1px solid ${moodFilter === m.key ? t.accent : t.surfaceBorder}`,
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            }}>{m.icon} {m.label}</button>
          ))}
        </div>
      </div>

      {/* Room grid */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ddd-skeleton" style={{ height: 300, borderRadius: 14, background: t.surface, border: `1px solid ${t.surfaceBorder}` }} />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>✦</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 8px' }}>
            {moodFilter ? `No ${moodFilter} rooms yet` : 'The community is just getting started'}
          </h3>
          <p style={{ fontSize: 14, color: t.textSoft, margin: 0 }}>
            {moodFilter ? 'Try a different theme or check back soon.' : 'Be the first — open the builder and share your room.'}
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
          {posts.filter(p => p !== featuredRoom || moodFilter).map(post => (
            <PostCard
              key={post.id}
              post={post}
              t={t}
              hearted={myHearts.has(post.id)}
              onHeart={() => toggleHeart(post.id)}
              onOpen={() => onNavigate(`/community/room/${post.id}`)}
              featured={post.is_featured}
            />
          ))}
        </div>
      )}

      {/* Open builder CTA */}
      <div style={{
        marginTop: 48, padding: '36px 28px', borderRadius: 18,
        background: `${t.accent}08`, border: `1px solid ${t.accent}20`,
        textAlign: 'center',
      }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: t.text }}>Want to design your own?</h3>
        <p style={{ margin: '0 0 16px', fontSize: 14, color: t.textSoft }}>
          Open the 3D builder, set the mood, furnish your room, and share it here.
        </p>
        <a href="/" style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 10,
          background: t.accent, color: t.accentText, textDecoration: 'none',
          fontSize: 15, fontWeight: 700,
        }}>Open the Builder →</a>
      </div>
    </div>
  )
}
