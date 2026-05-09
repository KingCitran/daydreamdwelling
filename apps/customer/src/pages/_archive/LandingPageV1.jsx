import { useState, useEffect } from 'react'
import { useTheme } from '@shared/ThemeProvider'
import { MOODS } from '@shared/useMood'
import { MOOD_THEMES } from '@shared/themes'
import MoodPicker from '@shared/MoodPicker'
import { supabase } from '@shared/supabase'
import { LivingRoom, Bedroom, BlankRoom } from '../LandingRooms'
import DesignerLeaderboard from '../DesignerLeaderboard'
import RaindropIcon from '@shared/RaindropIcon'
import Logo from '@shared/Logo'
import HeroMusic from '../HeroMusic'

const SHARE_URL  = 'https://daydreamdwelling.com'
const SHARE_TEXT = 'Just joined the waitlist for DaydreamDwelling ✦ A 3D room builder where you can actually buy the furniture you place — from independent sellers.'
const BLOSSOMS_URL = 'https://daydreamblossoms.com'

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

const ROOM_CAROUSEL = [
  { Room: BlankRoom, mood: 'Golden Hour' },
  { Room: BlankRoom, mood: 'Moonlight' },
  { Room: BlankRoom, mood: 'Dream State' },
  { Room: BlankRoom, mood: 'Cottagecore Dawn' },
  { Room: BlankRoom, mood: 'Neon Nights' },
  { Room: BlankRoom, mood: 'Coastal Morning' },
  { Room: BlankRoom, mood: 'Vivid Sunset' },
  { Room: BlankRoom, mood: 'Dark Academia' },
]
// LivingRoom/Bedroom imported for showcase section below
void LivingRoom; void Bedroom;

export default function LandingPage({ onEnter, onBrowseShop }) {
  const t = useTheme()
  const s = makeStyles(t)

  const [carIdx, setCarIdx]            = useState(0)
  const [carPaused, setCarPaused]      = useState(false)
  const [idxB, setIdxB]               = useState(7)
  const [email, setEmail]             = useState('')
  const [joined, setJoined]           = useState(false)
  const [submitting, setSubmitting]   = useState(false)
  const [waitlistErr, setWaitlistErr] = useState('')
  const [waitlistCount, setWaitlistCount] = useState(null)
  const [copied, setCopied]           = useState(false)
  const [featuredRoom, setFeaturedRoom] = useState(null)

  useEffect(() => {
    const a = setInterval(() => { if (!carPaused) setCarIdx(i => (i + 1) % ROOM_CAROUSEL.length) }, 6000)
    const b = setInterval(() => setIdxB(i => (i + 1) % MOODS.length), 5300)
    return () => { clearInterval(a); clearInterval(b) }
  }, [carPaused])

  useEffect(() => {
    supabase
      .from('community_posts')
      .select('*, profiles(display_name, avatar_url, designer_tier)')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setFeaturedRoom(data[0]) })
  }, [])

  useEffect(() => {
    supabase.rpc('get_waitlist_count')
      .then(({ data }) => { if (data) setWaitlistCount(Number(data)) })
  }, [])

  const carItem = ROOM_CAROUSEL[carIdx]
  const mtA = MOOD_THEMES[carItem.mood]
  const mtB = MOOD_THEMES[MOODS[idxB].key]
  const CarRoom = carItem.Room

  function carPrev() { setCarIdx(i => (i - 1 + ROOM_CAROUSEL.length) % ROOM_CAROUSEL.length) }
  function carNext() { setCarIdx(i => (i + 1) % ROOM_CAROUSEL.length) }

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
            <Logo size={28} color={t.accent} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.text, lineHeight: 1.2, fontFamily: "'Outfit', system-ui, sans-serif" }}>DaydreamDwelling</div>
              <div style={{ fontSize: 9, color: t.textSoft, letterSpacing: '0.5px' }}>Room Builder</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <MoodPicker />
            <a href="/community" className="ddd-landing-nav-outdoor" style={{ ...s.navLink, color: t.accent }}>Community ✦</a>
            <a href={BLOSSOMS_URL} className="ddd-landing-nav-outdoor" style={{ ...s.navLink, color: t.textSoft }}>Daydream Blossoms ✿</a>
            <button style={s.navCta} onClick={onEnter}>Open Builder →</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="ddd-landing-hero-wrap">
        <div style={s.heroOrb} />
        <div className="ddd-landing-hero">

          {/* Left: text */}
          <div className="ddd-landing-hero-left">
            <p style={s.eyebrow}>Free 3D Room Builder</p>
            <h1 className="ddd-landing-hero-title" style={{ color: t.text }}>Design the room<br />you've been<br />dreaming of.</h1>
            <p className="ddd-landing-hero-sub" style={s.heroSub}>Build your space in 3D. Set the perfect mood.<br />Buy the real furniture from independent sellers.</p>
            <div className="ddd-landing-hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button style={s.heroCta} onClick={onEnter}>Start building — it's free →</button>
              <button style={s.browseCta} onClick={onBrowseShop}>Browse Shop →</button>
            </div>
            <p style={s.heroNote}>No account needed · 13 lighting moods · Real items from real sellers</p>
          </div>

          {/* Right: room carousel with sidewinder arrows */}
          <div className="ddd-landing-hero-right">
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={carPrev} style={s.carouselArrow} aria-label="Previous room">‹</button>
              <div
                onClick={onEnter}
                style={{ position: 'relative', cursor: 'pointer', transition: 'transform 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <CarRoom mt={mtA} moodName={carItem.mood} width={420} height={320} />
                <div onClick={e => e.stopPropagation()}>
                  <HeroMusic mood={carItem.mood} accent={mtA.accent} />
                </div>
                <div style={s.heroRoomBadge}>
                  <span style={{ color: mtA.accent, transition: 'color 1s ease' }}>✦</span>
                  &nbsp;Mood: <strong style={{ color: mtA.accent, transition: 'color 1s ease' }}>{carItem.mood}</strong>
                </div>
                {/* Click to enter hint */}
                <div style={{
                  position: 'absolute', bottom: 14, right: 14,
                  background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
                  borderRadius: 20, padding: '6px 14px',
                  fontSize: 11, color: '#fff', fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                  pointerEvents: 'none',
                }}>
                  ✦ Click to step inside
                </div>
              </div>
              <button onClick={carNext} style={s.carouselArrow} aria-label="Next room">›</button>
            </div>
            {/* Dot indicators + pause */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {ROOM_CAROUSEL.map((_, i) => (
                  <button key={i} onClick={() => setCarIdx(i)} style={{
                    width: i === carIdx ? 20 : 7, height: 7, borderRadius: 4, border: 'none', padding: 0,
                    background: i === carIdx ? mtA.accent : `${t.textSoft}40`,
                    cursor: 'pointer', transition: 'all 0.3s ease',
                  }} />
                ))}
              </div>
              <button
                onClick={() => setCarPaused(p => !p)}
                title={carPaused ? 'Resume auto-rotate' : 'Pause auto-rotate'}
                style={{
                  marginLeft: 6, width: 24, height: 24, borderRadius: '50%',
                  background: 'transparent', border: `1px solid ${t.surfaceBorder}`,
                  color: t.textSoft, fontSize: 10, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >{carPaused ? '▶' : '❚❚'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mood strip ── */}
      <div style={s.moodStrip}>
        <div style={s.moodStripInner}>
          {MOODS.map((m, i) => {
            const mc = MOOD_THEMES[m.key]
            const active = m.key === carItem.mood || i === idxB
            return (
              <button key={m.key} onClick={() => { const ci = ROOM_CAROUSEL.findIndex(r => r.mood === m.key); if (ci >= 0) setCarIdx(ci) }} style={{
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

      {/* ── Daily Featured Room ── */}
      {featuredRoom && (
        <div className="ddd-landing-section" style={{ borderBottom: `1px solid ${t.surfaceBorder}` }}>
          <div style={s.inner}>
            <p style={s.eyebrow}>Today's featured room</p>
            <h2 style={{ ...s.sectionTitle, marginBottom: 20 }}>
              {featuredRoom.title || 'Community Spotlight'}
            </h2>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              {featuredRoom.screenshot_url && (
                <img
                  src={featuredRoom.screenshot_url}
                  alt={featuredRoom.title || 'Featured room'}
                  style={{ width: '100%', maxWidth: 520, borderRadius: 14, border: `1px solid ${t.surfaceBorder}` }}
                  loading="lazy"
                />
              )}
              <div style={{ flex: 1, minWidth: 200 }}>
                {featuredRoom.description && (
                  <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, marginBottom: 16 }}>
                    {featuredRoom.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  {featuredRoom.profiles?.avatar_url && (
                    <img src={featuredRoom.profiles.avatar_url} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <span style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>
                    {featuredRoom.profiles?.display_name || 'Designer'}
                  </span>
                  <span style={{ fontSize: 12, color: t.textSoft, display: 'flex', alignItems: 'center', gap: 3 }}>
                    💧 {featuredRoom.heart_count ?? 0} raindrops
                  </span>
                </div>
                <button style={s.heroCta} onClick={onEnter}>Explore in the builder →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Bedroom showcase ── */}
      <div className="ddd-landing-showcase-wrap">
        <div className="ddd-landing-showcase">
          <Bedroom mt={mtB} moodName={MOODS[idxB].key} width={420} height={320} />
          <div className="ddd-landing-showcase-text">
            <p style={s.eyebrow}>Every room. Every mood.</p>
            <h2 style={{ ...s.sectionTitle, marginBottom: 16 }}>Your whole home,<br />designed in 3D.</h2>
            <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.8, marginBottom: 24 }}>
              Start with one room and expand into a full house. Each room has its own layout, lighting, and style — connected by doors you can walk through.
            </p>
            <button style={s.heroCta} onClick={onEnter}>Try the builder →</button>
          </div>
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
      <div className="ddd-landing-section">
        <div style={s.inner}>
          <h2 style={{ ...s.sectionTitle, textAlign: 'center', marginBottom: 36 }}>Everything in one place</h2>
          <div className="ddd-landing-feat-grid">
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
      <div className="ddd-landing-section" style={{ background: t.surface, borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}` }}>
        <div style={s.inner}>
          <h2 style={s.sectionTitle}>How it works</h2>
          <div className="ddd-landing-steps-grid">
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

      {/* ── Designer Leaderboard ── */}
      <div className="ddd-landing-section">
        <div style={{ ...s.inner, maxWidth: 640 }}>
          <DesignerLeaderboard compact />
        </div>
      </div>

      {/* ── Waitlist ── */}
      <div className="ddd-landing-waitlist-wrap">
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

      {/* ── Daydream Blossoms CTA ── */}
      <div className="ddd-landing-section" style={{ borderTop: `1px solid ${t.surfaceBorder}` }}>
        <div style={s.inner}>
          <div className="ddd-landing-outdoor">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>Also from DaydreamDwelling</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: t.text, marginBottom: 6 }}>Daydream Blossoms ✿</h2>
              <p style={{ fontSize: 13, fontWeight: 600, color: t.accent, letterSpacing: '0.5px', marginBottom: 10 }}>Outdoor & Garden</p>
              <p style={{ fontSize: 14, color: t.textSoft, lineHeight: 1.7, maxWidth: 440 }}>Soil, sun, and yard planning — plus curated outdoor furniture, planters, and decor from independent makers.</p>
            </div>
            <a href={BLOSSOMS_URL} style={{ ...s.heroCta, textDecoration: 'none', flexShrink: 0, display: 'inline-block' }}>Visit Daydream Blossoms →</a>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px 40px', borderTop: `1px solid ${t.surfaceBorder}`, color: t.textSoft, fontSize: 12, textAlign: 'center' }}>
        © {new Date().getFullYear()} DaydreamDwelling &nbsp;·&nbsp; <span style={{ color: t.accent }}>daydreamdwelling.com</span>
        &nbsp;·&nbsp; <a href={BLOSSOMS_URL} style={{ color: t.textSoft, textDecoration: 'none' }}>Daydream Blossoms</a>
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
    heroOrb:        { position: 'absolute', top: -120, left: '30%', width: 700, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 65%)`, pointerEvents: 'none' },
    heroRoomBadge:  { position: 'absolute', bottom: 14, left: 14, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '5px 12px', fontSize: 12, color: '#e0d9ff', border: '1px solid rgba(255,255,255,0.08)' },
    carouselArrow:  { width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', color: '#e0d9ff', fontSize: 22, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, border-color 0.2s', flexShrink: 0, lineHeight: 1 },
    eyebrow:        { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16, marginTop: 0 },
    heroSub:        { fontSize: 16, color: t.textSoft, lineHeight: 1.7, marginBottom: 28, marginTop: 0 },
    heroCta:        { padding: '13px 26px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    browseCta:      { padding: '13px 26px', background: 'transparent', color: t.accent, border: `1.5px solid ${t.accent}`, borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' },
    heroNote:       { fontSize: 11, color: t.textSoft, marginTop: 14 },
    moodStrip:      { borderTop: `1px solid ${t.surfaceBorder}`, borderBottom: `1px solid ${t.surfaceBorder}`, overflowX: 'auto', padding: '0 40px', scrollbarWidth: 'none' },
    moodStripInner: { display: 'flex', gap: 8, padding: '12px 0', maxWidth: 1160, margin: '0 auto' },
    moodPill:       { display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease' },
    wispySection:   { background: 'linear-gradient(160deg, #0d0a1e 0%, #1a0e30 50%, #0d0a1e 100%)', borderTop: `1px solid rgba(154,122,238,0.2)`, borderBottom: `1px solid rgba(154,122,238,0.2)`, padding: '80px 40px', textAlign: 'center' },
    wispyInner:     { maxWidth: 580, margin: '0 auto' },
    wispyCloud:     { fontSize: 72, lineHeight: 1, marginBottom: 20, display: 'block', animation: 'wispyFloat 3.5s ease-in-out infinite' },
    wispyBadge:     { display: 'inline-block', padding: '6px 16px', background: 'rgba(154,122,238,0.12)', border: '1px solid rgba(154,122,238,0.3)', borderRadius: 20, fontSize: 12, color: '#9a7aee', fontWeight: 600 },
    inner:          { maxWidth: 1160, margin: '0 auto' },
    sectionTitle:   { fontSize: 30, fontWeight: 800, color: t.text, marginBottom: 36, marginTop: 0 },
    featCard:       { display: 'flex', flexDirection: 'column', gap: 10, padding: '24px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16 },
    stepCard:       { display: 'flex', flexDirection: 'column' },
    waitlistInput:  { flex: 1, padding: '13px 16px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, color: t.text, fontSize: 14, outline: 'none' },
    joinedWrap:     { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    shareBtn:       { padding: '10px 18px', background: t.accent, color: t.accentText, border: `1px solid ${t.accent}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
  }
}
