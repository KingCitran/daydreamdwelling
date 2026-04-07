import { useState } from 'react'
import { useBuilderStyles } from './styles/appStyles'

export default function RoomBanner({ currentRoomId, roomName, allRoomsData, roomNames, onOpenOverview, onNavigate, onRename }) {
  const s = useBuilderStyles()
  const [dropOpen,  setDropOpen]  = useState(false)
  const [editing,   setEditing]   = useState(false)
  const [draft,     setDraft]     = useState(roomName)
  const roomIds   = Object.keys(allRoomsData).map(Number)
  const hasMultiple = roomIds.length > 1

  const commitRename = () => {
    const trimmed = draft.trim()
    if (trimmed) onRename(currentRoomId, trimmed)
    setEditing(false)
  }

  return (
    <div style={s.roomBannerWrap}>
      {editing ? (
        <input
          style={s.roomBannerInput}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={e => {
            if (e.key === 'Enter')  commitRename()
            if (e.key === 'Escape') { setEditing(false); setDraft(roomName) }
          }}
          autoFocus
        />
      ) : (
        <button style={s.roomBannerBtn} onClick={onOpenOverview} title="Click to open overview · double-click to rename">
          🏠 <span onDoubleClick={e => { e.stopPropagation(); setDraft(roomName); setEditing(true) }}>{roomName}</span>
        </button>
      )}
      {!editing && (
        <button style={s.roomBannerEdit}
          onClick={() => { setDraft(roomName); setEditing(true) }}
          title="Rename room">✏</button>
      )}
      {!editing && hasMultiple && (
        <div style={{ position: 'relative' }}>
          <button style={s.roomBannerDrop} onClick={() => setDropOpen(v => !v)} title="Switch room">▾</button>
          {dropOpen && (
            <div style={s.roomDropdown}>
              {roomIds.map(id => {
                const name = roomNames[id] || `Room ${id + 1}`
                const isActive = id === currentRoomId
                return (
                  <button key={id} style={{ ...s.roomDropItem, ...(isActive ? s.roomDropItemActive : {}) }}
                    onClick={() => { onNavigate(id); setDropOpen(false) }}
                  >
                    {isActive ? '● ' : '○ '}{name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
