import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import { useMusicPlayer } from '../../contexts/MusicPlayerContext'

// Searchable catalog of approved tracks. Closes M7 of humming-velvet-tide.
// Drives discovery for marketing outreach — when we point an artist's friends
// at the platform, they need to be able to find that artist's music.
//
// Filters: free-text search across title + artist_name, station tag chips.
// Click any track → loads it into the global player's custom queue starting
// at that index and starts playback unmuted (consents to audio).

const STATION_TAGS = ['All', 'Cozy', 'Jazz Lounge', 'Lo-fi Study', 'Upbeat', 'Ambient', 'Nature']
const PAGE_SIZE = 60

export default function MusicCatalogPage({ onNavigate }) {
  const t = useTheme()
  const { setCustomQueue, playTrackAtIndex, currentTrack, isPlaying } = useMusicPlayer()

  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [station, setStation] = useState('All')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    supabase
      .from('artist_tracks')
      .select('id, title, audio_url, duration_seconds, station_tags, mood_tags, descriptive_tags, rotation_status, play_count, artist_id, artist_profiles(artist_name, avatar_url, external_links, preferred_destination, ppc_balance_cents, ppc_rate_cents)')
      .eq('approval_status', 'approved')
      .eq('rotation_status', 'active')
      .order('play_count', { ascending: false })
      .limit(PAGE_SIZE)
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) setError(err.message)
        else setTracks(data ?? [])
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tracks.filter(tr => {
      if (station !== 'All' && !(tr.station_tags ?? []).includes(station)) return false
      if (!q) return true
      const inTitle  = tr.title?.toLowerCase().includes(q)
      const inArtist = tr.artist_profiles?.artist_name?.toLowerCase().includes(q)
      return inTitle || inArtist
    })
  }, [tracks, query, station])

  function playFrom(idx) {
    setCustomQueue(filtered, 'Catalog', idx)
    playTrackAtIndex(idx)
  }

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <header style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: t.text, margin: '0 0 6px' }}>Music catalog</h1>
        <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>
          Every track approved for rotation. Search by title or artist; tap a card to play.
        </p>
      </header>

      {/* Search + station filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 280px', minWidth: 220 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tracks or artists…"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '10px 36px 10px 14px',
              borderRadius: 10,
              background: t.surface,
              border: `1px solid ${t.surfaceBorder}`,
              color: t.text, fontSize: 13, fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
              background: 'transparent', border: 'none', color: t.textSoft,
              fontSize: 14, cursor: 'pointer', padding: 4,
            }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {STATION_TAGS.map(s => (
          <button key={s} onClick={() => setStation(s)} style={{
            padding: '6px 14px', borderRadius: 18,
            background: station === s ? t.accent : 'transparent',
            border: `1px solid ${station === s ? t.accent : t.surfaceBorder}`,
            color: station === s ? t.accentText : t.text,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>

      {/* Results */}
      {loading && <div style={{ padding: 32, textAlign: 'center', color: t.textSoft, fontSize: 13 }}>Loading catalog…</div>}
      {error && <div style={{ padding: 16, background: '#ff8a8a20', color: '#ff8a8a', borderRadius: 10, fontSize: 13, marginBottom: 16 }}>Couldn't load tracks: {error}</div>}

      {!loading && filtered.length === 0 && (
        <div style={{
          padding: '48px 24px', textAlign: 'center',
          background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16,
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>♪</div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 6px' }}>
            {query || station !== 'All' ? 'No tracks match those filters' : 'No approved tracks yet'}
          </h2>
          <p style={{ fontSize: 13, color: t.textSoft, margin: 0 }}>
            {query || station !== 'All' ? 'Try a different search or station.' : 'Check back once artists submit and get approved.'}
          </p>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {filtered.map((tr, idx) => {
          const ap = tr.artist_profiles
          const isCurrent = currentTrack?.id === tr.id
          return (
            <button key={tr.id} onClick={() => playFrom(idx)} style={{
              textAlign: 'left',
              background: t.surface, border: `1px solid ${isCurrent ? t.accent : t.surfaceBorder}`,
              borderRadius: 14, padding: 14, cursor: 'pointer',
              fontFamily: 'inherit',
              boxShadow: isCurrent ? `0 0 0 1px ${t.accent}, 0 4px 18px ${t.accent}25` : 'none',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: ap?.avatar_url ? `center / cover no-repeat url(${ap.avatar_url})` : `${t.accent}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, color: t.accent,
                }}>{!ap?.avatar_url && '♪'}</div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: t.text,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{tr.title}</div>
                  <div style={{
                    fontSize: 11, color: t.textSoft, marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{ap?.artist_name ?? 'Unknown artist'}</div>
                </div>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: isCurrent && isPlaying ? t.accent : `${t.accent}25`,
                  color: isCurrent && isPlaying ? t.accentText : t.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, flexShrink: 0,
                }}>{isCurrent && isPlaying ? '❚❚' : '▶'}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {(tr.station_tags ?? []).slice(0, 3).map(s => (
                  <span key={s} style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 10,
                    background: `${t.accent}15`, color: t.accent, fontWeight: 600, letterSpacing: '0.3px',
                  }}>{s}</span>
                ))}
                {typeof tr.play_count === 'number' && tr.play_count > 0 && (
                  <span style={{
                    fontSize: 9, padding: '2px 7px', borderRadius: 10,
                    background: t.bg, color: t.textSoft, fontWeight: 600,
                    marginLeft: 'auto',
                  }}>{tr.play_count.toLocaleString()} plays</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {!loading && tracks.length >= PAGE_SIZE && filtered.length === tracks.length && (
        <div style={{ textAlign: 'center', marginTop: 24, color: t.textSoft, fontSize: 12 }}>
          Showing top {PAGE_SIZE} tracks. Refine with search if you're looking for something specific.
        </div>
      )}
    </div>
  )
}
