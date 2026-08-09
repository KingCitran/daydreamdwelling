import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import { ITEM_CATALOGUE } from '../data/items'
import { ROOMS as DEFAULT_ROOMS } from './landing/endlessRooms'
import AuthModal from '../ui/AuthModal'

const FONTS = {
  display: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
  body: "'Outfit', 'Inter', system-ui, sans-serif",
}

const TABS = ['rooms', 'edit', 'palette', 'preview']
const TAB_LABELS = { rooms: '✦ Rooms', edit: '⚙ Edit', palette: '◈ Palette', preview: '▶ Preview' }

export default function LandingAdminPage({ onBack }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('rooms')
  const [config, setConfig] = useState({ rooms: [], brandRoom: null, brandInterval: 2, revolutionSeconds: 30 })
  const [loading, setLoading] = useState(true)

  // Load existing config
  useEffect(() => {
    supabase.from('landing_hero_config').select('*').order('updated_at', { ascending: false }).limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          const c = data[0]
          setConfig({
            id: c.id,
            rooms: c.rooms || [],
            brandRoom: c.brand_room,
            brandInterval: c.brand_interval ?? 2,
            revolutionSeconds: c.revolution_seconds ?? 30,
            publishedAt: c.published_at,
          })
        }
        setLoading(false)
      })
  }, [])

  // Backfill missing room data — fetch from saved_rooms for any room that's
  // in the lineup but doesn't have its data snapshot yet
  useEffect(() => {
    if (loading || !config.rooms.length) return
    const missing = config.rooms.filter(r => !r.data && (r.roomId || r.sourceId))
    if (!missing.length) return
    ;(async () => {
      const updates = {}
      for (const r of missing) {
        // Community rooms: fetch via roomId (saved_room FK). Saved rooms: fetch via sourceId.
        const fetchId = r.roomId || r.sourceId
        if (!fetchId) continue
        const { data: row } = await supabase.from('saved_rooms').select('data').eq('id', fetchId).maybeSingle()
        if (row?.data) updates[fetchId] = row.data
      }
      if (!Object.keys(updates).length) return
      setConfig(c => ({
        ...c,
        rooms: c.rooms.map(r => {
          const fetchId = r.roomId || r.sourceId
          return updates[fetchId] ? { ...r, data: updates[fetchId] } : r
        }),
      }))
    })()
  }, [loading, config.rooms.length])

  // Auto-save config to Supabase (debounced 1.5s)
  const [saving, setSaving] = useState(false)
  const saveTimer = useRef(null)
  const initialLoad = useRef(true)

  useEffect(() => {
    if (initialLoad.current) { initialLoad.current = false; return }
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      setSaving(true)
      const payload = {
        rooms: config.rooms,
        brand_room: config.brandRoom,
        brand_interval: config.brandInterval,
        revolution_seconds: config.revolutionSeconds,
      }
      if (config.id) {
        await supabase.from('landing_hero_config').update(payload).eq('id', config.id)
      } else {
        const { data } = await supabase.from('landing_hero_config').insert(payload).select().single()
        if (data) setConfig(c => ({ ...c, id: data.id }))
      }
      setSaving(false)
    }, 1500)
    return () => clearTimeout(saveTimer.current)
  }, [config.rooms, config.brandRoom, config.brandInterval, config.revolutionSeconds])

  if (loading) return <div style={{ padding: 40, fontFamily: FONTS.body, color: '#1a2a48' }}>Loading config...</div>

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f8f6f2', fontFamily: FONTS.body, color: '#1a2a48', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <h2 style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 400, marginBottom: 0 }}>
        Daydream<span style={{ fontStyle: 'italic' }}>Dwelling</span> <span style={{ color: '#ff9b5c' }}>Admin</span>
      </h2>
      <p style={{ fontSize: 14, color: '#4a6890', marginBottom: 8 }}>Sign in to manage the landing page.</p>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <AdminSignIn />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f6f2', fontFamily: FONTS.body, color: '#1a2a48', paddingTop: 0 }} className="ddd-admin-hide-music">
      {/* Header */}
      <header style={{
        padding: '16px 32px', background: '#fff', borderBottom: '1px solid #e8e4de',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => { window.location.search = '?landing=1' }} style={{
            background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#4a6890',
          }}>← back to landing</button>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 400, margin: 0 }}>
            Landing Hero <span style={{ fontStyle: 'italic', color: '#ff9b5c' }}>Admin</span>
          </h1>
        </div>
        <div style={{ fontSize: 12, color: '#4a6890', display: 'flex', alignItems: 'center', gap: 12 }}>
          {saving && <span style={{ color: '#ff9b5c' }}>saving...</span>}
          {!saving && config.id && <span style={{ color: '#7aa06a' }}>✓ saved</span>}
          <span>{config.publishedAt ? `published ${new Date(config.publishedAt).toLocaleDateString()}` : 'not published'}</span>
        </div>
      </header>

      {/* Tab bar */}
      <nav style={{
        display: 'flex', gap: 0, background: '#fff', borderBottom: '1px solid #e8e4de',
        padding: '0 32px',
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '14px 24px', border: 'none', cursor: 'pointer',
            background: t === tab ? '#f8f6f2' : 'transparent',
            borderBottom: t === tab ? '2px solid #ff9b5c' : '2px solid transparent',
            fontFamily: FONTS.body, fontSize: 13, fontWeight: t === tab ? 600 : 400,
            color: t === tab ? '#1a2a48' : '#4a6890',
            letterSpacing: '0.5px',
          }}>
            {TAB_LABELS[t]}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div style={{ padding: 32 }}>
        {tab === 'rooms' && <RoomPickerTab config={config} setConfig={setConfig} user={user} />}
        {tab === 'palette' && <PaletteDesignerTab config={config} setConfig={setConfig} />}
        {tab === 'edit' && <RoomEditTab config={config} setConfig={setConfig} />}
        {tab === 'preview' && <PreviewPublishTab config={config} setConfig={setConfig} />}
      </div>
      <style>{`
        /* Push any floating UI elements (music, wispy, feedback) to bottom-left so they don't overlap tabs */
        .ddd-admin-hide-music ~ * [style*="position: fixed"] { z-index: 5 !important; }
        body > div[style*="fixed"][style*="left: 0"] { bottom: 20px !important; top: auto !important; }
      `}</style>
    </div>
  )
}

// ── Admin sign-in — keeps user on admin page after auth ─────
function AdminSignIn() {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    if (tab === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      // On success, React re-renders with user — stays on admin page
    } else {
      const { error } = await signUp(email, password, displayName)
      if (error) setError(error.message)
      else setError('Check your email to confirm, then sign in.')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    setLoading(true); setError(null)
    // Use popup so the admin page stays open — no redirect dance
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.href,
        skipBrowserRedirect: true,
      },
    }).then(({ data, error }) => {
      if (error) return { error }
      if (data?.url) {
        // Open Google auth in a popup
        const popup = window.open(data.url, 'google-auth', 'width=500,height=600,menubar=no,toolbar=no')
        // Poll for the popup closing (user completed auth)
        const timer = setInterval(() => {
          if (!popup || popup.closed) {
            clearInterval(timer)
            // Auth state will update via Supabase listener — just reload
            window.location.reload()
          }
        }, 500)
      }
      return { error: null }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #e8e4de',
    fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: FONTS.body,
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e8e4de', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20 }}>
        {['signin', 'signup'].map(t => (
          <button key={t} onClick={() => { setTab(t); setError(null) }} style={{
            flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
            background: t === tab ? '#f8f6f2' : 'transparent',
            borderBottom: t === tab ? '2px solid #ff9b5c' : '2px solid transparent',
            fontSize: 13, fontWeight: t === tab ? 600 : 400, color: t === tab ? '#1a2a48' : '#4a6890',
          }}>{t === 'signin' ? 'Sign In' : 'Create Account'}</button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'signup' && (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            placeholder="Display name" style={inputStyle} />
        )}
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email" required style={inputStyle} />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password" required style={inputStyle} />
        {error && <div style={{ fontSize: 12, color: '#c03838' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          padding: '12px', border: 'none', cursor: loading ? 'wait' : 'pointer',
          background: '#ff9b5c', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600,
          opacity: loading ? 0.6 : 1,
        }}>{loading ? '...' : tab === 'signin' ? 'sign in' : 'create account'}</button>
      </form>
      <div style={{ textAlign: 'center', margin: '14px 0 10px', fontSize: 12, color: '#8a8070' }}>or</div>
      <button onClick={handleGoogle} disabled={loading} style={{
        width: '100%', padding: '12px', border: '1px solid #e8e4de', cursor: 'pointer',
        background: '#fff', borderRadius: 8, fontSize: 13, color: '#1a2a48', fontWeight: 500,
      }}>continue with Google</button>
    </div>
  )
}

// ── Save default rooms to the database ──────────────────────
// Creates real saved_room records for each endlessRooms entry so they get
// thumbnails (on next open in builder) and can be browsed in My Rooms.
function SaveDefaultsButton({ user }) {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSave() {
    if (!user) { alert('Sign in first'); return }
    if (!confirm('This will create 6 saved rooms in your account from the landing page defaults. Continue?')) return
    setSaving(true)
    let count = 0
    for (const r of DEFAULT_ROOMS) {
      const data = {
        version: 1,
        gridW: r.gridW, gridD: r.gridD, wallHeight: r.wallHeight,
        cells: (() => { const c = []; for (let x = 0; x < r.gridW; x++) for (let z = 0; z < r.gridD; z++) c.push(`${x},${z}`); return c })(),
        internalWalls: [], doorOpenings: [],
        items: r.items,
        floorColor: r.floor?.match?.(/#[0-9a-f]{6}/i)?.[0] || '#d8c4a8',
        floorTexture: r.floorTex || 'wood',
        wallColor: r.wall?.match?.(/#[0-9a-f]{6}/i)?.[0] || '#f0ece4',
        wallTexture: r.wallTex || 'plaster',
        lightMood: r.mood,
        mood: r.mood,
        cart: [], musicStation: null, roomNames: {},
        allRooms: {}, currentRoomId: null,
      }
      const { error } = await supabase.from('saved_rooms').insert({
        user_id: user.id, name: r.name, data,
      })
      if (!error) count++
    }
    setSaving(false)
    setDone(true)
    alert(`Created ${count} rooms. Open each one in the builder to auto-capture thumbnails.`)
  }

  return (
    <button onClick={handleSave} disabled={saving || done} style={{
      padding: '6px 14px', borderRadius: 8, border: '1px solid #1a2a48', cursor: saving ? 'wait' : 'pointer',
      background: done ? '#f0ede8' : '#1a2a48', color: done ? '#4a6890' : '#fff',
      fontSize: 12, fontWeight: 500, opacity: saving ? 0.6 : 1,
    }}>{saving ? 'saving...' : done ? 'rooms created ✓' : 'save defaults to My Rooms'}</button>
  )
}

// ── Tab 1: Room Picker ──────────────────────────────────────
function RoomPickerTab({ config, setConfig, user }) {
  const [savedRooms, setSavedRooms] = useState([])
  const [communityRooms, setCommunityRooms] = useState([])
  const [source, setSource] = useState('saved') // 'saved' | 'community'
  const [search, setSearch] = useState('')
  const [loadingRooms, setLoadingRooms] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('saved_rooms').select('id, name, thumbnail_url, updated_at, data')
        .order('updated_at', { ascending: false }).limit(50),
      supabase.from('community_posts').select('id, title, screenshot_url, heart_count, room_id, mood')
        .order('heart_count', { ascending: false }).limit(50),
    ]).then(([saved, community]) => {
      setSavedRooms(saved.data || [])
      setCommunityRooms(community.data || [])
      setLoadingRooms(false)
    })
  }, [])

  const sourceRooms = source === 'saved' ? savedRooms : communityRooms
  const filtered = search
    ? sourceRooms.filter(r => (r.name || r.title || '').toLowerCase().includes(search.toLowerCase()))
    : sourceRooms

  async function addRoom(room) {
    if (config.rooms.length >= 12) return
    if (source === 'saved') {
      const snapshot = { sourceType: 'saved', sourceId: room.id, name: room.name || 'Untitled', thumbnail: room.thumbnail_url, data: room.data }
      setConfig(c => ({ ...c, rooms: [...c.rooms, snapshot] }))
    } else {
      // Community room — needs a linked saved_room to work on the landing page
      if (!room.room_id) {
        alert('This community room has no linked room data (shared before room linking was added). It can\'t be used on the landing page.')
        return
      }
      const { data: saved } = await supabase.from('saved_rooms').select('data').eq('id', room.room_id).single()
      const snapshot = {
        sourceType: 'community', sourceId: room.id, savedRoomId: room.room_id,
        name: room.title || 'Untitled', thumbnail: room.screenshot_url,
        mood: room.mood, roomId: room.room_id, data: saved?.data || null,
      }
      setConfig(c => ({ ...c, rooms: [...c.rooms, snapshot] }))
    }
  }

  function moveRoom(from, to) {
    setConfig(c => {
      const rooms = [...c.rooms]
      const [item] = rooms.splice(from, 1)
      rooms.splice(to, 0, item)
      return { ...c, rooms }
    })
  }

  async function deleteSavedRoom(roomId) {
    if (!confirm('Delete this saved room permanently?')) return
    await supabase.from('saved_rooms').delete().eq('id', roomId)
    setSavedRooms(prev => prev.filter(r => r.id !== roomId))
    // Also remove from lineup if it's there
    setConfig(c => ({ ...c, rooms: c.rooms.filter(r => r.sourceId !== roomId) }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
      <div>
        <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: '0 0 12px' }}>
          Available Rooms
        </h2>
        {/* Source toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {['saved', 'community'].map(s => (
            <button key={s} onClick={() => setSource(s)} style={{
              padding: '8px 16px', borderRadius: 999, border: '1px solid #e8e4de', cursor: 'pointer',
              background: s === source ? '#1a2a48' : '#fff',
              color: s === source ? '#fff' : '#1a2a48',
              fontSize: 12, fontWeight: 500,
            }}>
              {s === 'saved' ? `✦ My Rooms (${savedRooms.length})` : `♡ Community (${communityRooms.length})`}
            </button>
          ))}
        </div>
        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="search rooms..." style={{
            width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e8e4de',
            fontSize: 13, marginBottom: 12, boxSizing: 'border-box', outline: 'none',
          }} />
        {/* Room list */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #e8e4de', minHeight: 400, maxHeight: 500, overflowY: 'auto' }}>
          {loadingRooms ? (
            <div style={{ color: '#4a6890', fontSize: 13, textAlign: 'center', padding: 40 }}>loading rooms...</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: '#4a6890', fontSize: 13, textAlign: 'center', padding: 40 }}>
              {search ? 'no rooms match your search' : source === 'saved' ? 'no saved rooms yet — build one in the room builder' : 'no community rooms yet'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filtered.map(room => {
                const name = room.name || room.title || 'Untitled'
                const thumb = room.thumbnail_url || room.screenshot_url
                const alreadyAdded = config.rooms.some(r => r.sourceId === room.id)
                return (
                  <button key={room.id} onClick={() => !alreadyAdded && addRoom(room)}
                    disabled={alreadyAdded || config.rooms.length >= 12}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      background: alreadyAdded ? '#f0ede8' : '#fff', borderRadius: 8,
                      border: '1px solid #e8e4de', cursor: alreadyAdded ? 'default' : 'pointer',
                      opacity: alreadyAdded ? 0.5 : 1, textAlign: 'left', width: '100%',
                    }}>
                    {thumb ? (
                      <img src={thumb} alt="" style={{ width: 48, height: 36, borderRadius: 4, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 48, height: 36, borderRadius: 4, background: '#e8e4de' }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                      <div style={{ fontSize: 11, color: '#4a6890' }}>
                        {source === 'community' ? `♡ ${room.heart_count || 0}` : new Date(room.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <span style={{ fontSize: 11, color: '#4a6890' }}>added</span>
                    ) : (
                      <span style={{ fontSize: 18, color: '#ff9b5c' }}>+</span>
                    )}
                    {source === 'saved' && (
                      <span onClick={e => { e.stopPropagation(); deleteSavedRoom(room.id) }}
                        style={{ fontSize: 13, color: '#c03838', cursor: 'pointer', padding: '2px 6px', marginLeft: 4 }}
                        title="Delete this saved room">🗑</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <div>
        <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: '0 0 12px' }}>
          Rotation Lineup ({config.rooms.length}/12)
        </h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <button onClick={() => {
            const defaults = DEFAULT_ROOMS.map(r => ({
              sourceType: 'default', sourceId: r.name, name: r.name,
              mood: r.mood, palette: r.palette, sky: r.sky, accent: r.accent, dark: r.dark,
              data: { gridW: r.gridW, gridD: r.gridD, wallHeight: r.wallHeight,
                wallColor: r.wall, floorColor: r.floor, wallTexture: r.wallTex,
                floorTexture: r.floorTex, lightMood: r.mood, items: r.items,
                sky: r.sky, wall: r.wall, floor: r.floor, side: r.side },
            }))
            setConfig(c => ({ ...c, rooms: defaults }))
          }} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #7aa06a', cursor: 'pointer',
            background: '#eef6e6', fontSize: 12, color: '#4a6a3a', fontWeight: 500,
          }}>load defaults into lineup</button>
          <SaveDefaultsButton user={user} />
          <button onClick={() => setConfig(c => ({ ...c, rooms: [] }))} style={{
            padding: '6px 14px', borderRadius: 8, border: '1px solid #c03838', cursor: 'pointer',
            background: '#fff', fontSize: 12, color: '#c03838',
          }}>clear all</button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, fontSize: 13 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Speed:
            <input type="range" min={15} max={45} value={config.revolutionSeconds}
              onChange={e => setConfig(c => ({ ...c, revolutionSeconds: +e.target.value }))} />
            {config.revolutionSeconds}s
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Brand every:
            <input type="number" min={1} max={6} value={config.brandInterval} style={{ width: 40, padding: '4px 8px', borderRadius: 4, border: '1px solid #e8e4de' }}
              onChange={e => setConfig(c => ({ ...c, brandInterval: +e.target.value }))} />
            rooms
          </label>
        </div>
        <div style={{ marginBottom: 12, padding: 12, background: '#f8f6f2', borderRadius: 8, border: '1px solid #e8e4de' }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4a6890', display: 'block', marginBottom: 6 }}>
            Brand Room (appears first + every {config.brandInterval} rooms)
          </label>
          <select
            value={config.brandRoom || ''}
            onChange={e => setConfig(c => ({ ...c, brandRoom: e.target.value || null }))}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #e8e4de', fontSize: 13, background: '#fff' }}
          >
            <option value="">Default (Dream State brand room)</option>
            {savedRooms.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {config.brandRoom && (
            <p style={{ margin: '6px 0 0', fontSize: 11, color: '#7a8a6a' }}>
              This room will get D-shaped windows and "Daydream Dwelling" branding overlaid.
            </p>
          )}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 12, border: '1px solid #e8e4de', minHeight: 400 }}>
          {config.rooms.length === 0 ? (
            <div style={{ color: '#4a6890', fontSize: 13, textAlign: 'center', padding: 40 }}>
              No rooms in lineup yet. Add rooms from the left.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {config.rooms.map((room, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: '#f8f6f2', borderRadius: 8, border: '1px solid #e8e4de',
                }}
                  draggable onDragStart={e => e.dataTransfer.setData('text/plain', i)}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); moveRoom(+e.dataTransfer.getData('text/plain'), i) }}
                >
                  <span style={{ fontSize: 11, color: '#4a6890', width: 18, cursor: 'grab' }}>☰</span>
                  {room.thumbnail ? (
                    <img src={room.thumbnail} alt="" style={{ width: 40, height: 30, borderRadius: 4, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 30, borderRadius: 4, background: '#e8e4de' }} />
                  )}
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {room.name}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {i > 0 && <button onClick={() => moveRoom(i, i - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#4a6890' }}>▲</button>}
                    {i < config.rooms.length - 1 && <button onClick={() => moveRoom(i, i + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: '#4a6890' }}>▼</button>}
                    <button onClick={() => setConfig(c => ({ ...c, rooms: c.rooms.filter((_, j) => j !== i) }))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0383d', fontSize: 11 }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tab 2: Palette Designer ─────────────────────────────────
// Auto-generates palette from real room data (wallColor, floorColor, item swatches),
// with manual color picker overrides. Output matches endlessRooms.js format:
// { chips: [4 hex], fab: [[base, weave], ...], lamp, wood: [from, to], dot }

function hexOrFallback(v, fb) { return v?.match?.(/#[0-9a-f]{6}/i)?.[0] || fb }

function autoGeneratePalette(roomData) {
  const d = typeof roomData === 'string' ? JSON.parse(roomData) : roomData
  if (!d) return null
  const wall = hexOrFallback(d.wallColor, '#f0ece4')
  const floor = hexOrFallback(d.floorColor, '#d8c4a8')
  // Pull item swatch colors from the catalogue
  const itemColors = (d.items || []).slice(0, 8).map(it => {
    const def = ITEM_CATALOGUE[it.typeKey]
    return def?.swatches?.[it.swatchIndex]?.hex || def?.color || '#888'
  }).filter(Boolean)
  const c0 = wall, c1 = floor, c2 = itemColors[0] || '#9a7a5a', c3 = itemColors[1] || '#6a8a52'
  const fab0 = itemColors[2] || c1, fab1 = itemColors[3] || c2, fab2 = itemColors[4] || c0
  return {
    chips: [c0, c1, c2, c3],
    fab: [[fab0, 'rgba(120,100,70,0.25)'], [fab1, 'rgba(100,80,50,0.25)'], [fab2, 'rgba(110,90,60,0.25)']],
    lamp: `radial-gradient(circle at 35% 30%,${c0},${c1})`,
    wood: [floor, c2],
    dot: `linear-gradient(135deg,${c1},${c2})`,
  }
}

const PALETTE_SLOTS = [
  { key: 'chip0', label: 'Chip 1 (Wall)', row: 0 },
  { key: 'chip1', label: 'Chip 2 (Floor)', row: 0 },
  { key: 'chip2', label: 'Chip 3 (Accent)', row: 0 },
  { key: 'chip3', label: 'Chip 4 (Green)', row: 0 },
  { key: 'fab0', label: 'Fabric 1', row: 1 },
  { key: 'fab1', label: 'Fabric 2', row: 1 },
  { key: 'fab2', label: 'Fabric 3', row: 1 },
  { key: 'wood0', label: 'Wood Light', row: 2 },
  { key: 'wood1', label: 'Wood Dark', row: 2 },
]

function paletteToSlots(pal) {
  if (!pal) return {}
  return {
    chip0: pal.chips?.[0] || '#f0ece4', chip1: pal.chips?.[1] || '#d8c4a8',
    chip2: pal.chips?.[2] || '#9a7a5a', chip3: pal.chips?.[3] || '#6a8a52',
    fab0: pal.fab?.[0]?.[0] || '#c8a878', fab1: pal.fab?.[1]?.[0] || '#a08060',
    fab2: pal.fab?.[2]?.[0] || '#d0b090',
    wood0: pal.wood?.[0] || '#c9a87e', wood1: pal.wood?.[1] || '#a9855c',
  }
}

function slotsToPalette(slots) {
  return {
    chips: [slots.chip0 || '#f0ece4', slots.chip1 || '#d8c4a8', slots.chip2 || '#9a7a5a', slots.chip3 || '#6a8a52'],
    fab: [
      [slots.fab0 || '#c8a878', 'rgba(120,100,70,0.25)'],
      [slots.fab1 || '#a08060', 'rgba(100,80,50,0.25)'],
      [slots.fab2 || '#d0b090', 'rgba(110,90,60,0.25)'],
    ],
    lamp: `radial-gradient(circle at 35% 30%,${slots.chip0 || '#fff6e0'},${slots.chip1 || '#f0d9ac'})`,
    wood: [slots.wood0 || '#c9a87e', slots.wood1 || '#a9855c'],
    dot: `linear-gradient(135deg,${slots.chip1 || '#d8c4a8'},${slots.chip2 || '#9a7a5a'})`,
  }
}

function PaletteDesignerTab({ config, setConfig }) {
  const [sel, setSel] = useState(0)
  const [liveThumb, setLiveThumb] = useState(null)
  const room = config.rooms[sel]
  const pal = room?.palette

  // Fetch latest thumbnail from DB
  const palRoomDbId = room?.sourceType === 'saved' ? room.sourceId : room?.savedRoomId
  useEffect(() => {
    setLiveThumb(null)
    if (!palRoomDbId) return
    supabase.from('saved_rooms').select('thumbnail_url').eq('id', palRoomDbId).single()
      .then(({ data }) => { if (data?.thumbnail_url) setLiveThumb(data.thumbnail_url) })
  }, [palRoomDbId])
  const palThumb = liveThumb || room?.thumbnail
  const slots = paletteToSlots(pal)

  function updatePalette(newSlots) {
    setConfig(c => {
      const rooms = [...c.rooms]
      rooms[sel] = { ...rooms[sel], palette: slotsToPalette(newSlots) }
      return { ...c, rooms }
    })
  }

  function handleAutoGenerate() {
    if (!room?.data) return
    if (room.palette && !confirm('This room already has a palette. Overwrite it with auto-generated colors?')) return
    const generated = autoGeneratePalette(room.data)
    if (generated) {
      setConfig(c => {
        const rooms = [...c.rooms]
        rooms[sel] = { ...rooms[sel], palette: generated }
        return { ...c, rooms }
      })
    }
  }

  if (!room) return <p style={{ color: '#4a6890', fontSize: 14 }}>Add rooms in the Rooms tab first.</p>

  return (
    <div>
      <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: '0 0 16px' }}>Palette Designer</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {config.rooms.map((r, i) => (
            <button key={i} onClick={() => setSel(i)} style={{
              padding: '10px 14px', border: '1px solid #e8e4de', borderRadius: 8, cursor: 'pointer',
              background: i === sel ? '#ff9b5c' : '#fff', color: i === sel ? '#fff' : '#1a2a48',
              fontSize: 13, textAlign: 'left',
            }}>{r.name || `Room ${i + 1}`}
              {r.palette ? ' ✓' : ''}
            </button>
          ))}
        </div>
        <div>
          {/* Room reference — see the room while designing its palette */}
          {(() => {
            const d = room.data ? (typeof room.data === 'string' ? JSON.parse(room.data) : room.data) : null
            const roomColors = []
            if (d) {
              if (d.wallColor) roomColors.push({ label: 'Wall', val: d.wallColor })
              if (d.floorColor) roomColors.push({ label: 'Floor', val: d.floorColor })
              if (d.items) {
                d.items.slice(0, 6).forEach(it => {
                  const def = ITEM_CATALOGUE[it.typeKey]
                  const hex = def?.swatches?.[it.swatchIndex]?.hex || def?.color
                  if (hex) roomColors.push({ label: def?.label || it.typeKey, val: hex })
                })
              }
            }
            return (
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: 16, background: '#fff', borderRadius: 10, border: '1px solid #e8e4de' }}>
                {palThumb ? (
                  <img src={palThumb} alt="" style={{ width: 120, height: 90, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 120, height: 90, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: d?.wallColor || '#f0ece4', border: '1px solid #e8e4de', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%', background: d?.floorColor || '#d8c4a8' }} />
                    <span style={{ fontSize: 10, color: '#8a8070', zIndex: 1 }}>{room.name}</span>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{room.name}</div>
                  <div style={{ fontSize: 11, color: '#4a6890', marginBottom: 8 }}>{room.mood || d?.lightMood || ''}</div>
                  {roomColors.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, color: '#8a8070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Room Colors</div>
                      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {roomColors.map((c, i) => (
                          <div key={i} title={`${c.label}: ${c.val}`} style={{
                            width: 24, height: 24, borderRadius: 4, background: c.val,
                            border: '1px solid rgba(0,0,0,0.1)', cursor: 'help',
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'center' }}>
                  <button onClick={handleAutoGenerate} style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid #7aa06a', cursor: 'pointer',
                    background: '#eef6e6', fontSize: 12, color: '#4a6a3a', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>auto-generate</button>
                </div>
              </div>
            )
          })()}

          {/* Current palette */}
          <div style={{ fontSize: 10, color: '#8a8070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Current Palette</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 12, background: '#faf5ed', borderRadius: 10, border: '1px solid #e8e0d0' }}>
            {(pal?.chips || ['#ddd','#ccc','#bbb','#aaa']).map((c, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: 6, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
            ))}
            {(pal?.fab || [['#ddd'],['#ccc'],['#bbb']]).map(([c], i) => (
              <div key={`f${i}`} style={{ width: 48, height: 48, borderRadius: 6, background: c, border: '1px solid rgba(0,0,0,0.08)', opacity: 0.85 }} />
            ))}
            <div style={{ width: 48, height: 48, borderRadius: 6, background: `linear-gradient(135deg, ${pal?.wood?.[0] || '#c9a87e'}, ${pal?.wood?.[1] || '#a9855c'})`, border: '1px solid rgba(0,0,0,0.08)' }} />
          </div>

          {/* Color grid */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4de', padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#4a6890', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>
              Swatch Colors
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {PALETTE_SLOTS.map(slot => (
                <label key={slot.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#4a6890' }}>{slot.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input type="color" value={slots[slot.key] || '#888888'}
                      onChange={e => updatePalette({ ...slots, [slot.key]: e.target.value })}
                      style={{ width: 36, height: 28, border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', padding: 0 }} />
                    <span style={{ fontSize: 10, color: '#8a8070', fontFamily: 'monospace' }}>{slots[slot.key] || '#888'}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Room preview — sky gradient + room name ─────────────────
// For rooms with thumbnails/screenshots, shows the real image.
// For defaults, shows the sky gradient with the room name as an elegant card.
function RoomPreview({ room, width = 220, height = 165 }) {
  if (room.thumbnail) {
    return <img src={room.thumbnail} alt={room.name} style={{ width, height, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
  }
  const sky = room.sky || room.data?.sky || 'linear-gradient(180deg, #a8c8e4 0%, #ffe4c0 100%)'
  const pal = room.palette
  return (
    <div style={{
      width, height, borderRadius: 10, overflow: 'hidden', position: 'relative',
      background: sky, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <span style={{
          fontFamily: "'EB Garamond', serif", fontStyle: 'italic', fontSize: 18,
          color: room.dark ? '#f4eee2' : '#1a2a48',
          textShadow: room.dark ? '0 1px 6px rgba(0,0,0,0.5)' : '0 1px 4px rgba(255,255,255,0.6)',
        }}>{room.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px',
          color: room.accent || (room.dark ? '#f4eee2' : '#4a6890'),
          opacity: 0.8,
        }}>{room.mood}</span>
      </div>
      {pal && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', height: 5 }}>
          {pal.chips?.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
        </div>
      )}
    </div>
  )
}

// ── Tab 3: Room Edit Mode ───────────────────────────────────
function RoomEditTab({ config }) {
  const [sel, setSel] = useState(0)
  const [liveThumb, setLiveThumb] = useState(null)
  const room = config.rooms[sel]

  const isDefault = room?.sourceType === 'default'
  const roomDbId = room?.sourceType === 'saved' ? room.sourceId : room?.savedRoomId
  const canEdit = !!roomDbId

  // Fetch latest thumbnail from DB (config snapshot may be stale)
  useEffect(() => {
    setLiveThumb(null)
    if (!roomDbId) return
    supabase.from('saved_rooms').select('thumbnail_url').eq('id', roomDbId).single()
      .then(({ data }) => { if (data?.thumbnail_url) setLiveThumb(data.thumbnail_url) })
  }, [roomDbId])

  const thumb = liveThumb || room?.thumbnail

  if (!room) return <p style={{ color: '#4a6890', fontSize: 14 }}>Add rooms in the Rooms tab first.</p>

  const d = room.data ? (typeof room.data === 'string' ? JSON.parse(room.data) : room.data) : null
  const itemCount = d?.items?.length || 0
  const sourceLabel = isDefault ? '◈ Built-in Default' : room.sourceType === 'saved' ? '✦ Saved Room' : '♡ Community'

  return (
    <div>
      <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: '0 0 16px' }}>Room Editor</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {config.rooms.map((r, i) => (
            <button key={i} onClick={() => setSel(i)} style={{
              padding: '10px 14px', border: '1px solid #e8e4de', borderRadius: 8, cursor: 'pointer',
              background: i === sel ? '#ff9b5c' : '#fff', color: i === sel ? '#fff' : '#1a2a48',
              fontSize: 13, textAlign: 'left',
            }}>{r.name || `Room ${i + 1}`}</button>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4de', padding: 24 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            {thumb ? (
              <img src={thumb} alt="" style={{ width: 220, height: 165, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <RoomPreview room={room} width={220} height={165} />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: '0 0 10px' }}>{room.name}</h3>
              <div style={{ fontSize: 13, color: '#4a6890', display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span>{sourceLabel}</span>
                {d && <span>{d.gridW || 10} x {d.gridD || 10} ft, {d.wallHeight || 10} ft tall</span>}
                <span>{itemCount} items</span>
                {(room.mood || d?.lightMood) && <span>Mood: {room.mood || d.lightMood}</span>}
              </div>
              {/* Palette preview */}
              {room.palette && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: '#8a8070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Palette</div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {room.palette.chips?.map((c, i) => (
                      <div key={i} style={{ width: 22, height: 22, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                    ))}
                    {room.palette.fab?.map(([c], i) => (
                      <div key={`f${i}`} style={{ width: 22, height: 22, borderRadius: 4, background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Item list */}
          {d?.items?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#8a8070', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Furniture</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {d.items.map((it, i) => {
                  const def = ITEM_CATALOGUE[it.typeKey]
                  const color = def?.swatches?.[it.swatchIndex]?.hex || def?.color || '#888'
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                      background: '#f8f6f2', borderRadius: 6, border: '1px solid #e8e4de', fontSize: 11,
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
                      {def?.label || it.typeKey}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {canEdit ? (
            <a href={`/?room=${roomDbId}&from=admin`} style={{
              display: 'inline-block', padding: '14px 28px', border: 'none', cursor: 'pointer',
              background: '#ff9b5c', color: '#fff', borderRadius: 999,
              fontSize: 14, fontWeight: 600, boxShadow: '0 6px 18px rgba(255,155,92,0.4)',
              textDecoration: 'none',
            }}>open in builder →</a>
          ) : (
            <p style={{ fontSize: 13, color: '#4a6890', margin: 0, padding: '12px 16px', background: '#f8f6f2', borderRadius: 8, border: '1px solid #e8e4de' }}>
              {room.sourceType === 'community' && !room.roomId
                ? '⚠ This community room has no linked room data — it was shared before room linking was added. It won\'t appear on the landing page.'
                : 'Built-in default — save it to My Rooms first to edit.'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Tab 4: Preview & Publish ────────────────────────────────
function PreviewPublishTab({ config, setConfig }) {
  const [publishing, setPublishing] = useState(false)
  const [unpublishing, setUnpublishing] = useState(false)

  async function handlePublish() {
    setPublishing(true)
    const payload = {
      rooms: config.rooms,
      brand_room: config.brandRoom,
      brand_interval: config.brandInterval,
      revolution_seconds: config.revolutionSeconds,
      published_at: new Date().toISOString(),
    }
    if (config.id) {
      await supabase.from('landing_hero_config').update(payload).eq('id', config.id)
    } else {
      const { data } = await supabase.from('landing_hero_config').insert(payload).select().single()
      if (data) setConfig(c => ({ ...c, id: data.id }))
    }
    setConfig(c => ({ ...c, publishedAt: payload.published_at }))
    setPublishing(false)
  }

  async function handleUnpublish() {
    if (!config.id) return
    setUnpublishing(true)
    await supabase.from('landing_hero_config').update({ published_at: null }).eq('id', config.id)
    setConfig(c => ({ ...c, publishedAt: null }))
    setUnpublishing(false)
  }

  const roomCount = config.rooms.length
  const brandCount = config.brandInterval > 0 ? Math.floor(roomCount / config.brandInterval) : 0
  const totalRooms = roomCount + brandCount
  const totalTime = totalRooms * config.revolutionSeconds

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 22, fontWeight: 400, margin: 0 }}>Preview & Publish</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {config.publishedAt && (
            <button onClick={handleUnpublish} disabled={unpublishing} style={{
              padding: '10px 20px', border: '1px solid #c03838', cursor: unpublishing ? 'wait' : 'pointer',
              background: 'transparent', color: '#c03838', borderRadius: 999, fontSize: 13, fontWeight: 500,
            }}>{unpublishing ? 'unpublishing...' : 'unpublish'}</button>
          )}
          <button onClick={handlePublish} disabled={publishing || roomCount === 0} style={{
            padding: '12px 28px', border: 'none', cursor: publishing ? 'wait' : 'pointer',
            background: roomCount === 0 ? '#ccc' : '#ff9b5c', color: '#fff', borderRadius: 999,
            fontSize: 14, fontWeight: 600, boxShadow: roomCount > 0 ? '0 6px 18px rgba(255,155,92,0.4)' : 'none',
            opacity: publishing ? 0.6 : 1,
          }}>{publishing ? 'publishing...' : 'publish to landing →'}</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
        {[
          { label: 'rooms', value: roomCount },
          { label: 'with brand', value: totalRooms },
          { label: 'full cycle', value: `${Math.floor(totalTime / 60)}m ${totalTime % 60}s` },
          { label: 'revolution', value: `${config.revolutionSeconds}s` },
          { label: 'status', value: config.publishedAt ? 'published' : 'draft' },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', borderRadius: 10, border: '1px solid #e8e4de',
            padding: '14px 20px', flex: 1, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#1a2a48', fontFamily: "'EB Garamond', serif" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#4a6890', textTransform: 'uppercase', letterSpacing: '1px', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Room sequence */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e8e4de', padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#4a6890', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Room Sequence</div>
        {roomCount === 0 ? (
          <p style={{ color: '#4a6890', fontSize: 13 }}>Add rooms in the Rooms tab to see the sequence.</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {config.rooms.map((room, i) => {
              const showBrand = config.brandInterval > 0 && (i + 1) % config.brandInterval === 0 && i < roomCount - 1
              return (
                <div key={i} style={{ display: 'contents' }}>
                  <div style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #e8e4de', background: '#f8f6f2', fontSize: 12, minWidth: 80, textAlign: 'center' }}>
                    <div style={{ fontWeight: 500 }}>{room.name}</div>
                    <div style={{ fontSize: 10, color: '#4a6890', marginTop: 2 }}>{config.revolutionSeconds}s</div>
                    {room.palette && <div style={{ display: 'flex', gap: 2, marginTop: 4, justifyContent: 'center' }}>
                      {room.palette.chips?.map((c, j) => <div key={j} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
                    </div>}
                  </div>
                  {showBrand && (
                    <div style={{ padding: '10px 16px', borderRadius: 8, background: '#fdf5ec', border: '1px solid #f0d9ac', fontSize: 12, minWidth: 80, textAlign: 'center' }}>
                      <div style={{ fontWeight: 500, color: '#a9744a' }}>DD Brand</div>
                      <div style={{ fontSize: 10, color: '#c89a62', marginTop: 2 }}>{config.revolutionSeconds}s</div>
                    </div>
                  )}
                  {i < roomCount - 1 && <span style={{ color: '#d8d0c4', fontSize: 16 }}>→</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {config.publishedAt && (
        <div style={{ fontSize: 12, color: '#7aa06a', textAlign: 'center' }}>
          Last published: {new Date(config.publishedAt).toLocaleString()}
        </div>
      )}
    </div>
  )
}
