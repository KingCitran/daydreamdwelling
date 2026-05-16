import { useState, useEffect } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import { Icon } from '@shared/ui/Icon'
import { RevealAudioSettings } from './RevealAudioToggle'

const TABS = ['Rooms', 'Orders', 'Wishlists', 'Rewards', 'Pets', 'Profile', 'Preferences']

export default function AccountModal({ onClose, onLoadRoom }) {
  const t = useTheme()
  const st = makeStyles(t)
  const { user, signOut } = useAuth()
  const [tab, setTab] = useState('Rooms')

  // ── Profile ───────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState('')
  const [bio,         setBio]         = useState('')
  const [avatarUrl,   setAvatarUrl]   = useState(null)
  const [uploading,   setUploading]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [saveMsg,     setSaveMsg]     = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('display_name, bio, avatar_url').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data) return
        setDisplayName(data.display_name ?? '')
        setBio(data.bio ?? '')
        setAvatarUrl(data.avatar_url ?? null)
      })
  }, [user])

  async function uploadAvatar(e) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (upErr) { setUploading(false); return }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = urlData.publicUrl + '?t=' + Date.now()
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatarUrl(url)
    setUploading(false)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true); setSaveMsg(null)
    const { error } = await supabase.from('profiles')
      .update({ display_name: displayName.trim(), bio: bio.trim() })
      .eq('id', user.id)
    setSaving(false)
    setSaveMsg(error ? error.message : 'Saved!')
    setTimeout(() => setSaveMsg(null), 3000)
  }

  // ── Rooms ─────────────────────────────────────────────────────────
  const [rooms,        setRooms]        = useState([])
  const [roomsLoading, setRoomsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'Rooms' || !user) return
    setRoomsLoading(true)
    supabase.from('saved_rooms').select('id, name, is_public, updated_at')
      .eq('user_id', user.id).order('updated_at', { ascending: false })
      .then(({ data }) => { setRooms(data ?? []); setRoomsLoading(false) })
  }, [tab, user])

  async function togglePublic(room) {
    await supabase.from('saved_rooms').update({ is_public: !room.is_public }).eq('id', room.id)
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, is_public: !r.is_public } : r))
  }

  async function deleteRoom(id) {
    if (!window.confirm('Delete this saved room?')) return
    await supabase.from('saved_rooms').delete().eq('id', id)
    setRooms(prev => prev.filter(r => r.id !== id))
  }

  // ── Orders ────────────────────────────────────────────────────────
  const [orders,        setOrders]        = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'Orders' || !user) return
    setOrdersLoading(true)
    supabase.from('orders')
      .select('id, status, total_cents, created_at, order_items(product_name, qty, unit_price_cents)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { setOrders(data ?? []); setOrdersLoading(false) })
  }, [tab, user])

  function fmt(iso) {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // ── Wishlists ─────────────────────────────────────────────────────
  const [wlists,      setWlists]      = useState([])
  const [wlistLoading, setWlistLoading] = useState(false)
  const [newListName,  setNewListName]  = useState('')
  const [newIsGift,    setNewIsGift]    = useState(false)

  useEffect(() => {
    if (tab !== 'Wishlists' || !user) return
    setWlistLoading(true)
    supabase.from('wishlist_lists').select('*, wishlist_items(*)').eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setWlists(data ?? []); setWlistLoading(false) })
  }, [tab, user])

  async function createWishlist(e) {
    e.preventDefault()
    if (!newListName.trim()) return
    await supabase.from('wishlist_lists').insert({ user_id: user.id, name: newListName.trim(), is_gift_registry: newIsGift })
    setNewListName(''); setNewIsGift(false)
    const { data } = await supabase.from('wishlist_lists').select('*, wishlist_items(*)').eq('user_id', user.id).order('created_at', { ascending: true })
    setWlists(data ?? [])
  }

  async function deleteWishlist(id) {
    await supabase.from('wishlist_lists').delete().eq('id', id)
    setWlists(prev => prev.filter(l => l.id !== id))
  }

  // ── Rewards ──────────────────────────────────────────────────────
  const [points,       setPoints]       = useState(0)
  const [pointsLog,    setPointsLog]    = useState([])
  const [rewardsLoading, setRewardsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'Rewards' || !user) return
    setRewardsLoading(true)
    Promise.all([
      supabase.rpc('get_loyalty_balance', { uid: user.id }),
      supabase.from('loyalty_points').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ]).then(([{ data: bal }, { data: log }]) => {
      setPoints(Number(bal) || 0)
      setPointsLog(log ?? [])
      setRewardsLoading(false)
    })
  }, [tab, user])

  // ── Pets ──────────────────────────────────────────────────────────
  const [myPets,      setMyPets]      = useState([])
  const [allPets,     setAllPets]     = useState([])
  const [petsLoading, setPetsLoading] = useState(false)

  useEffect(() => {
    if (tab !== 'Pets' || !user) return
    setPetsLoading(true)
    Promise.all([
      supabase.from('user_pets').select('*, pet_types(*)').eq('user_id', user.id),
      supabase.from('pet_types').select('*').order('rarity'),
    ]).then(([{ data: mine }, { data: all }]) => {
      setMyPets(mine ?? [])
      setAllPets(all ?? [])
      setPetsLoading(false)
    })
  }, [tab, user])

  async function handleSignOut() {
    await signOut()
    onClose()
  }

  return (
    <div style={st.backdrop} onClick={onClose}>
      <div style={st.card} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={st.header}>
          <div style={st.headerLeft}>
            <div style={st.avatar}>
              {avatarUrl
                ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : (displayName || user?.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <p style={st.headerName}>{displayName || 'My Account'}</p>
              <p style={st.headerEmail}>{user?.email}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button style={{ ...st.signOutBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={handleSignOut}>
              <Icon name="signout" size={13} /> Sign Out
            </button>
            <button style={st.closeBtn} onClick={onClose} title="Close"><Icon name="close" size={16} /></button>
          </div>
        </div>

        {/* Tabs */}
        <div style={st.tabs}>
          {TABS.map(tb => (
            <button key={tb} style={{ ...st.tab, ...(tab === tb ? st.tabActive : {}) }} onClick={() => setTab(tb)}>{tb}</button>
          ))}
        </div>

        {/* Body */}
        <div style={st.body}>

          {tab === 'Rooms' && (
            <>
              {roomsLoading && <p style={st.hint}>Loading…</p>}
              {!roomsLoading && rooms.length === 0 && <p style={st.hint}>No saved rooms yet. Use Save in the builder.</p>}
              {!roomsLoading && rooms.map(room => (
                <div key={room.id} style={st.row}>
                  <div style={st.rowInfo}>
                    <span style={st.rowName}>{room.name}</span>
                    <span style={st.rowDate}>{fmt(room.updated_at)}</span>
                  </div>
                  <div style={st.rowBtns}>
                    <button
                      style={{ ...st.pillBtn, ...(room.is_public ? st.pillBtnActive : {}), display: 'inline-flex', alignItems: 'center', gap: 5 }}
                      onClick={() => togglePublic(room)}
                      title={room.is_public ? 'Public — click to make private' : 'Private — click to make public'}
                    >
                      <Icon name={room.is_public ? 'external' : 'lock'} size={11} />
                      {room.is_public ? 'Public' : 'Private'}
                    </button>
                    <button style={st.loadBtn} onClick={() => { onLoadRoom(room.id); onClose() }}>Load</button>
                    <button style={st.deleteBtn} onClick={() => deleteRoom(room.id)} title="Delete"><Icon name="trash" size={13} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'Orders' && (
            <>
              {ordersLoading && <p style={st.hint}>Loading…</p>}
              {!ordersLoading && orders.length === 0 && <p style={st.hint}>No orders yet.</p>}
              {!ordersLoading && orders.map(order => (
                <div key={order.id} style={st.orderCard}>
                  <div style={st.orderHeader}>
                    <span style={st.orderDate}>{fmt(order.created_at)}</span>
                    <span style={{ ...st.orderStatus, ...(order.status === 'paid' || order.status === 'fulfilled' ? st.orderStatusGreen : {}) }}>
                      {order.status}
                    </span>
                    <span style={st.orderTotal}>${(order.total_cents / 100).toFixed(2)}</span>
                  </div>
                  <div style={st.orderItems}>
                    {(order.order_items ?? []).map((it, i) => (
                      <span key={i} style={st.orderItem}>{it.product_name} ×{it.qty}</span>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'Wishlists' && (
            <>
              <form onSubmit={createWishlist} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input style={{ ...st.input, flex: 1 }} value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="New list name…" maxLength={40} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.textSoft, cursor: 'pointer', flexShrink: 0 }}>
                  <input type="checkbox" checked={newIsGift} onChange={e => setNewIsGift(e.target.checked)} /> Gift
                </label>
                <button type="submit" style={{ ...st.loadBtn, flexShrink: 0 }}>+ Create</button>
              </form>
              {wlistLoading && <p style={st.hint}>Loading…</p>}
              {!wlistLoading && wlists.length === 0 && <p style={st.hint}>No wishlists yet. Create one above.</p>}
              {wlists.map(list => (
                <div key={list.id} style={st.row}>
                  <div style={st.rowInfo}>
                    <span style={st.rowName}>{list.is_gift_registry ? '🎁 ' : ''}{list.name}</span>
                    <span style={st.rowDate}>{(list.wishlist_items ?? []).length} items · {list.share_token ? 'Shareable' : 'Private'}</span>
                  </div>
                  <div style={st.rowBtns}>
                    {list.share_token && (
                      <button style={st.pillBtn} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?wishlist=${list.share_token}`); }}>
                        Copy Link
                      </button>
                    )}
                    <button style={st.deleteBtn} onClick={() => deleteWishlist(list.id)} title="Delete"><Icon name="trash" size={13} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'Rewards' && (
            <>
              {rewardsLoading ? <p style={st.hint}>Loading…</p> : (
                <>
                  <div style={{ textAlign: 'center', padding: '20px 0 16px' }}>
                    <p style={{ margin: 0, fontSize: 36, fontWeight: 800, color: t.accent }}>{points}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: t.textSoft }}>Dream Points</p>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 11, color: t.textSoft, textAlign: 'center' }}>
                    Earn points from purchases, posting rooms, and completing tutorials.
                  </p>
                  {pointsLog.length === 0 && <p style={st.hint}>No activity yet.</p>}
                  {pointsLog.map(entry => (
                    <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${t.surfaceBorder}` }}>
                      <span style={{ fontSize: 12, color: t.text, textTransform: 'capitalize' }}>{entry.reason.replace('_', ' ')}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: entry.amount > 0 ? '#70c090' : '#ff7a7a' }}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount}
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {tab === 'Pets' && (
            <>
              {petsLoading && <p style={st.hint}>Loading…</p>}
              {!petsLoading && (
                <>
                  {myPets.length > 0 && (
                    <>
                      <p style={{ margin: '0 0 8px', fontSize: 11, color: t.textSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Pets</p>
                      {myPets.map(p => (
                        <div key={p.id} style={{ ...st.row, borderLeft: `3px solid #70c090` }}>
                          <span style={{ fontSize: 28, flexShrink: 0 }}>{p.pet_types?.name === 'Cloudlet' ? '☁' : p.pet_types?.name === 'Moonbeam' ? '✨' : p.pet_types?.name === 'Starwhisk' ? '⭐' : p.pet_types?.name === 'Dreamfox' ? '🦊' : '🐉'}</span>
                          <div style={st.rowInfo}>
                            <span style={st.rowName}>{p.nickname || p.pet_types?.name}</span>
                            <span style={st.rowDate}>{p.pet_types?.description}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <p style={{ margin: '16px 0 8px', fontSize: 11, color: t.textSoft, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>All Pets</p>
                  {allPets.map(pt => {
                    const owned = myPets.some(p => p.pet_type_id === pt.id)
                    return (
                      <div key={pt.id} style={{ ...st.row, opacity: owned ? 1 : 0.5 }}>
                        <span style={{ fontSize: 24, flexShrink: 0 }}>{pt.name === 'Cloudlet' ? '☁' : pt.name === 'Moonbeam' ? '✨' : pt.name === 'Starwhisk' ? '⭐' : pt.name === 'Dreamfox' ? '🦊' : '🐉'}</span>
                        <div style={st.rowInfo}>
                          <span style={st.rowName}>{pt.name} {owned && <span style={{ color: '#70c090', fontSize: 10 }}>✓ Owned</span>}</span>
                          <span style={st.rowDate}>{pt.rarity} · Unlock: tier {pt.unlock_value}</span>
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </>
          )}

          {tab === 'Preferences' && (
            <div style={{ padding: '4px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <RevealAudioSettings t={t} />
              <div style={{ borderTop: `1px solid ${t.surfaceBorder}`, paddingTop: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: t.text, marginBottom: 6, letterSpacing: '0.3px' }}>
                  Scene tooling
                </div>
                <div style={{ fontSize: 11, color: t.textSoft, marginBottom: 10, lineHeight: 1.5 }}>
                  Internal pickers for curating cloud + drape assets. Saved choices live in this browser's localStorage and feed the runtime automatically — anchor edits show up next reload.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a href="/asset-picker.html" target="_blank" rel="noreferrer" style={{ ...st.loadBtn, textDecoration: 'none', textAlign: 'center' }}>
                    Open Asset Picker (shapes / vines / florals + anchors)
                  </a>
                  <a href="/clouds-picker.html" target="_blank" rel="noreferrer" style={{ ...st.loadBtn, textDecoration: 'none', textAlign: 'center' }}>
                    Open Clouds Picker (per-mood + flat-bottom)
                  </a>
                </div>
              </div>
            </div>
          )}

          {tab === 'Profile' && (
            <form style={st.profileForm} onSubmit={saveProfile}>
              <label style={st.label}>Avatar</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...st.avatar, width: 56, height: 56, fontSize: 24 }}>
                  {avatarUrl
                    ? <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : (displayName || user?.email || '?')[0].toUpperCase()}
                </div>
                <label style={{ ...st.loadBtn, opacity: uploading ? 0.6 : 1, cursor: uploading ? 'default' : 'pointer' }}>
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={uploadAvatar} hidden disabled={uploading} />
                </label>
              </div>
              <label style={st.label}>Display Name</label>
              <input style={st.input} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" maxLength={80} />
              <label style={st.label}>Bio</label>
              <textarea style={{ ...st.input, height: 80, resize: 'vertical' }} value={bio} onChange={e => setBio(e.target.value)} placeholder="A little about you…" maxLength={300} />
              {saveMsg && <p style={{ margin: 0, fontSize: 12, color: saveMsg === 'Saved!' ? '#70c090' : '#ff7a7a' }}>{saveMsg}</p>}
              <button type="submit" style={{ ...st.loadBtn, opacity: saving ? 0.6 : 1 }} disabled={saving}>
                {saving ? 'Saving…' : 'Save Profile'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}

function makeStyles(t) {
  return {
    backdrop:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
    card:            { background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, width: 460, maxWidth: '94vw', maxHeight: '82vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    headerLeft:      { display: 'flex', alignItems: 'center', gap: 12 },
    avatar:          { width: 40, height: 40, borderRadius: '50%', background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: t.accentText, flexShrink: 0 },
    headerName:      { margin: 0, fontSize: 14, fontWeight: 700, color: t.text },
    headerEmail:     { margin: '2px 0 0', fontSize: 11, color: t.textSoft },
    signOutBtn:      { padding: '6px 14px', fontSize: 12, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, cursor: 'pointer' },
    closeBtn:        { background: 'none', border: 'none', cursor: 'pointer', color: t.textSoft, fontSize: 16, padding: 4 },
    tabs:            { display: 'flex', borderBottom: `1px solid ${t.surfaceBorder}`, flexShrink: 0 },
    tab:             { flex: 1, padding: '10px 0', background: 'transparent', color: t.textSoft, border: 'none', borderBottom: '2px solid transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
    tabActive:       { color: t.text, borderBottom: `2px solid ${t.accent}` },
    body:            { overflowY: 'auto', padding: '12px 16px 20px', display: 'flex', flexDirection: 'column', gap: 8 },
    hint:            { margin: 0, fontSize: 13, color: t.textSoft, textAlign: 'center', padding: '20px 0' },
    row:             { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10 },
    rowInfo:         { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
    rowName:         { fontSize: 13, fontWeight: 600, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    rowDate:         { fontSize: 11, color: t.textSoft },
    rowBtns:         { display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' },
    pillBtn:         { padding: '4px 10px', fontSize: 11, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 20, cursor: 'pointer' },
    pillBtnActive:   { color: '#70c090', borderColor: '#70c090' },
    loadBtn:         { padding: '6px 14px', fontSize: 12, fontWeight: 600, background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 7, cursor: 'pointer' },
    deleteBtn:       { padding: '6px 10px', fontSize: 13, background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, cursor: 'pointer' },
    orderCard:       { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 },
    orderHeader:     { display: 'flex', gap: 12, alignItems: 'center' },
    orderDate:       { fontSize: 12, color: t.textSoft, flex: 1 },
    orderStatus:     { fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' },
    orderStatusGreen:{ color: '#70c090' },
    orderTotal:      { fontSize: 13, fontWeight: 700, color: t.text },
    orderItems:      { display: 'flex', flexWrap: 'wrap', gap: 6 },
    orderItem:       { fontSize: 11, color: t.textSoft, background: `${t.accent}18`, border: `1px solid ${t.accent}33`, borderRadius: 5, padding: '2px 8px' },
    profileForm:     { display: 'flex', flexDirection: 'column', gap: 10 },
    label:           { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px', color: t.textSoft, margin: '4px 0 0' },
    input:           { padding: '10px 12px', background: t.surface, color: t.text, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit' },
  }
}
