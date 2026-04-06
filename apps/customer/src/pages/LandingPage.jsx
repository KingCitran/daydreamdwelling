import { useTheme } from '@shared/ThemeProvider'
import MoodPicker from '@shared/MoodPicker'

const FEATURES = [
  { icon: '◈', title: '3D room builder',       text: 'Place furniture, adjust walls, switch lighting moods — all in real time.' },
  { icon: '✦', title: 'Buy what you place',     text: 'Every item in the builder links directly to its seller. One click to cart.' },
  { icon: '◉', title: '12 mood presets',        text: 'From golden hour warmth to moonlit calm — find the light that fits your life.' },
]

const STEPS = [
  { n: '01', title: 'Set your room dimensions',  text: 'Choose width, depth, and wall height. Add windows, doors, and arches.' },
  { n: '02', title: 'Furnish and style',          text: 'Browse the catalogue. Drag furniture in. Adjust paint, floors, and ceiling.' },
  { n: '03', title: 'Buy it in the real world',  text: 'When your room feels right, add pieces to your cart and check out directly with the seller.' },
]

export default function LandingPage({ onEnter }) {
  const t = useTheme()
  const s = makeStyles(t)

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
            <a href="http://localhost:5175" target="_blank" rel="noreferrer" style={{ ...s.navLink, color: t.textSoft }}>Outdoor Shop</a>
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
              Build your space in 3D, find the perfect lighting mood,
              then buy the real furniture — all in one place.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button style={s.heroCta} onClick={onEnter}>Start building — it's free →</button>
            </div>
            <p style={s.heroNote}>No account needed to start.</p>
          </div>

          <div style={s.heroRight}>
            <div style={s.builderPreview}>
              <div style={s.previewOrb} />
              {/* Mini room illustration */}
              <div style={s.previewRoom}>
                <div style={s.previewFloor} />
                <div style={s.previewWallBack} />
                <div style={s.previewWallLeft} />
                <div style={{ position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)', fontSize: 52, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>🛋</div>
                <div style={{ position: 'absolute', bottom: 46, right: 52, fontSize: 28 }}>🪴</div>
                <div style={{ position: 'absolute', bottom: 46, left: 52, fontSize: 24 }}>🏮</div>
              </div>
              <div style={s.previewLabel}>
                <span style={{ color: t.accent, fontWeight: 700 }}>Golden Hour</span>
                <span style={{ color: t.textSoft, fontSize: 11 }}> mood active</span>
              </div>
            </div>
          </div>
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

      {/* ── Outdoor CTA ─────────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.inner}>
          <div style={s.outdoorBand}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Also from DaydreamDwelling</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 10 }}>Love your outdoor space too?</h2>
              <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, maxWidth: 440 }}>Browse curated outdoor furniture, planters, and decor from independent makers in our garden shop.</p>
            </div>
            <a href="http://localhost:5175" target="_blank" rel="noreferrer" style={{ ...s.heroCta, textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>Explore Outdoor Shop →</a>
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

function makeStyles(t) {
  return {
    page:         { minHeight: '100vh', background: t.bg, color: t.text },
    nav:          { background: t.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.navBorder}`, position: 'sticky', top: 0, zIndex: 100 },
    navInner:     { maxWidth: 1100, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:         { display: 'flex', alignItems: 'center', gap: 10 },
    navLink:      { fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 10px', borderRadius: 6 },
    navCta:       { padding: '8px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    hero:         { position: 'relative', overflow: 'hidden', padding: '80px 40px 100px' },
    heroOrb1:     { position: 'absolute', top: -60, right: 80, width: 440, height: 440, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroOrb2:     { position: 'absolute', bottom: -40, left: 40, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroInner:    { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60 },
    heroLeft:     { flex: 1 },
    eyebrow:      { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18 },
    heroTitle:    { fontSize: 54, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 20 },
    heroSub:      { fontSize: 16, color: t.textSoft, lineHeight: 1.7, marginBottom: 32, maxWidth: 480 },
    heroCta:      { padding: '14px 26px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    heroNote:     { fontSize: 11, color: t.textSoft, marginTop: 12 },
    heroRight:    { flexShrink: 0 },
    builderPreview: { width: 360, height: 300, borderRadius: 20, background: t.surface, border: `1px solid ${t.surfaceBorder}`, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    previewOrb:   { position: 'absolute', top: '10%', left: '10%', width: 240, height: 240, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    previewRoom:  { position: 'relative', width: 260, height: 200 },
    previewFloor: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, background: t.surfaceBorder, borderRadius: '0 0 8px 8px' },
    previewWallBack: { position: 'absolute', bottom: 48, left: 0, right: 0, height: 100, background: `${t.surfaceBorder}88`, borderRadius: '4px 4px 0 0' },
    previewWallLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 148, background: `${t.surfaceBorder}55`, borderRadius: '4px 0 0 4px' },
    previewLabel: { position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontSize: 12 },
    section:      { padding: '64px 40px' },
    inner:        { maxWidth: 1100, margin: '0 auto' },
    sectionTitle: { fontSize: 28, fontWeight: 700, color: t.text, marginBottom: 36 },
    featGrid:     { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 },
    featCard:     { display: 'flex', flexDirection: 'column', gap: 10, padding: '24px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16 },
    stepsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 },
    stepCard:     { display: 'flex', flexDirection: 'column' },
    outdoorBand:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 },
  }
}
