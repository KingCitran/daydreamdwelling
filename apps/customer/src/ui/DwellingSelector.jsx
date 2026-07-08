// DwellingSelector — switch between multiple dwelling projects
import { useState } from 'react'

const STORAGE_KEY = 'ddd_dwellings_index'

function getDwellingIndex() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function saveDwellingIndex(index) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(index))
}

export default function DwellingSelector({ currentName, onSwitch, onNew, onRename }) {
  const [open, setOpen] = useState(false)
  const dwellings = getDwellingIndex()

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: '#a0a0c0',
        fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        🏠 {currentName || 'My Dwelling'}
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '120%', right: 0, minWidth: 200,
          background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 12,
          padding: 6, zIndex: 200, boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
          fontFamily: "'Outfit',sans-serif",
        }}>
          {dwellings.map((d, i) => (
            <button key={i} onClick={() => { onSwitch?.(d.key); setOpen(false) }} style={{
              display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8,
              border: 'none', background: d.key === (currentName || 'default') ? '#5a3a9a20' : 'transparent',
              color: '#c0b8e0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              textAlign: 'left',
            }}>
              {d.name || `Dwelling ${i + 1}`}
            </button>
          ))}
          <div style={{ height: 1, background: '#3a3a5a', margin: '4px 6px' }} />
          <button onClick={() => {
            const name = prompt('New dwelling name:')
            if (name) { onNew?.(name); setOpen(false) }
          }} style={{
            display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8,
            border: 'none', background: 'transparent', color: '#5a3a9a',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left',
          }}>+ New Dwelling</button>
        </div>
      )}
    </div>
  )
}

// Helper to save current state as a named dwelling
export function saveDwelling(key, name) {
  const index = getDwellingIndex()
  const existing = index.findIndex(d => d.key === key)
  if (existing >= 0) index[existing].name = name
  else index.push({ key, name, created: Date.now() })
  saveDwellingIndex(index)
}

export function loadDwelling(key) {
  try { return JSON.parse(localStorage.getItem(`ddd_dwelling_${key}`) || 'null') } catch { return null }
}

export function storeDwelling(key, data) {
  localStorage.setItem(`ddd_dwelling_${key}`, JSON.stringify(data))
}
