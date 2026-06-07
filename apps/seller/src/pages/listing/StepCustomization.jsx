import { useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { Card, Field, Row } from './Step1Identity'

const BADGE_TYPES = [
  { value: 'customized', label: 'Customized', desc: 'Customer makes small tweaks — different size, color, material. Adds to cart directly.' },
  { value: 'custom',     label: 'Custom',     desc: 'Fully bespoke — customer submits a spec, you review and approve before they buy.' },
  { value: 'both',       label: 'Both',       desc: 'Offer both small tweaks and fully custom options.' },
]

const FULFILLMENT_TYPES = [
  { value: 'ships_finished', label: 'Ships finished',  desc: 'You build it and ship the completed product.' },
  { value: 'diy_kit',        label: 'DIY kit',         desc: 'You ship parts + instructions. Customer assembles.' },
  { value: 'local_pickup',   label: 'Local pickup',    desc: 'Customer picks up the finished item from your location.' },
  { value: 'local_builder',  label: 'Local builder',   desc: 'Requires local assembly. Platform can match with builders (future).' },
]

const OPTION_TYPES = [
  { value: 'dimension', label: 'Dimension',  desc: 'Width, height, depth — with min/max range', input: 'range' },
  { value: 'material',  label: 'Material',   desc: 'Wood type, fabric, finish — dropdown with price adjustments', input: 'dropdown' },
  { value: 'color',     label: 'Color',      desc: 'Color picker or preset palette', input: 'color' },
  { value: 'number',    label: 'Quantity',   desc: 'Number of shelves, doors, drawers — with min/max', input: 'number' },
  { value: 'feature',   label: 'Feature',    desc: 'Add-on options — handles, legs, hardware style', input: 'dropdown' },
  { value: 'text',      label: 'Note',       desc: 'Freeform text — special instructions, engravings', input: 'text' },
  { value: 'photo',     label: 'Photo',      desc: 'Customer uploads reference photos', input: 'photo' },
]

const BLANK_OPTION = {
  option_type: 'dimension', label: '', input_type: 'range', required: true,
  config: { min: '', max: '', unit: 'inches', step: 1, pricePerUnit: '' },
}

function configForType(type) {
  switch (type) {
    case 'dimension': return { min: '', max: '', unit: 'inches', step: 1, pricePerUnit: '' }
    case 'material':
    case 'feature':   return { choices: [{ label: '', priceAdj: '' }] }
    case 'color':     return { choices: [{ label: '', hex: '#888888', priceAdj: '' }] }
    case 'number':    return { min: 1, max: 10, pricePerUnit: '' }
    case 'text':      return { maxLength: 500, placeholder: '' }
    case 'photo':     return { maxFiles: 3 }
    default:          return {}
  }
}

function inputForType(type) {
  const map = { dimension: 'range', material: 'dropdown', color: 'color', number: 'number', feature: 'dropdown', text: 'text', photo: 'photo' }
  return map[type] || 'text'
}

export default function StepCustomization({ form, update }) {
  const t = useTheme()
  const s = styles(t)

  if (!form.isCustomizable) {
    return (
      <Card t={t}>
        <h3 style={s.title}>Customization</h3>
        <p style={s.hint}>Allow customers to configure this product to their needs.</p>
        <button style={s.enableBtn} onClick={() => update({ isCustomizable: true })}>
          Enable customization for this product
        </button>
      </Card>
    )
  }

  const options = form.customizationOptions || []

  function setOption(i, patch) {
    const next = options.map((opt, idx) => idx === i ? { ...opt, ...patch } : opt)
    update({ customizationOptions: next })
  }

  function setConfig(i, patch) {
    const opt = options[i]
    setOption(i, { config: { ...opt.config, ...patch } })
  }

  function changeType(i, newType) {
    setOption(i, {
      option_type: newType,
      input_type: inputForType(newType),
      config: configForType(newType),
    })
  }

  function addOption() {
    update({ customizationOptions: [...options, { ...BLANK_OPTION, config: { ...BLANK_OPTION.config } }] })
  }

  function removeOption(i) {
    update({ customizationOptions: options.filter((_, idx) => idx !== i) })
  }

  function addChoice(optIdx) {
    const opt = options[optIdx]
    const choices = [...(opt.config.choices || []), { label: '', priceAdj: '', hex: '#888888' }]
    setConfig(optIdx, { choices })
  }

  function setChoice(optIdx, choiceIdx, patch) {
    const opt = options[optIdx]
    const choices = opt.config.choices.map((c, ci) => ci === choiceIdx ? { ...c, ...patch } : c)
    setConfig(optIdx, { choices })
  }

  function removeChoice(optIdx, choiceIdx) {
    const opt = options[optIdx]
    setConfig(optIdx, { choices: opt.config.choices.filter((_, ci) => ci !== choiceIdx) })
  }

  return (
    <Card t={t}>
      <h3 style={s.title}>Customization</h3>
      <button style={s.disableBtn} onClick={() => update({ isCustomizable: false, customizationOptions: [] })}>
        Disable customization
      </button>

      {/* Badge type */}
      <Field t={t} label="Customization type">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BADGE_TYPES.map(bt => (
            <label key={bt.value} style={{
              flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px',
              border: `1px solid ${form.customizationType === bt.value ? t.accent : t.surfaceBorder}`,
              borderRadius: 10, cursor: 'pointer',
              background: form.customizationType === bt.value ? `${t.accent}18` : t.surface,
            }}>
              <input type="radio" name="customizationType" value={bt.value}
                checked={form.customizationType === bt.value}
                onChange={() => update({ customizationType: bt.value })}
                style={{ display: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: form.customizationType === bt.value ? t.accent : t.text }}>{bt.label}</span>
              <span style={{ fontSize: 11, color: t.textSoft }}>{bt.desc}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Fulfillment */}
      <Field t={t} label="How do you fulfill custom orders?">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FULFILLMENT_TYPES.map(ft => (
            <label key={ft.value} style={{
              flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', gap: 4, padding: '10px 12px',
              border: `1px solid ${form.fulfillmentMethod === ft.value ? t.accent : t.surfaceBorder}`,
              borderRadius: 10, cursor: 'pointer',
              background: form.fulfillmentMethod === ft.value ? `${t.accent}18` : t.surface,
            }}>
              <input type="radio" name="fulfillmentMethod" value={ft.value}
                checked={form.fulfillmentMethod === ft.value}
                onChange={() => update({ fulfillmentMethod: ft.value })}
                style={{ display: 'none' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: form.fulfillmentMethod === ft.value ? t.accent : t.text }}>{ft.label}</span>
              <span style={{ fontSize: 11, color: t.textSoft }}>{ft.desc}</span>
            </label>
          ))}
        </div>
      </Field>

      {/* Options */}
      <Field t={t} label="What can customers customize?">
        {options.map((opt, i) => (
          <div key={i} style={s.optionCard}>
            <div style={s.optionHeader}>
              <select style={s.typeSelect} value={opt.option_type} onChange={e => changeType(i, e.target.value)}>
                {OPTION_TYPES.map(ot => <option key={ot.value} value={ot.value}>{ot.label}</option>)}
              </select>
              <input style={{ ...s.input, flex: 1 }} value={opt.label}
                onChange={e => setOption(i, { label: e.target.value })}
                placeholder="Label (e.g. Width, Wood type, Number of doors)" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.textSoft, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={opt.required} onChange={e => setOption(i, { required: e.target.checked })} style={{ accentColor: t.accent }} />
                Required
              </label>
              <button style={s.removeBtn} onClick={() => removeOption(i)}>✕</button>
            </div>

            {/* Range config (dimensions) */}
            {opt.input_type === 'range' && (
              <div style={s.configRow}>
                <Field t={t} label="Min">
                  <input style={s.smallInput} type="number" value={opt.config.min ?? ''}
                    onChange={e => setConfig(i, { min: e.target.value })} placeholder="0" />
                </Field>
                <Field t={t} label="Max">
                  <input style={s.smallInput} type="number" value={opt.config.max ?? ''}
                    onChange={e => setConfig(i, { max: e.target.value })} placeholder="100" />
                </Field>
                <Field t={t} label="Unit">
                  <select style={s.smallInput} value={opt.config.unit ?? 'inches'}
                    onChange={e => setConfig(i, { unit: e.target.value })}>
                    <option value="inches">inches</option>
                    <option value="feet">feet</option>
                    <option value="cm">cm</option>
                  </select>
                </Field>
                <Field t={t} label="$ per unit">
                  <input style={s.smallInput} type="number" step="0.01" value={opt.config.pricePerUnit ?? ''}
                    onChange={e => setConfig(i, { pricePerUnit: e.target.value })} placeholder="0.00" />
                </Field>
              </div>
            )}

            {/* Number config */}
            {opt.input_type === 'number' && (
              <div style={s.configRow}>
                <Field t={t} label="Min">
                  <input style={s.smallInput} type="number" value={opt.config.min ?? ''}
                    onChange={e => setConfig(i, { min: e.target.value })} placeholder="1" />
                </Field>
                <Field t={t} label="Max">
                  <input style={s.smallInput} type="number" value={opt.config.max ?? ''}
                    onChange={e => setConfig(i, { max: e.target.value })} placeholder="10" />
                </Field>
                <Field t={t} label="$ per unit">
                  <input style={s.smallInput} type="number" step="0.01" value={opt.config.pricePerUnit ?? ''}
                    onChange={e => setConfig(i, { pricePerUnit: e.target.value })} placeholder="0.00" />
                </Field>
              </div>
            )}

            {/* Dropdown config (materials, features) */}
            {opt.input_type === 'dropdown' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(opt.config.choices || []).map((c, ci) => (
                  <div key={ci} style={s.choiceRow}>
                    <input style={{ ...s.input, flex: 1 }} value={c.label}
                      onChange={e => setChoice(i, ci, { label: e.target.value })}
                      placeholder="Option name (e.g. Walnut, Brass)" />
                    <input style={s.smallInput} type="number" step="0.01" value={c.priceAdj ?? ''}
                      onChange={e => setChoice(i, ci, { priceAdj: e.target.value })}
                      placeholder="+/- $" />
                    <button style={s.choiceRemove} onClick={() => removeChoice(i, ci)}>✕</button>
                  </div>
                ))}
                <button style={s.addChoiceBtn} onClick={() => addChoice(i)}>+ Add choice</button>
              </div>
            )}

            {/* Color config */}
            {opt.input_type === 'color' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(opt.config.choices || []).map((c, ci) => (
                  <div key={ci} style={s.choiceRow}>
                    <input type="color" value={c.hex || '#888888'}
                      onChange={e => setChoice(i, ci, { hex: e.target.value })}
                      style={{ width: 32, height: 32, border: `1px solid ${t.surfaceBorder}`, borderRadius: 6, padding: 2, cursor: 'pointer' }} />
                    <input style={{ ...s.input, flex: 1 }} value={c.label}
                      onChange={e => setChoice(i, ci, { label: e.target.value })}
                      placeholder="Color name" />
                    <input style={s.smallInput} type="number" step="0.01" value={c.priceAdj ?? ''}
                      onChange={e => setChoice(i, ci, { priceAdj: e.target.value })}
                      placeholder="+/- $" />
                    <button style={s.choiceRemove} onClick={() => removeChoice(i, ci)}>✕</button>
                  </div>
                ))}
                <button style={s.addChoiceBtn} onClick={() => addChoice(i)}>+ Add color</button>
              </div>
            )}

            {/* Text config */}
            {opt.input_type === 'text' && (
              <div style={s.configRow}>
                <Field t={t} label="Max characters">
                  <input style={s.smallInput} type="number" value={opt.config.maxLength ?? 500}
                    onChange={e => setConfig(i, { maxLength: Number(e.target.value) })} />
                </Field>
                <Field t={t} label="Placeholder text">
                  <input style={{ ...s.input, flex: 1 }} value={opt.config.placeholder ?? ''}
                    onChange={e => setConfig(i, { placeholder: e.target.value })}
                    placeholder="e.g. Describe what you'd like..." />
                </Field>
              </div>
            )}

            {/* Photo config */}
            {opt.input_type === 'photo' && (
              <div style={s.configRow}>
                <Field t={t} label="Max photos">
                  <input style={s.smallInput} type="number" min="1" max="10" value={opt.config.maxFiles ?? 3}
                    onChange={e => setConfig(i, { maxFiles: Number(e.target.value) })} />
                </Field>
              </div>
            )}
          </div>
        ))}

        <button style={s.addOptionBtn} onClick={addOption}>+ Add customization option</button>
      </Field>

      <p style={s.note}>
        Soft limits: customers see your min/max as guidelines. They can request outside the range — you'll review before accepting.
      </p>
    </Card>
  )
}

function styles(t) {
  return {
    title:       { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:        { fontSize: 13, color: t.textSoft, margin: 0, lineHeight: 1.5 },
    note:        { fontSize: 11, color: t.textSoft, margin: 0 },
    input:       { padding: '8px 10px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box' },
    smallInput:  { padding: '8px 10px', background: t.bg || '#f7faf4', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 13, outline: 'none', width: 80, boxSizing: 'border-box' },
    enableBtn:   { padding: '12px 20px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
    disableBtn:  { alignSelf: 'flex-end', padding: '5px 12px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.textSoft, fontSize: 11, cursor: 'pointer' },
    optionCard:  { padding: '12px', background: `${t.accent}06`, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 },
    optionHeader:{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
    typeSelect:  { padding: '8px 10px', background: t.bg, border: `1px solid ${t.surfaceBorder}`, borderRadius: 7, color: t.text, fontSize: 12, outline: 'none', cursor: 'pointer' },
    configRow:   { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' },
    choiceRow:   { display: 'flex', gap: 6, alignItems: 'center' },
    choiceRemove:{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#c06060', fontSize: 14, cursor: 'pointer' },
    addChoiceBtn:{ alignSelf: 'flex-start', padding: '5px 12px', background: 'transparent', border: `1px dashed ${t.surfaceBorder}`, borderRadius: 7, color: t.textSoft, fontSize: 11, cursor: 'pointer' },
    addOptionBtn:{ padding: '10px 18px', background: 'transparent', border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, cursor: 'pointer', marginTop: 4 },
    removeBtn:   { padding: '5px 8px', background: 'transparent', border: '1px solid rgba(220,140,140,0.4)', borderRadius: 6, color: '#c06060', fontSize: 12, cursor: 'pointer', flexShrink: 0 },
  }
}
