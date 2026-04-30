import { DoorOpen, RectangleHorizontal, Layers, ArrowUpDown, Archive } from 'lucide-react'

// Build tab — structural elements. Window + Door are wired to the existing
// pickers; Walls, Stairs, Closets are spec'd but not built (shown as SOON).

export default function BuildTabPanel({
  onWindow, onDoor,
}) {
  const items = [
    { id: 'window', label: 'Window', Icon: RectangleHorizontal, onClick: onWindow },
    { id: 'door',   label: 'Door',   Icon: DoorOpen,            onClick: onDoor   },
    { id: 'walls',  label: 'Walls',  Icon: Layers,              soon: true },
    { id: 'stairs', label: 'Stairs', Icon: ArrowUpDown,         soon: true },
    { id: 'closet', label: 'Closet', Icon: Archive,             soon: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map(it => (
        <button
          key={it.id}
          onClick={it.soon ? undefined : it.onClick}
          disabled={it.soon}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 14px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)',
            background: it.soon ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
            color: '#f0eaff',
            cursor: it.soon ? 'default' : 'pointer',
            opacity: it.soon ? 0.55 : 1,
            fontSize: 13, fontWeight: 600,
            fontFamily: "'Outfit', system-ui, sans-serif",
            textAlign: 'left',
          }}
        >
          <span style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: '#88d8b033', color: '#88d8b0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <it.Icon size={15} strokeWidth={2.2} />
          </span>
          <span style={{ flex: 1 }}>{it.label}</span>
          {it.soon && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 8,
              background: '#88d8b022', color: '#88d8b0',
              letterSpacing: '0.5px',
            }}>SOON</span>
          )}
        </button>
      ))}
    </div>
  )
}
