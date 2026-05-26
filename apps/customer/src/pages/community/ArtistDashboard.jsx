import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import ArtistSelfListenPlayer from './ArtistSelfListenPlayer'

const STAT_COLORS = [
  { color: '#b8a0ff', bg: 'rgba(184,160,255,0.12)' },
  { color: '#f0a8d8', bg: 'rgba(240,168,216,0.12)' },
  { color: '#ffc87a', bg: 'rgba(255,200,122,0.12)' },
  { color: '#88d8b0', bg: 'rgba(136,216,176,0.12)' },
]

export default function ArtistDashboard({ onNavigate, onSignIn }) {
  const { user, profile } = useAuth()
  const t = useTheme()
  const [artist,    setArtist]    = useState(null)
  const [stats,     setStats]     = useState(null)
  const [recent,    setRecent]    = useState([])
  const [charges,   setCharges]   = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [needsAttn, setNeedsAttn] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    async function load() {
      setLoading(true)

      const { data: artistRow } = await supabase
        .from('artist_profiles').select('*').eq('user_id', user.id).maybeSingle()

      if (!artistRow) {
        setArtist(null)
        setStats({ plays: 0, clicks: 0, tracks: 0, balance: 0 })
        setLoading(false)
        return
      }
      setArtist(artistRow)

      const { data: tracks } = await supabase
        .from('artist_tracks')
        .select('id, title, play_count, skip_rate, approval_status, rotation_status, rejection_reason, submitted_at')
        .eq('artist_id', user.id)
        .order('submitted_at', { ascending: false })

      const trackIds = (tracks ?? []).map(tr => tr.id)
      const totalPlays = (tracks ?? []).reduce((s, tr) => s + (tr.play_count ?? 0), 0)
      const activeTracks = (tracks ?? []).filter(tr => tr.approval_status === 'approved' && tr.rotation_status !== 'removed').length

      let totalClicks = 0
      let recentPlays = []
      let recentCharges = []
      if (trackIds.length) {
        const { count } = await supabase
          .from('artist_ppc_clicks')
          .select('id', { count: 'exact', head: true })
          .in('track_id', trackIds)
        totalClicks = count ?? 0

        const [playsRes, chargesRes] = await Promise.all([
          supabase.from('artist_track_plays')
            .select('id, station, room_mood, completed, played_at, artist_tracks(title)')
            .in('track_id', trackIds)
            .order('played_at', { ascending: false })
            .limit(6),
          supabase.from('artist_ppc_clicks')
            .select('id, click_cost_cents, clicked_at, destination_label, artist_tracks(title)')
            .in('track_id', trackIds)
            .order('clicked_at', { ascending: false })
            .limit(12),
        ])
        recentPlays = playsRes.data ?? []
        recentCharges = chargesRes.data ?? []
      }

      const flagged = (tracks ?? []).filter(tr => tr.approval_status === 'flagged' || tr.approval_status === 'rejected' || tr.rotation_status === 'removed').slice(0, 5)
      const top = (tracks ?? [])
        .filter(tr => tr.approval_status === 'approved')
        .sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0))
        .slice(0, 5)

      setStats({ plays: totalPlays, clicks: totalClicks, tracks: activeTracks, balance: artistRow.ppc_balance_cents })
      setRecent(recentPlays)
      setCharges(recentCharges)
      setTopTracks(top)
      setNeedsAttn(flagged)
      setLoading(false)
    }
    load()
  }, [user])

  const name = artist?.artist_name || profile?.display_name || user?.email?.split('@')[0] || 'Artist'
  const s = makeStyles(t)

  if (!user) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: t.textSoft, marginBottom: 16 }}>Sign in to view your artist dashboard.</p>
      <button onClick={onSignIn} style={{ padding: '10px 22px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
    </div>
  )
  if (loading) return <div style={{ padding: 48, color: t.textSoft }}>Loading…</div>
  if (!artist) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={s.pageTitle}>You're not on the artist roster yet</h1>
        <p style={{ ...s.pageSubtitle, marginBottom: 20 }}>Submit your first track to claim an artist profile.</p>
        <button onClick={() => onNavigate('/community/artists/submit')} style={{
          padding: '12px 24px', background: t.accent, color: t.accentText,
          border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
        }}>+ Submit your first track</button>
      </div>
    )
  }

  const balanceDollars = (stats.balance / 100).toFixed(2)
  const ppcRate = artist.ppc_rate_cents ?? 15
  const clicksLeft = Math.floor(stats.balance / Math.max(ppcRate, 1))

  return (
    <div style={{ padding: '32px 0' }}>
      {/* Profile header — cover banner with avatar + name overlay. Doubles as
          a visual nudge to set images if they're missing (the placeholder
          gradient + "Add a cover" hint live in the edit page; here we just
          show the current state). */}
      <div style={{
        position: 'relative', marginBottom: 32,
        height: 200, borderRadius: 18, overflow: 'hidden',
        background: artist?.cover_url
          ? `center / cover no-repeat url(${artist.cover_url})`
          : `linear-gradient(135deg, ${t.accent}30 0%, ${t.accent}08 100%)`,
        border: `1px solid ${t.surfaceBorder}`,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: artist?.cover_url
            ? 'linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.55) 100%)'
            : 'none',
        }} />
        <div style={{
          position: 'absolute', left: 24, bottom: 18, right: 24,
          display: 'flex', alignItems: 'flex-end', gap: 16,
        }}>
          <div style={{
            width: 92, height: 92, borderRadius: '50%',
            background: artist?.avatar_url
              ? `center / cover no-repeat url(${artist.avatar_url})`
              : `${t.accent}30`,
            border: `3px solid ${artist?.cover_url ? '#fff' : t.surface}`,
            boxShadow: '0 4px 18px rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, color: artist?.cover_url ? '#fff' : t.accent,
            flexShrink: 0,
          }}>{!artist?.avatar_url && '♪'}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              margin: 0, fontSize: 28, fontWeight: 800,
              color: artist?.cover_url ? '#fff' : t.text,
              textShadow: artist?.cover_url ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
            }}>{name}</h1>
            {artist?.bio && (
              <p style={{
                margin: '4px 0 0', fontSize: 13,
                color: artist?.cover_url ? 'rgba(255,255,255,0.9)' : t.textSoft,
                textShadow: artist?.cover_url ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 480,
              }}>{artist.bio}</p>
            )}
          </div>
          <button onClick={() => onNavigate('/community/artists/profile')} style={{
            padding: '8px 14px', borderRadius: 8, border: 'none',
            background: artist?.cover_url ? 'rgba(255,255,255,0.92)' : t.accent,
            color: artist?.cover_url ? '#1a1a2e' : t.accentText,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            flexShrink: 0,
          }}>Edit profile</button>
        </div>
        {!artist?.cover_url && (
          <div style={{
            position: 'absolute', top: 12, right: 14,
            fontSize: 11, color: t.textSoft, fontStyle: 'italic',
          }}>Add a cover image in Edit profile →</div>
        )}
      </div>

      <ArtistSelfListenPlayer userId={user.id} />

      <div style={s.statsGrid}>
        {[
          { label: 'PPC Balance',    value: `$${balanceDollars}` },
          { label: 'Total Plays',    value: stats.plays.toLocaleString() },
          { label: 'Click-throughs', value: stats.clicks.toLocaleString() },
          { label: 'Active Tracks',  value: stats.tracks },
        ].map((stat, i) => (
          <StatCard key={stat.label} {...stat} {...STAT_COLORS[i]} t={t} />
        ))}
      </div>

      <div style={s.twoCol}>
        <div style={s.card}>
          <div style={s.cardHeader}>
            <h2 style={s.cardTitle}>Recent plays</h2>
            <button style={s.linkBtn} onClick={() => onNavigate('/community/artists/submit')}>+ New track</button>
          </div>
          {recent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <p style={s.dim}>No plays yet.</p>
              <button style={s.linkBtn} onClick={() => onNavigate('/community/artists/submit')}>Submit your first track →</button>
            </div>
          ) : (
            <div>
              <div style={s.tableHead}><span>Track</span><span>Station</span><span>Mood</span><span>Completed</span></div>
              {recent.map(item => (
                <div key={item.id} style={s.tableRow}>
                  <span style={s.cell}>{item.artist_tracks?.title ?? '—'}</span>
                  <span style={s.cell}>{item.station ?? '—'}</span>
                  <span style={s.cell}>{item.room_mood ?? '—'}</span>
                  <span style={s.cell}>{item.completed ? '✓' : '⤬'}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={s.card}>
          <h2 style={{ ...s.cardTitle, marginBottom: 14 }}>Quick actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {[
              { icon: '+', label: 'Submit New Track',          page: '/community/artists/submit',   color: '#b8a0ff' },
              { icon: '◈', label: 'Top Up PPC Balance',         page: '/community/artists/programs', color: '#f0a8d8' },
              { icon: '⊟', label: 'Advertising Opportunities', page: '/community/artists/programs', color: '#ffc87a' },
              { icon: '◫', label: 'Edit Artist Profile',        page: '/community/artists/profile',  color: '#88d8b0' },
            ].map(a => (
              <button key={a.label} style={{ ...s.actionBtn, cursor: 'pointer' }} onClick={() => onNavigate(a.page)}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, background: a.color + '30', color: a.color }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: t.text, fontWeight: 500, textAlign: 'left' }}>{a.label}</span>
                <span style={{ fontSize: 12, color: t.textSoft }}>→</span>
              </button>
            ))}
          </div>

          <PpcBalanceCard
            t={t}
            balanceDollars={balanceDollars}
            clicksLeft={clicksLeft}
            ppcRate={ppcRate}
            charges={charges}
            onTopUp={() => onNavigate('/community/artists/programs')}
          />
        </div>
      </div>

      {(needsAttn.length > 0 || topTracks.length > 0) && (
        <div style={{ ...s.twoCol, marginBottom: 20 }}>
          {needsAttn.length > 0 ? (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>
                  <span style={{ color: '#ffc87a', marginRight: 6 }}>⚠</span>
                  Needs your attention
                </h2>
              </div>
              {needsAttn.map(track => (
                <div key={track.id} style={s.attnRow}>
                  <div style={s.attnDot} />
                  <span style={{ flex: 1, fontSize: 13, color: t.text }}>{track.title}</span>
                  <span style={{ fontSize: 11, color: '#ffc87a' }}>{track.approval_status}</span>
                </div>
              ))}
            </div>
          ) : <div />}

          {topTracks.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <h2 style={s.cardTitle}>Top tracks</h2>
              </div>
              {topTracks.map((tr, i) => (
                <div key={tr.id} style={s.topRow}>
                  <span style={s.topRank}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 13, color: t.text, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tr.title}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>{(tr.play_count ?? 0).toLocaleString()} plays</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {stats.tracks === 0 && (
        <div style={{ marginTop: 16, background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: 28, textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: t.textSoft, marginBottom: 14 }}>You don't have any approved tracks yet.</p>
          <button style={{ padding: '11px 24px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }} onClick={() => onNavigate('/community/artists/submit')}>
            + Submit your first track
          </button>
        </div>
      )}
    </div>
  )
}

// Replaces the old progress-bar widget. Auto-scrolls a vertical ticker of recent
// PPC charges (track → destination · -$X.XX). Hover pauses so the artist can
// read the row they care about. Loops seamlessly by duplicating the list and
// translating -50% over the duration.
function PpcBalanceCard({ t, balanceDollars, clicksLeft, ppcRate, charges, onTopUp }) {
  const [paused, setPaused] = useState(false)
  const hasCharges = charges.length > 0
  const loop = hasCharges ? [...charges, ...charges] : []
  const scrollDuration = Math.max(20, charges.length * 2.5)

  return (
    <div style={{ background: `${t.accent}10`, borderRadius: 12, padding: '14px 16px' }}>
      <style>{`
        @keyframes ppcChargeScroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>◈ Remaining balance</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: t.accent }}>${balanceDollars}</span>
      </div>
      <p style={{ fontSize: 11, color: t.textSoft, margin: '0 0 10px' }}>~{clicksLeft.toLocaleString()} clicks left at ${(ppcRate / 100).toFixed(2)}/each</p>

      <div
        style={{
          height: 92, overflow: 'hidden', position: 'relative',
          borderTop: `1px solid ${t.surfaceBorder}`,
          paddingTop: 8, marginBottom: 10,
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        title="Hover to pause"
      >
        {hasCharges ? (
          <div style={{
            animation: `ppcChargeScroll ${scrollDuration}s linear infinite`,
            animationPlayState: paused ? 'paused' : 'running',
          }}>
            {loop.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 11, padding: '4px 0', color: t.textSoft }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {c.artist_tracks?.title ?? 'Untitled'} → {c.destination_label ?? '—'}
                </span>
                <span style={{ color: '#ff9a9a', flexShrink: 0 }}>−${(c.click_cost_cents / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: t.textSoft, textAlign: 'center', paddingTop: 24 }}>No charges yet.</div>
        )}
      </div>

      <button onClick={onTopUp} style={{
        width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
        background: t.accent, color: t.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}>Top up balance</button>
    </div>
  )
}

function StatCard({ label, value, color, bg, t }) {
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</div>
    </div>
  )
}

function makeStyles(t) {
  return {
    pageTitle:  { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle:{ fontSize: 13, color: t.textSoft },
    dim:        { fontSize: 13, color: t.textSoft },
    statsGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14, marginBottom: 24 },
    twoCol:     { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 20 },
    card:       { background: t.surface, backdropFilter: 'blur(12px)', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 16px rgba(0,0,0,0.05)', border: `1px solid ${t.surfaceBorder}` },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle:  { fontSize: 15, fontWeight: 700, color: t.text },
    linkBtn:    { background: 'transparent', border: 'none', color: t.accent, fontSize: 13, cursor: 'pointer', padding: 0 },
    tableHead:  { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', borderBottom: `1px solid ${t.surfaceBorder}`, fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 4 },
    tableRow:   { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8, padding: '10px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    cell:       { fontSize: 13, color: t.text, display: 'flex', alignItems: 'center' },
    actionBtn:  { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: 'none', background: `${t.accent}08`, cursor: 'pointer', width: '100%' },
    attnRow:    { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    attnDot:    { width: 8, height: 8, borderRadius: '50%', background: '#ffc87a', flexShrink: 0 },
    topRow:     { display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: `1px solid ${t.surfaceBorder}` },
    topRank:    { width: 20, fontSize: 11, fontWeight: 700, color: t.textSoft, textAlign: 'center', flexShrink: 0 },
  }
}
