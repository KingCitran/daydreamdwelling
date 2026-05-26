import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

// Edit Artist Profile — updates name, bio, external_links, preferred_destination
// on artist_profiles. Mirrors ArtistSubmit.jsx form styling. Requires an existing
// profile (created during first track submission); if none, redirects to /submit.

export default function ArtistProfile({ onNavigate, onSignIn }) {
  const { user } = useAuth()
  const t = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [exists, setExists] = useState(false)

  const [artistName, setArtistName] = useState('')
  const [bio, setBio] = useState('')
  const [spotify, setSpotify] = useState('')
  const [appleMusic, setAppleMusic] = useState('')
  const [bandcamp, setBandcamp] = useState('')
  const [website, setWebsite] = useState('')
  const [preferred, setPreferred] = useState('spotify')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [coverBusy, setCoverBusy] = useState(false)
  const [imageErr, setImageErr] = useState('')

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('artist_profiles').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExists(true)
          setArtistName(data.artist_name ?? '')
          setBio(data.bio ?? '')
          const links = data.external_links ?? {}
          setSpotify(links.spotify ?? '')
          setAppleMusic(links.apple_music ?? '')
          setBandcamp(links.bandcamp ?? '')
          setWebsite(links.website ?? '')
          setPreferred(data.preferred_destination ?? 'spotify')
          setAvatarUrl(data.avatar_url ?? '')
          setCoverUrl(data.cover_url ?? '')
        }
        setLoading(false)
      })
  }, [user])

  async function uploadImage(file, kind /* 'avatar' | 'cover' */) {
    if (!user || !file) return
    const setter = kind === 'avatar' ? setAvatarUrl : setCoverUrl
    const busy   = kind === 'avatar' ? setAvatarBusy : setCoverBusy
    busy(true)
    setImageErr('')
    try {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const path = `${user.id}/${kind}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('artist-images')
        .upload(path, file, { upsert: false, contentType: file.type })
      if (upErr) throw upErr
      const { data: pub } = supabase.storage.from('artist-images').getPublicUrl(path)
      const newUrl = pub.publicUrl
      const col = kind === 'avatar' ? 'avatar_url' : 'cover_url'
      const { error: updErr } = await supabase
        .from('artist_profiles')
        .update({ [col]: newUrl, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
      if (updErr) throw updErr
      setter(newUrl)
    } catch (err) {
      console.error(`[artist ${kind} upload]`, err)
      setImageErr(`${kind === 'avatar' ? 'Avatar' : 'Cover'} upload failed: ${err.message ?? 'unknown error'}`)
    } finally {
      busy(false)
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!user) return
    if (!artistName.trim()) {
      setSaveMsg('Artist name is required.')
      return
    }
    setSaving(true)
    setSaveMsg('')
    try {
      const externalLinks = {
        ...(spotify    && { spotify }),
        ...(appleMusic && { apple_music: appleMusic }),
        ...(bandcamp   && { bandcamp }),
        ...(website    && { website }),
      }
      const { error } = await supabase
        .from('artist_profiles')
        .update({
          artist_name: artistName.trim(),
          bio: bio.trim() || null,
          external_links: externalLinks,
          preferred_destination: preferred,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
      if (error) throw error
      setSaveMsg('Profile saved.')
    } catch (err) {
      console.error(err)
      setSaveMsg(`Save failed: ${err.message ?? 'unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  const s = makeStyles(t)

  if (!user) return (
    <div style={{ padding: 48, textAlign: 'center' }}>
      <p style={{ color: t.textSoft, marginBottom: 16 }}>Sign in to edit your artist profile.</p>
      <button onClick={onSignIn} style={{ padding: '10px 22px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
    </div>
  )
  if (loading) return <div style={{ padding: 48, color: t.textSoft }}>Loading…</div>

  if (!exists) return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 8 }}>You're not on the artist roster yet</h1>
      <p style={{ fontSize: 13, color: t.textSoft, marginBottom: 20 }}>Submit your first track to claim a profile, then come back here to edit it.</p>
      <button onClick={() => onNavigate('/community/artists/submit')} style={{
        padding: '12px 24px', background: t.accent, color: t.accentText,
        border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer',
      }}>+ Submit your first track</button>
    </div>
  )

  return (
    <div className="ddd-artist-page" style={{ padding: '32px 0', maxWidth: 720, margin: '0 auto' }}>
      <style>{`
        .ddd-artist-page h1,
        .ddd-artist-page h2,
        .ddd-artist-page p,
        .ddd-artist-page label,
        .ddd-artist-page label *,
        .ddd-artist-page input,
        .ddd-artist-page textarea,
        .ddd-artist-page select,
        .ddd-artist-page span,
        .ddd-artist-page button {
          -webkit-text-stroke: 0 !important;
          text-shadow: none !important;
        }
        .ddd-artist-form input::placeholder,
        .ddd-artist-form textarea::placeholder {
          color: ${t.text}; opacity: 0.55;
        }
        .ddd-artist-form input:focus,
        .ddd-artist-form textarea:focus,
        .ddd-artist-form select:focus { outline: none; border-color: ${t.accent}; box-shadow: 0 0 0 3px ${t.accent}25; }
      `}</style>

      <div style={s.headerCard}>
        <h1 style={s.pageTitle}>Edit artist profile</h1>
        <p style={s.subtitle}>
          Update your name, bio, and external links. Click-throughs use your preferred destination by default.
        </p>
      </div>

      <form onSubmit={onSubmit} className="ddd-artist-form" style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Profile</h2>

          {/* Cover banner — full-width image strip behind avatar */}
          <div style={{
            position: 'relative', marginBottom: 16,
            height: 140, borderRadius: 12, overflow: 'hidden',
            background: coverUrl ? `center / cover no-repeat url(${coverUrl})` : `${t.accent}18`,
            border: `1px solid ${t.surfaceBorder}`,
          }}>
            {!coverUrl && (
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: t.textSoft, fontStyle: 'italic',
              }}>Add a cover image (recommended 1600×400)</div>
            )}
            <label style={{
              position: 'absolute', right: 10, bottom: 10,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(0,0,0,0.55)', color: '#fff',
              fontSize: 11, fontWeight: 600, cursor: coverBusy ? 'wait' : 'pointer',
            }}>
              {coverBusy ? 'Uploading…' : (coverUrl ? 'Change cover' : 'Upload cover')}
              <input type="file" accept="image/*" style={{ display: 'none' }}
                disabled={coverBusy}
                onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'cover') }} />
            </label>
          </div>

          {/* Avatar circle + change link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%',
              background: avatarUrl ? `center / cover no-repeat url(${avatarUrl})` : `${t.accent}20`,
              border: `2px solid ${t.surface}`, boxShadow: `0 0 0 1px ${t.surfaceBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: t.accent, flexShrink: 0,
            }}>{!avatarUrl && '♪'}</div>
            <div>
              <label style={{
                display: 'inline-block',
                padding: '8px 14px', borderRadius: 8,
                background: t.accent, color: t.accentText,
                fontSize: 12, fontWeight: 700, cursor: avatarBusy ? 'wait' : 'pointer',
                opacity: avatarBusy ? 0.6 : 1,
              }}>
                {avatarBusy ? 'Uploading…' : (avatarUrl ? 'Change avatar' : 'Upload avatar')}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  disabled={avatarBusy}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'avatar') }} />
              </label>
              <div style={{ fontSize: 10, color: t.textSoft, marginTop: 6 }}>Square images work best. Max 5MB.</div>
            </div>
          </div>

          {imageErr && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: '#ff8a8a20', color: '#ff8a8a', fontSize: 12 }}>{imageErr}</div>
          )}

          <Field label="Artist name *">
            <input style={s.input} value={artistName} onChange={e => setArtistName(e.target.value)} placeholder="Stage name or band name" required maxLength={120} />
          </Field>
          <Field label="Bio">
            <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="A few sentences about your music." maxLength={500} />
          </Field>
        </section>

        <section style={s.card}>
          <h2 style={s.sectionTitle}>External links</h2>
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

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button type="submit" disabled={saving || !artistName.trim()} style={{
            padding: '14px 28px', borderRadius: 12, border: 'none',
            background: t.accent, color: t.accentText, fontSize: 14, fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer', opacity: saving || !artistName.trim() ? 0.5 : 1,
          }}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" onClick={() => onNavigate('/community/artists/dashboard')} style={{
            padding: '14px 20px', borderRadius: 12,
            background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
            color: t.text, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
        </div>

        {saveMsg && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: saveMsg === 'Profile saved.' ? `${t.accent}15` : '#ff8a8a20',
            color: saveMsg === 'Profile saved.' ? t.accent : '#ff8a8a',
            fontSize: 13,
          }}>{saveMsg}</div>
        )}
      </form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button onClick={() => onNavigate('/community/artists/dashboard')} style={{ background: 'none', border: 'none', color: t.accent, fontSize: 13, cursor: 'pointer' }}>← Back to dashboard</button>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  const t = useTheme()
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: t.text, opacity: 0.85, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</div>
      {children}
    </label>
  )
}

function solidBg(t) {
  const bg = t.bg
  if (typeof bg === 'string' && /(linear|radial|conic)-gradient/.test(bg)) return '#ffffff'
  return bg
}

function makeStyles(t) {
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
    subtitle:     { fontSize: 13, color: t.text, opacity: 0.75, margin: 0 },
    card: {
      backgroundColor: solidBg(t),
      backgroundImage: surfaceFlat,
      border: `1px solid ${t.surfaceBorder}`,
      borderRadius: 16, padding: '20px 22px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
    },
    sectionTitle: { fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 16 },
    input: {
      width: '100%', boxSizing: 'border-box',
      padding: '10px 12px', borderRadius: 8,
      border: `1px solid ${t.surfaceBorder}`,
      backgroundColor: solidBg(t),
      backgroundImage: `${inputInset}, ${surfaceFlat}`,
      color: t.text,
      fontSize: 13, fontFamily: 'inherit',
      WebkitTextStroke: '0',
      textShadow: 'none',
    },
  }
}
