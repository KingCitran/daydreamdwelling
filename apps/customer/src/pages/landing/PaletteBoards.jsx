// Exterior palette boards — laid out like an interior designer's material board.
// Neat rows, nothing crooked. Each derives ALL colors from the room's palette record.

function PaintCard({ x, y, w, h, color }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: '#fff',
      boxShadow: '0 4px 10px rgba(60,80,120,0.20)', borderRadius: 3, padding: 4, boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ flex: 1, background: color, borderRadius: 2 }} />
      <div style={{ height: 5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ height: 2, width: '70%', background: 'rgba(26,42,72,0.28)', borderRadius: 1 }} />
        <div style={{ height: 1.5, width: '45%', background: 'rgba(26,42,72,0.16)', borderRadius: 1 }} />
      </div>
    </div>
  )
}

function FabricSwatch({ x, y, s, base, weave }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: s, height: s, background: '#fff', padding: 3,
      boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(60,80,120,0.20)', borderRadius: 3 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: 2,
        background: `repeating-linear-gradient(0deg,transparent 0 3px,${weave} 3px 4px), repeating-linear-gradient(90deg,transparent 0 3px,${weave} 3px 4px), ${base}` }} />
    </div>
  )
}

function Plank({ x, y, w, h, from, to }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: 3,
      background: `repeating-linear-gradient(90deg,transparent 0 14px,rgba(0,0,0,0.06) 14px 16px), linear-gradient(90deg,${from},${to})`,
      boxShadow: '0 4px 10px rgba(60,80,120,0.20)' }} />
  )
}

function MatDot({ x, y, d, bg }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: d, height: d, borderRadius: '50%', background: bg,
      border: '3px solid #fff', boxSizing: 'border-box', boxShadow: '0 4px 10px rgba(60,80,120,0.20)' }} />
  )
}

function WallpaperSheet({ x, y, w, h, bg, size }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, background: bg, backgroundSize: size || 'auto',
      boxShadow: '0 4px 10px rgba(60,80,120,0.20)', borderRadius: 2, border: '3px solid #fff', boxSizing: 'border-box' }} />
  )
}

// Back wall exterior — the room's color story (4 paint chips, 3 fabric swatches, wood sample)
export function PaletteBack({ room }) {
  const p = room.palette
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <PaintCard x="9%" y="14%" w="17%" h="26%" color={p.chips[0]} />
      <PaintCard x="31%" y="14%" w="17%" h="26%" color={p.chips[1]} />
      <PaintCard x="53%" y="14%" w="17%" h="26%" color={p.chips[2]} />
      <PaintCard x="75%" y="14%" w="17%" h="26%" color={p.chips[3]} />
      <FabricSwatch x="9%" y="48%" s="18%" base={p.fab[0][0]} weave={p.fab[0][1]} />
      <FabricSwatch x="31%" y="48%" s="18%" base={p.fab[1][0]} weave={p.fab[1][1]} />
      <FabricSwatch x="53%" y="48%" s="18%" base={p.fab[2][0]} weave={p.fab[2][1]} />
      <MatDot x="76.5%" y="49%" d="15%" bg={p.lamp} />
      <Plank x="9%" y="76%" w="61%" h="11%" from={p.wood[0]} to={p.wood[1]} />
      <MatDot x="76.5%" y="74%" d="15%" bg={p.dot} />
    </div>
  )
}

// Side wall exterior — wallpaper sheets, material dots, paint chips
export function PaletteSide({ room }) {
  const p = room.palette
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <WallpaperSheet x="10%" y="12%" w="26%" h="48%"
        bg={`repeating-linear-gradient(0deg,${p.chips[0]} 0 12px,${p.chips[1]} 12px 14px)`} />
      <WallpaperSheet x="41%" y="12%" w="26%" h="48%"
        bg={`radial-gradient(circle at 7px 8px,${p.fab[1][0]} 2.5px,transparent 3px), ${p.chips[0]}`} size="20px 22px" />
      <MatDot x="74%" y="13%" d="14%" bg={`linear-gradient(135deg,${p.wood[0]},${p.wood[1]})`} />
      <MatDot x="74%" y="31%" d="14%" bg={p.lamp} />
      <MatDot x="74%" y="49%" d="14%" bg={p.dot} />
      <PaintCard x="10%" y="68%" w="17%" h="24%" color={p.fab[0][0]} />
      <PaintCard x="32%" y="68%" w="17%" h="24%" color={p.fab[1][0]} />
      <PaintCard x="54%" y="68%" w="17%" h="24%" color={p.fab[2][0]} />
    </div>
  )
}
