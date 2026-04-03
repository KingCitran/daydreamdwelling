export default function DoorLinkPicker({ doorId, allRoomsData, currentRoomId, getRoomName, onNewRoom, onLinkRoom, onCancel }) {
  const otherRooms = Object.keys(allRoomsData)
    .map(Number)
    .filter(id => id !== currentRoomId)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)',
    }} onClick={onCancel}>
      <div style={{
        background: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: 12,
        padding: '22px 26px', minWidth: 260, maxWidth: 340,
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        fontFamily: 'system-ui, sans-serif',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e0d9ff', marginBottom: 14 }}>
          🚪 Where does this door lead?
        </div>

        <button
          style={{
            display: 'block', width: '100%', marginBottom: 8,
            padding: '9px 14px', textAlign: 'left',
            background: '#2a2a45', border: '1px solid #6060a0',
            borderRadius: 7, color: '#c0b8ff', fontSize: 13, cursor: 'pointer',
          }}
          onClick={() => onNewRoom(doorId)}
        >
          ✦ New Room
        </button>

        {otherRooms.length > 0 && (
          <>
            <div style={{ fontSize: 11, color: '#6868a0', margin: '10px 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>
              Connect to existing
            </div>
            {otherRooms.map(rid => (
              <button
                key={rid}
                style={{
                  display: 'block', width: '100%', marginBottom: 6,
                  padding: '9px 14px', textAlign: 'left',
                  background: '#222238', border: '1px solid #3a3a5a',
                  borderRadius: 7, color: '#a8a0cc', fontSize: 13, cursor: 'pointer',
                }}
                onClick={() => onLinkRoom(doorId, rid)}
              >
                → {getRoomName(rid)}
              </button>
            ))}
          </>
        )}

        <button
          style={{
            display: 'block', width: '100%', marginTop: 12,
            padding: '7px 14px', textAlign: 'center',
            background: 'transparent', border: '1px solid #3a3a5a',
            borderRadius: 7, color: '#5a5a7a', fontSize: 12, cursor: 'pointer',
          }}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
