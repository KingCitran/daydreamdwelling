import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Mirrors the seller DashboardPage layout — stat cards, two-col main, optional
// attention/top row, empty state. Differentiation: plays/clicks/balance instead of
// revenue/orders, PPC balance widget instead of tier progress, Top Tracks instead
// of Top Sellers, flagged/rejected tracks instead of unshipped orders.

// Toggle: when true, skip Supabase and inject hardcoded mock data so the dashboard
// can be previewed without a real artist profile + approved tracks. Flip to false
// for production.
const DEMO_MODE = true

const STAT_COLORS = [
  { color: '#b8a0ff', bg: 'rgba(184,160,255,0.12)' },
  { color: '#f0a8d8', bg: 'rgba(240,168,216,0.12)' },
  { color: '#ffc87a', bg: 'rgba(255,200,122,0.12)' },
  { color: '#88d8b0', bg: 'rgba(136,216,176,0.12)' },
]

const MOCK_ARTIST = {
  user_id:           'demo-artist',
  artist_name:       'Hollow Branches',
  bio:               'Ambient and lo-fi for late-night rooms. Spotify + Bandcamp.',
  external_links:    { spotify: 'https://open.spotify.com/', bandcamp: 'https://bandcamp.com/' },
  ppc_balance_cents: 450,
  ppc_rate_cents:    15,
  is_verified:       true,
}

// Real audio assets that exist in /public/audio/ so playback actually works.
const AUDIO_POOL = [
  '/audio/gentle-rain.mp3',
  '/audio/thunder-rumble.mp3',
  '/audio/crack-1.mp3',
  '/audio/crack-2.mp3',
  '/audio/crack-3.mp3',
  '/audio/crack-4.mp3',
]

const MOCK_TRACKS = [
  { id: 'm1', title: 'Sunrise Hymn',    play_count: 2890, skip_rate: 0.12, approval_status: 'approved', rotation_status: 'active',  audio_url: AUDIO_POOL[0], duration_seconds: 184 },
  { id: 'm2', title: 'Late Night Drive',play_count: 1247, skip_rate: 0.18, approval_status: 'approved', rotation_status: 'active',  audio_url: AUDIO_POOL[1], duration_seconds: 213 },
  { id: 'm3', title: 'Empty Pages',     play_count: 423,  skip_rate: 0.31, approval_status: 'approved', rotation_status: 'active',  audio_url: AUDIO_POOL[2], duration_seconds: 156 },
  { id: 'm4', title: 'Static Halo',     play_count: 102,  skip_rate: 0.47, approval_status: 'approved', rotation_status: 'limited', audio_url: AUDIO_POOL[3], duration_seconds: 178 },
  { id: 'm5', title: 'Quietly Drowning',play_count: 0,    skip_rate: 0,    approval_status: 'pending',  rotation_status: 'active',  audio_url: AUDIO_POOL[4], duration_seconds: 142, submitted_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
  { id: 'm6', title: 'Ghost Frequency', play_count: 12,   skip_rate: 0.78, approval_status: 'approved', rotation_status: 'removed', audio_url: AUDIO_POOL[5], duration_seconds: 98, rejection_reason: 'High skip rate — removed from rotation' },
]

const MOCK_RECENT = [
  { id: 'r1', station: 'Cozy',    room_mood: "Ember's Sunrise",       completed: true,  artist_tracks: { title: 'Sunrise Hymn' } },
  { id: 'r2', station: 'Evening', room_mood: 'Moonlight',             completed: true,  artist_tracks: { title: 'Late Night Drive' } },
  { id: 'r3', station: 'Cozy',    room_mood: 'Cottagecore Dawn',      completed: false, artist_tracks: { title: 'Empty Pages' } },
  { id: 'r4', station: 'Focus',   room_mood: 'Dark Academia',         completed: true,  artist_tracks: { title: 'Sunrise Hymn' } },
  { id: 'r5', station: 'Evening', room_mood: 'Candlelit Cozy Evening',completed: true,  artist_tracks: { title: 'Late Night Drive' } },
  { id: 'r6', station: 'Cozy',    room_mood: 'Dream State',           completed: false, artist_tracks: { title: 'Static Halo' } },
]

const MOCK_CLICKS = 247

export default function ArtistDashboard({ onNavigate, onSignIn }) {
  const { user, profile } = useAuth()
  const t = useTheme()
  const [artist,    setArtist]    = useState(null)
  const [stats,     setStats]     = useState(null)
  const [recent,    setRecent]    = useState([])
  const [topTracks, setTopTracks] = useState([])
  const [needsAttn, setNeedsAttn] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (DEMO_MODE) {
      // Inject mock data so the dashboard renders without a real artist + tracks.
      const totalPlays = MOCK_TRACKS.reduce((s, tr) => s + tr.play_count, 0)
      const activeTracks = MOCK_TRACKS.filter(tr => tr.approval_status === 'approved' && tr.rotation_status !== 'removed').length
      const flagged = MOCK_TRACKS.filter(tr => tr.approval_status === 'flagged' || tr.approval_status === 'rejected' || tr.rotation_status === 'removed').slice(0, 5)
      const top = MOCK_TRACKS.filter(tr => tr.approval_status === 'approved').sort((a, b) => b.play_count - a.play_count).slice(0, 5)
      setArtist(MOCK_ARTIST)
      setStats({ plays: totalPlays, clicks: MOCK_CLICKS, tracks: activeTracks, balance: MOCK_ARTIST.ppc_balance_cents })
      setRecent(MOCK_RECENT)
      setTopTracks(top)
      setNeedsAttn(flagged)
      setLoading(false)
      return
    }

    if (!user) return
    async function load() {
      setLoading(true)

      const { data: artistRow } = await supabase
        .from('artist_profiles').select('*').eq('user_id', user.id).maybeSingle()

      if (!artistRow) {
        // No artist profile — let the parent decide what to render (empty state below handles it)
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
      if (trackIds.length) {
        const { count } = await supabase
          .from('artist_ppc_clicks')
          .select('id', { count: 'exact', head: true })
          .in('track_id', trackIds)
        totalClicks = count ?? 0

        const { data: rp } = await supabase
          .from('artist_track_plays')
          .select('id, station, room_mood, completed, played_at, artist_tracks(title)')
          .in('track_id', trackIds)
          .order('played_at', { ascending: false })
          .limit(6)
        recentPlays = rp ?? []
      }

      const flagged = (tracks ?? []).filter(tr => tr.approval_status === 'flagged' || tr.approval_status === 'rejected').slice(0, 5)
      const top = (tracks ?? [])
        .filter(tr => tr.approval_status === 'approved')
        .sort((a, b) => (b.play_count ?? 0) - (a.play_count ?? 0))
        .slice(0, 5)

      setStats({ plays: totalPlays, clicks: totalClicks, tracks: activeTracks, balance: artistRow.ppc_balance_cents })
      setRecent(recentPlays)
      setTopTracks(top)
      setNeedsAttn(flagged)
      setLoading(false)
    }
    load()
  }, [user])

  const name = artist?.artist_name || profile?.display_name || user?.email?.split('@')[0] || 'Artist'
  const s = makeStyles(t)

  if (!DEMO_MODE && !user) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: t.textSoft, marginBottom: 16 }}>Sign in to view your artist dashboard.</p>
      <button onClick={onSignIn} style={{ padding: '10px 22px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
    </div>
  )

  if (loading) return <div style={{ padding: 48, color: t.textSoft }}>Loading…</div>

  if (!artist) {
    // No artist profile yet — invite them to create one via the submit flow
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
      {DEMO_MODE && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: `${t.accent}18`, border: `1px dashed ${t.accent}55`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 12, color: t.text,
        }}>
          <span><strong style={{ color: t.accent }}>DEMO MODE</strong> — mock artist + tracks. Toggle <code>DEMO_MODE</code> in <code>ArtistDashboard.jsx</code> to disable.</span>
        </div>
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={s.pageTitle}>Hey, {name} ☁</h1>
        <p style={s.pageSubtitle}>Here's how your tracks are doing.</p>
      </div>

      {/* Demo player — only visible in DEMO_MODE so the founder can hear tracks */}
      {DEMO_MODE && <DemoPlayer t={t} />}

      {/* Stat cards */}
      <div style={s.statsGrid}>
        {[
          { label: 'PPC Balance',   value: `$${balanceDollars}`,             pct: Math.min(100, Math.round((stats.balance / 5000) * 100)) },
          { label: 'Total Plays',   value: stats.plays.toLocaleString(),     pct: Math.min(100, Math.round(Math.log10(Math.max(stats.plays, 1)) * 25)) },
          { label: 'Click-throughs', value: stats.clicks.toLocaleString(),   pct: Math.min(100, Math.round(Math.log10(Math.max(stats.clicks, 1)) * 30)) },
          { label: 'Active Tracks', value: stats.tracks,                     pct: Math.min(100, stats.tracks * 10) },
        ].map((stat, i) => (
          <StatCard key={stat.label} {...stat} {...STAT_COLORS[i]} t={t} />
        ))}
      </div>

      {/* Two-column: Recent Plays + Quick Actions sidebar */}
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
              { icon: '◫', label: 'Edit Artist Profile',        page: null,                          color: '#88d8b0', soon: true },
            ].map(a => (
              <button key={a.label} disabled={a.soon} style={{ ...s.actionBtn, opacity: a.soon ? 0.55 : 1, cursor: a.soon ? 'default' : 'pointer' }} onClick={() => a.page && onNavigate(a.page)}>
                <span style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0, background: a.color + '30', color: a.color }}>{a.icon}</span>
                <span style={{ flex: 1, fontSize: 13, color: t.text, fontWeight: 500, textAlign: 'left' }}>{a.label}</span>
                {a.soon
                  ? <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8, background: `${t.accent}18`, color: t.accent, letterSpacing: '0.5px' }}>SOON</span>
                  : <span style={{ fontSize: 12, color: t.textSoft }}>→</span>}
              </button>
            ))}
          </div>

          {/* PPC Balance widget — replaces seller's tier progress */}
          <div style={{ background: `${t.accent}10`, borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.accent }}>◈ PPC Balance</span>
              <span style={{ fontSize: 12, color: t.textSoft }}>${balanceDollars}</span>
            </div>
            <div style={{ height: 6, background: `${t.accent}20`, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', width: `${Math.min(100, (stats.balance / 5000) * 100)}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.glow.replace('rgba(', 'rgb(').replace(/, ?[\d.]+\)/, ')')})`, borderRadius: 3 }} />
            </div>
            <p style={{ fontSize: 11, color: t.textSoft, margin: '0 0 10px' }}>~{clicksLeft.toLocaleString()} clicks left at ${(ppcRate / 100).toFixed(2)}/each</p>
            <button onClick={() => onNavigate('/community/artists/programs')} style={{
              width: '100%', padding: '8px 12px', borderRadius: 8, border: 'none',
              background: t.accent, color: t.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>Top up balance</button>
          </div>
        </div>
      </div>

      {/* Needs attention + Top tracks row */}
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

// Inline player so the founder can hear the mock tracks rotating through.
// Loads MOCK_TRACKS as a queue, advances on track end, exposes play/pause/skip.
function DemoPlayer({ t }) {
  const audioRef = useRef(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const track = MOCK_TRACKS[idx]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return
    audio.src = track.audio_url
    if (playing) audio.play().catch(() => setPlaying(false))
  }, [idx, track])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else         { audio.play().then(() => setPlaying(true)).catch(() => {}) }
  }
  function next() { setIdx(i => (i + 1) % MOCK_TRACKS.length) }

  return (
    <div style={{
      marginBottom: 24, padding: '14px 18px', borderRadius: 14,
      backgroundColor: t.bg && /(linear|radial|conic)-gradient/.test(t.bg) ? '#ffffff' : t.bg,
      backgroundImage: `linear-gradient(${t.surface}, ${t.surface})`,
      border: `1px solid ${t.surfaceBorder}`,
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <audio ref={audioRef} onEnded={next} preload="metadata" />
      <button onClick={toggle} style={{
        width: 40, height: 40, borderRadius: '50%', border: 'none',
        background: t.accent, color: t.accentText, cursor: 'pointer',
        fontSize: 14, flexShrink: 0,
      }}>{playing ? '❚❚' : '▶'}</button>
      <button onClick={next} title="Skip" style={{
        background: 'none', border: 'none', color: t.text, opacity: 0.6,
        cursor: 'pointer', fontSize: 18, padding: 0, flexShrink: 0,
      }}>⤼</button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {track.title}
        </div>
        <div style={{ fontSize: 11, color: t.text, opacity: 0.65 }}>
          Demo audio · track {idx + 1} of {MOCK_TRACKS.length}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, pct, color, bg, t }) {
  const r = 24, circ = 2 * Math.PI * r, dash = circ * (1 - pct / 100)
  return (
    <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</div>
          <div style={{ fontSize: 11, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.7px' }}>{label}</div>
        </div>
        <svg width={60} height={60} style={{ flexShrink: 0 }}>
          <circle cx={30} cy={30} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={6} />
          <circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round" transform="rotate(-90 30 30)" />
          <text x={30} y={34} textAnchor="middle" fontSize={10} fill={color} fontWeight={700}>{pct}%</text>
        </svg>
      </div>
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
