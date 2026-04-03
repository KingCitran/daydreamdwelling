import { useState } from 'react'
import { styles } from './styles/appStyles'

export default function RoomBanner({ currentRoomId, roomName, allRoomsData, roomNames, onOpenOverview, onNavigate, onRename }) {
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
    <div style={styles.roomBannerWrap}>
      {editing ? (
        <input
          style={styles.roomBannerInput}
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
        <button style={styles.roomBannerBtn} onClick={onOpenOverview} title="Click to open overview · double-click to rename">
          🏠 <span onDoubleClick={e => { e.stopPropagation(); setDraft(roomName); setEditing(true) }}>{roomName}</span>
        </button>
      )}
      {!editing && (
        <button style={styles.roomBannerEdit}
          onClick={() => { setDraft(roomName); setEditing(true) }}
          title="Rename room">✏</button>
      )}
      {!editing && hasMultiple && (
        <div style={{ position: 'relative' }}>
          <button style={styles.roomBannerDrop} onClick={() => setDropOpen(v => !v)} title="Switch room">▾</button>
          {dropOpen && (
            <div style={styles.roomDropdown}>
              {roomIds.map(id => {
                const name = roomNames[id] || `Room ${id + 1}`
                const isActive = id === currentRoomId
                return (
                  <button key={id} style={{ ...styles.roomDropItem, ...(isActive ? styles.roomDropItemActive : {}) }}
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
