import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'

const BLANK_SIZE    = { label: '', price: '' }
const BLANK_SWATCH  = { name: '', hex: '#888888' }

export default function AddProductPage({ productId, onDone }) {
  const { user } = useAuth()
  const isEdit   = !!productId

  const [label,     setLabel]     = useState('')
  const [brand,     setBrand]     = useState('')
  const [desc,      setDesc]      = useState('')
  const [category,  setCategory]  = useState('')
  const [gradient,  setGradient]  = useState('linear-gradient(135deg,#4a4a6a,#2a2a4a)')
  const [sizes,     setSizes]     = useState([{ ...BLANK_SIZE }])
  const [swatches,  setSwatches]  = useState([{ ...BLANK_SWATCH }])
  const [tags,      setTags]      = useState('')
  const [active,    setActive]    = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState(null)

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
        category: category.trim() || null, gradient, is_active: active, seller_id: user.id,
      }

      let pid = productId
      if (isEdit) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', pid)
        if (err) throw err
        // Replace child rows
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
    <div style={{ maxWidth: 680 }}>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>{isEdit ? 'Edit product' : 'New product'}</h1>
        <button style={s.cancelBtn} onClick={onDone}>Cancel</button>
      </div>

      <form onSubmit={handleSave} style={s.form}>
        {/* Basic info */}
        <Section title="Basic Info">
          <Field label="Product name *">
            <input style={s.input} value={label} onChange={e => setLabel(e.target.value)} required placeholder="e.g. Luxe Velvet Sofa" />
          </Field>
          <Row>
            <Field label="Brand">
              <input style={s.input} value={brand} onChange={e => setBrand(e.target.value)} placeholder="e.g. Studio Nord" />
            </Field>
            <Field label="Category">
              <input style={s.input} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. seating" />
            </Field>
          </Row>
          <Field label="Description">
            <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Short product description…" />
          </Field>
          <Field label="Gradient (CSS)">
            <input style={s.input} value={gradient} onChange={e => setGradient(e.target.value)} placeholder="linear-gradient(135deg,#4a4a6a,#2a2a4a)" />
          </Field>
        </Section>

        {/* Sizes */}
        <Section title="Sizes & Prices">
          {sizes.map((sz, i) => (
            <Row key={i}>
              <Field label="Size label">
                <input style={s.input} value={sz.label} onChange={e => setSizeField(i, 'label', e.target.value)} placeholder="e.g. Small" />
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

        {/* Swatches */}
        <Section title="Color Swatches">
          {swatches.map((sw, i) => (
            <Row key={i}>
              <Field label="Color name">
                <input style={s.input} value={sw.name} onChange={e => setSwatchField(i, 'name', e.target.value)} placeholder="e.g. Midnight" />
              </Field>
              <Field label="Hex">
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="color" value={sw.hex} onChange={e => setSwatchField(i, 'hex', e.target.value)} style={{ width: 38, height: 38, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
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

        {/* Tags & visibility */}
        <Section title="Tags & Visibility">
          <Field label="Tags (comma-separated)">
            <input style={s.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="modern, oak, bestseller" />
          </Field>
          <label style={s.checkLabel}>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            List as active (visible to shoppers)
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
    <div style={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 12, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#7878aa', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>{title}</h3>
      {children}
    </div>
  )
}
function Field({ label, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1 }}><label style={{ fontSize: 12, color: '#7878aa' }}>{label}</label>{children}</div>
}
function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>{children}</div>
}

const s = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle:  { fontSize: 22, fontWeight: 700, color: '#e0d9ff' },
  cancelBtn:  { padding: '8px 16px', background: 'transparent', border: '1px solid #3a3a5a', borderRadius: 8, color: '#7878aa', fontSize: 13 },
  form:       { display: 'flex', flexDirection: 'column', gap: 16 },
  input:      { padding: '10px 12px', background: '#13132a', border: '1px solid #3a3a5a', borderRadius: 8, color: '#e0d9ff', fontSize: 13, outline: 'none', width: '100%' },
  removeBtn:  { padding: '8px 10px', background: 'transparent', border: '1px solid #4a2a2a', borderRadius: 7, color: '#ff7a7a', fontSize: 12, alignSelf: 'flex-end', marginBottom: 1, flexShrink: 0 },
  addRowBtn:  { alignSelf: 'flex-start', padding: '7px 14px', background: 'transparent', border: '1px solid #3a3a5a', borderRadius: 7, color: '#9090b8', fontSize: 12 },
  checkLabel: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#c0b8ff', cursor: 'pointer' },
  error:      { fontSize: 12, color: '#ff7a7a', background: '#3a1a1a', border: '1px solid #7a2a2a', borderRadius: 6, padding: '10px 14px' },
  saveBtn:    { padding: '14px 0', background: 'linear-gradient(135deg, #4a3a7a 0%, #6a4aaa 100%)', color: '#fff', border: '1px solid #9a7aee', borderRadius: 10, fontSize: 15, fontWeight: 700, transition: 'opacity 0.15s' },
}
