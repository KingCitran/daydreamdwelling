import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

export default function ProfilePage({ userId, onEnterBuilder }) {
  const t = useTheme()
  const [profile, setProfile] = useState(null)
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    Promise.all([
      supabase.from('profiles').select('display_name, bio, avatar_url, role, created_at').eq('id', userId).single(),
      supabase.from('saved_rooms').select('id, name, updated_at, thumbnail_url').eq('user_id', userId).eq('is_public', true).order('updated_at', { ascending: false }),
    ]).then(([{ data: prof }, { data: rms }]) => {
      setProfile(prof)
      setRooms(rms ?? [])
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div style={s.center}><p style={{ color: t.textSoft }}>Loading…</p></div>
  if (!profile) return <div style={s.center}><p style={{ color: t.textSoft }}>Profile not found</p></div>

  const initial = (profile.display_name || '?')[0].toUpperCase()
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div style={{ minHeight: '100vh', background: t.bg, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header bar */}
      <div style={{ padding: '12px 24px', borderBottom: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>DaydreamDwelling</span>
        <button onClick={onEnterBuilder} style={{ padding: '6px 16px', borderRadius: 8, background: t.accent, color: t.accentText, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          Open Builder
        </button>
      </div>

      {/* Profile hero */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px 32px', gap: 16 }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%', background: t.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, fontWeight: 700, color: t.accentText, overflow: 'hidden',
          border: `3px solid ${t.surfaceBorder}`,
        }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initial}
        </div>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: t.text }}>
            {profile.display_name || 'Anonymous Dreamer'}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: t.textSoft }}>
            Joined {joined}
          </p>
        </div>
        {profile.bio && (
          <p style={{ margin: 0, fontSize: 14, color: t.textSoft, maxWidth: 420, textAlign: 'center', lineHeight: 1.6 }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Room showcase */}
      <div style={{ padding: '0 24px 48px', maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: t.text, margin: '0 0 16px' }}>
          Room Showcase {rooms.length > 0 && <span style={{ fontWeight: 400, color: t.textSoft }}>({rooms.length})</span>}
        </h2>
        {rooms.length === 0 && (
          <p style={{ fontSize: 13, color: t.textSoft, textAlign: 'center', padding: '32px 0' }}>
            No public rooms yet
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
          {rooms.map(room => (
            <div key={room.id} style={{
              background: t.surface, border: `1px solid ${t.surfaceBorder}`,
              borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{
                height: 120, borderRadius: 8, background: t.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
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

const s = {
  center: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
}
