import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'

const STATUS_TABS = ['ready', 'approved', 'rejected', 'generating', 'failed']

export default function ModelReviewPage() {
  const { user } = useAuth()
  const t = useTheme()
  const [tab, setTab] = useState('ready')
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [acting, setActing] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.rpc('is_admin', { uid: user.id }).then(({ data }) => setIsAdmin(!!data))
  }, [user])

  useEffect(() => { load() }, [tab, user])

  async function load() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('id, label, brand, seller_id, model_3d_status, model_3d_storage_path, model_3d_generated_at, model_3d_tripo_job_id, scale_multiplier, orientation_offset_deg, profiles!products_seller_id_fkey(display_name)')
      .eq('model_3d_status', tab)
      .order('model_3d_generated_at', { ascending: false, nullsFirst: false })
    setModels(data || [])
    setLoading(false)
  }

  async function approve(id) {
    setActing(id)
    await supabase.from('products').update({
      model_3d_status: 'approved',
      model_3d_approved_at: new Date().toISOString(),
    }).eq('id', id)
    setActing(null)
    load()
  }

  async function reject(id) {
    setActing(id)
    await supabase.from('products').update({
      model_3d_status: 'rejected',
    }).eq('id', id)
    setActing(null)
    setRejectingId(null)
    setRejectReason('')
    load()
  }

  async function updateScale(id, scale) {
    await supabase.from('products').update({ scale_multiplier: scale }).eq('id', id)
  }

  async function updateOrientation(id, deg) {
    await supabase.from('products').update({ orientation_offset_deg: deg }).eq('id', id)
  }

  function modelPublicUrl(path) {
    if (!path) return null
    const { data } = supabase.storage.from('product-models').getPublicUrl(path)
    return data?.publicUrl
  }

  const s = styles(t)

  if (!isAdmin) {
    return (
      <div style={s.empty}>
        <p style={{ color: t.textSoft, fontSize: 14 }}>Admin access required.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>3D Model Review</h1>
        <p style={s.subtitle}>{models.length} model{models.length !== 1 ? 's' : ''} — {tab}</p>
      </div>

      <div style={s.tabs}>
        {STATUS_TABS.map(st => (
          <button
            key={st}
            style={{ ...s.tab, ...(tab === st ? s.tabActive : {}) }}
            onClick={() => setTab(st)}
          >
            {st === 'ready' ? 'Pending Review' : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={s.dim}>Loading…</p>
      ) : models.length === 0 ? (
        <div style={s.empty}>
          <p style={s.dim}>No models with status "{tab}"</p>
        </div>
      ) : (
        <div style={s.grid}>
          {models.map(m => {
            const url = modelPublicUrl(m.model_3d_storage_path)
            const seller = m.profiles?.display_name || 'Unknown seller'
            return (
              <div key={m.id} style={s.card}>
                <div style={s.cardHeader}>
                  <p style={s.cardLabel}>{m.label}</p>
                  {m.brand && <p style={s.cardBrand}>{m.brand}</p>}
                  <p style={s.cardSeller}>by {seller}</p>
                </div>

                {url && (
                  <div style={s.modelPreview}>
                    <a href={url} target="_blank" rel="noopener noreferrer" style={s.downloadLink}>
                      Download .glb
                    </a>
                    <p style={s.dim}>Open in 3D viewer to inspect</p>
                  </div>
                )}

                {m.model_3d_generated_at && (
                  <p style={s.dim}>Generated {new Date(m.model_3d_generated_at).toLocaleDateString()}</p>
                )}

                {/* Scale + orientation controls */}
                <div style={s.controls}>
                  <label style={s.controlLabel}>
                    Scale
                    <input
                      type="number" step="0.1" min="0.1" max="10"
                      defaultValue={m.scale_multiplier ?? 1}
                      style={s.controlInput}
                      onBlur={e => updateScale(m.id, parseFloat(e.target.value) || 1)}
                    />
                  </label>
                  <label style={s.controlLabel}>
                    Rotation
                    <input
                      type="number" step="15" min="0" max="360"
                      defaultValue={m.orientation_offset_deg ?? 0}
                      style={s.controlInput}
                      onBlur={e => updateOrientation(m.id, parseInt(e.target.value) || 0)}
                    />
                  </label>
                </div>

                {/* Approve / Reject actions */}
                {tab === 'ready' && (
                  <div style={s.actions}>
                    <button
                      style={s.approveBtn}
                      onClick={() => approve(m.id)}
                      disabled={acting === m.id}
                    >
                      {acting === m.id ? '…' : 'Approve'}
                    </button>
                    {rejectingId === m.id ? (
                      <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                        <input
                          style={s.rejectInput}
                          placeholder="Reason (optional)"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                        />
                        <button style={s.rejectConfirm} onClick={() => reject(m.id)} disabled={acting === m.id}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button style={s.rejectBtn} onClick={() => setRejectingId(m.id)}>
                        Reject
                      </button>
                    )}
                  </div>
                )}

                {tab === 'rejected' && (
                  <div style={s.actions}>
                    <button style={s.approveBtn} onClick={() => approve(m.id)} disabled={acting === m.id}>
                      Re-approve
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function styles(t) {
  return {
    header:      { marginBottom: 20 },
    title:       { fontSize: 26, fontWeight: 700, color: t.text, marginBottom: 4 },
    subtitle:    { fontSize: 13, color: t.textSoft, margin: 0 },
    tabs:        { display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' },
    tab:         { padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: t.surface, border: `1px solid ${t.surfaceBorder}`, color: t.textSoft },
    tabActive:   { background: t.accent, color: t.accentText, border: `1px solid ${t.accent}` },
    dim:         { fontSize: 12, color: t.textSoft, margin: '4px 0' },
    empty:       { padding: 40, textAlign: 'center', background: t.surface, border: `1px dashed ${t.surfaceBorder}`, borderRadius: 14 },
    grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 },
    card:        { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 },
    cardHeader:  {},
    cardLabel:   { fontSize: 15, fontWeight: 600, color: t.text, margin: '0 0 2px' },
    cardBrand:   { fontSize: 12, color: t.textSoft, margin: 0 },
    cardSeller:  { fontSize: 11, color: t.textSoft, margin: '2px 0 0' },
    modelPreview:{ padding: '12px', background: `${t.accent}08`, borderRadius: 10, textAlign: 'center' },
    downloadLink:{ fontSize: 13, fontWeight: 600, color: t.accent, textDecoration: 'none' },
    controls:    { display: 'flex', gap: 12 },
    controlLabel:{ fontSize: 11, color: t.textSoft, display: 'flex', flexDirection: 'column', gap: 4 },
    controlInput:{ width: 70, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: `1px solid ${t.surfaceBorder}`, background: t.bg, color: t.text },
    actions:     { display: 'flex', gap: 8, marginTop: 4 },
    approveBtn:  { flex: 1, padding: '8px 0', background: '#88d8b0', color: '#1a4a2e', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    rejectBtn:   { flex: 1, padding: '8px 0', background: '#f0d0d0', color: '#8a3030', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    rejectInput: { flex: 1, padding: '5px 8px', fontSize: 12, borderRadius: 6, border: `1px solid ${t.surfaceBorder}`, background: t.bg, color: t.text },
    rejectConfirm:{ padding: '5px 12px', background: '#d06060', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  }
}
