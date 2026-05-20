import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import { useAuth } from '@shared/auth/AuthContext'
import useMessageThread from '@shared/useMessageThread'
import RaindropIcon from '@shared/RaindropIcon'
import Logo from '@shared/Logo'

const DESIGNER_TIERS = ['', 'Reverie', 'Drift', 'Wander', 'Lucid', 'Ethereal']
const TIER_COLORS    = ['', '#9a7aee', '#70c090', '#f0c060', '#ff7aa0', '#c084fc']

export default function ProfilePage({ userId, onEnterBuilder }) {
  const t = useTheme()
  const [profile, setProfile]       = useState(null)
  const [rooms, setRooms]           = useState([])
  const [posts, setPosts]           = useState([])
  const [stats, setStats]           = useState({ hearts: 0, rooms: 0, points: 0 })
  const [contestWins, setContestWins] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase.from('profiles').select('display_name, bio, avatar_url, role, created_at, designer_tier, designer_title, ad_free').eq('id', userId).single(),
      supabase.from('saved_rooms').select('id, name, updated_at, thumbnail_url').eq('user_id', userId).eq('is_public', true).order('updated_at', { ascending: false }),
      supabase.from('community_posts').select('id, title, screenshot_url, heart_count, created_at').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('contest_entries').select('award, contest:contest_id(title)').eq('user_id', userId).eq('is_winner', true),
    ]).then(([{ data: prof }, { data: rms }, { data: psts }, { data: wins }]) => {
      setProfile(prof)
      setRooms(rms ?? [])
      setPosts(psts ?? [])
      setContestWins(wins ?? [])
      const totalHearts = (psts ?? []).reduce((s, p) => s + (p.heart_count ?? 0), 0)
      setStats({ hearts: totalHearts, rooms: (psts ?? []).length, points: 0 })
      setLoading(false)
      // Fetch loyalty balance
      supabase.rpc('get_loyalty_balance', { uid: userId }).then(({ data }) => {
        if (data != null) setStats(prev => ({ ...prev, points: Number(data) }))
      })
    })
  }, [userId])

  if (loading) return <div style={center}><p style={{ color: t.textSoft }}>Loading...</p></div>
  if (!profile) return <div style={center}><p style={{ color: t.textSoft }}>Profile not found</p></div>

  const initial = (profile.display_name || '?')[0].toUpperCase()
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const tier = profile.designer_tier ?? 0
  const tierName = DESIGNER_TIERS[tier]
  const tierColor = TIER_COLORS[tier] || t.accent

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: "'Outfit', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Logo size={24} color={t.accent} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>DaydreamDwelling</span>
        </div>
        <button onClick={onEnterBuilder} style={{ padding: '6px 16px', borderRadius: 8, background: t.accent, color: t.accentText, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Open Builder
        </button>
      </div>

      {/* Profile hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 24px', gap: 14 }}>
        {/* Avatar with tier glow ring */}
        <div style={{
          width: 96, height: 96, borderRadius: '50%', background: t.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, fontWeight: 700, color: t.accentText, overflow: 'hidden',
          border: `3px solid ${tier > 0 ? tierColor : t.surfaceBorder}`,
          boxShadow: tier > 0 ? `0 0 0 4px ${tierColor}30, 0 0 24px ${tierColor}20` : 'none',
          transition: 'box-shadow 0.3s, border-color 0.3s',
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: t.text }}>{profile.display_name || 'Anonymous Dreamer'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 }}>
            {tierName && <span style={{ fontSize: 12, fontWeight: 600, color: tierColor }}>✦ {tierName}</span>}
            {profile.ad_free && <span style={{ fontSize: 10, fontWeight: 600, color: t.accent, padding: '2px 8px', background: `${t.accent}15`, borderRadius: 8 }}>Supporter</span>}
            <span style={{ fontSize: 12, color: t.textSoft }}>Joined {joined}</span>
          </div>
        </div>

        {profile.bio && (
          <p style={{ margin: 0, fontSize: 14, color: t.textSoft, maxWidth: 440, textAlign: 'center', lineHeight: 1.7 }}>{profile.bio}</p>
        )}

        <MessageProfileBlock profileUserId={userId} partnerName={profile.display_name || 'Seller'} t={t} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, padding: '0 24px 32px', flexWrap: 'wrap' }}>
        <StatCard t={t} icon={<RaindropIcon size={18} filled color={t.accent} />} value={stats.hearts} label="Raindrops" />
        <StatCard t={t} icon="🌐" value={stats.rooms} label="Shared Rooms" />
        <StatCard t={t} icon="✦" value={stats.points} label="Dream Points" />
      </div>

      {/* Contest wins */}
      {contestWins.length > 0 && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {contestWins.map((w, i) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6,
                background: `${t.accent}10`, border: `1px solid ${t.accent}25`, fontSize: 12, fontWeight: 600, color: t.accent,
              }}>
                <RaindropIcon size={14} filled color={t.accent} />
                {w.award || 'Winner'}: {w.contest?.title || 'Contest'}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px 48px' }}>
        {/* Shared designs */}
        {posts.length > 0 && (
          <>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: t.textSoft, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              ✦ Shared Designs
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 36 }}>
              {posts.map(post => (
                <div key={post.id} style={{
                  background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12, overflow: 'hidden',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }} className="ddd-tile">
                  <div style={{ height: 160, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {post.screenshot_url
                      ? <img src={post.screenshot_url} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 36, opacity: 0.15 }}>✦</span>}
                  </div>
                  <div style={{ padding: '10px 14px' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.text }}>{post.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <RaindropIcon size={14} filled={post.heart_count > 0} color={post.heart_count > 0 ? t.accent : t.textSoft} />
                      <span style={{ fontSize: 12, color: t.textSoft }}>{post.heart_count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Room showcase */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: t.textSoft, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Saved Rooms {rooms.length > 0 && <span style={{ fontWeight: 400 }}>({rooms.length})</span>}
        </h2>
        {rooms.length === 0 && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 40, opacity: 0.15, marginBottom: 12 }}>✦</div>
            <p style={{ fontSize: 14, color: t.textSoft }}>No rooms shared yet</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {rooms.map(room => (
            <div key={room.id} style={{
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
            }} className="ddd-tile">
              <div style={{ height: 120, borderRadius: 8, background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {room.thumbnail_url
                  ? <img src={room.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 28, color: t.textSoft, opacity: 0.3 }}>🏠</span>}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: t.text }}>{room.name}</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: t.textSoft }}>
                  {new Date(room.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Direct-message block on the profile (general thread, no order_id). Hidden
// if the viewer isn't signed in or is on their own profile.
function MessageProfileBlock({ profileUserId, partnerName, t }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, sending, send, unreadCount } = useMessageThread({
    user,
    orderId: null,
    partnerId: profileUserId,
  })

  if (!user || !profileUserId || user.id === profileUserId) return null

  return (
    <div style={{ marginTop: 14, width: '100%', maxWidth: 520, textAlign: 'center' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '8px 18px', borderRadius: 10, border: `1px solid ${t.accent}`,
          background: open ? t.accent : 'transparent',
          color: open ? t.accentText : t.accent,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
      >
        💬 {open ? 'Close' : `Message ${partnerName}`}
        {unreadCount > 0 && (
          <span style={{ padding: '2px 8px', background: open ? t.accentText : t.accent, color: open ? t.accent : t.accentText, borderRadius: 10, fontSize: 10, fontWeight: 700 }}>
            {unreadCount} new
          </span>
        )}
      </button>
      {open && (
        <div style={{
          marginTop: 12, padding: 14, textAlign: 'left',
          background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 12,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {messages.length === 0 ? (
              <p style={{ margin: 0, fontSize: 12, color: t.textSoft, fontStyle: 'italic', textAlign: 'center', padding: '12px 0' }}>
                No messages yet — say hi.
              </p>
            ) : messages.map(m => {
              const mine = m.from_user_id === user.id
              return (
                <div key={m.id} style={{
                  padding: '7px 11px', borderRadius: 10, maxWidth: '78%',
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  background: mine ? t.accent : t.bg,
                  color: mine ? t.accentText : t.text,
                  border: mine ? 'none' : `1px solid ${t.surfaceBorder}`,
                }}>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.body}</p>
                  <p style={{ margin: '3px 0 0', fontSize: 10, opacity: 0.65 }}>
                    {new Date(m.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              style={{ flex: 1, padding: '8px 11px', fontSize: 13, fontFamily: 'inherit', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, background: t.bg, color: t.text, outline: 'none' }}
              placeholder={`Message ${partnerName}…`}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && draft.trim() && !sending) {
                  const { error } = await send(draft)
                  if (!error) setDraft('')
                }
              }}
            />
            <button
              style={{ padding: '8px 16px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: (!draft.trim() || sending) ? 'default' : 'pointer', opacity: (!draft.trim() || sending) ? 0.6 : 1 }}
              onClick={async () => {
                if (!draft.trim() || sending) return
                const { error } = await send(draft)
                if (!error) setDraft('')
              }}
              disabled={!draft.trim() || sending}
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ t, icon, value, label }) {
  return (
    <div style={{
      padding: '16px 24px', borderRadius: 14, minWidth: 130, textAlign: 'center',
      background: t.surface, border: `1px solid ${t.surfaceBorder}`,
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontSize: 16, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: t.text }}>{value}</div>
      <div style={{ fontSize: 11, color: t.textSoft, marginTop: 2 }}>{label}</div>
    </div>
  )
}

const center = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }
