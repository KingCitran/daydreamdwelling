import { useState } from 'react'
import { styles } from './styles/appStyles'
import { DIAMOND_MAP, roomQuadrant } from '../utils/roomGeometry'

export default function WallPicker({ def, onPick, onCancel, roomRotation }) {
  const [hovered, setHovered] = useState(null)
  const dmap  = DIAMOND_MAP[roomQuadrant(roomRotation ?? 0)]
  const label = { N: 'Back', S: 'Front', W: 'Left', E: 'Right' }

  const segs = [
    { pos: 'tl', pts: '13,55 55,13 55,27 27,55'  },
    { pos: 'tr', pts: '55,13 97,55 83,55 55,27'  },
    { pos: 'br', pts: '97,55 55,97 55,83 83,55' },
    { pos: 'bl', pts: '55,97 13,55 27,55 55,83'  },
  ]
  const labelPos = { tl: [28,33], tr: [82,33], br: [82,77], bl: [28,77] }

  return (
    <div style={styles.wallPickerOverlay}>
      <div style={styles.wallPickerPanel}>
        <p style={styles.wallPickerTitle}>Which wall?</p>
        <p style={styles.wallPickerSub}>
          <span style={{ color: def.color ?? '#c4a8ff' }}>■</span>{' '}
          {def.label}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginTop: 12 }}>
          <svg width="110" height="110" style={{ display: 'block' }}>
            {segs.map(({ pos, pts }) => {
              const wall = dmap[pos]
              const active = hovered === wall
              return (
                <polygon key={pos} points={pts}
                  fill={active ? '#4a4a8a' : '#2a2a4a'}
                  stroke={active ? '#a0a0ff' : '#5050a0'}
                  strokeWidth="1"
                  style={{ cursor: 'pointer' }}
                  onClick={() => onPick(wall)}
                  onMouseEnter={() => setHovered(wall)}
                  onMouseLeave={() => setHovered(null)}
                />
              )
            })}
            {segs.map(({ pos }) => {
              const wall = dmap[pos]
              const [lx, ly] = labelPos[pos]
              return (
                <text key={pos} x={lx} y={ly}
                  textAnchor="middle" dominantBaseline="middle"
                  fill={hovered === wall ? '#e0e0ff' : '#8080bb'}
                  fontSize="9" style={{ pointerEvents: 'none', userSelect: 'none' }}
                >{label[wall]}</text>
              )
            })}
            <path d="M 55,13 L 97,55 L 55,97 L 13,55 Z"
              fill="none" stroke="#5050a0" strokeWidth="2.5" strokeLinejoin="round"
              style={{ pointerEvents: 'none' }} />
            <path d="M 55,27 L 83,55 L 55,83 L 27,55 Z"
              fill="#1a1a2e" stroke="#2a2a50" strokeWidth="1"
              style={{ pointerEvents: 'none' }} />
            <text x="55" y="55" textAnchor="middle" dominantBaseline="middle"
              fill="#6060a0" fontSize="8" style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {hovered ? label[hovered] : ''}
            </text>
          </svg>
        </div>

        <button style={styles.wallPickerCancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}
