import WispyCashier from '../ui/WispyCashier'
import Wispy from '../ui/Wispy'
import { useState } from 'react'

const BGS = ['#1a1a2e', '#f5f0ff', '#2a1a3a', '#0d0a1e', '#e8e0f0', '#3a2040']

export default function WispyPreview() {
  const [bg, setBg]       = useState('#1a1a2e')
  const [mode, setMode]   = useState('cashier')
  const [greeting, setGreeting] = useState('Welcome to my shop! ☁')
  const [msg, setMsg]     = useState(null)

  return (
    <div style={{
      width: '100vw', height: '100vh', background: bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Controls */}
      <div style={{
        padding: '16px 24px', background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        zIndex: 300,
      }}>
        <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Wispy Preview</span>

        <div style={{ display: 'flex', gap: 6 }}>
          {BGS.map(c => (
            <button key={c} onClick={() => setBg(c)} style={{
              width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
              border: bg === c ? '2px solid #9a7aee' : '2px solid transparent',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setMode('cashier')} style={{
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            background: mode === 'cashier' ? '#9a7aee' : '#333', color: 'white', border: 'none',
          }}>Cashier</button>
          <button onClick={() => setMode('wispy')} style={{
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            background: mode === 'wispy' ? '#9a7aee' : '#333', color: 'white', border: 'none',
          }}>Wispy</button>
        </div>

        {mode === 'wispy' && (
          <button onClick={() => setMsg(msg ? null : "Hi! I'm Wispy ✨")} style={{
            padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12,
            background: '#333', color: 'white', border: 'none',
          }}>{msg ? 'Dismiss' : 'Show'}</button>
        )}

        {mode === 'cashier' && (
          <input value={greeting} onChange={e => setGreeting(e.target.value)} style={{
            padding: '6px 10px', borderRadius: 6, fontSize: 12, width: 200,
            background: '#222', border: '1px solid #555', color: 'white',
          }} />
        )}
      </div>

      {/* Character */}
      <div style={{ flex: 1, position: 'relative' }}>
        {mode === 'cashier' && <WispyCashier greeting={greeting} />}
        {mode === 'wispy' && msg && <Wispy message={msg} onDismiss={() => setMsg(null)} />}
      </div>
    </div>
  )
}
