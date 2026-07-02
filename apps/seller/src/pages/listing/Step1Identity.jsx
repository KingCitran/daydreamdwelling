import { useRef } from 'react'
import { useTheme } from '@shared/ThemeProvider'

const CATEGORIES = [
  'seating','tables','storage','beds','lighting',
  'flooring','wall treatments','paint',
  'rugs','textiles','decor',
  'doors','windows','trim & molding',
  'electronics','outdoor','other',
]

const SUBCATEGORIES = {
  seating:           ['Sofa', 'Loveseat', 'Armchair', 'Accent Chair', 'Recliner', 'Bench', 'Stool', 'Bar Stool', 'Dining Chair', 'Office Chair', 'Bean Bag', 'Ottoman', 'Pouf'],
  tables:            ['Dining Table', 'Coffee Table', 'Side Table', 'Console Table', 'Desk', 'Nightstand', 'Bar Table', 'Vanity Table', 'Folding Table'],
  storage:           ['Dresser', 'Bookshelf', 'Shelving Unit', 'Cabinet', 'Credenza', 'Sideboard', 'Wardrobe', 'TV Stand', 'Shoe Rack', 'Storage Bench', 'Closet System', 'Pantry Cabinet'],
  beds:              ['Bed Frame', 'Headboard', 'Bunk Bed', 'Daybed', 'Crib', 'Toddler Bed', 'Murphy Bed', 'Platform Bed', 'Canopy Bed'],
  lighting:          ['Floor Lamp', 'Table Lamp', 'Desk Lamp', 'Pendant Light', 'Chandelier', 'Wall Sconce', 'Flush Mount', 'Semi-Flush Mount', 'String Lights', 'Under-Cabinet Light', 'Recessed Light', 'Smart Bulb'],
  flooring:          ['Hardwood', 'Laminate', 'Luxury Vinyl (LVP)', 'Ceramic Tile', 'Porcelain Tile', 'Natural Stone', 'Carpet (wall-to-wall)', 'Concrete', 'Cork', 'Bamboo'],
  'wall treatments': ['Wallpaper', 'Peel & Stick Wallpaper', 'Wall Mural', 'Stone Veneer', 'Brick Veneer', 'Wood Paneling', 'Shiplap', 'Beadboard', 'Wainscoting', 'Acoustic Panels', 'Wall Tile'],
  paint:             ['Interior Wall Paint', 'Ceiling Paint', 'Trim Paint', 'Cabinet Paint', 'Primer'],
  rugs:              ['Area Rug', 'Runner', 'Doormat', 'Outdoor Rug'],
  textiles:          ['Bedding Set', 'Duvet Cover', 'Comforter', 'Throw Pillow', 'Throw Blanket', 'Curtains', 'Drapes', 'Sheer Curtains', 'Blinds', 'Shades', 'Shutters', 'Table Linen', 'Towels'],
  decor:             ['Wall Art', 'Print / Poster', 'Mirror', 'Clock', 'Vase', 'Candle', 'Candle Holder', 'Sculpture', 'Figurine', 'Picture Frame', 'Artificial Plant', 'Planter', 'Bookends', 'Tray', 'Basket'],
  doors:             ['Interior Door', 'Barn Door', 'French Door', 'Bi-Fold Door', 'Pocket Door', 'Screen Door', 'Pet Door'],
  windows:           ['Window Frame', 'Skylight', 'Stained Glass Panel'],
  'trim & molding':  ['Baseboard', 'Crown Molding', 'Chair Rail', 'Door Casing', 'Window Casing', 'Quarter Round'],
  electronics:       ['Smart Speaker', 'Smart Display', 'Thermostat', 'Security Camera', 'Smart Plug', 'Smart Lock', 'Robot Vacuum'],
  outdoor:           ['Patio Chair', 'Patio Table', 'Patio Set', 'Planter', 'Garden Decor', 'Fire Pit', 'Grill', 'Outdoor Lighting', 'Hammock', 'Umbrella'],
}

const TEXTURE_TYPES = {
  flooring: ['wood', 'tile', 'carpet', 'concrete', 'marble'],
  'wall treatments': ['brick', 'shiplap', 'tile', 'flat'],
}

const SHEEN_LEVELS = ['flat', 'eggshell', 'satin', 'semiGloss', 'highGloss']

const SHEEN_LABELS = {
  flat: 'Flat / Matte', eggshell: 'Eggshell', satin: 'Satin', semiGloss: 'Semi-Gloss', highGloss: 'High-Gloss',
}

// Smart defaults — auto-fill when a subcategory is picked.
// Seller can always override. paintFinish = material sheen (maps to 3D roughness).
const SUBCATEGORY_DEFAULTS = {
  // ── Seating ──
  'Sofa':               { paintFinish: 'flat' },      // fabric = matte
  'Loveseat':           { paintFinish: 'flat' },
  'Armchair':           { paintFinish: 'flat' },
  'Accent Chair':       { paintFinish: 'eggshell' },
  'Recliner':           { paintFinish: 'flat' },
  'Bench':              { paintFinish: 'satin' },      // wood or upholstered
  'Stool':              { paintFinish: 'satin' },
  'Bar Stool':          { paintFinish: 'satin' },
  'Dining Chair':       { paintFinish: 'satin' },
  'Office Chair':       { paintFinish: 'eggshell' },
  'Bean Bag':           { paintFinish: 'flat' },
  'Ottoman':            { paintFinish: 'flat' },
  'Pouf':               { paintFinish: 'flat' },
  // ── Tables ──
  'Dining Table':       { paintFinish: 'satin' },
  'Coffee Table':       { paintFinish: 'satin' },
  'Side Table':         { paintFinish: 'satin' },
  'Console Table':      { paintFinish: 'satin' },
  'Desk':               { paintFinish: 'satin' },
  'Nightstand':         { paintFinish: 'satin' },
  'Bar Table':          { paintFinish: 'semiGloss' },
  'Vanity Table':       { paintFinish: 'highGloss' },  // vanities are typically glossy
  'Folding Table':      { paintFinish: 'eggshell' },
  // ── Storage ──
  'Dresser':            { paintFinish: 'satin' },
  'Bookshelf':          { paintFinish: 'satin' },
  'Shelving Unit':      { paintFinish: 'eggshell' },
  'Cabinet':            { paintFinish: 'satin' },
  'Credenza':           { paintFinish: 'satin' },
  'Sideboard':          { paintFinish: 'satin' },
  'Wardrobe':           { paintFinish: 'satin' },
  'TV Stand':           { paintFinish: 'satin' },
  'Shoe Rack':          { paintFinish: 'eggshell' },
  'Storage Bench':      { paintFinish: 'satin' },
  'Closet System':      { paintFinish: 'eggshell' },
  'Pantry Cabinet':     { paintFinish: 'satin' },
  // ── Beds ──
  'Bed Frame':          { paintFinish: 'satin' },
  'Headboard':          { paintFinish: 'flat' },       // usually upholstered
  'Bunk Bed':           { paintFinish: 'satin' },
  'Daybed':             { paintFinish: 'satin' },
  'Crib':               { paintFinish: 'semiGloss' },  // kid-safe, easy to wipe
  'Toddler Bed':        { paintFinish: 'semiGloss' },
  'Murphy Bed':         { paintFinish: 'satin' },
  'Platform Bed':       { paintFinish: 'satin' },
  'Canopy Bed':         { paintFinish: 'satin' },
  // ── Lighting ──
  'Floor Lamp':         { paintFinish: 'satin' },
  'Table Lamp':         { paintFinish: 'satin' },
  'Desk Lamp':          { paintFinish: 'satin' },
  'Pendant Light':      { paintFinish: 'semiGloss' },
  'Chandelier':         { paintFinish: 'highGloss' },
  'Wall Sconce':        { paintFinish: 'satin' },
  'Flush Mount':        { paintFinish: 'satin' },
  'Semi-Flush Mount':   { paintFinish: 'satin' },
  'String Lights':      { paintFinish: 'eggshell' },
  'Under-Cabinet Light':{ paintFinish: 'satin' },
  'Recessed Light':     { paintFinish: 'satin' },
  'Smart Bulb':         { paintFinish: 'semiGloss' },
  // ── Flooring ──
  'Hardwood':             { textureType: 'wood',     paintFinish: 'satin',     coverageSqft: '25' },
  'Laminate':             { textureType: 'wood',     paintFinish: 'satin',     coverageSqft: '25' },
  'Luxury Vinyl (LVP)':  { textureType: 'wood',     paintFinish: 'satin',     coverageSqft: '25' },
  'Ceramic Tile':         { textureType: 'tile',     paintFinish: 'satin',     coverageSqft: '15' },
  'Porcelain Tile':       { textureType: 'tile',     paintFinish: 'semiGloss', coverageSqft: '15' },
  'Natural Stone':        { textureType: 'marble',   paintFinish: 'satin',     coverageSqft: '10' },
  'Carpet (wall-to-wall)':{ textureType: 'carpet',  paintFinish: 'flat',      coverageSqft: '25' },
  'Concrete':             { textureType: 'concrete', paintFinish: 'satin',     coverageSqft: '25' },
  'Cork':                 { textureType: 'wood',     paintFinish: 'satin',     coverageSqft: '20' },
  'Bamboo':               { textureType: 'wood',     paintFinish: 'semiGloss', coverageSqft: '25' },
  // ── Wall treatments ──
  'Wallpaper':            { textureType: 'flat',     paintFinish: 'eggshell',  coverageSqft: '28' },
  'Peel & Stick Wallpaper':{ textureType: 'flat',    paintFinish: 'eggshell',  coverageSqft: '28' },
  'Wall Mural':           { textureType: 'flat',     paintFinish: 'eggshell',  coverageSqft: '' },
  'Stone Veneer':         { textureType: 'brick',    paintFinish: 'flat',      coverageSqft: '10' },
  'Brick Veneer':         { textureType: 'brick',    paintFinish: 'flat',      coverageSqft: '10' },
  'Wood Paneling':        { textureType: 'shiplap',  paintFinish: 'satin',     coverageSqft: '' },
  'Shiplap':              { textureType: 'shiplap',  paintFinish: 'satin',     coverageSqft: '' },
  'Beadboard':            { textureType: 'shiplap',  paintFinish: 'semiGloss', coverageSqft: '' },
  'Wainscoting':          { textureType: 'shiplap',  paintFinish: 'semiGloss', coverageSqft: '' },
  'Acoustic Panels':      { textureType: 'flat',     paintFinish: 'flat',      coverageSqft: '' },
  'Wall Tile':            { textureType: 'tile',     paintFinish: 'semiGloss', coverageSqft: '10' },
  // ── Paint ──
  'Interior Wall Paint':  { textureType: 'flat',     paintFinish: 'eggshell',  coverageSqft: '400' },
  'Ceiling Paint':        { textureType: 'flat',     paintFinish: 'flat',      coverageSqft: '400' },
  'Trim Paint':           { textureType: 'flat',     paintFinish: 'semiGloss', coverageSqft: '200' },
  'Cabinet Paint':        { textureType: 'flat',     paintFinish: 'semiGloss', coverageSqft: '200' },
  'Primer':               { textureType: 'flat',     paintFinish: 'flat',      coverageSqft: '400' },
  // ── Rugs ──
  'Area Rug':             { paintFinish: 'flat' },
  'Runner':               { paintFinish: 'flat' },
  'Doormat':              { paintFinish: 'flat' },
  'Outdoor Rug':          { paintFinish: 'flat' },
  // ── Textiles ──
  'Bedding Set':          { paintFinish: 'eggshell' },
  'Duvet Cover':          { paintFinish: 'eggshell' },
  'Comforter':            { paintFinish: 'flat' },
  'Throw Pillow':         { paintFinish: 'flat' },
  'Throw Blanket':        { paintFinish: 'flat' },
  'Curtains':             { paintFinish: 'flat' },
  'Drapes':               { paintFinish: 'eggshell' },
  'Sheer Curtains':       { paintFinish: 'eggshell' },
  'Blinds':               { paintFinish: 'satin' },
  'Shades':               { paintFinish: 'flat' },
  'Shutters':             { paintFinish: 'semiGloss' },
  'Table Linen':          { paintFinish: 'flat' },
  'Towels':               { paintFinish: 'flat' },
  // ── Decor ──
  'Wall Art':             { paintFinish: 'eggshell' },
  'Print / Poster':       { paintFinish: 'eggshell' },
  'Mirror':               { paintFinish: 'highGloss' },
  'Clock':                { paintFinish: 'satin' },
  'Vase':                 { paintFinish: 'semiGloss' },
  'Candle':               { paintFinish: 'eggshell' },
  'Candle Holder':        { paintFinish: 'satin' },
  'Sculpture':            { paintFinish: 'satin' },
  'Figurine':             { paintFinish: 'semiGloss' },
  'Picture Frame':        { paintFinish: 'satin' },
  'Artificial Plant':     { paintFinish: 'flat' },
  'Planter':              { paintFinish: 'satin' },
  'Bookends':             { paintFinish: 'satin' },
  'Tray':                 { paintFinish: 'semiGloss' },
  'Basket':               { paintFinish: 'flat' },
  // ── Doors ──
  'Interior Door':        { paintFinish: 'semiGloss' },
  'Barn Door':            { paintFinish: 'satin' },
  'French Door':          { paintFinish: 'semiGloss' },
  'Bi-Fold Door':         { paintFinish: 'satin' },
  'Pocket Door':          { paintFinish: 'satin' },
  'Screen Door':          { paintFinish: 'eggshell' },
  'Pet Door':             { paintFinish: 'eggshell' },
  // ── Windows ──
  'Window Frame':         { paintFinish: 'semiGloss' },
  'Skylight':             { paintFinish: 'semiGloss' },
  'Stained Glass Panel':  { paintFinish: 'highGloss' },
  // ── Trim ──
  'Baseboard':            { paintFinish: 'semiGloss' },
  'Crown Molding':        { paintFinish: 'semiGloss' },
  'Chair Rail':           { paintFinish: 'semiGloss' },
  'Door Casing':          { paintFinish: 'semiGloss' },
  'Window Casing':        { paintFinish: 'semiGloss' },
  'Quarter Round':        { paintFinish: 'semiGloss' },
  // ── Electronics ──
  'Smart Speaker':        { paintFinish: 'eggshell' },
  'Smart Display':        { paintFinish: 'semiGloss' },
  'Thermostat':           { paintFinish: 'satin' },
  'Security Camera':      { paintFinish: 'satin' },
  'Smart Plug':           { paintFinish: 'eggshell' },
  'Smart Lock':           { paintFinish: 'satin' },
  'Robot Vacuum':         { paintFinish: 'satin' },
  // ── Outdoor ──
  'Patio Chair':          { paintFinish: 'eggshell' },
  'Patio Table':          { paintFinish: 'eggshell' },
  'Patio Set':            { paintFinish: 'eggshell' },
  'Garden Decor':         { paintFinish: 'flat' },
  'Fire Pit':             { paintFinish: 'flat' },
  'Grill':                { paintFinish: 'satin' },
  'Outdoor Lighting':     { paintFinish: 'satin' },
  'Hammock':              { paintFinish: 'flat' },
  'Umbrella':             { paintFinish: 'flat' },
}
const HANDMADE_OPTS = [
  { value: 'handmade',     label: 'Handmade',     desc: 'Made by hand, one at a time' },
  { value: 'manufactured', label: 'Manufactured',  desc: 'Produced in a factory or at scale' },
  { value: 'exclusive',    label: 'Exclusive',     desc: 'Limited run or designer collaboration' },
]

export default function Step1Identity({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  const matRef = useRef(null)

  function addMaterial() {
    const val = matRef.current?.value?.trim()
    if (!val) return
    if (!form.materials.includes(val)) update({ materials: [...form.materials, val] })
    matRef.current.value = ''
  }

  function toggleMaterial(e) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    addMaterial()
  }

  function removeMaterial(m) {
    update({ materials: form.materials.filter(x => x !== m) })
  }

  return (
    <Card t={t}>
      <h3 style={s.sectionTitle}>Product Identity</h3>

      <Row>
        <Field t={t} label="Product name *">
          <input style={s.input} value={form.label}
            onChange={e => update({ label: e.target.value })}
            placeholder="e.g. Luxe Velvet Sofa" />
        </Field>
        <Field t={t} label="Brand">
          <input style={s.input} value={form.brand}
            onChange={e => update({ brand: e.target.value })}
            placeholder="e.g. Studio Nord" />
        </Field>
      </Row>

      <Row>
        <Field t={t} label="Category">
          <select style={s.input} value={form.category} onChange={e => {
            const cat = e.target.value
            update({ category: cat, subcategory: '', textureType: '', paintFinish: '', coverageSqft: '' })
          }}>
            <option value="">Select…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
        </Field>
        {SUBCATEGORIES[form.category] && (
          <Field t={t} label="Subcategory">
            <select style={s.input} value={form.subcategory || ''} onChange={e => {
              const sc = e.target.value
              const defaults = SUBCATEGORY_DEFAULTS[sc]
              if (defaults) {
                update({ subcategory: sc, ...defaults })
              } else {
                update({ subcategory: sc })
              }
            }}>
              <option value="">Select…</option>
              {SUBCATEGORIES[form.category].map(sc => <option key={sc} value={sc}>{sc}</option>)}
            </select>
          </Field>
        )}
      </Row>

      {form.category && SUBCATEGORIES[form.category] && (
        <Field t={t} label="Make / Model (optional)">
          <input style={s.input} value={form.makeModel}
            onChange={e => update({ makeModel: e.target.value })}
            placeholder="e.g. Ikea KLIPPAN 2024" />
        </Field>
      )}

      {/* Surface-specific fields — show for flooring, wall treatments, paint */}
      {(form.category === 'flooring' || form.category === 'wall treatments') && TEXTURE_TYPES[form.category] && (
        <Field t={t} label="How should this look in the 3D room builder?">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {TEXTURE_TYPES[form.category].map(tt => (
              <label key={tt} style={{
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                border: `1px solid ${form.textureType === tt ? t.accent : t.surfaceBorder}`,
                background: form.textureType === tt ? `${t.accent}18` : t.surface,
                color: form.textureType === tt ? t.accent : t.text, fontWeight: form.textureType === tt ? 600 : 400,
              }}>
                <input type="radio" name="textureType" value={tt}
                  checked={form.textureType === tt}
                  onChange={() => update({ textureType: tt })}
                  style={{ display: 'none' }} />
                {tt.charAt(0).toUpperCase() + tt.slice(1)}
              </label>
            ))}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: t.textSoft }}>
            This determines the pattern shown on floors/walls when customers preview your product in the builder.
          </p>
        </Field>
      )}

      {form.subcategory && (
        <Field t={t} label="Material sheen">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {SHEEN_LEVELS.map(f => (
              <label key={f} style={{
                padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                border: `1px solid ${form.paintFinish === f ? t.accent : t.surfaceBorder}`,
                background: form.paintFinish === f ? `${t.accent}18` : t.surface,
                color: form.paintFinish === f ? t.accent : t.text, fontWeight: form.paintFinish === f ? 600 : 400,
              }}>
                <input type="radio" name="paintFinish" value={f}
                  checked={form.paintFinish === f}
                  onChange={() => update({ paintFinish: f })}
                  style={{ display: 'none' }} />
                {SHEEN_LABELS[f]}
              </label>
            ))}
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 11, color: t.textSoft }}>
            {form.paintFinish === 'flat' ? 'No sheen — fabric, matte wood, unfinished surfaces. Hides imperfections.' :
             form.paintFinish === 'eggshell' ? 'Slight sheen — most upholstery, light-touch surfaces. Easy to clean.' :
             form.paintFinish === 'satin' ? 'Soft luster — finished wood, sealed stone, most furniture. Durable.' :
             form.paintFinish === 'semiGloss' ? 'Noticeable shine — lacquered wood, glazed ceramic, polished metal.' :
             form.paintFinish === 'highGloss' ? 'Mirror-like — high-gloss lacquer, polished chrome, glass surfaces.' :
             'How shiny does this product look? This affects how light bounces off it in the 3D room builder.'}
          </p>
        </Field>
      )}

      {(form.category === 'flooring' || form.category === 'wall treatments' || form.category === 'paint') && (
        <Field t={t} label={form.category === 'paint' ? 'Coverage per gallon (sq ft)' : 'Coverage per unit (sq ft)'}>
          <input style={s.input} type="number" min="0" step="1"
            value={form.coverageSqft || ''}
            onChange={e => update({ coverageSqft: e.target.value })}
            placeholder={form.category === 'paint' ? 'e.g. 400' : 'e.g. 25'} />
          <p style={{ margin: '4px 0 0', fontSize: 11, color: t.textSoft }}>
            {form.category === 'paint'
              ? 'How many sq ft does one gallon cover? Helps buyers know how much to order.'
              : 'How many sq ft does one box/roll cover? Helps buyers calculate quantity needed.'}
          </p>
        </Field>
      )}

      <Field t={t} label="Type declaration">
        <div style={{ display: 'flex', gap: 10 }}>
          {HANDMADE_OPTS.map(opt => (
            <label key={opt.value} style={{
              flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px',
              border: `1px solid ${form.handmadeType === opt.value ? t.accent : t.surfaceBorder}`,
              borderRadius: 10, cursor: 'pointer',
              background: form.handmadeType === opt.value ? `${t.accent}18` : t.surface,
            }}>
              <input type="radio" name="handmadeType" value={opt.value}
                checked={form.handmadeType === opt.value}
                onChange={() => update({ handmadeType: opt.value })}
                style={{ display: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: form.handmadeType === opt.value ? t.accent : t.text }}>
                {opt.label}
              </span>
              <span style={{ fontSize: 11, color: t.textSoft }}>{opt.desc}</span>
            </label>
          ))}
        </div>
      </Field>

      <Field t={t} label={`Short description (${form.shortDesc.length}/150)`}>
        <textarea style={{ ...s.input, height: 60, resize: 'vertical' }}
          value={form.shortDesc} maxLength={150}
          onChange={e => update({ shortDesc: e.target.value })}
          placeholder="One sentence that sells this product…" />
      </Field>

      <Field t={t} label="Full description">
        <textarea style={{ ...s.input, height: 100, resize: 'vertical' }}
          value={form.fullDesc}
          onChange={e => update({ fullDesc: e.target.value })}
          placeholder="Materials, style, dimensions, what makes it special…" />
      </Field>

      <Field t={t} label="Materials">
        <div style={{ display: 'flex', gap: 6 }}>
          <input ref={matRef} style={{ ...s.input, flex: 1 }} placeholder="e.g. Solid oak"
            onKeyDown={toggleMaterial} />
          <button type="button" onClick={addMaterial} style={s.addBtn}>+ Add</button>
        </div>
        {form.materials.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
            {form.materials.map(m => (
              <span key={m} style={s.chip}>
                {m}
                <button style={s.chipX} onClick={() => removeMaterial(m)}>×</button>
              </span>
            ))}
          </div>
        )}
      </Field>

      <Field t={t} label="Guarantee / warranty">
        <input style={s.input} value={form.guarantee}
          onChange={e => update({ guarantee: e.target.value })}
          placeholder="e.g. 10-year frame · 2-year fabric" />
      </Field>
    </Card>
  )
}

export function Card({ t, children }) {
  return (
    <div style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  )
}
export function Field({ label, children, t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</label>
      {children}
    </div>
  )
}
export function Row({ children }) {
  return <div className="ddd-form-row" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>{children}</div>
}

function styles(t) {
  return {
    sectionTitle: { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    input: { padding: '9px 11px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    chip: { display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: `${t.accent}18`, border: `1px solid ${t.accent}44`, borderRadius: 20, fontSize: 12, color: t.accent },
    chipX: { background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1 },
    addBtn: { padding: '9px 14px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' },
  }
}
