import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const BLANK_SIZE   = { label: '', price: '' }
const BLANK_SWATCH = { name: '', hex: '#888888' }

const CATEGORIES = ['seating', 'tables', 'storage', 'beds', 'lighting', 'surfaces', 'textiles', 'decor', 'electronics', 'outdoor', 'other']

export default function AddProductPage({ productId, onDone }) {
  const { user } = useAuth()
  const isEdit   = !!productId

  const [label,    setLabel]    = useState('')
  const [brand,    setBrand]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [category, setCategory] = useState('')
  const [gradient, setGradient] = useState('linear-gradient(135deg,#c4a8ff,#f0a8d8)')
  const [sizes,    setSizes]    = useState([{ ...BLANK_SIZE }])
  const [swatches, setSwatches] = useState([{ ...BLANK_SWATCH }])
  const [tags,     setTags]     = useState('')
  const [active,   setActive]   = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    if (!productId) return
    async function fetch() {
      const { data: p } = await supabase
        .from('products')
        .select('*, product_sizes(*), product_swatches(*), product_tags(tag)')
        .eq('id', productId)
        .single()
      if (!p) return
      setLabel(p.label || '')
      setBrand(p.brand || '')
      setDesc(p.description || '')
      setCategory(p.category || '')
      setGradient(p.gradient || gradient)
      setActive(p.is_active ?? true)
      setSizes(p.product_sizes?.length ? p.product_sizes.map(s => ({ label: s.label, price: s.price })) : [{ ...BLANK_SIZE }])
      setSwatches(p.product_swatches?.length ? p.product_swatches.map(s => ({ name: s.name, hex: s.hex_color })) : [{ ...BLANK_SWATCH }])
      setTags((p.product_tags || []).map(t => t.tag).join(', '))
    }
    fetch()
  }, [productId])

  function setSizeField(i, field, val) {
    setSizes(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }
  function setSwatchField(i, field, val) {
    setSwatches(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!user) return
    setError(null); setSaving(true)
    try {
      const payload = {
        label: label.trim(), brand: brand.trim() || null, description: desc.trim() || null,
        category: category || null, gradient, is_active: active, seller_id: user.id,
      }
      let pid = productId
      if (isEdit) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', pid)
        if (err) throw err
        await supabase.from('product_sizes').delete().eq('product_id', pid)
        await supabase.from('product_swatches').delete().eq('product_id', pid)
        await supabase.from('product_tags').delete().eq('product_id', pid)
      } else {
        const { data, error: err } = await supabase.from('products').insert(payload).select('id').single()
        if (err) throw err
        pid = data.id
      }
      const validSizes   = sizes.filter(s => s.label.trim() && s.price !== '')
      const validSwatches = swatches.filter(s => s.name.trim())
      if (validSizes.length) {
        await supabase.from('product_sizes').insert(validSizes.map((s, i) => ({ product_id: pid, label: s.label.trim(), price: Number(s.price), sort_order: i })))
      }
      if (validSwatches.length) {
        await supabase.from('product_swatches').insert(validSwatches.map((s, i) => ({ product_id: pid, name: s.name.trim(), hex_color: s.hex, sort_order: i })))
      }
      const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean)
      if (tagArr.length) {
        await supabase.from('product_tags').insert(tagArr.map(tag => ({ product_id: pid, tag })))
      }
      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p style={s.pageSubtitle}>{isEdit ? 'Update your listing details.' : 'Fill in the details to list your product.'}</p>
        </div>
        <button style={s.cancelBtn} onClick={onDone}>Cancel</button>
      </div>

      <form onSubmit={handleSave} style={s.form}>
        <Section title="Basic Info">
          <Field label="Product name *">
            <input style={s.input} value={label} onChange={e => setLabel(e.target.value)} required placeholder="e.g. Luxe Velvet Sofa" />
          </Field>
          <Row>
            <Field label="Brand">
              <input style={s.input} value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Studio Nord" />
            </Field>
            <Field label="Category">
              <select style={s.input} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">Select category…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Description">
            <textarea style={{ ...s.input, height: 90, resize: 'vertical' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your product — materials, style, what makes it special…" />
          </Field>
          <Field label="Preview gradient (temporary — image upload coming soon)">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: 8, background: gradient, flexShrink: 0, border: '1px solid rgba(180,160,220,0.3)' }} />
              <input style={{ ...s.input, flex: 1 }} value={gradient} onChange={e => setGradient(e.target.value)} placeholder="linear-gradient(135deg,#c4a8ff,#f0a8d8)" />
            </div>
          </Field>
        </Section>

        <Section title="Sizes & Prices">
          {sizes.map((sz, i) => (
            <Row key={i}>
              <Field label="Size label">
                <input style={s.input} value={sz.label} onChange={e => setSizeField(i, 'label', e.target.value)} placeholder="e.g. Small / 3-seat / 60in" />
              </Field>
              <Field label="Price ($)">
                <input style={s.input} type="number" min="0" value={sz.price} onChange={e => setSizeField(i, 'price', e.target.value)} placeholder="0" />
              </Field>
              {sizes.length > 1 && (
                <button type="button" style={s.removeBtn} onClick={() => setSizes(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              )}
            </Row>
          ))}
          <button type="button" style={s.addRowBtn} onClick={() => setSizes(prev => [...prev, { ...BLANK_SIZE }])}>+ Add size</button>
        </Section>

        <Section title="Color Swatches">
          {swatches.map((sw, i) => (
            <Row key={i}>
              <Field label="Color name">
                <input style={s.input} value={sw.name} onChange={e => setSwatchField(i, 'name', e.target.value)} placeholder="e.g. Midnight Blue" />
              </Field>
              <Field label="Color">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={sw.hex} onChange={e => setSwatchField(i, 'hex', e.target.value)} style={{ width: 42, height: 42, border: '1px solid rgba(180,160,220,0.3)', borderRadius: 8, background: 'none', cursor: 'pointer', padding: 2 }} />
                  <input style={{ ...s.input, flex: 1 }} value={sw.hex} onChange={e => setSwatchField(i, 'hex', e.target.value)} placeholder="#888888" />
                </div>
              </Field>
              {swatches.length > 1 && (
                <button type="button" style={s.removeBtn} onClick={() => setSwatches(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              )}
            </Row>
          ))}
          <button type="button" style={s.addRowBtn} onClick={() => setSwatches(prev => [...prev, { ...BLANK_SWATCH }])}>+ Add swatch</button>
        </Section>

        <Section title="Tags & Visibility">
          <Field label="Tags (comma-separated)">
            <input style={s.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="modern, oak, bestseller, japandi" />
          </Field>
          <label style={s.checkLabel}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} style={{ accentColor: '#c4a8ff' }} />
            List as active (visible to shoppers immediately)
          </label>
        </Section>

        {error && <p style={s.error}>{error}</p>}

        <button type="submit" style={{ ...s.saveBtn, opacity: saving ? 0.6 : 1 }} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes →' : 'Publish product →'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)', border: '1px solid rgba(180,160,220,0.2)', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 2px 12px rgba(140,100,200,0.06)' }}>
      <h3 style={{ fontSize: 11, fontWeight: 700, color: '#9a78cc', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}
function Field({ label, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#6a5a8a' }}>{label}</label>{children}</div>
}
function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>{children}</div>
}

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle:  { fontSize: 26, fontWeight: 700, color: '#3a2a5a', marginBottom: 4 },
  pageSubtitle:{ fontSize: 13, color: '#9a88bb' },
  cancelBtn:  { padding: '8px 16px', background: 'transparent', border: '1px solid rgba(180,160,220,0.4)', borderRadius: 8, color: '#7a6a9a', fontSize: 13, cursor: 'pointer' },
  form:       { display: 'flex', flexDirection: 'column', gap: 14 },
  input:      { padding: '10px 12px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(180,160,220,0.35)', borderRadius: 8, color: '#3a2a5a', fontSize: 13, outline: 'none', width: '100%' },
  removeBtn:  { padding: '8px 10px', background: 'transparent', border: '1px solid rgba(220,140,140,0.4)', borderRadius: 7, color: '#c06060', fontSize: 12, alignSelf: 'flex-end', marginBottom: 1, flexShrink: 0, cursor: 'pointer' },
  addRowBtn:  { alignSelf: 'flex-start', padding: '7px 14px', background: 'transparent', border: '1px solid rgba(180,160,220,0.35)', borderRadius: 7, color: '#8a78aa', fontSize: 12, cursor: 'pointer' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#4a3a6a', cursor: 'pointer' },
  error:      { fontSize: 12, color: '#c05050', background: 'rgba(220,100,100,0.08)', border: '1px solid rgba(220,100,100,0.25)', borderRadius: 8, padding: '10px 14px' },
  saveBtn:    { padding: '14px 0', background: 'linear-gradient(135deg,#c4a8ff,#f0a8d8)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s' },
}
