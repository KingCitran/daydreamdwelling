// CSS-drawn room preview cards used in LandingPage hero + showcase
const T = 'background 1s ease, border-color 1s ease, color 1s ease, opacity 1s ease'

// Simple fallback room — always renders, no internal furniture
export function BlankRoom({ mt, moodName, width = 420, height = 320 }) {
  const FH = Math.round(height * 0.32), WW = Math.round(width * 0.14)
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', position: 'relative', flexShrink: 0,
      background: mt.bg, border: `1px solid ${mt.surfaceBorder}`,
      boxShadow: '0 28px 70px rgba(0,0,0,0.55)', transition: T,
      width, height,
    }}>
      {/* Back wall */}
      <div style={{ position: 'absolute', top: 0, left: WW, right: 0, bottom: FH, background: mt.navBg, transition: T }} />
      {/* Side wall */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: WW, bottom: FH, background: mt.surface, opacity: 0.85, transition: T }} />
      {/* Floor */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: FH, background: mt.surface, transition: T }} />
      {/* Window glow */}
      <div style={{
        position: 'absolute', top: height * 0.18, left: width * 0.55,
        width: width * 0.22, height: height * 0.3,
        background: `linear-gradient(180deg, ${mt.accent}80 0%, ${mt.accent}10 100%)`,
        borderRadius: 4, boxShadow: `0 0 40px ${mt.accent}60`,
        transition: T,
      }} />
      {/* Mood label */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
        borderRadius: 12, padding: '4px 10px',
        fontSize: 11, color: '#fff',
      }}>
        {moodName}
      </div>
    </div>
  )
}

export function roomCard(mt) {
  return {
    borderRadius: 16, overflow: 'hidden', position: 'relative', flexShrink: 0,
    background: mt.bg, border: `1px solid ${mt.surfaceBorder}`,
    boxShadow: '0 28px 70px rgba(0,0,0,0.55)', transition: T,
  }
}

export function abs(bg, extra = {}) {
  return { position: 'absolute', background: bg, transition: T, ...extra }
}

export function LivingRoom({ mt, moodName, width = 468, height = 356 }) {
  const FH = Math.round(height * 0.267), WW = Math.round(width * 0.111)
  const scale = width / 468
  return (
    <div style={{ ...roomCard(mt), width, height }}>
      <div style={abs(mt.navBg,   { top: 0, left: WW, right: 0, bottom: FH })} />
      <div style={abs(mt.surface, { top: 0, left: 0, width: WW, bottom: FH, opacity: 0.85 })} />
      <div style={abs(mt.surface, { bottom: 0, left: 0, right: 0, height: FH })} />
      {/* Ceiling light */}
      <div style={abs(mt.surfaceBorder, { top: 0, left: width * 0.48, width: 3, height: 38 * scale })} />
      <div style={abs(mt.surfaceBorder, { top: 35 * scale, left: width * 0.443, width: 36 * scale, height: 11 * scale, borderRadius: '0 0 10px 10px' })} />
      <div style={{ position: 'absolute', top: 28 * scale, left: width * 0.32, width: 160 * scale, height: 100 * scale, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}38 0%, transparent 62%)`, transition: T, pointerEvents: 'none' }} />
      {/* Window */}
      <div style={{ position: 'absolute', bottom: FH + 100 * scale, left: width * 0.363, width: 138 * scale, height: 105 * scale, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}09`, borderRadius: 3, transition: T }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: mt.surfaceBorder, transition: T }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '48%', height: 2, background: mt.surfaceBorder, transition: T }} />
      </div>
      {/* Bookshelf */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, right: 22 * scale, width: 66 * scale, height: 188 * scale, opacity: 0.48, borderRadius: '2px 2px 0 0' })}>
        {[48, 96, 142].map(b => <div key={b} style={{ position: 'absolute', bottom: b * scale, left: 0, right: 0, height: 2, background: mt.navBg, opacity: 0.7 }} />)}
      </div>
      {/* Floor lamp */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: 85 * scale, width: 3, height: 148 * scale, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 144 * scale, left: 73 * scale, width: 28 * scale, height: 10 * scale, borderRadius: '0 0 18px 18px', opacity: 0.75 })} />
      <div style={{ position: 'absolute', bottom: FH + 88 * scale, left: 58 * scale, width: 66 * scale, height: 60 * scale, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}48 0%, transparent 68%)`, transition: T }} />
      {/* Plant */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: WW + 12 * scale, width: 28 * scale, height: 20 * scale, borderRadius: '3px 3px 0 0', opacity: 0.5 })} />
      <div style={{ position: 'absolute', bottom: FH + 16 * scale, left: WW + 6 * scale, width: 42 * scale, height: 42 * scale, borderRadius: '50% 55% 48% 52%', background: `${mt.accent}55`, transition: T }} />
      {/* Rug */}
      <div style={{ position: 'absolute', bottom: FH + 2, left: 120 * scale, width: 248 * scale, height: 58 * scale, borderRadius: 5, background: `${mt.accent}1c`, transition: T }} />
      {/* Sofa */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58 * scale, left: 138 * scale, width: 18 * scale, height: 66 * scale, borderRadius: '3px 0 0 3px' })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58 * scale, left: 348 * scale, width: 18 * scale, height: 66 * scale, borderRadius: '0 3px 3px 0' })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58 * scale, left: 156 * scale, width: 192 * scale, height: 42 * scale })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 96 * scale, left: 138 * scale, width: 228 * scale, height: 28 * scale, borderRadius: '3px 3px 0 0', opacity: 0.75 })} />
      {/* Coffee table */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 48 * scale, left: 192 * scale, width: 110 * scale, height: 12 * scale, borderRadius: '3px 3px 0 0', opacity: 0.45 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 2, left: 200 * scale, width: 94 * scale, height: 48 * scale, opacity: 0.28, borderRadius: 2 })} />
      <div style={{ position: 'absolute', top: 13, left: WW + 12 * scale, fontSize: 10, fontWeight: 700, color: mt.textSoft, letterSpacing: '0.1em', textTransform: 'uppercase', transition: T }}>Living Room</div>
      <div style={{ position: 'absolute', bottom: 13, right: 14, fontSize: 12, fontWeight: 700, color: mt.accent, transition: T }}>{moodName}</div>
    </div>
  )
}

export function Bedroom({ mt, moodName, width = 468, height = 356 }) {
  const FH = Math.round(height * 0.267), WW = Math.round(width * 0.111)
  const scale = width / 468
  return (
    <div style={{ ...roomCard(mt), width, height }}>
      <div style={abs(mt.navBg,   { top: 0, left: WW, right: 0, bottom: FH })} />
      <div style={abs(mt.surface, { top: 0, left: 0, width: WW, bottom: FH, opacity: 0.85 })} />
      <div style={abs(mt.surface, { bottom: 0, left: 0, right: 0, height: FH })} />
      {/* Ceiling light */}
      <div style={abs(mt.surfaceBorder, { top: 0, left: width * 0.48, width: 3, height: 38 * scale })} />
      <div style={abs(mt.surfaceBorder, { top: 35 * scale, left: width * 0.449, width: 30 * scale, height: 10 * scale, borderRadius: '0 0 8px 8px' })} />
      <div style={{ position: 'absolute', top: 28 * scale, left: width * 0.331, width: 140 * scale, height: 90 * scale, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}38 0%, transparent 62%)`, transition: T, pointerEvents: 'none' }} />
      {/* Window + curtains */}
      <div style={{ position: 'absolute', bottom: FH + 130 * scale, left: 158 * scale, width: 118 * scale, height: 90 * scale, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}09`, borderRadius: 2, transition: T }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: mt.surfaceBorder, transition: T }} />
      </div>
      <div style={abs(mt.surfaceBorder, { bottom: FH + 218 * scale, left: 144 * scale, width: 148 * scale, height: 4 * scale, borderRadius: 2, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 130 * scale, left: 144 * scale, width: 20 * scale, height: 90 * scale, opacity: 0.5 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 130 * scale, left: 270 * scale, width: 20 * scale, height: 90 * scale, opacity: 0.5 })} />
      {/* Dresser */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, right: 26 * scale, width: 62 * scale, height: 108 * scale, opacity: 0.48, borderRadius: '2px 2px 0 0' })}>
        {[32, 68].map(b => <div key={b} style={{ position: 'absolute', bottom: b * scale, left: 6 * scale, right: 6 * scale, height: 2, background: mt.navBg }} />)}
      </div>
      <div style={{ position: 'absolute', bottom: FH + 108 * scale, right: 36 * scale, width: 44 * scale, height: 55 * scale, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}08`, borderRadius: 3, transition: T }} />
      {/* Rug */}
      <div style={{ position: 'absolute', bottom: FH + 2, left: 80 * scale, width: 258 * scale, height: 52 * scale, borderRadius: 4, background: `${mt.accent}1c`, transition: T }} />
      {/* Bed */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 82 * scale, left: 88 * scale, width: 248 * scale, height: 36 * scale, borderRadius: '4px 4px 0 0', opacity: 0.78 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: 88 * scale, width: 248 * scale, height: 84 * scale, opacity: 0.38 })} />
      <div style={{ position: 'absolute', bottom: FH, left: 88 * scale, width: 248 * scale, height: 68 * scale, background: `${mt.accent}24`, transition: T, borderRadius: '0 0 2px 2px' }} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 60 * scale, left: 102 * scale, width: 78 * scale, height: 26 * scale, borderRadius: 4, opacity: 0.68 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 60 * scale, left: 238 * scale, width: 78 * scale, height: 26 * scale, borderRadius: 4, opacity: 0.68 })} />
      {/* Nightstand + lamp */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: 346 * scale, width: 46 * scale, height: 50 * scale, opacity: 0.48, borderRadius: 3 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 50 * scale, left: 358 * scale, width: 3, height: 28 * scale, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 74 * scale, left: 349 * scale, width: 20 * scale, height: 8 * scale, borderRadius: '50%', opacity: 0.78 })} />
      <div style={{ position: 'absolute', bottom: FH + 28 * scale, left: 330 * scale, width: 62 * scale, height: 55 * scale, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}48 0%, transparent 68%)`, transition: T }} />
      <div style={{ position: 'absolute', top: 13, left: WW + 12 * scale, fontSize: 10, fontWeight: 700, color: mt.textSoft, letterSpacing: '0.1em', textTransform: 'uppercase', transition: T }}>Bedroom</div>
      <div style={{ position: 'absolute', bottom: 13, right: 14, fontSize: 12, fontWeight: 700, color: mt.accent, transition: T }}>{moodName}</div>
    </div>
  )
}
