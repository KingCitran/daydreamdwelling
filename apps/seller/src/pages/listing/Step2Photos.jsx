import { useRef } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { Card, Field } from './Step1Identity'

export default function Step2Photos({ form, update }) {
  const t      = useTheme()
  const fileRef = useRef(null)
  const s       = styles(t)

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
        Upload at least 4 photos. The first photo is used as the primary thumbnail.
        {need > 0 && <span style={{ color: '#e07a30' }}> {need} more needed.</span>}
      </p>

      <div style={s.grid}>
        {form.photos.map((photo, i) => (
          <div key={i} style={{ ...s.tile, outline: i === 0 ? `2px solid ${t.accent}` : 'none' }}>
            <img src={photo.url} alt="" style={s.img} />
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
          <span style={{ fontSize: 12, color: t.textSoft }}>Add photos</span>
        </button>
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />

      {count >= 4 && (
        <p style={{ fontSize: 12, color: t.textSoft }}>
          {count} photo{count !== 1 ? 's' : ''} selected. Drag to reorder using the arrows.
        </p>
      )}

      <Field t={t} label="Note">
        <p style={{ fontSize: 12, color: t.textSoft, margin: 0 }}>
          Photos will be uploaded to Supabase Storage when you publish.
          3D model generation (Tripo3D) will be wired in Phase 2.
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
    tileActions: { display: 'flex', justifyContent: 'space-around', padding: '6px 4px', borderTop: `1px solid ${t.surfaceBorder}` },
    tileBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: t.textSoft, padding: '2px 6px' },
    addTile: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 160, border: `2px dashed ${t.surfaceBorder}`, borderRadius: 10, background: 'transparent', cursor: 'pointer' },
  }
}
