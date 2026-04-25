import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Reusable tag chip strip for an approved track. Shows artist's own descriptive
// tags (golden) alongside community-added tags (muted), ranked by adders count.
// Authenticated listeners can add their own tag inline.
//
// Props:
//   trackId, descriptiveTags (artist's own, optional — saves a query if passed)
//   compact (boolean) — narrower layout suitable for player bars
export default function TrackTags({ trackId, descriptiveTags = [], compact = false }) {
  const { user } = useAuth()
  const t = useTheme()
  const [communityTags, setCommunityTags] = useState([]) // [{tag, adders}]
  const [adding, setAdding] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function load() {
    if (!trackId) return
    const { data } = await supabase
      .from('track_tag_summary')
      .select('tag, adders')
      .eq('track_id', trackId)
      .order('adders', { ascending: false })
      .limit(20)
    setCommunityTags(data ?? [])
  }
  useEffect(() => { load() }, [trackId])

  async function submitTag() {
    const cleaned = newTag.trim().toLowerCase().slice(0, 40)
    if (!cleaned || !user) return
    setBusy(true); setErr('')
    const { error } = await supabase.from('track_community_tags').insert({
      track_id: trackId, tag: cleaned, added_by: user.id,
    })
    setBusy(false)
    if (error) {
      // Unique violation = already added by this user — quietly succeed
      if (error.code === '23505') {
        setNewTag(''); setAdding(false); load(); return
      }
      setErr(error.message)
      return
    }
    setNewTag(''); setAdding(false); load()
  }

  const fontSize = compact ? 10 : 11
  const padding = compact ? '2px 8px' : '3px 10px'

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, alignItems: 'center' }}>
      {/* Artist's own tags */}
      {descriptiveTags.map(tag => (
        <span key={`a-${tag}`} title="Artist tag" style={{
          fontSize, fontWeight: 600, padding, borderRadius: 12,
          background: `${t.accent}25`, color: t.accent,
          border: `1px solid ${t.accent}40`,
        }}>{tag}</span>
      ))}
      {/* Community tags */}
      {communityTags.map(({ tag, adders }) => (
        <span key={`c-${tag}`} title={`${adders} listener${adders === 1 ? '' : 's'} added this`} style={{
          fontSize, fontWeight: 600, padding, borderRadius: 12,
          background: 'rgba(255,255,255,0.08)', color: '#d0c8e8',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          {tag}
          {adders > 1 && <span style={{ fontSize: fontSize - 1, opacity: 0.7 }}>×{adders}</span>}
        </span>
      ))}

      {/* Add-tag UX (only for signed-in listeners) */}
      {user && !adding && (
        <button onClick={() => setAdding(true)} title="Suggest a tag" style={{
          fontSize, fontWeight: 700, padding, borderRadius: 12,
          background: 'transparent', color: '#a090c8',
          border: '1px dashed rgba(255,255,255,0.25)', cursor: 'pointer',
        }}>+ tag</button>
      )}
      {user && adding && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <input
            autoFocus
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitTag() } if (e.key === 'Escape') { setAdding(false); setNewTag('') } }}
            placeholder="your tag"
            maxLength={40}
            style={{
              fontSize, padding: '3px 8px', borderRadius: 12,
              background: 'rgba(15,12,30,0.7)', color: '#f0eaff',
              border: `1px solid ${t.accent}50`, width: 120, fontFamily: 'inherit',
            }}
          />
          <button onClick={submitTag} disabled={busy || !newTag.trim()} style={{
            fontSize, fontWeight: 700, padding,
            background: t.accent, color: t.accentText, border: 'none',
            borderRadius: 12, cursor: busy ? 'wait' : 'pointer', opacity: busy || !newTag.trim() ? 0.5 : 1,
          }}>add</button>
          <button onClick={() => { setAdding(false); setNewTag('') }} style={{
            fontSize, padding, background: 'transparent', color: '#a090c8',
            border: 'none', cursor: 'pointer',
          }}>×</button>
        </span>
      )}
      {err && <span style={{ fontSize: fontSize - 1, color: '#ff8a8a' }}>{err}</span>}
    </div>
  )
}
