import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { MOODS } from '@shared/useMood'
import { MOOD_THEMES } from '@shared/themes'
import MoodPicker from '@shared/MoodPicker'
import { supabase } from '@shared/supabase'
import { LivingRoom, Bedroom } from './LandingRooms'

const SHARE_URL  = 'https://daydreamdwelling.com'
const SHARE_TEXT = 'Just joined the waitlist for DaydreamDwelling ✦ A 3D room builder where you can actually buy the furniture you place — from independent sellers.'

const FEATURES = [
  { icon: '◈', title: '3D room builder',    text: 'Place furniture, adjust walls, switch lighting moods — all in real time.' },
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

  const [idxA, setIdxA]               = useState(0)
  const [idxB, setIdxB]               = useState(7)
  const [email, setEmail]             = useState('')
  const [joined, setJoined]           = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [waitlistErr, setWaitlistErr] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(null)
  const [copied, setCopied]           = useState(false)

  useEffect(() => {
    const a = setInterval(() => setIdxA(i => (i + 1) % MOODS.length), 4000)
    const b = setInterval(() => setIdxB(i => (i + 1) % MOODS.length), 5300)
    return () => { clearInterval(a); clearInterval(b) }
  }, [])

  useEffect(() => {
    supabase.rpc('get_waitlist_count')
      .then(({ data }) => { if (data) setWaitlistCount(Number(data)) })
  }, [])

  const mtA = MOOD_THEMES[MOODS[idxA].key]
  const mtB = MOOD_THEMES[MOODS[idxB].key]

  async function handleWaitlist(e) {
    e.preventDefault()
    if (!email.trim() || submitting) return
    setSubmitting(true); setWaitlistErr('')
    const { error } = await supabase.from('waitlist').insert({ email: email.trim() })
    setSubmitting(false)
    if (!error || error.code === '23505') {
      setJoined(true)
      setWaitlistCount(c => (c ?? 0) + 1)
    } else {
      setWaitlistErr('Something went wrong. Try again.')
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(SHARE_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div style={s.page}>
      <style>{WISPY_KEYFRAMES}</style>

      {/* ── Nav ── */}
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

      {/* ── Hero ── */}
      <div style={s.heroWrap}>
        <div style={s.heroOrb} />
        <div style={s.heroInner}>

          {/* Left: text */}
          <div style={s.heroLeft}>
            <p style={s.eyebrow}>Free 3D Room Builder</p>
            <h1 style={s.heroTitle}>Design the room<br />you've been<br />dreaming of.</h1>
            <p style={s.heroSub}>Build your space in 3D. Set the perfect mood.<br />Buy the real furniture from independent sellers.</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={s.heroCta} onClick={onEnter}>Start building — it's free →</button>
              <button style={s.browseCta} onClick={onEnter}>Browse Shop →</button>
            </div>
            <p style={s.heroNote}>No account needed · 13 lighting moods · Real items from real sellers</p>
          </div>

          {/* Right: animated room */}
          <div style={s.heroRight}>
            <div style={{ position: 'relative' }}>
              <LivingRoom mt={mtA} moodName={MOODS[idxA].key} width={420} height={320} />
              <div style={s.heroRoomBadge}>
                <span style={{ color: mtA.accent, transition: 'color 1s ease' }}>✦</span>
                &nbsp;Mood: <strong style={{ color: mtA.accent, transition: 'color 1s ease' }}>{MOODS[idxA].key}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mood strip ── */}
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

      {/* ── Bedroom showcase ── */}
      <div style={s.showcase}>
        <Bedroom mt={mtB} moodName={MOODS[idxB].key} width={420} height={320} />
        <div style={s.showcaseText}>
          <p style={s.eyebrow}>Every room. Every mood.</p>
          <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>Your whole home,<br />designed in 3D.</h2>
          <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.8, marginBottom: 24 }}>
            Start with one room and expand into a full house. Each room has its own layout, lighting, and style — connected by doors you can walk through.
          </p>
          <button style={s.heroCta} onClick={onEnter}>Try the builder →</button>
        </div>
      </div>

      {/* ── Wispy teaser ── */}
      <div style={s.wispySection}>
        <div style={s.wispyInner}>
          <div style={s.wispyCloud}>☁</div>
          <p style={{ ...s.eyebrow, color: '#c0a8ff' }}>Coming soon</p>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#f0eaff', marginBottom: 12, letterSpacing: '-0.5px' }}>Meet Wispy</h2>
          <p style={{ fontSize: 15, color: '#a090c8', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 20px' }}>
            Your personal design companion. She guides you through your first room, cheers you on at milestones, and occasionally suggests that yes — that throw pillow does tie the whole room together.
          </p>
          <span style={s.wispyBadge}>Available at launch · No extra cost</span>
        </div>
      </div>

      {/* ── Features ── */}
      <div style={s.section}>
        <div style={s.inner}>
          <h2 style={{ ...s.sectionTitle, textAlign: 'center', marginBottom: 36 }}>Everything in one place</h2>
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

      {/* ── How it works ── */}
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

      {/* ── Waitlist ── */}
      <div style={s.waitlistSection}>
        <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center' }}>
          <p style={s.eyebrow}>Early access</p>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: t.text, marginBottom: 10, letterSpacing: '-0.5px' }}>
            Be among the first<br />through the door.
          </h2>
          <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 8 }}>
            New sellers, builder features, and exclusive mood drops — straight to your inbox.
          </p>
          {waitlistCount > 0 && (
            <p style={{ fontSize: 13, color: t.accent, fontWeight: 600, marginBottom: 24 }}>
              ✦ {waitlistCount.toLocaleString()} {waitlistCount === 1 ? 'dreamer' : 'dreamers'} already on the list
            </p>
          )}
          {!waitlistCount && <div style={{ marginBottom: 24 }} />}

          {joined ? (
            <div style={s.joinedWrap}>
              <p style={{ fontSize: 20, color: t.accent, fontWeight: 700, margin: '0 0 6px' }}>You're on the list. ✦</p>
              <p style={{ fontSize: 13, color: t.textSoft, margin: '0 0 24px' }}>We'll be in touch. Share DaydreamDwelling with someone who'd love it:</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={s.shareBtn}
                >𝕏 Share on X</a>
                <a
                  href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(SHARE_URL)}&description=${encodeURIComponent(SHARE_TEXT)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ ...s.shareBtn, background: '#e60023', borderColor: '#e60023' }}
                >📌 Pin it</a>
                <button style={{ ...s.shareBtn, background: copied ? '#4a7a5a' : 'transparent', borderColor: copied ? '#4a7a5a' : t.surfaceBorder, color: copied ? '#a0e0b0' : t.textSoft }}
                  onClick={copyLink}>
                  {copied ? '✓ Copied!' : '🔗 Copy link'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', width: '100%', maxWidth: 440 }}>
                <input
                  style={s.waitlistInput}
                  type="email" placeholder="your@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
                <button type="submit" style={{ ...s.heroCta, opacity: submitting ? 0.6 : 1 }} disabled={submitting}>
                  {submitting ? '…' : 'Join →'}
                </button>
              </div>
              {waitlistErr && <p style={{ fontSize: 12, color: '#e57373', margin: 0 }}>{waitlistErr}</p>}
              <p style={{ fontSize: 11, color: t.textSoft, margin: 0 }}>No spam, ever. Unsubscribe any time.</p>
            </form>
          )}
        </div>
      </div>

      {/* ── Outdoor CTA ── */}
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

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 40px', borderTop: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, textAlign: 'center' }}>
        © 2025 DaydreamDwelling &nbsp;·&nbsp; <span style={{ color: t.accent }}>daydreamdwelling.com</span>
        &nbsp;·&nbsp; <a href="/outdoor" style={{ color: t.textSoft, textDecoration: 'none' }}>Outdoor Shop</a>
        &nbsp;·&nbsp; <a href="mailto:hello@daydreamdwelling.com" style={{ color: t.textSoft, textDecoration: 'none' }}>Contact</a>
      </footer>
    </div>
  )
}

const WISPY_KEYFRAMES = `
  @keyframes wispyFloat {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-14px) scale(1.04); }
  }
`

function makeStyles(t) {
  return {
    page:           { minHeight: '100vh', background: t.bg, color: t.text },
    nav:            { background: t.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.navBorder}`, position: 'sticky', top: 0, zIndex: 100 },
    navInner:       { maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo:           { display: 'flex', alignItems: 'center', gap: 10 },
    navLink:        { fontSize: 13, fontWeight: 500, textDecoration: 'none', padding: '6px 10px', borderRadius: 6 },
    navCta:         { padding: '8px 18px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
    heroWrap:       { position: 'relative', overflow: 'hidden', padding: '72px 40px 64px' },
    heroOrb:        { position: 'absolute', top: -120, left: '30%', width: 700, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`, pointerEvents: 'none' },
    heroInner:      { maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, position: 'relative', zIndex: 1 },
    heroLeft:       { flex: '1 1 0', minWidth: 0 },
    heroRight:      { flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 12 },
    heroRoomBadge:  { position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#e0d9ff', border: '1px solid rgba(255,255,255,0.08)' },
    eyebrow:        { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16, marginTop: 0 },
    heroTitle:      { fontSize: 58, fontWeight: 800, color: t.text, lineHeight: 1.06, marginBottom: 20, marginTop: 0, fontFamily: 'Georgia, "Times New Roman", serif' },
    heroSub:        { fontSize: 16, color: t.textSoft, lineHeight: 1.7, marginBottom: 28, marginTop: 0 },
    heroCta:        { padding: '13px 26px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    browseCta:      { padding: '13px 26px', background: 'transparent', color: t.accent, border: `1.5px solid ${t.accent}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    heroNote:       { fontSize: 11, color: t.textSoft, marginTop: 14 },
    moodStrip:      { borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}`, overflowX: 'auto', padding: '0 40px', scrollbarWidth: 'none' },
    moodStripInner: { display: 'flex', gap: 8, padding: '12px 0', maxWidth: 1160, margin: '0 auto' },
    moodPill:       { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
    showcase:       { maxWidth: 1160, margin: '0 auto', padding: '72px 40px', display: 'flex', alignItems: 'center', gap: 60 },
    showcaseText:   { flex: '1 1 0', minWidth: 0 },
    wispySection:   { background: 'linear-gradient(160deg, #0d0a1e 0%, #1a0e30 50%, #0d0a1e 100%)', borderTop: `1px solid rgba(154,122,238,0.2)`, borderBottom: `1px solid rgba(154,122,238,0.2)`, padding: '80px 40px', textAlign: 'center' },
    wispyInner:     { maxWidth: 580, margin: '0 auto' },
    wispyCloud:     { fontSize: 72, lineHeight: 1, marginBottom: 20, display: 'block', animation: 'wispyFloat 3.5s ease-in-out infinite' },
    wispyBadge:     { display: 'inline-block', padding: '6px 16px', background: 'rgba(154,122,238,0.12)', border: '1px solid rgba(154,122,238,0.3)', borderRadius: 20, fontSize: 12, color: '#9a7aee', fontWeight: 600 },
    section:        { padding: '72px 40px' },
    inner:          { maxWidth: 1160, margin: '0 auto' },
    sectionTitle:   { fontSize: 30, fontWeight: 800, color: t.text, marginBottom: 36, marginTop: 0 },
    featGrid:       { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
    featCard:       { display: 'flex', flexDirection: 'column', gap: 10, padding: '24px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16 },
    stepsGrid:      { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 },
    stepCard:       { display: 'flex', flexDirection: 'column' },
    waitlistSection:{ padding: '88px 40px', textAlign: 'center' },
    waitlistInput:  { flex: 1, padding: '13px 16px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none' },
    joinedWrap:     { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    shareBtn:       { padding: '10px 18px', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
    outdoorBand:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 },
  }
}
