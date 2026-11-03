// DwellingSelector — switch between dwelling projects
import { useState } from 'react'
import { getProjectList, deleteProject } from '../utils/projectManager'

export default function DwellingSelector({ currentName, currentId, onSwitch, onNew, onDelete }) {
  const [open, setOpen] = useState(false)
  const projects = getProjectList()

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding: '6px 14px', borderRadius: '4px 999px 999px 4px', border: '1px solid rgba(255,255,255,0.1)',
        background: open ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', color: '#c0c0e0',
        fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      }}>
        🏠 {currentName || 'My Dwelling'} ▾
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '120%', left: 0, minWidth: 220,
          background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 12,
          padding: 6, zIndex: 200, boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
          fontFamily: "'Outfit',sans-serif",
        }}>
          <div style={{ padding: '4px 8px', fontSize: 9, fontWeight: 700, color: '#505070', textTransform: 'uppercase' }}>Your Projects</div>
          {projects.length === 0 && (
            <div style={{ padding: '8px 10px', fontSize: 11, color: '#505060' }}>No saved projects yet</div>
          )}
          {projects.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button onClick={() => { onSwitch?.(p.id); setOpen(false) }} style={{
                flex: 1, display: 'block', padding: '8px 10px', borderRadius: 8,
                border: 'none', background: p.id === currentId ? '#5a3a9a20' : 'transparent',
                color: p.id === currentId ? '#b0a0e0' : '#a0a0c0', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
              }}>
                <div style={{ fontWeight: 600 }}>{p.name || 'Untitled'}</div>
                <div style={{ fontSize: 9, color: '#606080' }}>
                  {p.roomCount ?? 1} room{(p.roomCount ?? 1) !== 1 ? 's' : ''}
                  {p.updated ? ` · ${new Date(p.updated).toLocaleDateString()}` : ''}
                </div>
              </button>
              {p.id !== currentId && (
                <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete "${p.name}"?`)) { deleteProject(p.id); onDelete?.(p.id) } }}
                  style={{ padding: '4px 6px', border: 'none', background: 'transparent', color: '#604040', fontSize: 12, cursor: 'pointer' }}>✕</button>
              )}
            </div>
          ))}
          <div style={{ height: 1, background: '#3a3a5a', margin: '4px 6px' }} />
          <button onClick={() => {
            const name = prompt('Project name:')
            if (name?.trim()) { onNew?.(name.trim()); setOpen(false) }
          }} style={{
            display: 'block', width: '100%', padding: '8px 10px', borderRadius: 8,
            border: 'none', background: 'transparent', color: '#5a8a5a',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            textAlign: 'left',
          }}>+ New Project</button>
        </div>
      )}
    </div>
  )
}
