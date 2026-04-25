import { useEffect, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const STATUS_FILTERS = [
  { key: 'pending',  label: 'Pending',  color: '#70a0ff' },
  { key: 'flagged',  label: 'Flagged',  color: '#ffc87a' },
  { key: 'approved', label: 'Approved', color: '#88d8b0' },
  { key: 'rejected', label: 'Rejected', color: '#f09090' },
]

export default function ArtistApprovalPage() {
  const t = useTheme()
  const [filter, setFilter]     = useState('pending')
  const [tracks, setTracks]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [working, setWorking]   = useState(null)
  const [rejectFor, setRejectFor] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => { fetchTracks() }, [filter])

  async function fetchTracks() {
    setLoading(true)
    const { data } = await supabase
      .from('artist_tracks')
      .select('*, artist_profiles(artist_name, bio, external_links)')
      .eq('approval_status', filter)
      .order('submitted_at', { ascending: filter === 'pending' || filter === 'flagged' })
      .limit(50)
    setTracks(data ?? [])
    setLoading(false)
  }

  async function approve(track) {
    setWorking(track.id)
    await supabase.from('artist_tracks')
      .update({ approval_status: 'approved', approved_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', track.id)
    await fetchTracks()
    setWorking(null)
  }

  async function reject(track, reason) {
    if (!reason?.trim()) return
    setWorking(track.id)
    await supabase.from('artist_tracks')
      .update({ approval_status: 'rejected', rejection_reason: reason.trim() })
      .eq('id', track.id)
    setRejectFor(null); setRejectReason('')
    await fetchTracks()
    setWorking(null)
  }

  async function flag(track) {
    setWorking(track.id)
    await supabase.from('artist_tracks').update({ approval_status: 'flagged' }).eq('id', track.id)
    await fetchTracks()
    setWorking(null)
  }

  const counts = STATUS_FILTERS.reduce((acc, f) => ({ ...acc, [f.key]: tracks.length }), {})

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 }}>Artist Track Review</h1>
        <p style={{ fontSize: 13, color: t.textSoft }}>Auto-screened submissions land in Pending. Anything that failed validation lands in Flagged.</p>
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: 20,
            border: filter === f.key ? `2px solid ${f.color}` : `1px solid ${t.surfaceBorder}`,
            background: filter === f.key ? `${f.color}18` : 'transparent',
            color: filter === f.key ? f.color : t.textSoft,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{f.label}{filter === f.key && tracks.length > 0 && ` (${tracks.length})`}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontSize: 13, color: t.textSoft }}>Loading…</p>
      ) : tracks.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: t.surface, borderRadius: 16, border: `1px solid ${t.surfaceBorder}` }}>
          <p style={{ fontSize: 13, color: t.textSoft }}>No tracks in this queue.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} t={t}
              onApprove={() => approve(track)}
              onReject={() => { setRejectFor(track.id); setRejectReason('') }}
              onFlag={() => flag(track)}
              working={working === track.id}
              rejectActive={rejectFor === track.id}
              rejectReason={rejectReason}
              setRejectReason={setRejectReason}
              onSubmitReject={() => reject(track, rejectReason)}
              onCancelReject={() => { setRejectFor(null); setRejectReason('') }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function TrackCard({ track, t, onApprove, onReject, onFlag, working, rejectActive, rejectReason, setRejectReason, onSubmitReject, onCancelReject }) {
  const artist = track.artist_profiles
  const links  = artist?.external_links ?? {}
  const minutes = Math.floor(track.duration_seconds / 60)
  const seconds = String(track.duration_seconds % 60).padStart(2, '0')

  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, padding: '18px 22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{track.title}</div>
          <div style={{ fontSize: 12, color: t.textSoft }}>
            {artist?.artist_name ?? 'Artist'} · {track.genre || 'no genre'} · {minutes}:{seconds}
          </div>
        </div>
        <div style={{ fontSize: 11, color: t.textSoft }}>
          Submitted {new Date(track.submitted_at).toLocaleString()}
        </div>
      </div>

      <audio src={track.audio_url} controls style={{ width: '100%', marginBottom: 12 }} />

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {(track.station_tags ?? []).map(s => (
          <span key={`st-${s}`} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: `${t.accent}20`, color: t.accent }}>{s}</span>
        ))}
        {(track.mood_tags ?? []).map(m => (
          <span key={`m-${m}`} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: '#88d8b020', color: '#88d8b0' }}>{m}</span>
        ))}
      </div>

      {/* External links */}
      {Object.entries(links).filter(([, v]) => !!v).length > 0 && (
        <div style={{ fontSize: 11, color: t.textSoft, marginBottom: 12 }}>
          External: {Object.entries(links).filter(([, v]) => !!v).map(([k, v]) => (
            <a key={k} href={v} target="_blank" rel="noopener noreferrer" style={{ color: t.accent, marginRight: 10, textDecoration: 'none' }}>{k}</a>
          ))}
        </div>
      )}

      {/* Flag reasons (if any) */}
      {(track.flag_reasons ?? []).length > 0 && (
        <div style={{ fontSize: 11, color: '#ffc87a', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#ffc87a18' }}>
          ⚠ Auto-screen flags: {(track.flag_reasons ?? []).join(', ')}
        </div>
      )}

      {/* Existing rejection reason */}
      {track.rejection_reason && (
        <div style={{ fontSize: 11, color: '#f09090', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#f0909018' }}>
          Rejected: {track.rejection_reason}
        </div>
      )}

      {/* Actions */}
      {rejectActive ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection (sent to artist)…" style={{
            flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8,
            border: `1px solid ${t.surfaceBorder}`, background: t.bg, color: t.text, fontSize: 13,
          }} />
          <button onClick={onSubmitReject} disabled={!rejectReason.trim() || working} style={btn(t, '#f09090', true)}>Confirm reject</button>
          <button onClick={onCancelReject} style={btn(t, t.textSoft, false)}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {track.approval_status !== 'approved' && (
            <button onClick={onApprove} disabled={working} style={btn(t, '#88d8b0', true)}>✓ Approve</button>
          )}
          {track.approval_status !== 'flagged' && (
            <button onClick={onFlag} disabled={working} style={btn(t, '#ffc87a', false)}>⚠ Flag</button>
          )}
          {track.approval_status !== 'rejected' && (
            <button onClick={onReject} disabled={working} style={btn(t, '#f09090', false)}>✗ Reject</button>
          )}
        </div>
      )}
    </div>
  )
}

function btn(t, color, filled) {
  return {
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
    background: filled ? color : 'transparent',
    color: filled ? '#0e0c1e' : color,
    fontSize: 12, fontWeight: 700,
    boxShadow: filled ? `0 2px 12px ${color}40` : 'none',
  }
}
