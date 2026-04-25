import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const STATIONS = ['Cozy', 'Bright', 'Evening', 'Focus', 'Nature', 'Romance', 'Party', 'Silence']
const MOODS = ['Golden Hour', 'Bright Day', 'Vivid Sunset', "Ember's Sunrise", 'Candlelit Cozy Evening', 'Moonlight', 'Northern Lights', 'Dark Academia', 'Cottagecore Dawn', 'Coastal Morning', 'Dream State', 'Neon Nights', 'Greenhouse']
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/mp4', 'audio/x-m4a']
const MIN_DURATION = 30
const MAX_DURATION = 8 * 60
const MAX_SIZE = 15 * 1024 * 1024

export default function ArtistSubmit({ onNavigate, onSignIn }) {
  const { user } = useAuth()
  const t = useTheme()
  const [artist, setArtist] = useState(null)
  const [loading, setLoading] = useState(true)

  // Profile fields (only used if artist profile doesn't exist yet)
  const [artistName, setArtistName] = useState('')
  const [bio, setBio] = useState('')
  const [spotify, setSpotify] = useState('')
  const [appleMusic, setAppleMusic] = useState('')
  const [bandcamp, setBandcamp] = useState('')
  const [website, setWebsite] = useState('')
  const [preferred, setPreferred] = useState('spotify')

  // Track fields
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [stationTags, setStationTags] = useState([])
  const [moodTags, setMoodTags] = useState([])
  const [descriptiveTags, setDescriptiveTags] = useState('') // free-text comma-separated
  const [audioFile, setAudioFile] = useState(null)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioError, setAudioError] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitMsg, setSubmitMsg] = useState('')
  const [submittedTrack, setSubmittedTrack] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('artist_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => { setArtist(data); setLoading(false) })
  }, [user])

  function toggleTag(setter, list, val) {
    setter(list.includes(val) ? list.filter(v => v !== val) : [...list, val])
  }

  async function onPickFile(e) {
    setAudioError('')
    const file = e.target.files?.[0]
    if (!file) return setAudioFile(null)
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAudioError(`Unsupported format (${file.type}). Use mp3, wav, aac, or m4a.`)
      setAudioFile(null); return
    }
    if (file.size > MAX_SIZE) {
      setAudioError(`File is ${(file.size / 1024 / 1024).toFixed(1)}MB — max is 15MB.`)
      setAudioFile(null); return
    }
    // Probe duration
    const url = URL.createObjectURL(file)
    const audio = new Audio()
    audio.preload = 'metadata'
    audio.src = url
    await new Promise((res) => { audio.onloadedmetadata = res; audio.onerror = res })
    const dur = audio.duration
    URL.revokeObjectURL(url)
    if (!isFinite(dur) || dur < MIN_DURATION) {
      setAudioError(`Track is ${Math.round(dur)}s — minimum is ${MIN_DURATION}s.`)
      setAudioFile(null); return
    }
    if (dur > MAX_DURATION) {
      setAudioError(`Track is ${Math.round(dur)}s — maximum is ${MAX_DURATION}s (8 min).`)
      setAudioFile(null); return
    }
    setAudioFile(file)
    setAudioDuration(Math.round(dur))
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!user || !audioFile) return

    setSubmitting(true)
    setSubmitMsg('')

    try {
      // 1. Create or fetch artist profile
      let artistRow = artist
      if (!artistRow) {
        if (!artistName.trim()) {
          setSubmitMsg('Add an artist name to claim your profile.')
          setSubmitting(false); return
        }
        const externalLinks = {
          ...(spotify     && { spotify }),
          ...(appleMusic  && { apple_music: appleMusic }),
          ...(bandcamp    && { bandcamp }),
          ...(website     && { website }),
        }
        const { data: created, error: createErr } = await supabase
          .from('artist_profiles')
          .insert({
            user_id: user.id,
            artist_name: artistName.trim(),
            bio: bio.trim() || null,
            external_links: externalLinks,
            preferred_destination: preferred,
          })
          .select()
          .single()
        if (createErr) throw createErr
        artistRow = created
        setArtist(created)
      }

      // 2. Upload audio file to storage
      const ext = audioFile.name.split('.').pop()
      const objectPath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('artist-tracks')
        .upload(objectPath, audioFile, { contentType: audioFile.type, upsert: false })
      if (uploadErr) throw uploadErr

      const { data: pub } = supabase.storage.from('artist-tracks').getPublicUrl(objectPath)
      const audioUrl = pub.publicUrl

      // 3. Insert track row — passes auto-screen, status 'pending' for admin review
      const parsedDescTags = descriptiveTags.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 12)
      const { data: trackRow, error: insertErr } = await supabase.from('artist_tracks').insert({
        artist_id: user.id,
        title: title.trim(),
        audio_url: audioUrl,
        duration_seconds: audioDuration,
        genre: genre.trim() || null,
        station_tags: stationTags,
        mood_tags: moodTags,
        descriptive_tags: parsedDescTags,
        approval_status: 'pending',
      }).select().single()
      if (insertErr) throw insertErr

      setSubmittedTrack(trackRow)
      setSubmitMsg('Track submitted! Queued for admin review (typically within 48h).')
      setTitle(''); setGenre(''); setStationTags([]); setMoodTags([]); setDescriptiveTags(''); setAudioFile(null); setAudioDuration(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      console.error(err)
      setSubmitMsg(`Submission failed: ${err.message ?? 'unknown error'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const s = makeStyles(t)

  if (!user) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: t.textSoft, marginBottom: 16 }}>Sign in to submit tracks.</p>
      <button onClick={onSignIn} style={{ padding: '10px 22px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
    </div>
  )
  if (loading) return <div style={{ padding: 48, color: t.textSoft }}>Loading…</div>

  return (
    <div style={{ padding: '32px 0', maxWidth: 720, margin: '0 auto' }}>
      <style>{`
        .ddd-artist-form input,
        .ddd-artist-form textarea,
        .ddd-artist-form select {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        .ddd-artist-form input::placeholder,
        .ddd-artist-form textarea::placeholder {
          color: ${t.textSoft}; opacity: 0.65;
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        .ddd-artist-form input:focus,
        .ddd-artist-form textarea:focus,
        .ddd-artist-form select:focus { outline: none; border-color: ${t.accent}; box-shadow: 0 0 0 3px ${t.accent}25; }
      `}</style>
      <div style={s.headerCard}>
        <h1 style={s.pageTitle}>{artist ? 'Submit a new track' : 'Claim your artist profile + submit your first track'}</h1>
        <p style={s.subtitle}>
          Free submission. Auto-screened, then admin-reviewed within 48 hours. You'll see status updates in your dashboard.
        </p>
      </div>

      {submittedTrack && (
        <div style={{
          marginBottom: 24, padding: '20px 22px', borderRadius: 16,
          background: t.surface, border: `1px solid ${t.accent}50`,
          backdropFilter: 'blur(12px)', boxShadow: `0 4px 20px ${t.accent}20`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18, color: '#3a8a4a' }}>✓</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>Track submitted</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: `${t.accent}20`, color: t.accent, letterSpacing: '0.5px' }}>PENDING REVIEW</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>{submittedTrack.title}</div>
          <div style={{ fontSize: 12, color: t.textSoft, marginBottom: 12 }}>
            {Math.floor(submittedTrack.duration_seconds / 60)}:{String(submittedTrack.duration_seconds % 60).padStart(2, '0')}
            {submittedTrack.genre && ` · ${submittedTrack.genre}`}
          </div>
          <audio src={submittedTrack.audio_url} controls style={{ width: '100%', marginBottom: 12, height: 36 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => onNavigate('/community/artists/dashboard')} style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: t.accent, color: t.accentText, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>View dashboard →</button>
            <button onClick={() => setSubmittedTrack(null)} style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'transparent', border: `1px solid ${t.accent}40`,
              color: t.text, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>+ Submit another</button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="ddd-artist-form" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {!artist && (
          <section style={s.card}>
            <h2 style={s.sectionTitle}>Artist profile</h2>
            <Field label="Artist name *">
              <input style={s.input} value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Stage name or band name" required />
            </Field>
            <Field label="Bio">
              <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="A few sentences about your music." />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <Field label="Spotify URL"><input style={s.input} type="url" value={spotify}    onChange={e => setSpotify(e.target.value)}    placeholder="https://open.spotify.com/artist/…" /></Field>
              <Field label="Apple Music URL"><input style={s.input} type="url" value={appleMusic} onChange={e => setAppleMusic(e.target.value)} placeholder="https://music.apple.com/…" /></Field>
              <Field label="Bandcamp URL"><input style={s.input} type="url" value={bandcamp}   onChange={e => setBandcamp(e.target.value)}   placeholder="https://yourname.bandcamp.com" /></Field>
              <Field label="Website / Other"><input style={s.input} type="url" value={website}    onChange={e => setWebsite(e.target.value)}    placeholder="https://yoursite.com" /></Field>
            </div>
            <Field label="Preferred destination (default for click-throughs)">
              <select style={s.input} value={preferred} onChange={e => setPreferred(e.target.value)}>
                <option value="spotify">Spotify</option>
                <option value="apple_music">Apple Music</option>
                <option value="bandcamp">Bandcamp</option>
                <option value="website">Website / Other</option>
              </select>
            </Field>
          </section>
        )}

        <section style={s.card}>
          <h2 style={s.sectionTitle}>Track details</h2>
          <Field label="Title *">
            <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} required maxLength={120} />
          </Field>
          <Field label="Genre">
            <input style={s.input} value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g. ambient, lo-fi, indie folk" maxLength={60} />
          </Field>

          <Field label={`Audio file * (mp3 / wav / aac / m4a, ${MIN_DURATION}s–${MAX_DURATION / 60}min, max 15MB)`}>
            <input ref={fileInputRef} style={s.input} type="file" accept="audio/*" onChange={onPickFile} required />
            {audioFile && !audioError && (
              <div style={{ marginTop: 8, fontSize: 12, color: t.textSoft }}>
                ✓ {audioFile.name} · {Math.round(audioDuration)}s · {(audioFile.size / 1024 / 1024).toFixed(1)}MB
              </div>
            )}
            {audioError && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#ff8a8a' }}>{audioError}</div>
            )}
          </Field>

          <Field label="Stations (which moods does this track fit?)">
            <div style={s.tagGrid}>
              {STATIONS.map(st => (
                <button key={st} type="button" onClick={() => toggleTag(setStationTags, stationTags, st)} style={tagBtn(t, stationTags.includes(st))}>{st}</button>
              ))}
            </div>
          </Field>

          <Field label="Mood tags (room moods this complements)">
            <div style={s.tagGrid}>
              {MOODS.map(m => (
                <button key={m} type="button" onClick={() => toggleTag(setMoodTags, moodTags, m)} style={tagBtn(t, moodTags.includes(m))}>{m}</button>
              ))}
            </div>
          </Field>

          <Field label="Descriptive tags (your own words \u2014 comma separated, max 12)">
            <input style={s.input} value={descriptiveTags} onChange={e => setDescriptiveTags(e.target.value)} placeholder="e.g. lush strings, late-night drive, hopeful, instrumental" />
            <div style={{ marginTop: 6, fontSize: 11, color: '#a090c8' }}>
              Customers can add their own tags after listening — yours seed the catalog.
            </div>
          </Field>
        </section>

        <button type="submit" disabled={submitting || !audioFile || !title.trim()} style={{
          padding: '14px 28px', borderRadius: 12, border: 'none',
          background: t.accent, color: t.accentText, fontSize: 14, fontWeight: 700,
          cursor: submitting ? 'wait' : 'pointer', opacity: submitting || !audioFile || !title.trim() ? 0.5 : 1,
        }}>{submitting ? 'Submitting…' : 'Submit track'}</button>

        {submitMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: submitMsg.startsWith('Track submitted') ? `${t.accent}15` : '#ff8a8a20',
            color: submitMsg.startsWith('Track submitted') ? t.accent : '#ff8a8a',
            fontSize: 13,
          }}>{submitMsg}</div>
        )}
      </form>

      {artist && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button onClick={() => onNavigate('/community/artists/dashboard')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, cursor: 'pointer' }}>← Back to dashboard</button>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }) {
  const t = useTheme()
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.textSoft, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      {children}
    </label>
  )
}

function tagBtn(t, active) {
  return {
    padding: '6px 12px', borderRadius: 16, border: `1px solid ${active ? t.accent : t.surfaceBorder}`,
    background: active ? `${t.accent}25` : 'transparent',
    color: active ? t.accent : t.textSoft,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
  }
}

// Returns a CSS-safe solid color for backgroundColor. Falls back to white when
// t.bg is a gradient string (Ember's Sunrise) since gradient strings are
// invalid for the backgroundColor property and would render as transparent.
function solidBg(t) {
  const bg = t.bg
  if (typeof bg === 'string' && /(linear|radial|conic)-gradient/.test(bg)) return '#ffffff'
  return bg
}

function makeStyles(t) {
  // backgroundImage trick: linear-gradient(c, c) renders as a flat color and IS
  // valid for backgroundImage. Pair with a solid backgroundColor under it so
  // the card stays opaque even when the page bg is animated/gradient.
  const surfaceFlat = `linear-gradient(${t.surface}, ${t.surface})`
  const inputInset  = 'linear-gradient(rgba(0,0,0,0.06), rgba(0,0,0,0.06))'
  return {
    headerCard: {
      backgroundColor: solidBg(t),
      backgroundImage: surfaceFlat,
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16, padding: '20px 22px', marginBottom: 24,
    },
    pageTitle:    { fontSize: 24, fontWeight: 700, color: t.text, margin: '0 0 6px' },
    subtitle:     { fontSize: 13, color: t.textSoft, margin: 0 },
    card: {
      backgroundColor: solidBg(t),
      backgroundImage: surfaceFlat,
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16, padding: '20px 22px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 },
    // Input layered: solid bg → surface tint → small dark inset so it visibly
    // recesses below the card surface on any theme.
    input: {
      width: '100%', boxSizing: 'border-box',
      padding: '10px 12px', borderRadius: 8,
      border: `1px solid ${t.surfaceBorder}`,
      backgroundColor: solidBg(t),
      backgroundImage: `${inputInset}, ${surfaceFlat}`,
      color: t.text,
      fontSize: 13, fontFamily: 'inherit',
      // Ember's global text-stroke makes input text look chunky — undo it just here.
      WebkitTextStroke: '0',
      textShadow: 'none',
    },
    tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  }
}
