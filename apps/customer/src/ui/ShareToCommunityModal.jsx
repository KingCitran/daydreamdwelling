import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { useMoodControl } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

export default function ShareToCommunityModal({ onClose, screenshotRef, musicStation, cloudRoomId }) {
  const t = useTheme()
  const { mood } = useMoodControl()
  const { user } = useAuth()
  const [title, setTitle]       = useState('')
  const [description, setDesc]  = useState('')
  const [postMood, setPostMood] = useState(mood)
  const [postMusic, setPostMusic] = useState(musicStation || '')
  const [preview, setPreview]   = useState(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState(null)
  const captured = useRef(false)

  // Capture screenshot on mount
  useEffect(() => {
    if (captured.current) return
    captured.current = true
    const canvas = document.querySelector('canvas')
    if (!canvas) return
    canvas.toBlob(blob => {
      if (blob) setPreview(blob)
    }, 'image/png')
  }, [])

  async function handleSubmit() {
    if (!user || !title.trim()) return
    setUploading(true); setError(null)

    let screenshotUrl = null

    // Upload screenshot to Supabase Storage
    if (preview) {
      const path = `${user.id}/${Date.now()}.png`
      const { error: upErr } = await supabase.storage
        .from('community-screenshots')
        .upload(path, preview, { contentType: 'image/png', upsert: false })

      if (!upErr) {
        const { data: urlData } = supabase.storage.from('community-screenshots').getPublicUrl(path)
        screenshotUrl = urlData?.publicUrl
      } else {
        console.warn('Screenshot upload failed:', upErr.message)
      }
    }

    // Insert community post
    const { error: postErr } = await supabase.from('community_posts').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      screenshot_url: screenshotUrl,
      room_id: cloudRoomId || null,
      music_station: postMusic || null,
      mood: postMood || null,
    })

    if (postErr) {
      setError(postErr.message)
      setUploading(false)
      return
    }

    // Award loyalty points
    await supabase.from('loyalty_points').insert({ user_id: user.id, amount: 5, reason: 'community_post' })

    setUploading(false)
    setSuccess(true)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.surface, color: t.text, fontSize: 13, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 260, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', system-ui, sans-serif" }}>
      <div style={{ background: t.navBg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, width: 400, maxWidth: '90vw', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: t.text }}>✦ Share to Community</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: t.textSoft, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        {success ? (
          <div style={{ padding: '40px 22px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✦</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 8px' }}>Room shared!</h3>
            <p style={{ fontSize: 13, color: t.textSoft, margin: '0 0 20px' }}>Your design is now on the community feed. +5 Dream Points!</p>
            <button onClick={onClose} style={{ padding: '10px 24px', borderRadius: 10, background: t.accent, color: t.accentText, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Screenshot preview */}
            <div style={{ borderRadius: 10, overflow: 'hidden', background: t.bg, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {preview
                ? <img src={URL.createObjectURL(preview)} alt="Room preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 13, color: t.textSoft }}>Capturing screenshot...</span>}
            </div>

            {/* Title */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sunset Reading Nook" maxLength={50} style={inputStyle} />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Description</label>
              <textarea value={description} onChange={e => setDesc(e.target.value)} placeholder="Tell people about your design (optional)" rows={2} maxLength={200} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Mood + Music row */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Mood</label>
                <div style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.surface, fontSize: 12, color: t.text }}>
                  ✦ {postMood}
                </div>
              </div>
              {postMusic && (
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, display: 'block' }}>Music</label>
                  <div style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${t.surfaceBorder}`, background: t.surface, fontSize: 12, color: t.text }}>
                    🎵 {postMusic}
                  </div>
                </div>
              )}
            </div>

            {error && <p style={{ margin: 0, fontSize: 12, color: '#ff6b6b' }}>{error}</p>}

            <button onClick={handleSubmit} disabled={uploading || !title.trim()} style={{
              padding: '12px', borderRadius: 10, background: t.accent, color: t.accentText,
              border: 'none', fontSize: 14, fontWeight: 700, cursor: uploading ? 'not-allowed' : 'pointer',
              opacity: (uploading || !title.trim()) ? 0.5 : 1, transition: 'opacity 0.2s',
            }}>
              {uploading ? 'Sharing...' : '✦ Share to Community'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
