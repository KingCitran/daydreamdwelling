import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { MOODS } from '@shared/useMood'
import { MOOD_THEMES } from '@shared/themes'
import MoodPicker from '@shared/MoodPicker'

const FEATURES = [
  { icon: '◈', title: '3D room builder',   text: 'Place furniture, adjust walls, switch lighting moods — all in real time.' },
  { icon: '✦', title: 'Buy what you place', text: 'Every item in the builder links directly to its seller. One click to cart.' },
  { icon: '◉', title: '13 mood presets',    text: 'From golden hour warmth to moonlit calm — find the light that fits your life.' },
]

const STEPS = [
  { n: '01', title: 'Set your room dimensions', text: 'Choose width, depth, and wall height. Add windows, doors, and arches.' },
  { n: '02', title: 'Furnish and style',         text: 'Browse the catalogue. Drag furniture in. Adjust paint, floors, and ceiling.' },
  { n: '03', title: 'Buy it in the real world',  text: 'When your room feels right, add pieces to cart and check out directly with the seller.' },
]

export default function LandingPage({ onEnter }) {
  const t = useTheme()
  const s = makeStyles(t)
  const [moodIdx, setMoodIdx] = useState(0)
  const [email,   setEmail]   = useState('')
  const [joined,  setJoined]  = useState(false)

  useEffect(() => {
    const id = setInterval(() => setMoodIdx(i => (i + 1) % MOODS.length), 3000)
    return () => clearInterval(id)
  }, [])

  const activeMood = MOODS[moodIdx]
  const mt = MOOD_THEMES[activeMood.key]

  return (
    <div style={s.page}>

      {/* ── Nav ─────────────────────────────────────────────── */}
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

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <p style={s.eyebrow}>Free 3D Room Builder</p>
            <h1 style={s.heroTitle}>Design the room<br />you've been dreaming of.</h1>
            <p style={s.heroSub}>
              Build your space in 3D, set the perfect mood lighting,
              then buy the real furniture — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={s.heroCta} onClick={onEnter}>Start building — it's free →</button>
            </div>
            <p style={s.heroNote}>No account needed to start.</p>
          </div>

          <div style={s.heroRight}>
            <MoodPreview activeMood={activeMood} mt={mt} moodIdx={moodIdx} onPick={setMoodIdx} />
          </div>
        </div>
      </div>

      {/* ── Mood strip ──────────────────────────────────────── */}
      <div style={s.moodStrip}>
        <div style={s.moodStripInner}>
          {MOODS.map((m, i) => {
            const mc = MOOD_THEMES[m.key]
            return (
              <button key={m.key} onClick={() => setMoodIdx(i)} style={{
                ...s.moodPill,
                background:   i === moodIdx ? `${mc.accent}1a` : 'transparent',
                border:       `1px solid ${i === moodIdx ? mc.accent : t.surfaceBorder}`,
                color:        i === moodIdx ? mc.accent : t.textSoft,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: mc.accent, flexShrink: 0, display: 'inline-block' }} />
                {m.key}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Features ────────────────────────────────────────── */}
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

      {/* ── How it works ────────────────────────────────────── */}
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

      {/* ── Waitlist ────────────────────────────────────────── */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={s.eyebrow}>Stay in the loop</p>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: t.text, marginBottom: 10 }}>Be first when new rooms arrive.</h2>
          <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 28 }}>New furniture collections, builder features, and mood drops — straight to your inbox.</p>
          {joined ? (
            <p style={{ fontSize: 18, color: t.accent, fontWeight: 700 }}>You're on the list. ✦</p>
          ) : (
            <form onSubmit={e => { e.preventDefault(); if (email.trim()) setJoined(true) }}
              style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <input
                style={{ flex: 1, maxWidth: 300, padding: '12px 16px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none' }}
                type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
              <button type="submit" style={s.heroCta}>Join →</button>
            </form>
          )}
        </div>
      </div>

      {/* ── Outdoor CTA ─────────────────────────────────────── */}
      <div style={{ ...s.section, borderTop: `1px solid ${t.surfaceBorder}` }}>
        <div style={s.inner}>
          <div style={s.outdoorBand}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Also from DaydreamDwelling</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 10 }}>Love your outdoor space too?</h2>
              <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, maxWidth: 440 }}>Browse curated outdoor furniture, planters, and decor from independent makers in our garden shop.</p>
            </div>
            <a href="/outdoor" style={{ ...s.heroCta, textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>Explore Outdoor Shop →</a>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer style={{ padding: '24px 40px', borderTop: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, textAlign: 'center' }}>
        © 2025 DaydreamDwelling · <span style={{ color: t.accent }}>Room Builder</span>
      </footer>

    </div>
  )
}

function MoodPreview({ activeMood, mt, moodIdx, onPick }) {
  return (
    <div style={{
      width: 360, height: 320, borderRadius: 20,
      background: mt.bg,
      border: `1px solid ${mt.surfaceBorder}`,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.9s ease, border-color 0.9s ease',
      flexShrink: 0,
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -60, right: -40, width: 300, height: 300,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${mt.glow} 0%, transparent 65%)`,
        transition: 'background 0.9s ease',
        pointerEvents: 'none',
      }} />

      {/* Mini CSS room ─────────────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 52, left: '50%', transform: 'translateX(-50%)', width: 280, height: 185 }}>
        {/* Back wall */}
        <div style={{ position: 'absolute', bottom: 48, left: 0, right: 0, height: 115,
          background: mt.navBg, transition: 'background 0.9s ease', borderRadius: '4px 4px 0 0' }} />
        {/* Left wall */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 44, height: 163,
          background: mt.surface, opacity: 0.85, transition: 'background 0.9s ease' }} />
        {/* Floor */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 50,
          background: mt.surface, transition: 'background 0.9s ease', borderRadius: '0 0 4px 4px' }} />
        {/* Sofa seat */}
        <div style={{ position: 'absolute', bottom: 50, left: '50%', transform: 'translateX(-40%)',
          width: 108, height: 26, background: mt.surfaceBorder,
          transition: 'background 0.9s ease', borderRadius: '4px 4px 0 0' }} />
        {/* Sofa back */}
        <div style={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-40%)',
          width: 108, height: 16, background: mt.surfaceBorder, opacity: 0.7,
          transition: 'background 0.9s ease', borderRadius: 4 }} />
        {/* Side table */}
        <div style={{ position: 'absolute', bottom: 50, right: 40, width: 24, height: 24,
          background: mt.surfaceBorder, opacity: 0.55,
          transition: 'background 0.9s ease', borderRadius: 3 }} />
        {/* Wall lamp glow */}
        <div style={{ position: 'absolute', bottom: 90, left: 52, width: 80, height: 55,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${mt.accent}44 0%, transparent 70%)`,
          transition: 'background 0.9s ease' }} />
        {/* Picture frame */}
        <div style={{ position: 'absolute', bottom: 108, right: 96, width: 38, height: 26,
          border: `2px solid ${mt.surfaceBorder}`,
          transition: 'border-color 0.9s ease', borderRadius: 2 }} />
      </div>

      {/* Mood label */}
      <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: mt.accent, transition: 'color 0.9s ease' }}>{activeMood.key}</span>
        <span style={{ fontSize: 11, color: mt.textSoft, marginLeft: 6, transition: 'color 0.9s ease' }}>mood</span>
      </div>

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 3 }}>
        {MOODS.map((_, i) => (
          <div key={i} onClick={() => onPick(i)} style={{
            width: i === moodIdx ? 14 : 5, height: 4, borderRadius: 2,
            background: i === moodIdx ? mt.accent : mt.surfaceBorder,
            transition: 'width 0.4s ease, background 0.9s ease',
            cursor: 'pointer',
          }} />
        ))}
      </div>
    </div>
  )
}

function makeStyles(t) {
  return {
    page:           { minHeight: '100vh', background: t.bg, color: t.text },
    nav:            { background: t.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.navBorder}`, position: 'sticky', top: 0, zIndex: 100 },
    navInner:       { maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:           { display: 'flex', alignItems: 'center', gap: 10 },
    navLink:        { fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 10px', borderRadius: 6 },
    navCta:         { padding: '8px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    hero:           { position: 'relative', overflow: 'hidden', padding: '80px 40px 100px' },
    heroOrb1:       { position: 'absolute', top: -60, right: 80, width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroOrb2:       { position: 'absolute', bottom: -40, left: 40, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroInner:      { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60 },
    heroLeft:       { flex: 1 },
    eyebrow:        { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18 },
    heroTitle:      { fontSize: 54, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 20, fontFamily: 'Georgia, "Times New Roman", serif' },
    heroSub:        { fontSize: 16, color: t.textSoft, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 },
    heroCta:        { padding: '14px 26px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    heroNote:       { fontSize: 11, color: t.textSoft, marginTop: 12 },
    heroRight:      { flexShrink: 0 },
    moodStrip:      { borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}`, overflowX: 'auto', padding: '0 40px', scrollbarWidth: 'none' },
    moodStripInner: { display: 'flex', gap: 8, padding: '12px 0', maxWidth: 1100, margin: '0 auto' },
    moodPill:       { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.02em', transition: 'all 0.2s ease' },
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
