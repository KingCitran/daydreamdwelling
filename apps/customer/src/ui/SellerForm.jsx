import { useState, useMemo } from 'react'
import { CATEGORIES, SUBCATEGORIES, ALL_STYLES, ALL_ROOMS, ALL_THEMES } from '../data/items'

const COLOR_FAMILIES = [
  'Beige', 'White', 'Gray', 'Black', 'Charcoal',
  'Brown', 'Wood', 'Red', 'Orange', 'Yellow',
  'Green', 'Blue', 'Purple', 'Pink', 'Silver', 'Gold',
]

const STEPS = [
  { label: 'About',   hint: 'Name, brand, type & category' },
  { label: 'Pricing', hint: 'Sizes and prices' },
  { label: 'Colors',  hint: 'Swatch variants' },
  { label: 'Tags',    hint: 'Style, room & vibe tags' },
  { label: 'Preview', hint: 'Review & publish' },
]

const freshForm = () => ({
  label: '', brand: '',
  category: '', subcategory: '',
  finishType: 'none',   // 'none' | 'floor' | 'wall'
  pricePerSqFt: '',
  sizes: [{ label: '', w: '2', d: '2', h: '1.5', price: '' }],
  swatches: [{ name: '', hex: '#8a7060', family: 'Brown' }],
  styles: [], rooms: [], themes: [],
  description: '', materials: [''], guarantee: '',
})

function toggleArr(arr, val) {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
}

export function buildItemDef(form) {
  const isFloor  = form.finishType === 'floor'
  const isWall   = form.finishType === 'wall'
  const isFinish = isFloor || isWall
  const validSwatches = form.swatches.filter(sw => sw.name.trim() && sw.hex)
  const firstHex = validSwatches[0]?.hex ?? '#888888'

  let sizes
  if (isFinish) {
    const ppsf = Math.max(0, Number(form.pricePerSqFt) || 0)
    sizes = [
      { label: 'Sample (10 sq ft)',  footprint: [1, 1], height: 0.01, price: ppsf * 10,  sqft: 10  },
      { label: 'Box (25 sq ft)',     footprint: [1, 1], height: 0.01, price: ppsf * 25,  sqft: 25  },
      { label: 'Bundle (100 sq ft)', footprint: [1, 1], height: 0.01, price: ppsf * 100, sqft: 100 },
    ]
  } else {
    sizes = form.sizes
      .filter(sz => sz.label.trim() && sz.price)
      .map(sz => ({
        label: sz.label,
        footprint: [Math.max(0.5, Number(sz.w) || 2), Math.max(0.5, Number(sz.d) || 2)],
        height: Math.max(0.1, Number(sz.h) || 1.5),
        price: Math.max(0, Number(sz.price) || 0),
      }))
    if (sizes.length === 0)
      sizes = [{ label: 'Standard', footprint: [2, 2], height: 1.5, price: 0 }]
  }

  const prices = sizes.map(s => s.price)
  const hex2 = validSwatches[1]?.hex ?? firstHex

  return {
    label:      form.label.trim() || 'Untitled Listing',
    category:   form.category || 'Decor',
    subcategory:form.subcategory.trim() || form.category || 'Decor',
    ...(isFloor && { isFloorFinish: true, surfaceHex: firstHex, pricePerSqFt: Number(form.pricePerSqFt) || 0 }),
    ...(isWall  && { isWallFinish:  true, surfaceHex: firstHex, pricePerSqFt: Number(form.pricePerSqFt) || 0 }),
    color:    firstHex,
    layer:    0,
    footprint: sizes[0].footprint,
    height:    sizes[0].height,
    gradient: `linear-gradient(135deg, ${firstHex} 0%, ${hex2}99 100%)`,
    brand:    form.brand.trim() || 'Independent Seller',
    price:    Math.min(...prices),
    priceMax: Math.max(...prices),
    rating:   5.0,
    reviewCount: 0,
    swatches: validSwatches.length > 0 ? validSwatches : [{ name: 'Default', hex: firstHex, family: 'Gray' }],
    styles:   form.styles,
    rooms:    form.rooms,
    themes:   form.themes,
    sizes,
    description: form.description.trim(),
    materials:   form.materials.filter(m => m.trim()),
    guarantee:   form.guarantee.trim(),
  }
}

// ── Main form component ───────────────────────────────────────────
export default function SellerForm({ onClose, onSubmit }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(freshForm)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const isFinish = form.finishType !== 'none'
  const def = useMemo(() => buildItemDef(form), [form])

  const stepValid = [
    !!(form.label.trim() && form.brand.trim() && form.category),
    isFinish ? Number(form.pricePerSqFt) > 0 : form.sizes.some(sz => sz.label.trim() && sz.price),
    form.swatches.some(sw => sw.name.trim()),
    true,
    true,
  ]

  return (
    <div style={f.backdrop} onClick={onClose}>
      <div style={f.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={f.header}>
          <div>
            <p style={f.headerEyebrow}>Seller Portal</p>
            <p style={f.headerTitle}>List a New Item</p>
          </div>
          <button style={f.closeX} onClick={onClose}>✕</button>
        </div>

        {/* Step progress bar */}
        <div style={f.stepBar}>
          {STEPS.map((s, i) => (
            <div key={i} style={f.stepItem}
              onClick={() => i < step && setStep(i)}
            >
              <div style={{ ...f.stepDot, ...(i === step ? f.dotActive : i < step ? f.dotDone : f.dotFuture) }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{ ...f.stepLbl, ...(i === step ? f.stepLblActive : {}) }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={f.body}>
          {step === 0 && <StepAbout   form={form} set={set} />}
          {step === 1 && <StepPricing form={form} set={set} isFinish={isFinish} />}
          {step === 2 && <StepColors  form={form} set={set} />}
          {step === 3 && <StepTags    form={form} set={set} />}
          {step === 4 && <StepPreview def={def} />}
        </div>

        {/* Footer */}
        <div style={f.footer}>
          <div style={{ minWidth: 80 }}>
            {step > 0 && (
              <button style={f.backBtn} onClick={() => setStep(s => s - 1)}>← Back</button>
            )}
          </div>
          <span style={f.footerHint}>{STEPS[step].hint}</span>
          <div style={{ minWidth: 80, textAlign: 'right' }}>
            {step < STEPS.length - 1 ? (
              <button
                style={{ ...f.nextBtn, ...(stepValid[step] ? {} : f.btnDisabled) }}
                onClick={() => stepValid[step] && setStep(s => s + 1)}
              >Next →</button>
            ) : (
              <button style={f.publishBtn} onClick={() => onSubmit(`custom_${Date.now()}`, def)}>
                🚀 Publish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: About ─────────────────────────────────────────────────
function StepAbout({ form, set }) {
  const subcatSuggestions = SUBCATEGORIES[form.category] ?? []
  const allCats = [...new Set([...CATEGORIES, 'Flooring', 'Wallpaper'])]

  return (
    <div style={f.step}>
      <Field label="Listing type">
        <div style={f.typeGrid}>
          {[
            { val: 'none',  icon: '🛋️', label: 'Furniture & Decor' },
            { val: 'floor', icon: '🪵', label: 'Floor Finish' },
            { val: 'wall',  icon: '🏠', label: 'Wall Covering' },
          ].map(t => (
            <button key={t.val}
              style={{ ...f.typeCard, ...(form.finishType === t.val ? f.typeCardActive : {}) }}
              onClick={() => {
                set('finishType', t.val)
                if (t.val === 'floor') set('category', 'Flooring')
                if (t.val === 'wall')  set('category', 'Wallpaper')
                if (t.val === 'none' && (form.category === 'Flooring' || form.category === 'Wallpaper')) set('category', '')
              }}
            >
              <span style={f.typeIcon}>{t.icon}</span>
              <span style={f.typeCardLabel}>{t.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Item name *">
        <input style={f.input} placeholder="e.g. Velvet Accent Chair"
          value={form.label} onChange={e => set('label', e.target.value)} />
      </Field>

      <Field label="Brand / Studio *">
        <input style={f.input} placeholder="e.g. Studio FORM"
          value={form.brand} onChange={e => set('brand', e.target.value)} />
      </Field>

      <div style={f.twoCol}>
        <Field label="Category *">
          <select style={f.select} value={form.category}
            onChange={e => { set('category', e.target.value); set('subcategory', '') }}>
            <option value="">Select category…</option>
            {allCats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory">
          <input style={f.input} placeholder="e.g. Accent Chairs"
            value={form.subcategory} onChange={e => set('subcategory', e.target.value)}
            list="subcat-suggestions" />
          <datalist id="subcat-suggestions">
            {subcatSuggestions.map(s => <option key={s} value={s} />)}
          </datalist>
        </Field>
      </div>
    </div>
  )
}

// ── Step 2: Pricing ───────────────────────────────────────────────
function StepPricing({ form, set, isFinish }) {
  const updateSize = (idx, key, val) =>
    set('sizes', form.sizes.map((sz, i) => i === idx ? { ...sz, [key]: val } : sz))

  if (isFinish) {
    const ppsf = Math.max(0, Number(form.pricePerSqFt) || 0)
    return (
      <div style={f.step}>
        <Field label="Price per square foot ($) *">
          <input style={f.input} type="number" min="0" step="0.50" placeholder="e.g. 8.00"
            value={form.pricePerSqFt} onChange={e => set('pricePerSqFt', e.target.value)} />
        </Field>
        <p style={f.noteText}>Auto-generated coverage packages:</p>
        <div style={f.previewTable}>
          {[{ sqft: 10, lbl: 'Sample' }, { sqft: 25, lbl: 'Box' }, { sqft: 100, lbl: 'Bundle' }].map(t => (
            <div key={t.sqft} style={f.previewRow}>
              <span style={f.previewLbl}>{t.lbl} — {t.sqft} sq ft</span>
              <span style={f.previewPrice}>${(ppsf * t.sqft).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={f.step}>
      {form.sizes.map((sz, idx) => (
        <div key={idx} style={f.sizeCard}>
          <div style={f.sizeCardTop}>
            <span style={f.sizeCardTitle}>Variant {idx + 1}</span>
            {form.sizes.length > 1 && (
              <button style={f.removeBtn} onClick={() => set('sizes', form.sizes.filter((_, i) => i !== idx))}>✕ Remove</button>
            )}
          </div>
          <Field label="Variant name">
            <input style={f.input} placeholder="e.g. 3-Seater"
              value={sz.label} onChange={e => updateSize(idx, 'label', e.target.value)} />
          </Field>
          <div style={f.fourCol}>
            <Field label="Width (ft)">
              <input style={f.inputSm} type="number" min="0.5" step="0.5" value={sz.w} onChange={e => updateSize(idx, 'w', e.target.value)} />
            </Field>
            <Field label="Depth (ft)">
              <input style={f.inputSm} type="number" min="0.5" step="0.5" value={sz.d} onChange={e => updateSize(idx, 'd', e.target.value)} />
            </Field>
            <Field label="Height (ft)">
              <input style={f.inputSm} type="number" min="0.1" step="0.1" value={sz.h} onChange={e => updateSize(idx, 'h', e.target.value)} />
            </Field>
            <Field label="Price ($)">
              <input style={f.inputSm} type="number" min="0" value={sz.price} onChange={e => updateSize(idx, 'price', e.target.value)} />
            </Field>
          </div>
        </div>
      ))}
      {form.sizes.length < 5 && (
        <button style={f.addBtn}
          onClick={() => set('sizes', [...form.sizes, { label: '', w: '2', d: '2', h: '1.5', price: '' }])}>
          + Add size variant
        </button>
      )}
    </div>
  )
}

// ── Step 3: Colors ────────────────────────────────────────────────
function StepColors({ form, set }) {
  const updateSwatch = (idx, key, val) =>
    set('swatches', form.swatches.map((sw, i) => i === idx ? { ...sw, [key]: val } : sw))

  return (
    <div style={f.step}>
      <p style={f.noteText}>Each swatch appears as a dot on your listing. At least one color is required.</p>
      {form.swatches.map((sw, idx) => (
        <div key={idx} style={f.swatchRow}>
          <div style={f.colorPickerWrap}>
            <input type="color" value={sw.hex} onChange={e => updateSwatch(idx, 'hex', e.target.value)} style={f.colorPicker} title="Pick color" />
            <div style={{ ...f.swatchCircle, background: sw.hex }} />
          </div>
          <input style={{ ...f.inputSm, flex: 2 }} placeholder="Color name (e.g. Sage Green)"
            value={sw.name} onChange={e => updateSwatch(idx, 'name', e.target.value)} />
          <select style={{ ...f.selectSm, flex: 1 }} value={sw.family}
            onChange={e => updateSwatch(idx, 'family', e.target.value)}>
            {COLOR_FAMILIES.map(fam => <option key={fam} value={fam}>{fam}</option>)}
          </select>
          {form.swatches.length > 1 && (
            <button style={f.removeBtn} onClick={() => set('swatches', form.swatches.filter((_, i) => i !== idx))}>✕</button>
          )}
        </div>
      ))}
      {form.swatches.length < 8 && (
        <button style={f.addBtn}
          onClick={() => set('swatches', [...form.swatches, { name: '', hex: '#888888', family: 'Gray' }])}>
          + Add color
        </button>
      )}
    </div>
  )
}

// ── Step 4: Tags + Details ────────────────────────────────────────
function StepTags({ form, set }) {
  return (
    <div style={f.step}>
      <TagPicker label="Rooms" hint="Where does this item belong?"
        allValues={ALL_ROOMS} active={form.rooms}
        onToggle={v => set('rooms', toggleArr(form.rooms, v))} />
      <TagPicker label="Styles"
        allValues={ALL_STYLES} active={form.styles}
        onToggle={v => set('styles', toggleArr(form.styles, v))} />
      <TagPicker label="Vibes"
        allValues={ALL_THEMES} active={form.themes}
        onToggle={v => set('themes', toggleArr(form.themes, v))} />

      <Field label="Description">
        <textarea style={f.textarea} rows={3}
          placeholder="Describe materials, construction, and what makes this special…"
          value={form.description} onChange={e => set('description', e.target.value)} />
      </Field>

      <Field label="Materials">
        {form.materials.map((m, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input style={{ ...f.input, flex: 1, marginBottom: 0 }}
              placeholder="e.g. Solid hardwood frame"
              value={m} onChange={e => set('materials', form.materials.map((x, i) => i === idx ? e.target.value : x))} />
            {form.materials.length > 1 && (
              <button style={f.removeBtn} onClick={() => set('materials', form.materials.filter((_, i) => i !== idx))}>✕</button>
            )}
          </div>
        ))}
        <button style={f.addBtn} onClick={() => set('materials', [...form.materials, ''])}>+ Add material</button>
      </Field>

      <Field label="Warranty / Guarantee">
        <input style={f.input} placeholder="e.g. 5-year frame · 2-year fabric"
          value={form.guarantee} onChange={e => set('guarantee', e.target.value)} />
      </Field>
    </div>
  )
}

function TagPicker({ label, hint, allValues, active, onToggle }) {
  const [q, setQ] = useState('')
  const shown = q ? allValues.filter(v => v.toLowerCase().includes(q.toLowerCase())) : allValues
  return (
    <div style={f.tagSection}>
      <div style={f.tagHeader}>
        <div>
          <p style={f.tagLabel}>{label}</p>
          {hint && <p style={f.tagHint}>{hint}</p>}
        </div>
        <input style={f.tagSearch} placeholder="filter…" value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div style={f.chipRow}>
        {shown.map(v => (
          <button key={v} style={{ ...f.chip, ...(active.includes(v) ? f.chipActive : {}) }}
            onClick={() => onToggle(v)}>{v}</button>
        ))}
      </div>
    </div>
  )
}

// ── Step 5: Preview ───────────────────────────────────────────────
function StepPreview({ def }) {
  const isFinish = def.isFloorFinish || def.isWallFinish
  return (
    <div style={f.step}>
      <p style={f.noteText}>This is how your listing will appear to customers. Click Publish when ready.</p>

      {/* Tile preview */}
      <div style={f.previewTile}>
        <div style={{ height: 120, background: def.gradient, borderRadius: '10px 10px 0 0', position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 10 }}>
          <span style={f.prevThumbTag}>{def.subcategory}</span>
          {isFinish && <span style={f.prevFinishTag}>{def.isFloorFinish ? '🪵 Floor' : '🏠 Wall'}</span>}
        </div>
        <div style={{ padding: '10px 14px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#7878aa' }}>{def.brand}</span>
            <span style={{ fontSize: 11, color: '#f0c060' }}>★ New</span>
          </div>
          <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#e0d9ff' }}>{def.label}</p>
          {isFinish
            ? <p style={{ margin: 0, fontSize: 13, color: '#c0b8ff' }}>${def.pricePerSqFt}<span style={{ fontSize: 10, color: '#7878aa' }}>/sq ft</span></p>
            : <p style={{ margin: 0, fontSize: 13, color: '#c0b8ff' }}>From <strong>${def.price.toLocaleString()}</strong></p>
          }
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {def.swatches.map(sw => (
              <span key={sw.name} title={sw.name} style={{ width: 14, height: 14, borderRadius: '50%', background: sw.hex, border: '2px solid rgba(255,255,255,0.2)', display: 'inline-block' }} />
            ))}
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div style={f.summaryTable}>
        {[
          ['Category',  `${def.category} › ${def.subcategory}`],
          ['Sizes',     `${def.sizes.length} variant${def.sizes.length !== 1 ? 's' : ''}`],
          ['Colors',    `${def.swatches.length} swatch${def.swatches.length !== 1 ? 'es' : ''}`],
          ['Styles',    def.styles.join(', ') || '—'],
          ['Rooms',     def.rooms.join(', ')  || '—'],
          ['Vibes',     def.themes.join(', ') || '—'],
        ].map(([k, v]) => (
          <div key={k} style={f.summaryRow}>
            <span style={f.summaryKey}>{k}</span>
            <span style={f.summaryVal}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Shared helpers ────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={f.field}>
      <label style={f.fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────
const f = {
  backdrop: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, fontFamily: 'system-ui, sans-serif' },
  modal: { background: '#1e1e30', border: '1px solid #4a4a6a', borderRadius: 16, width: 560, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  header: { padding: '16px 20px 12px', borderBottom: '1px solid #3a3a5a', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerEyebrow: { margin: 0, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#7878aa' },
  headerTitle: { margin: '3px 0 0', fontSize: 18, fontWeight: 700, color: '#e0d9ff' },
  closeX: { background: 'transparent', border: 'none', color: '#7878aa', cursor: 'pointer', fontSize: 18, padding: '0 4px', lineHeight: 1, marginTop: 4 },

  stepBar: { display: 'flex', padding: '12px 20px 0', borderBottom: '1px solid #2a2a3a', flexShrink: 0, overflowX: 'auto' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '0 14px 12px', cursor: 'pointer', flex: 1, minWidth: 52 },
  stepDot: { width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, transition: 'all 0.2s', flexShrink: 0 },
  dotActive: { background: '#9a7aee', color: '#fff', boxShadow: '0 0 0 3px rgba(154,122,238,0.3)' },
  dotDone:   { background: '#3a6a4a', color: '#80d080' },
  dotFuture: { background: '#2a2a3d', color: '#5a5a7a', border: '1px solid #3a3a5a' },
  stepLbl:       { fontSize: 10, color: '#6a6a8a', fontWeight: 500, whiteSpace: 'nowrap' },
  stepLblActive: { color: '#c0b8ff', fontWeight: 700 },

  body:   { flex: 1, overflowY: 'auto' },
  step:   { padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { padding: '12px 20px', borderTop: '1px solid #3a3a5a', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 10 },
  footerHint: { fontSize: 11, color: '#6868aa', flex: 1, textAlign: 'center' },
  backBtn:    { padding: '8px 16px', background: 'transparent', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
  nextBtn:    { padding: '8px 20px', background: '#5a4a8a', color: '#fff', border: '1px solid #9a7aee', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  btnDisabled:{ opacity: 0.35, cursor: 'not-allowed' },
  publishBtn: { padding: '9px 22px', background: '#2a5a3a', color: '#80e090', border: '1px solid #4a8a5a', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },

  // Fields
  field:      { display: 'flex', flexDirection: 'column', gap: 5 },
  fieldLabel: { fontSize: 10, fontWeight: 700, color: '#8888aa', textTransform: 'uppercase', letterSpacing: '0.9px' },
  noteText:   { margin: 0, fontSize: 12, color: '#7878aa', fontStyle: 'italic' },
  twoCol:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  fourCol:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },

  // Inputs
  input:    { padding: '8px 10px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 7, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
  inputSm:  { padding: '7px 8px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 6, fontSize: 12, outline: 'none', width: '100%', boxSizing: 'border-box' },
  select:   { padding: '8px 10px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 7, fontSize: 13, outline: 'none', width: '100%' },
  selectSm: { padding: '7px 8px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 6, fontSize: 12, outline: 'none' },
  textarea: { padding: '8px 10px', background: '#2a2a3d', color: '#e0d9ff', border: '1px solid #4a4a6a', borderRadius: 7, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' },

  // Listing type selector
  typeGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  typeCard:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', background: '#2a2a3d', border: '1px solid #3a3a5a', borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' },
  typeCardActive:{ background: '#3a2a5a', borderColor: '#9a7aee' },
  typeIcon:      { fontSize: 22 },
  typeCardLabel: { fontSize: 11, fontWeight: 600, color: '#c0b8ff', textAlign: 'center' },

  // Size card
  sizeCard:    { background: '#252538', border: '1px solid #3a3a5a', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 },
  sizeCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sizeCardTitle: { fontSize: 11, fontWeight: 700, color: '#9898cc', textTransform: 'uppercase', letterSpacing: '1px' },

  // Pricing preview
  previewTable: { background: '#252538', border: '1px solid #3a3a5a', borderRadius: 10, overflow: 'hidden' },
  previewRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #1e1e2a' },
  previewLbl:   { fontSize: 12, color: '#9898cc' },
  previewPrice: { fontSize: 15, fontWeight: 700, color: '#e0d9ff' },

  // Color swatches
  swatchRow:      { display: 'flex', alignItems: 'center', gap: 8 },
  colorPickerWrap:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 },
  colorPicker:    { width: 32, height: 32, borderRadius: 6, border: 'none', padding: 0, cursor: 'pointer', background: 'none' },
  swatchCircle:   { width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)' },

  // Tags
  tagSection: { display: 'flex', flexDirection: 'column', gap: 8 },
  tagHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  tagLabel:   { margin: 0, fontSize: 11, fontWeight: 700, color: '#9898cc', textTransform: 'uppercase', letterSpacing: '0.8px' },
  tagHint:    { margin: '2px 0 0', fontSize: 10, color: '#6868aa' },
  tagSearch:  { padding: '4px 9px', fontSize: 10, background: '#2a2a3d', color: '#c0b8ff', border: '1px solid #3a3a5a', borderRadius: 10, outline: 'none', width: 90, flexShrink: 0 },
  chipRow:    { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip:       { padding: '4px 12px', background: '#2a2a3d', color: '#9898cc', border: '1px solid #4a4a6a', borderRadius: 12, cursor: 'pointer', fontSize: 11 },
  chipActive: { background: '#5a4a8a', borderColor: '#9a7aee', color: '#e0d9ff', fontWeight: 600 },

  // Preview tile
  previewTile:  { background: '#2a2a3d', border: '1px solid #3a3a5a', borderRadius: 12, overflow: 'hidden' },
  prevThumbTag: { background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', padding: '2px 8px', borderRadius: 10 },
  prevFinishTag:{ background: 'rgba(90,74,138,0.85)', color: '#e0d9ff', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10 },

  // Summary table
  summaryTable:  { background: '#252538', border: '1px solid #3a3a5a', borderRadius: 10, overflow: 'hidden' },
  summaryRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 14px', borderBottom: '1px solid #1e1e2a' },
  summaryKey:    { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#7878aa', flexShrink: 0, marginRight: 12 },
  summaryVal:    { fontSize: 12, color: '#c0b8ff', textAlign: 'right' },

  // Shared actions
  addBtn:    { padding: '7px 14px', background: 'transparent', color: '#9a7aee', border: '1px dashed #5a4a8a', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, alignSelf: 'flex-start' },
  removeBtn: { padding: '4px 10px', background: 'transparent', color: '#7878aa', border: '1px solid #3a3a5a', borderRadius: 6, cursor: 'pointer', fontSize: 11, flexShrink: 0 },
}
