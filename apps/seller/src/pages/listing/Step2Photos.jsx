import { useRef, useState } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { Card, Field } from './Step1Identity'

const ANGLE_GUIDE = [
  { label: 'Front', desc: 'Straight on, eye-level', icon: '1' },
  { label: 'Left',  desc: 'Rotate 90° left',       icon: '2' },
  { label: 'Back',  desc: 'Straight on from behind',icon: '3' },
  { label: 'Right', desc: 'Rotate 90° right',       icon: '4' },
]

export default function Step2Photos({ form, update }) {
  const t      = useTheme()
  const fileRef = useRef(null)
  const camRef  = useRef(null)
  const s       = styles(t)
  const [guideOpen, setGuideOpen] = useState(false)

  function handleFiles(e) {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.map(file => ({
      file, url: URL.createObjectURL(file), storagePath: null, isPrimary: false,
    }))
    update({ photos: [...form.photos, ...newPhotos] })
    e.target.value = ''
  }

  function remove(i) {
    const next = form.photos.filter((_, idx) => idx !== i)
    update({ photos: next })
  }

  function move(i, dir) {
    const next = [...form.photos]
    const swap = i + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[i], next[swap]] = [next[swap], next[i]]
    update({ photos: next })
  }

  const count   = form.photos.length
  const need    = Math.max(0, 4 - count)

  return (
    <Card t={t}>
      <h3 style={s.title}>Photos</h3>
      <p style={s.hint}>
        Upload at least 4 photos — front, left, back, right — for best 3D results.
        {need > 0 && <span style={{ color: '#e07a30' }}> {need} more needed.</span>}
      </p>

      {/* Photo angle guide */}
      <button
        type="button"
        onClick={() => setGuideOpen(!guideOpen)}
        style={s.guideToggle}
      >
        {guideOpen ? '▾' : '▸'} How to photograph your product
      </button>
      {guideOpen && (
        <div style={s.guidePanel}>
          <p style={s.guideIntro}>
            Place your product on a clean, well-lit surface. Take 4 photos from these angles, in order:
          </p>
          <div style={s.guideGrid}>
            {ANGLE_GUIDE.map((a, i) => {
              const hasPhoto = form.photos[i]
              return (
                <div key={a.label} style={{ ...s.guideCard, border: hasPhoto ? `2px solid ${t.accent}` : `2px dashed ${t.surfaceBorder}` }}>
                  <div style={s.guideNumber}>{a.icon}</div>
                  <div style={s.guideLabel}>{a.label}</div>
                  <div style={s.guideDesc}>{a.desc}</div>
                  {hasPhoto && <div style={{ fontSize: 10, color: t.accent, fontWeight: 600, marginTop: 4 }}>Added</div>}
                </div>
              )
            })}
          </div>
          <p style={s.guideTips}>
            Tips: Use natural light, avoid harsh shadows, keep the same distance for all 4 shots, and make sure the whole product is visible in frame.
          </p>
        </div>
      )}

      <div style={s.grid}>
        {form.photos.map((photo, i) => (
          <div key={i} style={{ ...s.tile, outline: i === 0 ? `2px solid ${t.accent}` : 'none' }}>
            <img src={photo.url} alt="" style={s.img} />
            {i < 4 && <span style={s.angleBadge}>{ANGLE_GUIDE[i]?.label}</span>}
            {i === 0 && <span style={s.primaryBadge}>Primary</span>}
            <div style={s.tileActions}>
              <button style={s.tileBtn} onClick={() => move(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button style={s.tileBtn} onClick={() => move(i, 1)} disabled={i === form.photos.length - 1} title="Move down">↓</button>
              <button style={{ ...s.tileBtn, color: '#d06060' }} onClick={() => remove(i)} title="Remove">✕</button>
            </div>
          </div>
        ))}

        <button style={s.addTile} onClick={() => fileRef.current?.click()}>
          <span style={{ fontSize: 28, color: t.textSoft }}>+</span>
          <span style={{ fontSize: 12, color: t.textSoft }}>Gallery</span>
        </button>

        <button style={s.addTile} onClick={() => camRef.current?.click()}>
          <span style={{ fontSize: 28, color: t.textSoft }}>📷</span>
          <span style={{ fontSize: 12, color: t.textSoft }}>Camera</span>
        </button>
      </div>

      {/* Gallery picker (multiple) */}
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      {/* Camera capture (single shot) */}
      <input ref={camRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFiles} />

      {count >= 4 && (
        <p style={{ fontSize: 12, color: t.textSoft }}>
          {count} photo{count !== 1 ? 's' : ''} selected. Reorder using the arrows — first 4 are used for 3D generation.
        </p>
      )}

      <Field t={t} label="3D Model">
        <p style={{ fontSize: 12, color: t.textSoft, margin: 0 }}>
          When you publish, a 3D model will be auto-generated from your photos.
          Front, left, back, right order gives the best results.
        </p>
      </Field>
    </Card>
  )
}

function styles(t) {
  return {
    title: { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 },
    hint:  { fontSize: 13, color: t.textSoft, margin: 0 },
    grid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 },
    tile:  { position: 'relative', borderRadius: 10, overflow: 'hidden', border: `1px solid ${t.surfaceBorder}`, background: t.surface },
    img:   { width: '100%', height: 120, objectFit: 'cover', display: 'block' },
    primaryBadge: { position: 'absolute', top: 6, left: 6, background: t.accent, color: t.accentText, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20 },
    angleBadge: { position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 10 },
    tileActions: { display: 'flex', justifyContent: 'space-around', padding: '6px 4px', borderTop: `1px solid ${t.surfaceBorder}` },
    tileBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: t.textSoft, padding: '2px 6px' },
    addTile: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 160, border: `2px dashed ${t.surfaceBorder}`, borderRadius: 10, background: 'transparent', cursor: 'pointer' },
    guideToggle: { background: 'none', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '4px 0', textAlign: 'left' },
    guidePanel: { background: `${t.accent}08`, border: `1px solid ${t.accent}25`, borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 },
    guideIntro: { fontSize: 12, color: t.text, margin: 0, lineHeight: 1.5 },
    guideGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
    guideCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, background: t.surface, textAlign: 'center' },
    guideNumber: { width: 24, height: 24, borderRadius: '50%', background: t.accent, color: t.accentText, fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    guideLabel: { fontSize: 12, fontWeight: 600, color: t.text },
    guideDesc: { fontSize: 10, color: t.textSoft, lineHeight: 1.3 },
    guideTips: { fontSize: 11, color: t.textSoft, margin: 0, lineHeight: 1.5, fontStyle: 'italic' },
  }
}
