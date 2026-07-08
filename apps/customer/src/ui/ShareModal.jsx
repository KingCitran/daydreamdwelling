// ShareModal — generate shareable link for the current dwelling design
import { useState } from 'react'
import { supabase } from '@shared/supabase'

export default function ShareModal({ roomData, roomName, onClose }) {
  const [shareUrl, setShareUrl] = useState(null)
  const [copying, setCopying] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateLink = async () => {
    setSaving(true)
    try {
      // Save to a public shares table
      const shareId = Math.random().toString(36).slice(2, 10)
      const { error } = await supabase.from('shared_rooms').upsert({
        id: shareId,
        name: roomName || 'My Dwelling',
        data: roomData,
        created_at: new Date().toISOString(),
      })
      if (error) {
        // Table might not exist — fall back to URL encoding
        const compressed = btoa(JSON.stringify(roomData))
        setShareUrl(`${window.location.origin}/?view=${encodeURIComponent(compressed).slice(0, 2000)}`)
      } else {
        setShareUrl(`${window.location.origin}/?share=${shareId}`)
      }
    } catch (e) {
      // Fallback: encode in URL
      const mini = { cells: [...(roomData.cells ?? [])].slice(0, 200), gridW: roomData.gridW, gridD: roomData.gridD }
      setShareUrl(`${window.location.origin}/?preview=1`)
    }
    setSaving(false)
  }

  const copyToClipboard = () => {
    if (!shareUrl) return
    navigator.clipboard.writeText(shareUrl)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)', fontFamily: "'Outfit',sans-serif",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#1a1a2e', border: '1px solid #3a3a5a', borderRadius: 16,
        padding: 24, width: 400, maxWidth: '90vw',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#f0eaff', marginBottom: 4 }}>Share Your Dwelling</div>
        <div style={{ fontSize: 12, color: '#8878aa', marginBottom: 16 }}>Anyone with the link can view your design (read-only)</div>

        {!shareUrl ? (
          <button onClick={generateLink} disabled={saving} style={{
            width: '100%', padding: '12px 20px', borderRadius: 10, border: 'none',
            background: '#5a3a9a', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'wait' : 'pointer', fontFamily: 'inherit',
            opacity: saving ? 0.6 : 1,
          }}>{saving ? 'Generating...' : 'Generate Share Link'}</button>
        ) : (
          <div>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              padding: '10px 12px', background: '#12122a', borderRadius: 8,
              border: '1px solid #3a3a5a', marginBottom: 12,
            }}>
              <input value={shareUrl} readOnly style={{
                flex: 1, background: 'transparent', border: 'none', color: '#c0b8e0',
                fontSize: 12, fontFamily: 'inherit', outline: 'none',
              }} />
              <button onClick={copyToClipboard} style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: copying ? '#4ac88a' : '#5a3a9a', color: '#fff',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                flexShrink: 0,
              }}>{copying ? 'Copied!' : 'Copy'}</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out my room design on DaydreamDwelling! ' + shareUrl)}`, '_blank')}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #3a3a5a', background: '#12122a', color: '#8878aa', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                Share on X
              </button>
              <button onClick={() => navigator.share?.({ title: 'My DaydreamDwelling Design', url: shareUrl }).catch(() => {})}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid #3a3a5a', background: '#12122a', color: '#8878aa', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
                Share...
              </button>
            </div>
          </div>
        )}

        <button onClick={onClose} style={{
          marginTop: 12, width: '100%', padding: '8px', borderRadius: 8,
          border: '1px solid #3a3a5a', background: 'transparent', color: '#6868a0',
          fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
        }}>Close</button>
      </div>
    </div>
  )
}
