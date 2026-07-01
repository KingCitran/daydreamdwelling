import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const MODEL_STATUS = {
  none:       { label: 'No 3D',      color: '#888' },
  pending:    { label: 'Queued',     color: '#e0944a' },
  generating: { label: 'Generating', color: '#e0944a' },
  ready:      { label: '3D Ready',   color: '#5a9abb' },
  approved:   { label: '3D Live',    color: '#88d8b0' },
  rejected:   { label: '3D Rejected',color: '#d06060' },
  failed:     { label: '3D Failed',  color: '#d06060' },
}

export default function ProductsPage({ onNavigate }) {
  const { user } = useAuth()
  const t        = useTheme()
  const [products,  setProducts]  = useState([])
  const [unitsSold, setUnitsSold] = useState({}) // productId → qty
  const [loading,   setLoading]   = useState(true)
  const [deleting,  setDeleting]  = useState(null)
  const [tripoLoading, setTripoLoading] = useState(null)
  const [sizePreview, setSizePreview] = useState(null) // product id
  const [search,    setSearch]    = useState('')
  const [sort,      setSort]      = useState('newest')
  const [selected,  setSelected]  = useState(new Set())
  const [bulking,   setBulking]   = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    const { data: prods } = await supabase
      .from('products')
      .select('id, label, brand, is_active, created_at, model_3d_status, model_3d_tripo_job_id, product_sizes(label, price, footprint, height, sort_order), product_images(storage_path, is_primary, sort_order)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    const rows = (prods || []).map(p => {
      const imgs = (p.product_images || []).sort((a, b) => a.sort_order - b.sort_order)
      const primary = imgs.find(i => i.is_primary) || imgs[0]
      return {
        ...p,
        thumbnailUrl: primary
          ? supabase.storage.from('product-images').getPublicUrl(primary.storage_path).data?.publicUrl
          : null,
      }
    })
    setProducts(rows)

    if (rows.length) {
      const ids = rows.map(p => p.id)
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('product_id', ids)
      const totals = {}
      for (const it of items || []) {
        totals[it.product_id] = (totals[it.product_id] || 0) + it.quantity
      }
      setUnitsSold(totals)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  async function handleDelete(id) {
    const { count } = await supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('product_id', id)
    if (count > 0) { window.confirm('This product has orders and cannot be deleted. Archive it instead?'); return }
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('products').delete().eq('id', id)
    setDeleting(null)
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
    load()
  }

  async function toggleActive(product) {
    const next = !product.is_active
    await supabase.from('products').update({ is_active: next, status: next ? 'active' : 'draft' }).eq('id', product.id)
    load()
  }

  async function handleDuplicate(product) {
    const { data: src } = await supabase
      .from('products')
      .select('*, product_sizes(*)')
      .eq('id', product.id)
      .single()
    if (!src) return
    const { id: _id, created_at: _ca, ...rest } = src
    const { data: copy } = await supabase
      .from('products')
      .insert({ ...rest, label: `${src.label} (copy)`, is_active: false })
      .select('id')
      .single()
    if (copy && src.product_sizes?.length) {
      const sizes = src.product_sizes.map(({ id: _sid, product_id: _pid, ...sz }) => ({
        ...sz, product_id: copy.id,
      }))
      await supabase.from('product_sizes').insert(sizes)
    }
    load()
  }

  async function triggerTripo(id) {
    setTripoLoading(id)
    const { data, error } = await supabase.functions.invoke('generate-3d-model', { body: { productId: id } })
    if (error) {
      let msg = error.message || 'Unknown error'
      try {
        const ctx = error.context
        if (ctx && typeof ctx.json === 'function') {
          const body = await ctx.json()
          if (body?.error) msg = body.error
          if (body?.detail) msg += ' — ' + body.detail
        }
      } catch {}
      alert('3D generation failed: ' + msg)
    } else if (data?.ok) {
      alert(`3D model queued! (${data.photoCount} photos, ${data.mode})`)
    }
    setTripoLoading(null)
    load()
  }

  async function pollTripo(id, taskId) {
    setTripoLoading(id)
    const { data, error } = await supabase.functions.invoke('tripo-webhook', { body: { taskId } })
    setTripoLoading(null)
    if (error) { alert('Poll failed: ' + (error.message || 'Unknown')); return }
    if (data?.status === 'ready') alert('3D model is ready for review!')
    else if (data?.progress != null) alert(`Still generating… ${data.progress}% complete`)
    load()
  }

  // ── Bulk actions ────────────────────────────────────────────────────
  function toggleSelect(id) {
    setSelected(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleSelectAll() {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(p => p.id)))
  }

  async function bulkSetActive(active) {
    setBulking(true)
    await supabase.from('products').update({ is_active: active, status: active ? 'active' : 'draft' }).in('id', [...selected])
    setSelected(new Set())
    setBulking(false)
    load()
  }

  async function bulkDelete() {
    const ids = [...selected]
    const { count } = await supabase.from('order_items').select('id', { count: 'exact', head: true }).in('product_id', ids)
    if (count > 0) { window.confirm('Some selected products have orders and cannot be deleted. Archive them instead?'); return }
    if (!window.confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return
    setBulking(true)
    await supabase.from('products').delete().in('id', ids)
    setSelected(new Set())
    setBulking(false)
    load()
  }

  function minPrice(product) {
    const prices = (product.product_sizes || []).map(sz => sz.price).filter(Boolean)
    return prices.length ? Math.min(...prices) : null
  }

  const s = makeStyles(t)
  const filtered = products
    .filter(p => !search || p.label?.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name')     return (a.label ?? '').localeCompare(b.label ?? '')
      if (sort === 'price')    return (minPrice(a) ?? 0) - (minPrice(b) ?? 0)
      if (sort === 'sold')     return (unitsSold[b.id] || 0) - (unitsSold[a.id] || 0)
      return 0 // newest = DB order
    })

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>Products</h1>
          <p style={s.pageSubtitle}>{products.length} listing{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={s.addBtn} onClick={() => onNavigate('add-product')}>+ New product</button>
      </div>

      <div style={s.toolbar}>
        <input style={s.search} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price">Price: Low–High</option>
          <option value="sold">Most Sold</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div style={s.bulkBar}>
          <span style={s.bulkCount}>{selected.size} selected</span>
          <button style={s.bulkBtn} onClick={() => bulkSetActive(true)}  disabled={bulking}>Activate</button>
          <button style={s.bulkBtn} onClick={() => bulkSetActive(false)} disabled={bulking}>Deactivate</button>
          <button style={{ ...s.bulkBtn, color: '#d06060' }} onClick={bulkDelete} disabled={bulking}>Delete</button>
          <button style={s.bulkClear} onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {loading ? (
        <p style={s.dimText}>Loading…</p>
      ) : products.length === 0 ? (
        <div style={s.empty}>
          <p style={s.emptyTitle}>No products yet</p>
          <p style={s.dimText}>Add your first product to start selling.</p>
          <button style={s.addBtn} onClick={() => onNavigate('add-product')}>+ New product</button>
        </div>
      ) : (
        <>
          <div style={s.selectAllRow}>
            <label style={s.selectAllLabel}>
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} style={{ accentColor: t.accent }} />
              <span>Select all</span>
            </label>
          </div>
          <div style={s.grid}>
            {filtered.map(p => {
              const price  = minPrice(p)
              const sold   = unitsSold[p.id] || 0
              const isSelected = selected.has(p.id)
              return (
                <div key={p.id} style={{ ...s.card, ...(isSelected ? { outline: `2px solid ${t.accent}` } : {}) }}>
                  <div style={{ ...s.cardTop, ...(p.thumbnailUrl ? { backgroundImage: `url(${p.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
                    <div style={{ ...s.statusPill, background: p.is_active ? '#88d8b0' : '#e0d8f0', color: p.is_active ? '#2a6a4a' : '#9a88bb' }}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <div style={s.cardTopRight}>
                      {sold > 0 && <span style={s.soldBadge}>{sold} sold</span>}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(p.id)}
                        style={{ accentColor: t.accent, cursor: 'pointer' }}
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div style={s.cardBody}>
                    <p style={s.cardLabel}>{p.label}</p>
                    {p.brand && <p style={s.cardBrand}>{p.brand}</p>}
                    {price != null && <p style={s.cardPrice}>from ${price.toLocaleString()}</p>}
                    {/* 3D model status */}
                    {(() => {
                      const ms = MODEL_STATUS[p.model_3d_status] || MODEL_STATUS.none
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, color: ms.color }}>{ms.label}</span>
                          {(p.model_3d_status === 'none' || p.model_3d_status === 'failed' || p.model_3d_status === 'approved' || p.model_3d_status === 'ready' || p.model_3d_status === 'rejected') && (
                            <button
                              style={{ fontSize: 10, padding: '2px 8px', background: `${t.accent}20`, border: `1px solid ${t.accent}40`, borderRadius: 6, color: t.accent, cursor: 'pointer', fontWeight: 600 }}
                              onClick={e => { e.stopPropagation(); triggerTripo(p.id) }}
                              disabled={tripoLoading === p.id}
                            >
                              {tripoLoading === p.id ? '…' : p.model_3d_status === 'none' ? 'Generate 3D' : 'Regenerate 3D'}
                            </button>
                          )}
                          {p.model_3d_status === 'generating' && (
                            <button
                              style={{ fontSize: 10, padding: '2px 8px', background: `${t.accent}20`, border: `1px solid ${t.accent}40`, borderRadius: 6, color: t.accent, cursor: 'pointer', fontWeight: 600 }}
                              onClick={e => { e.stopPropagation(); pollTripo(p.id, p.model_3d_tripo_job_id) }}
                              disabled={tripoLoading === p.id}
                            >
                              {tripoLoading === p.id ? '…' : 'Check status'}
                            </button>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                  <div style={s.cardActions}>
                    <button style={s.actionBtn} onClick={e => { e.stopPropagation(); setSizePreview(sizePreview === p.id ? null : p.id) }}>📐</button>
                    <button style={s.actionBtn} onClick={() => onNavigate('add-product', { editProductId: p.id })}>Edit</button>
                    <button style={{ ...s.actionBtn, color: p.is_active ? '#e0944a' : '#5a9a6a' }} onClick={() => toggleActive(p)}>
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button style={s.actionBtn} onClick={() => handleDuplicate(p)} title="Duplicate as inactive draft">⎘</button>
                    <button style={{ ...s.actionBtn, color: '#d06060', borderRight: 'none' }} onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                      {deleting === p.id ? '…' : 'Del'}
                    </button>
                  </div>
                  {sizePreview === p.id && (() => {
                    const sizes = (p.product_sizes || []).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                    if (!sizes.length) return <div style={s.sizePanel}><p style={{ fontSize: 12, color: t.textSoft, margin: 0 }}>No sizes entered yet.</p></div>
                    const PERSON_H = 5.6 // average person ~5'7" in feet
                    const maxH = Math.max(...sizes.map(sz => sz.height || 0), PERSON_H)
                    const scale = 100 / maxH // px per foot
                    return (
                      <div style={s.sizePanel}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: t.textSoft, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Size Check</p>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', overflowX: 'auto', paddingBottom: 4 }}>
                          {/* Human reference */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <div style={{ width: 20, height: PERSON_H * scale, background: `${t.textSoft}30`, borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 4 }}>
                              <span style={{ fontSize: 10, color: t.textSoft }}>🧍</span>
                            </div>
                            <span style={{ fontSize: 9, color: t.textSoft }}>5'7"</span>
                          </div>
                          {sizes.map((sz, i) => {
                            const fp = sz.footprint || [0, 0]
                            const w = fp[0] || 0
                            const d = fp[1] || 0
                            const h = sz.height || 0
                            const fmtDim = v => v > 0 ? `${Math.floor(v)}'${Math.round((v % 1) * 12)}"` : '—'
                            return (
                              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{
                                  width: Math.max(24, (w || 1.5) * scale * 0.6),
                                  height: Math.max(12, h * scale),
                                  background: `${t.accent}30`,
                                  border: `1px solid ${t.accent}60`,
                                  borderRadius: 4,
                                }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: t.text }}>{sz.label}</span>
                                <span style={{ fontSize: 9, color: t.textSoft }}>
                                  {w > 0 || d > 0 ? `${fmtDim(w)} × ${fmtDim(d)}` : 'no dims'}
                                </span>
                                <span style={{ fontSize: 9, color: t.textSoft }}>
                                  H: {h > 0 ? fmtDim(h) : '—'}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {sizes.some(sz => !sz.height || !sz.footprint?.[0]) && (
                          <p style={{ fontSize: 10, color: '#e07a30', margin: '8px 0 0' }}>
                            Some sizes are missing dimensions — they'll default to 2×2×2 ft in the room builder.
                          </p>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function makeStyles(t) {
  return {
    pageHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    pageTitle:    { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    pageSubtitle: { fontSize: 13, color: t.textSoft },
    addBtn:       { padding: '10px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    toolbar:      { display: 'flex', gap: 10, marginBottom: 12 },
    search:       { flex: 1, padding: '9px 14px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, outline: 'none' },
    sortSelect:   { padding: '9px 14px', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, fontSize: 13, background: t.surface, color: t.text, cursor: 'pointer' },
    bulkBar:      { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: `${t.accent}14`, border: `1px solid ${t.accent}44`, borderRadius: 10, marginBottom: 14 },
    bulkCount:    { fontSize: 13, fontWeight: 600, color: t.accent, marginRight: 4 },
    bulkBtn:      { padding: '5px 12px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: t.text, cursor: 'pointer' },
    bulkClear:    { marginLeft: 'auto', padding: '5px 10px', background: 'transparent', border: 'none', fontSize: 12, color: t.textSoft, cursor: 'pointer' },
    selectAllRow: { display: 'flex', alignItems: 'center', marginBottom: 10 },
    selectAllLabel: { display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: t.textSoft, cursor: 'pointer', userSelect: 'none' },
    dimText:      { fontSize: 13, color: t.textSoft },
    empty:        { background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 16, padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
    emptyTitle:   { fontSize: 16, fontWeight: 600, color: t.text },
    grid:         { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 },
    card:         { background: t.surface, backdropFilter: 'blur(12px)', border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'outline 0.1s' },
    cardTop:      { height: 140, background: `${t.accent}12`, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10 },
    cardTopRight: { display: 'flex', alignItems: 'center', gap: 8 },
    statusPill:   { fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '3px 10px', letterSpacing: '0.3px' },
    soldBadge:    { fontSize: 10, fontWeight: 600, color: t.textSoft, background: `${t.textSoft}18`, borderRadius: 20, padding: '2px 8px' },
    cardBody:     { padding: '14px 16px', flex: 1 },
    cardLabel:    { fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 },
    cardBrand:    { fontSize: 11, color: t.textSoft, marginBottom: 6 },
    cardPrice:    { fontSize: 13, fontWeight: 600, color: t.accent },
    cardActions:  { display: 'flex', borderTop: `1px solid ${t.surfaceBorder}` },
    actionBtn:    { flex: 1, padding: '9px 0', background: 'transparent', border: 'none', color: t.textSoft, fontSize: 12, borderRight: `1px solid ${t.surfaceBorder}`, cursor: 'pointer', fontWeight: 500 },
    sizePanel:    { padding: '12px 14px', borderTop: `1px solid ${t.surfaceBorder}`, background: `${t.accent}06` },
  }
}
