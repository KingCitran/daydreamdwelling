import { useTheme } from '@shared/ThemeProvider'
import { Card } from './Step1Identity'

export default function Step7Preview({ form, update, onSave, saving, error, isEdit }) {
  const t = useTheme()
  const s = styles(t)

  const primaryPhoto = form.photos[0]?.url

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card t={t}>
        <h3 style={s.title}>Preview &amp; Publish</h3>
        <p style={s.hint}>Review your listing before publishing. You can go back to edit any step.</p>

        {/* Photo + name */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 100, height: 100, borderRadius: 12, flexShrink: 0, overflow: 'hidden', border: `1px solid ${t.surfaceBorder}`, background: `${t.accent}18` }}>
            {primaryPhoto
              ? <img src={primaryPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textSoft, fontSize: 28 }}>📷</div>}
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: t.text, margin: '0 0 4px' }}>
              {form.label || <span style={{ color: t.textSoft }}>No name entered</span>}
            </p>
            {form.brand && <p style={{ fontSize: 13, color: t.textSoft, margin: '0 0 4px' }}>{form.brand}</p>}
            {form.category && <p style={{ fontSize: 12, color: t.accent, margin: 0, textTransform: 'capitalize' }}>{form.category}</p>}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: `1px solid ${t.surfaceBorder}` }} />

        <PreviewRow label="Type" value={capitalize(form.handmadeType)} t={t} />
        {form.makeModel   && <PreviewRow label="Make / Model"     value={form.makeModel}   t={t} />}
        {form.shortDesc   && <PreviewRow label="Short description" value={form.shortDesc}   t={t} />}
        {form.guarantee   && <PreviewRow label="Guarantee"        value={form.guarantee}   t={t} />}

        {form.materials.length > 0 && (
          <PreviewRow label="Materials" value={form.materials.join(', ')} t={t} />
        )}

        <PreviewRow label="Photos" value={`${form.photos.length} photo${form.photos.length !== 1 ? 's' : ''}${form.photos.length < 4 ? ' ⚠️ (4 minimum)' : ''}`} t={t} />

        {/* Sizes */}
        {form.sizes.filter(s => s.label && s.price).length > 0 && (
          <div>
            <p style={s.label}>Sizes</p>
            {form.sizes.filter(s => s.label && s.price).map((s, i) => (
              <p key={i} style={s2.row}>
                <span style={{ color: t.text }}>{s.label}</span>
                <span style={{ color: t.accent, fontWeight: 600 }}>${Number(s.price).toLocaleString()}</span>
              </p>
            ))}
          </div>
        )}

        {/* Swatches */}
        {form.swatches.filter(sw => sw.name).length > 0 && (
          <div>
            <p style={s.label}>Colors</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {form.swatches.filter(sw => sw.name).map((sw, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: 50, background: sw.hex, border: `1px solid ${t.surfaceBorder}` }} />
                  <span style={{ fontSize: 12, color: t.textSoft }}>{sw.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {form.typeKey && <PreviewRow label="Room builder link" value={form.typeKey} t={t} />}
        {form.styleTags.length > 0 && <PreviewRow label="Style tags" value={form.styleTags.join(', ')} t={t} />}
        {form.roomTags.length  > 0 && <PreviewRow label="Room tags"  value={form.roomTags.join(', ')}  t={t} />}
        {form.themeTags.length > 0 && <PreviewRow label="Theme tags" value={form.themeTags.join(', ')} t={t} />}

        {/* Shipping */}
        <PreviewRow label="Shipping" value={form.shippingType === 'flat'
          ? `Flat rate: $${form.flatRate || '0'}`
          : 'Calculated (coming soon)'} t={t} />
        {form.wattage && <PreviewRow label="Wattage" value={`${form.wattage}W`} t={t} />}
        {form.kelvin  && <PreviewRow label="Color temp" value={`${form.kelvin}K`} t={t} />}
      </Card>

      <Card t={t}>
        <h3 style={s.title}>Visibility</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.active}
            onChange={e => update({ active: e.target.checked })}
            style={{ accentColor: t.accent, width: 16, height: 16 }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: t.text, margin: 0 }}>
              {form.active ? 'Active — visible to shoppers immediately' : 'Draft — hidden from shoppers'}
            </p>
            <p style={{ fontSize: 11, color: t.textSoft, margin: 0 }}>
              You can change this at any time from your Products page.
            </p>
          </div>
        </label>
      </Card>

      {error && (
        <p style={{ fontSize: 12, color: '#c05050', background: 'rgba(220,100,100,0.08)', border: '1px solid rgba(220,100,100,0.25)', borderRadius: 8, padding: '10px 14px' }}>
          {error}
        </p>
      )}

      <button
        style={{ padding: '15px 0', background: t.accent, color: t.accentText, border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Publishing…' : isEdit ? 'Save changes →' : 'Publish listing →'}
      </button>
    </div>
  )
}

function PreviewRow({ label, value, t }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: t.textSoft, minWidth: 130, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</span>
      <span style={{ fontSize: 13, color: t.text }}>{value}</span>
    </div>
  )
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''
}

const s2 = {
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 13, margin: '2px 0' },
}

function styles(t) {
  return {
    title: { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:  { fontSize: 13, color: t.textSoft, margin: 0 },
    label: { fontSize: 11, fontWeight: 600, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 6px' },
  }
}
