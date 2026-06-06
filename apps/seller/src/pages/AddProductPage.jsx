import { useEffect, useState } from 'react'
import { useAuth } from '@shared/auth/AuthContext'
import { useTheme } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import Step1Identity from './listing/Step1Identity'
import Step2Photos   from './listing/Step2Photos'
import Step3Sizes    from './listing/Step3Sizes'
import Step4Swatches from './listing/Step4Swatches'
import Step5Tags     from './listing/Step5Tags'
import Step6Shipping from './listing/Step6Shipping'
import Step7Preview  from './listing/Step7Preview'

const STEPS = ['Identity', 'Photos', 'Sizes', 'Swatches', 'Tags', 'Shipping', 'Preview']
const PROCESSING_OPTIONS = [
  { label: '1 day',     value: 1  },
  { label: '2–3 days',  value: 3  },
  { label: '3–5 days',  value: 5  },
  { label: '1–2 weeks', value: 10 },
  { label: '2–4 weeks', value: 21 },
]

export const INITIAL_FORM = {
  label: '', brand: '', category: '', handmadeType: 'manufactured',
  makeModel: '', shortDesc: '', fullDesc: '', materials: [], guarantee: '',
  photos: [],
  sizes: [{ label: '', wFt: '', wIn: '', dFt: '', dIn: '', hFt: '', hIn: '', price: '' }],
  swatches: [{ label: '', colors: [{ location: '', hex: '#888888', name: '' }], family: '' }],
  typeKey: '', styleTags: [], roomTags: [], themeTags: [],
  shippingType: 'flat', flatRate: '', processingDays: 5,
  shippingRegions: ['domestic'], wattage: '', kelvin: '',
  active: true,
}

export { PROCESSING_OPTIONS }

export default function AddProductPage({ productId, onDone }) {
  const { user } = useAuth()
  const t        = useTheme()
  const isEdit   = !!productId
  const [step,   setStep]   = useState(1)
  const [form,   setForm]   = useState(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const update = patch => setForm(prev => ({ ...prev, ...patch }))

  useEffect(() => {
    if (!productId) return
    async function load() {
      const { data: p, error: loadErr } = await supabase
        .from('products')
        .select('*, product_sizes(*), product_swatches(*), product_tags(value,tag_type), product_images(*)')
        .eq('id', productId).single()
      if (loadErr) { setError(`Load error: ${loadErr.message}`); return }
      if (!p) { setError('Product not found'); return }
      const photos = (p.product_images || [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => {
          const { data: d } = supabase.storage.from('product-images').getPublicUrl(img.storage_path)
          return { file: null, url: d.publicUrl, storagePath: img.storage_path, isPrimary: img.is_primary }
        })
      setForm({
        label: p.label || '', brand: p.brand || '', category: p.category || '',
        handmadeType: p.handmade_type || 'manufactured',
        makeModel: p.make_model || '', shortDesc: p.short_description || '',
        fullDesc: p.description || '', materials: p.materials || [], guarantee: p.guarantee || '',
        photos,
        sizes: p.product_sizes?.length
          ? p.product_sizes.map(s => {
              const fp = s.footprint || [0, 0]
              const wTotal = fp[0] || 0, dTotal = fp[1] || 0, hTotal = s.height || 0
              return {
                label: s.label, price: s.price,
                wFt: Math.floor(wTotal) || '', wIn: Math.round((wTotal % 1) * 12) || '',
                dFt: Math.floor(dTotal) || '', dIn: Math.round((dTotal % 1) * 12) || '',
                hFt: Math.floor(hTotal) || '', hIn: Math.round((hTotal % 1) * 12) || '',
              }
            })
          : INITIAL_FORM.sizes,
        swatches: p.product_swatches?.length
          ? p.product_swatches.map(s => ({
              label: s.name || '', family: s.family || '',
              colors: [{ location: '', hex: s.hex_color || s.hex || '#888888', name: s.name || '' }],
            }))
          : INITIAL_FORM.swatches,
        typeKey: p.type_key || '',
        styleTags: (p.product_tags || []).filter(x => x.tag_type === 'style').map(x => x.value),
        roomTags:  (p.product_tags || []).filter(x => x.tag_type === 'room').map(x => x.value),
        themeTags: (p.product_tags || []).filter(x => x.tag_type === 'theme').map(x => x.value),
        shippingType: p.shipping_type || 'flat', flatRate: p.flat_rate || '',
        processingDays: p.processing_days ?? 5,
        shippingRegions: p.shipping_regions || ['domestic'],
        wattage: p.wattage || '', kelvin: p.kelvin || '',
        active: p.is_active ?? true,
      })
    }
    load()
  }, [productId])

  async function handleSave() {
    if (!user) return
    setError(null); setSaving(true)
    try {
      await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true })
      const payload = {
        label: form.label.trim(), brand: form.brand.trim() || null,
        description: form.fullDesc.trim() || null, short_description: form.shortDesc.trim() || null,
        category: form.category || null, make_model: form.makeModel.trim() || null,
        handmade_type: form.handmadeType || null,
        materials: form.materials.length ? form.materials : null,
        guarantee: form.guarantee.trim() || null, type_key: form.typeKey.trim() || null,
        shipping_type: form.shippingType, flat_rate: form.flatRate ? Number(form.flatRate) : null,
        processing_days: form.processingDays || null, shipping_regions: form.shippingRegions,
        wattage: form.wattage ? Number(form.wattage) : null, kelvin: form.kelvin ? Number(form.kelvin) : null,
        is_active: form.active, status: form.active ? 'active' : 'draft', seller_id: user.id,
      }
      let pid = productId
      if (isEdit) {
        const { error: err } = await supabase.from('products').update(payload).eq('id', pid)
        if (err) throw err
      } else {
        const { data, error: err } = await supabase.from('products').insert(payload).select('id').single()
        if (err) throw err
        pid = data.id
      }
      // Upload new photos
      const uploaded = []
      for (const photo of form.photos) {
        if (photo.file) {
          const ext = photo.file.name.split('.').pop()
          const path = `${pid}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
          const { error: upErr } = await supabase.storage.from('product-images').upload(path, photo.file)
          if (upErr) throw upErr
          uploaded.push({ ...photo, storagePath: path })
        } else {
          uploaded.push(photo)
        }
      }
      await supabase.from('product_images').delete().eq('product_id', pid)
      if (uploaded.length) {
        await supabase.from('product_images').insert(
          uploaded.map((p, i) => ({ product_id: pid, storage_path: p.storagePath, is_primary: i === 0, sort_order: i }))
        )
      }
      // Sizes
      await supabase.from('product_sizes').delete().eq('product_id', pid)
      const validSizes = form.sizes.filter(s => s.label.trim() && s.price !== '')
      if (validSizes.length) {
        await supabase.from('product_sizes').insert(validSizes.map((s, i) => ({
          product_id: pid, label: s.label.trim(), price: Number(s.price),
          footprint: [Number(s.wFt || 0) + Number(s.wIn || 0) / 12, Number(s.dFt || 0) + Number(s.dIn || 0) / 12],
          height: Number(s.hFt || 0) + Number(s.hIn || 0) / 12, sort_order: i,
        })))
      }
      // Swatches — supports new multi-color format (colors[]) and legacy single-color
      await supabase.from('product_swatches').delete().eq('product_id', pid)
      const swatchRows = []
      for (let i = 0; i < form.swatches.length; i++) {
        const sw = form.swatches[i]
        if (sw.colors && sw.colors.length) {
          // New format: each option has multiple colors with locations
          const label = (sw.label || '').trim() || `Option ${i + 1}`
          const primaryColor = sw.colors[0] || {}
          const hasAnyColor = sw.colors.some(c => c.hex && c.hex !== '#888888')
          if (!hasAnyColor) continue
          swatchRows.push({
            product_id: pid,
            name: label,
            hex_color: primaryColor.hex || '#888888',
            hex: primaryColor.hex || '#888888',
            family: sw.family || null,
            sort_order: i,
            // Store full color data as JSON in the name field for now:
            // "Option 1 | Seat:#FFFFFF, Base:#1A1A1A"
          })
        } else if (sw.name && sw.name.trim()) {
          // Legacy single-color format
          swatchRows.push({
            product_id: pid, name: sw.name.trim(), hex_color: sw.hex, hex: sw.hex, family: sw.family || null, sort_order: i,
          })
        }
      }
      if (swatchRows.length) {
        await supabase.from('product_swatches').insert(swatchRows)
      }
      // Tags
      await supabase.from('product_tags').delete().eq('product_id', pid)
      const allTags = [
        ...form.styleTags.map(v => ({ product_id: pid, tag_type: 'style', value: v })),
        ...form.roomTags.map(v  => ({ product_id: pid, tag_type: 'room',  value: v })),
        ...form.themeTags.map(v => ({ product_id: pid, tag_type: 'theme', value: v })),
      ]
      if (allTags.length) await supabase.from('product_tags').insert(allTags)

      // Auto-queue 3D model generation if enough photos
      if (uploaded.length >= 1) {
        supabase.functions.invoke('generate-3d-model', { body: { productId: pid } })
          .then(({ error: tripoErr }) => {
            if (tripoErr) console.warn('3D model generation queued failed:', tripoErr)
            else console.log('3D model generation queued for', pid)
          })
      }

      onDone()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const steps = [null, Step1Identity, Step2Photos, Step3Sizes, Step4Swatches, Step5Tags, Step6Shipping, Step7Preview]
  const StepComp = steps[step]

  return (
    <div style={{ maxWidth: 680 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: t.text, marginBottom: 3 }}>
            {isEdit ? 'Edit Listing' : 'New Listing'}
          </h1>
          <p style={{ fontSize: 12, color: t.textSoft }}>Step {step} of 7 — {STEPS[step - 1]}</p>
        </div>
        <button style={{ padding: '8px 14px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, cursor: 'pointer' }} onClick={onDone}>
          Cancel
        </button>
      </div>

      <ProgressBar step={step} t={t} />

      <div style={{ marginTop: 20 }}>
        <StepComp
          form={form} update={update}
          onSave={handleSave} saving={saving} error={error} isEdit={isEdit}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
        {step > 1
          ? <button style={navBtn(t, false)} onClick={() => setStep(s => s - 1)}>← Back</button>
          : <span />}
        {step < 7 && (
          <button style={navBtn(t, true)} onClick={() => setStep(s => s + 1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}

function ProgressBar({ step, t }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {STEPS.map((name, i) => (
        <div key={name} style={{ flex: 1, height: 4, borderRadius: 4,
          background: i < step ? t.accent : i === step - 1 ? t.accent : `${t.accent}30` }} />
      ))}
    </div>
  )
}

function navBtn(t, primary) {
  return {
    padding: '11px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    background: primary ? t.accent : 'transparent',
    color: primary ? t.accentText : t.textSoft,
    border: primary ? 'none' : `1px solid ${t.surfaceBorder}`,
  }
}
