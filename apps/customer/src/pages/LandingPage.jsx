import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { MOODS } from '@shared/useMood'
import { MOOD_THEMES } from '@shared/themes'
import MoodPicker from '@shared/MoodPicker'
import { supabase } from '@shared/supabase'

const T = 'background 1s ease, border-color 1s ease, color 1s ease, opacity 1s ease'

const FEATURES = [
  { icon: '◈', title: '3D room builder',   text: 'Place furniture, adjust walls, switch lighting moods — all in real time.' },
  { icon: '✦', title: 'Buy what you place', text: 'Every item links directly to its seller. Add to cart without leaving the builder.' },
  { icon: '◉', title: '13 mood presets',    text: 'From golden hour warmth to moonlit calm — find the light that fits your life.' },
]

const STEPS = [
  { n: '01', title: 'Set your room dimensions', text: 'Choose width, depth, and wall height. Add windows, doors, and arches.' },
  { n: '02', title: 'Furnish and style',         text: 'Browse the catalogue. Drag furniture in. Adjust paint, floors, and ceiling.' },
  { n: '03', title: 'Buy it in the real world',  text: 'When your room feels right, add pieces to cart and check out with the seller.' },
]

export default function LandingPage({ onEnter }) {
  const t = useTheme()
  const s = makeStyles(t)
  const [idxA, setIdxA] = useState(0)
  const [idxB, setIdxB] = useState(7)
  const [email,   setEmail]   = useState('')
  const [joined,  setJoined]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [waitlistErr, setWaitlistErr] = useState('')

  useEffect(() => {
    const a = setInterval(() => setIdxA(i => (i + 1) % MOODS.length), 4000)
    const b = setInterval(() => setIdxB(i => (i + 1) % MOODS.length), 5300)
    return () => { clearInterval(a); clearInterval(b) }
  }, [])

  const mtA = MOOD_THEMES[MOODS[idxA].key]
  const mtB = MOOD_THEMES[MOODS[idxB].key]

  return (
    <div style={s.page}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <header style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={{ color: t.accent, fontSize: 20 }}>✦</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, lineHeight: 1.2 }}>DaydreamDwelling</div>
              <div style={{ fontSize: 9, color: t.textSoft, letterSpacing: '0.5px' }}>Room Builder</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <MoodPicker />
            <a href="/outdoor" style={{ ...s.navLink, color: t.textSoft }}>Outdoor Shop</a>
            <button style={s.navCta} onClick={onEnter}>Open Builder →</button>
          </div>
        </div>
      </header>

      {/* ── Hero text ────────────────────────────────────── */}
      <div style={s.heroText}>
        <div style={s.heroOrb} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p style={s.eyebrow}>Free 3D Room Builder</p>
          <h1 style={s.heroTitle}>Design the room<br />you've been dreaming of.</h1>
          <p style={s.heroSub}>Build your space in 3D. Set the perfect mood. Buy the real furniture.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button style={s.heroCta} onClick={onEnter}>Start building — it's free →</button>
            <button style={s.browseCta} onClick={onEnter}>Browse Marketplace →</button>
          </div>
          <p style={s.heroNote}>No account needed · 13 lighting moods · Real items from independent sellers</p>
        </div>
      </div>

      {/* ── Room showcase ────────────────────────────────── */}
      <div style={s.showcase}>
        <div style={s.showcaseInner}>
          <LivingRoom mt={mtA} moodName={MOODS[idxA].key} />
          <Bedroom    mt={mtB} moodName={MOODS[idxB].key} />
        </div>
        <p style={s.showcaseHint}>Two rooms · two moods · cycling live — click any pill below to preview</p>
      </div>

      {/* ── Mood strip ───────────────────────────────────── */}
      <div style={s.moodStrip}>
        <div style={s.moodStripInner}>
          {MOODS.map((m, i) => {
            const mc = MOOD_THEMES[m.key]
            const active = i === idxA || i === idxB
            return (
              <button key={m.key} onClick={() => setIdxA(i)} style={{
                ...s.moodPill,
                background: active ? `${mc.accent}1a` : 'transparent',
                border:     `1px solid ${active ? mc.accent : t.surfaceBorder}`,
                color:      active ? mc.accent : t.textSoft,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: mc.accent, display: 'inline-block', flexShrink: 0 }} />
                {m.key}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.inner}>
          <div style={s.featGrid}>
            {FEATURES.map(f => (
              <div key={f.title} style={s.featCard}>
                <span style={{ fontSize: 22, color: t.accent }}>{f.icon}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: t.text, margin: 0 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7, margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────── */}
      <div style={{ ...s.section, background: t.surface, borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div style={s.stepsGrid}>
            {STEPS.map(step => (
              <div key={step.n} style={s.stepCard}>
                <div style={{ fontSize: 11, fontWeight: 800, color: t.accent, letterSpacing: '1px', marginBottom: 10 }}>{step.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.7 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Waitlist ─────────────────────────────────────── */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={s.eyebrow}>Stay in the loop</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: t.text, marginBottom: 10 }}>Be first when new rooms arrive.</h2>
          <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 28 }}>New furniture, builder features, and mood drops — straight to your inbox.</p>
          {joined ? (
            <p style={{ fontSize: 18, color: t.accent, fontWeight: 700 }}>You're on the list. ✦</p>
          ) : (
            <form onSubmit={async e => {
              e.preventDefault()
              if (!email.trim() || submitting) return
              setSubmitting(true)
              setWaitlistErr('')
              const { error } = await supabase.from('waitlist').insert({ email: email.trim() })
              setSubmitting(false)
              if (!error || error.code === '23505') {
                setJoined(true)
              } else {
                setWaitlistErr('Something went wrong. Try again.')
              }
            }} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <input
                  style={{ flex: 1, maxWidth: 300, padding: '12px 16px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none' }}
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" style={{ ...s.heroCta, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
                  {submitting ? '...' : 'Join →'}
                </button>
              </div>
              {waitlistErr && <p style={{ fontSize: 12, color: '#e57373', margin: 0 }}>{waitlistErr}</p>}
            </form>
          )}
        </div>
      </div>

      {/* ── Outdoor CTA ──────────────────────────────────── */}
      <div style={{ ...s.section, borderTop: `1px solid ${t.surfaceBorder}` }}>
        <div style={s.inner}>
          <div style={s.outdoorBand}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Also from DaydreamDwelling</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 10 }}>Love your outdoor space too?</h2>
              <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, maxWidth: 440 }}>Curated outdoor furniture, planters, and decor from independent makers.</p>
            </div>
            <a href="/outdoor" style={{ ...s.heroCta, textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>Explore Outdoor Shop →</a>
          </div>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{ padding: '24px 40px', borderTop: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, textAlign: 'center' }}>
        © 2025 DaydreamDwelling · <span style={{ color: t.accent }}>Room Builder</span>
      </footer>

    </div>
  )
}

// ── Room components ──────────────────────────────────────────────────────────

function roomCard(mt) {
  return {
    width: 468, height: 356, borderRadius: 16, overflow: 'hidden',
    position: 'relative', flexShrink: 0,
    background: mt.bg,
    border: `1px solid ${mt.surfaceBorder}`,
    boxShadow: '0 28px 70px rgba(0,0,0,0.55)',
    transition: T,
  }
}

function abs(bg, extra = {}) {
  return { position: 'absolute', background: bg, transition: T, ...extra }
}

function LivingRoom({ mt, moodName }) {
  // constants: FH = floor height, WW = left-wall width
  const FH = 95, WW = 52
  return (
    <div style={roomCard(mt)}>
      {/* Walls + floor */}
      <div style={abs(mt.navBg,   { top: 0, left: WW, right: 0, bottom: FH })} />
      <div style={abs(mt.surface, { top: 0, left: 0, width: WW, bottom: FH, opacity: 0.85 })} />
      <div style={abs(mt.surface, { bottom: 0, left: 0, right: 0, height: FH })} />

      {/* Ceiling light */}
      <div style={abs(mt.surfaceBorder, { top: 0, left: 225, width: 3, height: 38 })} />
      <div style={abs(mt.surfaceBorder, { top: 35, left: 207, width: 36, height: 11, borderRadius: '0 0 10px 10px' })} />
      <div style={{ position: 'absolute', top: 28, left: 150, width: 160, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}38 0%, transparent 62%)`, transition: T, pointerEvents: 'none' }} />

      {/* Window */}
      <div style={{ position: 'absolute', bottom: FH + 100, left: 170, width: 138, height: 105, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}09`, borderRadius: 3, transition: T }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: mt.surfaceBorder, transition: T }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: '48%', height: 2, background: mt.surfaceBorder, transition: T }} />
      </div>

      {/* Bookshelf */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, right: 22, width: 66, height: 188, opacity: 0.48, borderRadius: '2px 2px 0 0' })}>
        {[48, 96, 142].map(b => <div key={b} style={{ position: 'absolute', bottom: b, left: 0, right: 0, height: 2, background: mt.navBg, opacity: 0.7 }} />)}
      </div>

      {/* Floor lamp */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: 85, width: 3, height: 148, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 144, left: 73, width: 28, height: 10, borderRadius: '0 0 18px 18px', opacity: 0.75 })} />
      <div style={{ position: 'absolute', bottom: FH + 88, left: 58, width: 66, height: 60, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}48 0%, transparent 68%)`, transition: T }} />

      {/* Plant */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: WW + 12, width: 28, height: 20, borderRadius: '3px 3px 0 0', opacity: 0.5 })} />
      <div style={{ position: 'absolute', bottom: FH + 16, left: WW + 6, width: 42, height: 42, borderRadius: '50% 55% 48% 52%', background: `${mt.accent}55`, transition: T }} />

      {/* Rug */}
      <div style={{ position: 'absolute', bottom: FH + 2, left: 120, width: 248, height: 58, borderRadius: 5, background: `${mt.accent}1c`, transition: T }} />

      {/* Sofa arms */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58, left: 138, width: 18, height: 66, borderRadius: '3px 0 0 3px' })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58, left: 348, width: 18, height: 66, borderRadius: '0 3px 3px 0' })} />
      {/* Sofa seat */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 58, left: 156, width: 192, height: 42 })} />
      {/* Sofa back */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 96, left: 138, width: 228, height: 28, borderRadius: '3px 3px 0 0', opacity: 0.75 })} />

      {/* Coffee table */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 48, left: 192, width: 110, height: 12, borderRadius: '3px 3px 0 0', opacity: 0.45 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 2,  left: 200, width: 94,  height: 48, opacity: 0.28, borderRadius: 2 })} />

      {/* Labels */}
      <div style={{ position: 'absolute', top: 13, left: WW + 12, fontSize: 10, fontWeight: 700, color: mt.textSoft, letterSpacing: '0.1em', textTransform: 'uppercase', transition: T }}>Living Room</div>
      <div style={{ position: 'absolute', bottom: 13, right: 14, fontSize: 12, fontWeight: 700, color: mt.accent, transition: T }}>{moodName}</div>
    </div>
  )
}

function Bedroom({ mt, moodName }) {
  const FH = 95, WW = 52
  return (
    <div style={roomCard(mt)}>
      {/* Walls + floor */}
      <div style={abs(mt.navBg,   { top: 0, left: WW, right: 0, bottom: FH })} />
      <div style={abs(mt.surface, { top: 0, left: 0, width: WW, bottom: FH, opacity: 0.85 })} />
      <div style={abs(mt.surface, { bottom: 0, left: 0, right: 0, height: FH })} />

      {/* Ceiling light */}
      <div style={abs(mt.surfaceBorder, { top: 0, left: 225, width: 3, height: 38 })} />
      <div style={abs(mt.surfaceBorder, { top: 35, left: 210, width: 30, height: 10, borderRadius: '0 0 8px 8px' })} />
      <div style={{ position: 'absolute', top: 28, left: 155, width: 140, height: 90, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}38 0%, transparent 62%)`, transition: T, pointerEvents: 'none' }} />

      {/* Window + curtains */}
      <div style={{ position: 'absolute', bottom: FH + 130, left: 158, width: 118, height: 90, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}09`, borderRadius: 2, transition: T }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: mt.surfaceBorder, transition: T }} />
      </div>
      <div style={abs(mt.surfaceBorder, { bottom: FH + 218, left: 144, width: 148, height: 4, borderRadius: 2, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 130, left: 144, width: 20, height: 90, opacity: 0.5 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 130, left: 270, width: 20, height: 90, opacity: 0.5 })} />

      {/* Dresser + mirror */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, right: 26, width: 62, height: 108, opacity: 0.48, borderRadius: '2px 2px 0 0' })}>
        {[32, 68].map(b => <div key={b} style={{ position: 'absolute', bottom: b, left: 6, right: 6, height: 2, background: mt.navBg }} />)}
      </div>
      <div style={{ position: 'absolute', bottom: FH + 108, right: 36, width: 44, height: 55, border: `2px solid ${mt.surfaceBorder}`, background: `${mt.accent}08`, borderRadius: 3, transition: T }} />

      {/* Rug */}
      <div style={{ position: 'absolute', bottom: FH + 2, left: 80, width: 258, height: 52, borderRadius: 4, background: `${mt.accent}1c`, transition: T }} />

      {/* Bed */}
      <div style={abs(mt.surfaceBorder, { bottom: FH + 82, left: 88, width: 248, height: 36, borderRadius: '4px 4px 0 0', opacity: 0.78 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH,      left: 88, width: 248, height: 84, opacity: 0.38 })} />
      <div style={{ position: 'absolute', bottom: FH, left: 88, width: 248, height: 68, background: `${mt.accent}24`, transition: T, borderRadius: '0 0 2px 2px' }} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 60, left: 102, width: 78, height: 26, borderRadius: 4, opacity: 0.68 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 60, left: 238, width: 78, height: 26, borderRadius: 4, opacity: 0.68 })} />

      {/* Nightstand + lamp */}
      <div style={abs(mt.surfaceBorder, { bottom: FH, left: 346, width: 46, height: 50, opacity: 0.48, borderRadius: 3 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 50, left: 358, width: 3, height: 28, opacity: 0.65 })} />
      <div style={abs(mt.surfaceBorder, { bottom: FH + 74, left: 349, width: 20, height: 8, borderRadius: '50%', opacity: 0.78 })} />
      <div style={{ position: 'absolute', bottom: FH + 28, left: 330, width: 62, height: 55, borderRadius: '50%', background: `radial-gradient(circle, ${mt.accent}48 0%, transparent 68%)`, transition: T }} />

      {/* Labels */}
      <div style={{ position: 'absolute', top: 13, left: WW + 12, fontSize: 10, fontWeight: 700, color: mt.textSoft, letterSpacing: '0.1em', textTransform: 'uppercase', transition: T }}>Bedroom</div>
      <div style={{ position: 'absolute', bottom: 13, right: 14, fontSize: 12, fontWeight: 700, color: mt.accent, transition: T }}>{moodName}</div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(t) {
  return {
    page:           { minHeight: '100vh', background: t.bg, color: t.text },
    nav:            { background: t.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.navBorder}`, position: 'sticky', top: 0, zIndex: 100 },
    navInner:       { maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:           { display: 'flex', alignItems: 'center', gap: 10 },
    navLink:        { fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 10px', borderRadius: 6 },
    navCta:         { padding: '8px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    heroText:       { position: 'relative', overflow: 'hidden', padding: '72px 40px 56px', textAlign: 'center' },
    heroOrb:        { position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`, pointerEvents: 'none' },
    eyebrow:        { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18 },
    heroTitle:      { fontSize: 56, fontWeight: 800, color: t.text, lineHeight: 1.08, marginBottom: 20, fontFamily: 'Georgia, "Times New Roman", serif' },
    heroSub:        { fontSize: 17, color: t.textSoft, lineHeight: 1.6, marginBottom: 32 },
    heroCta:        { padding: '14px 28px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    browseCta:      { padding: '14px 28px', background: 'transparent', color: t.accent, border: `1.5px solid ${t.accent}`, borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    heroNote:       { fontSize: 11, color: t.textSoft, marginTop: 14 },
    showcase:       { background: '#07070d', padding: '52px 40px 32px', borderTop: `1px solid rgba(255,255,255,0.05)` },
    showcaseInner:  { maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 28, justifyContent: 'center' },
    showcaseHint:   { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 22, letterSpacing: '0.05em' },
    moodStrip:      { borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}`, overflowX: 'auto', padding: '0 40px', scrollbarWidth: 'none' },
    moodStripInner: { display: 'flex', gap: 8, padding: '12px 0', maxWidth: 1100, margin: '0 auto' },
    moodPill:       { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
    section:        { padding: '64px 40px' },
    inner:          { maxWidth: 1100, margin: '0 auto' },
    sectionTitle:   { fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 36 },
    featGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 },
    featCard:       { display: 'flex', flexDirection: 'column', gap: 10, padding: '24px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16 },
    stepsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 },
    stepCard:       { display: 'flex', flexDirection: 'column' },
    outdoorBand:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 },
  }
}
