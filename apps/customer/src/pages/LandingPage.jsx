import { useState, useEffect } from 'react'
import { MOOD_THEMES } from '@shared/themes'
import { useMoodControl } from '@shared/ThemeProvider'
import { supabase } from '@shared/supabase'
import CloudField from './landing/CloudField'
import RotatingRoom from './landing/RotatingRoom'
import { ROOMS_WITH_BRAND as ENDLESS_ROOMS } from './landing/endlessRooms'
import { fetchPublishedRooms } from './landing/configToRooms'
import MoodSwatch from './landing/MoodSwatch'
import WispyArt from '@shared/wispy/art'

// "Above the clouds" sky palette — independent of mood. The mood-tinted glow
// (radial gradient over this base) is what shifts when the user picks a mood.
// Default Bright Day sky — used when current mood isn't one of the themed ones.
const SKY = {
  zenith:  '#3a6fb8',
  upper:   '#6a98d4',
  middle:  '#a8c8e4',
  horizon: '#ffe4c0',
  ink:     '#1a2a48',
  inkSoft: '#4a6890',
  accent:  '#ff9b5c',
  accentText: '#fff',
}

// Per-mood sky overrides — sync with SkyBackdrop.jsx so the landing sky
// matches whatever mood the clouds are themed to.
const SKY_BY_MOOD = {
  'Dream State':  { zenith: '#ffe8d0', upper: '#ffd8d0', middle: '#e8c8e0', horizon: '#a890d4', ink: '#3a1848' },
  'Golden Hour':  { zenith: '#5a2540', upper: '#b85a55', middle: '#e88a3e', horizon: '#ffe39a', ink: '#fff8e8' },
  'Moonlight':    { zenith: '#050918', upper: '#0c1530', middle: '#16203f', horizon: '#2a3868', ink: '#e8eef8' },
  'Blush Hour':   { zenith: '#ffe2cf', upper: '#ffc0b4', middle: '#f4b0c0', horizon: '#c8b8dc', ink: '#5a2848' },
  // Vivid Sunset: muted sky — clouds are the stars. Deep blue night-edge crown,
  // steel blue upper, pale blue-grey middle, warm honey lower, gold horizon.
  'Vivid Sunset': { zenith: '#1a2a5a', upper: '#4a5a8c', middle: '#a8b8d0', horizon: '#e8a040', ink: '#fff5d8' },
  // Coastal Morning: cool deep ocean-blue zenith → teal-blue upper → soft
  // sky blue middle → peachy-gold horizon. Fresh, sun rising at the horizon.
  'Coastal Morning': { zenith: '#2a5a8c', upper: '#5a8cb8', middle: '#a8c4d8', horizon: '#ffd896', ink: '#f0f5fa' },
  // Neon Nights: deep midnight purple with magenta horizon glow. Clouds are
  // lit by external neon — see MOOD_THEMES entry in CloudField.
  'Neon Nights':     { zenith: '#060318', upper: '#0c0828', middle: '#160e3a', horizon: '#2a1862', ink: '#e8d4ff' },
  // Greenhouse: warm spring green zenith fading to creamy yellow-white at
  // horizon, sun streaming through glass roof onto cream-green clouds.
  'Greenhouse':      { zenith: '#6cb87a', upper: '#a8d896', middle: '#e0e8b0', horizon: '#fff5d0', ink: '#2a4828' },
}

const FONTS = {
  display: "'EB Garamond', 'Cormorant Garamond', Georgia, serif",
  body:    "'Outfit', 'Inter', system-ui, sans-serif",
  hand:    "'Caveat', cursive",
}

const BLOSSOMS_URL = 'https://daydreamblossoms.com'

export default function LandingPage({ onEnter, onBrowseShop }) {
  const { mood, setMood, moods } = useMoodControl()
  const t = MOOD_THEMES[mood] || MOOD_THEMES['Bright Day']

  const [email, setEmail]                   = useState('')
  const [joined, setJoined]                 = useState(false)
  const [submitting, setSubmitting]         = useState(false)
  const [waitlistErr, setWaitlistErr]       = useState('')
  const [waitlistCount, setWaitlistCount]   = useState(null)
  const [activeRooms, setActiveRooms]        = useState(null)
  const rooms = activeRooms || ENDLESS_ROOMS
  const [roomState, setRoomState]            = useState(() => ({
    caption: ENDLESS_ROOMS[0], dark: ENDLESS_ROOMS[0].dark,
    sky: ENDLESS_ROOMS[0].sky, prevSky: ENDLESS_ROOMS[0].sky, skyKey: -1,
  }))

  // Fetch published admin config with live room data — fall back to hardcoded rooms
  useEffect(() => {
    fetchPublishedRooms()
      .then(r => setActiveRooms(r?.length > 0 ? r : ENDLESS_ROOMS))
      .catch(() => setActiveRooms(ENDLESS_ROOMS))
  }, [])

  // Sync mood to CloudField when the sky transitions
  useEffect(() => {
    if (roomState?.skyMood) setMood(roomState.skyMood)
  }, [roomState?.skyMood])

  useEffect(() => {
    supabase.rpc('get_waitlist_count').then(({ data }) => {
      if (data) setWaitlistCount(Number(data))
    })
  }, [])

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

  // Pull mood-specific sky if the current mood is themed; otherwise default Bright Day.
  const moodSky = SKY_BY_MOOD[mood]
  const sky = moodSky ? { ...SKY, ...moodSky } : SKY
  const skyBg = `linear-gradient(180deg, ${sky.zenith} 0%, ${sky.upper} 22%, ${sky.middle} 55%, ${sky.horizon} 92%, ${sky.horizon} 100%)`
  const moodGlow = `radial-gradient(ellipse 1200px 600px at 70% 25%, ${t.accent}33 0%, transparent 70%)`
  // Only show the dreamer count once it's a number we'd be proud to display.
  // Below the threshold (or while loading), hide the line — feels honest, not inflated.
  const showDreamerCount = waitlistCount != null && waitlistCount >= 25
  const dreamerCount = showDreamerCount ? waitlistCount.toLocaleString() : null

  // Hero text colors — flip to warm white for dark rooms
  const heroInk = roomState.dark ? '#f4eee2' : '#1a2a48'
  const heroAccent = '#ff9b5c'

  return (
    <div className="ddd-landing" style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      color: sky.ink, fontFamily: FONTS.body,
    }}>
      {/* Sky cross-fade — driven by the rotating room */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: roomState.prevSky }} />
        <div key={roomState.skyKey} style={{
          position: 'absolute', inset: 0, background: roomState.sky,
          animation: 'ddd-skyfade 8s ease-out both',
        }} />
      </div>
      <CloudField lite />

      {/* ── Nav ── */}
      <header className="ddd-blur" style={{
        position: 'sticky', top: 0, zIndex: 30,
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        background: 'rgba(255,255,255,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.6)',
      }}>
        <div style={{
          maxWidth: 1240, margin: '0 auto', padding: '12px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="36" height="26" viewBox="0 0 80 56" aria-hidden>
              <ellipse cx="40" cy="32" rx="32" ry="18" fill="#fff"/>
              <ellipse cx="22" cy="28" rx="14" ry="12" fill="#fff"/>
              <ellipse cx="56" cy="26" rx="16" ry="13" fill="#fff"/>
              <ellipse cx="40" cy="20" rx="12" ry="10" fill="#fff"/>
            </svg>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 500, color: sky.ink, lineHeight: 1, letterSpacing: '-0.5px' }}>
                Daydream<span style={{ fontStyle: 'italic', fontWeight: 400 }}>Dwelling</span>
              </div>
              <div style={{ fontSize: 11, color: sky.inkSoft, marginTop: 2, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                rooms in the sky
              </div>
            </div>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { label: 'community', href: '/community' },
              { label: 'blossoms',  href: BLOSSOMS_URL },
              { label: 'about',     href: '/?about=1' },
            ].map(l => (
              <a key={l.label} href={l.href} style={{
                padding: '10px 16px', cursor: 'pointer', borderRadius: 999,
                fontSize: 13, fontWeight: 500, color: sky.ink, textDecoration: 'none',
              }}>{l.label}</a>
            ))}
            <button onClick={onEnter} style={{
              marginLeft: 8, padding: '11px 22px', cursor: 'pointer',
              background: 'transparent', color: sky.ink,
              border: `1.5px solid ${sky.ink}33`,
              fontSize: 13, fontWeight: 600, borderRadius: 999,
              letterSpacing: '0.3px',
              transition: 'background 0.15s, border-color 0.15s',
            }}>open the builder →</button>
          </nav>
        </div>
      </header>

      {/* ── Hero — fits exactly in one viewport ── */}
      <section className="ddd-hero" style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1000, margin: '0 auto',
        padding: '0 24px',
        height: 'calc(100vh - 56px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        textAlign: 'center',
        gap: 0,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase',
          color: heroAccent, fontWeight: 600, marginTop: 20, marginBottom: 4,
          position: 'relative', zIndex: 20,
        }}>
          ✦ &nbsp;every room, in every light
        </div>
        <h1 className="ddd-hero-h1" style={{
          fontFamily: FONTS.display, fontSize: 'clamp(40px, 7vw, 72px)',
          fontWeight: 300, letterSpacing: '-3px', lineHeight: 0.9,
          margin: '0 0 8px', color: heroInk,
          transition: 'color 1.4s cubic-bezier(0.4,0,0.2,1)',
          position: 'relative', zIndex: 20,
        }}>
          The room that never<br /><em style={{ fontWeight: 400 }}>stops dreaming.</em>
        </h1>

        {/* Room — fills available space, camera zoom handles visual size */}
        <div style={{ width: '100%', height: 'clamp(220px, 52vh, 480px)', position: 'relative', zIndex: 10 }}>
          {activeRooms && <RotatingRoom onStateChange={setRoomState} rooms={activeRooms} />}
        </div>

        {/* Foreground cloud removed — it drifted in front of the room and looked bad */}

        <div key={roomState.caption.name} style={{
          marginTop: 2, position: 'relative', zIndex: 20,
          animation: 'ddd-fadeup 0.9s cubic-bezier(0.4,0,0.2,1) both',
        }}>
          <div style={{
            fontFamily: FONTS.display, fontStyle: 'italic',
            fontSize: 'clamp(22px, 3.2vw, 32px)', color: heroInk, lineHeight: 1.1,
            transition: 'color 1.4s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {roomState.caption.name}
          </div>
          <div style={{
            fontSize: 11, letterSpacing: '2px', textTransform: 'uppercase',
            fontWeight: 600, marginTop: 2, color: roomState.caption.accent,
          }}>
            {roomState.caption.mood} palette
          </div>
        </div>

        <div style={{ marginTop: 8, position: 'relative', zIndex: 20 }}>
          <button onClick={onEnter} style={{
            padding: '14px 28px', border: 'none', cursor: 'pointer',
            background: heroAccent, color: '#fff',
            fontSize: 15, fontWeight: 600, borderRadius: 999,
            letterSpacing: '0.3px',
            boxShadow: '0 8px 24px rgba(255,155,92,0.40)',
          }}>start building — it's free →</button>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section style={{ position: 'relative', maxWidth: 680, margin: '100px auto', padding: '0 40px', zIndex: 10 }}>
        <div className="ddd-blur" style={{
          background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          padding: 'clamp(28px, 4.5vw, 56px)', borderRadius: 32,
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 24px 60px rgba(120,150,200,0.2)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 11, color: sky.accent, letterSpacing: '2.5px',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 14,
          }}>✦  Early access  ✦</div>
          <h2 style={{
            fontFamily: FONTS.display, fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 300,
            letterSpacing: '-1.5px', lineHeight: 1.05, margin: '0 0 12px', color: sky.ink,
          }}>
            Be among the first<br/>
            <span style={{ fontStyle: 'italic', color: sky.accent }}>through the door.</span>
          </h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: sky.inkSoft, margin: '0 0 32px' }}>
            New makers, builder features, and the occasional mood drop —<br/>
            delivered to your inbox like a letter, not a newsletter.
          </p>
          {joined ? (
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 32, fontStyle: 'italic', color: sky.accent, marginBottom: 8 }}>
                you're on the list ✦
              </div>
              <div style={{ fontSize: 14, color: sky.inkSoft }}>we'll write soon.</div>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="ddd-waitlist-form" style={{ display: 'flex', gap: 8, maxWidth: 440, margin: '0 auto' }}>
              <input
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" type="email" required
                aria-label="Email address"
                className="ddd-waitlist-input"
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: 999,
                  border: '1.5px solid rgba(120,150,200,0.3)',
                  background: 'rgba(255,255,255,0.8)',
                  fontFamily: FONTS.body, fontSize: 15, color: sky.ink, outline: 'none',
                  transition: 'border-color 0.15s',
                }}/>
              <button type="submit" disabled={submitting} aria-busy={submitting} style={{
                padding: '14px 30px', border: 'none', cursor: submitting ? 'wait' : 'pointer',
                background: sky.accent, color: sky.accentText, borderRadius: 999,
                fontSize: 14, fontWeight: 600,
                boxShadow: `0 6px 18px ${sky.accent}55`,
                opacity: submitting ? 0.6 : 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>{submitting ? '…' : 'send →'}</button>
            </form>
          )}
          {waitlistErr && (
            <div style={{ fontSize: 12, color: '#c0383d', marginTop: 12 }}>{waitlistErr}</div>
          )}
          <div style={{ fontSize: 12, color: sky.inkSoft, marginTop: 20 }}>
            {dreamerCount ? `join ${dreamerCount} dreamers · no spam, ever` : 'no spam, ever'}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', maxWidth: 880, margin: '120px auto 80px', padding: '0 40px', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, color: sky.accent, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            ◈ How it works
          </div>
          <h2 style={{
            fontFamily: FONTS.display, fontSize: 'clamp(30px, 4.5vw, 54px)', fontWeight: 300,
            lineHeight: 1.05, letterSpacing: '-2px', margin: 0, color: sky.ink,
          }}>
            First you make a box.<br/>
            <span style={{ fontStyle: 'italic', color: sky.accent }}>Then you fill it with light.</span>
          </h2>
        </div>
        <div style={{ fontSize: 19, lineHeight: 1.85, color: sky.inkSoft, fontFamily: FONTS.body, fontWeight: 400 }}>
          {[
            { lead: 'You start with a box.',  body: " Width, depth, ceiling height. Add a window if you want one. Add three. We don't care." },
            { lead: 'Then you fill it.',      body: ' Drag in a chair. Try a rug. Move the lamp until the shadow falls right. Every piece is real — made by someone you can talk to.' },
            { lead: 'Switch the light.',      body: ' Golden hour. Moonlight. Dark Academia at 11pm. Your room exists in fourteen weathers — find the one that feels like home.' },
            { lead: "When it's right, you bring it home.", body: ' One cart. Direct to the maker. The chair shows up at your front door, and your room is no longer just a dream.' },
          ].map((p, i, all) => (
            <p key={i} style={{ margin: i === all.length - 1 ? 0 : '0 0 24px' }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 22, fontStyle: 'italic', color: sky.ink, fontWeight: 400 }}>
                {p.lead}
              </span>{p.body}
            </p>
          ))}
        </div>
      </section>

      {/* ── Founder note ── */}
      <section style={{ position: 'relative', maxWidth: 780, margin: '80px auto', padding: '0 40px', zIndex: 10 }}>
        <div className="ddd-blur" style={{
          background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 32, padding: 'clamp(28px, 4.5vw, 56px) clamp(24px, 5vw, 64px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 24px 60px rgba(120,150,200,0.18)',
        }}>
          <div style={{ fontSize: 11, color: sky.accent, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 20 }}>
            ✦  A note from the founder
          </div>
          <p style={{ fontFamily: FONTS.display, fontSize: 26, lineHeight: 1.55, fontWeight: 300, color: sky.ink, margin: '0 0 24px' }}>
            <span style={{ fontStyle: 'italic' }}>I made DaydreamDwelling</span> because every place
            I've ever lived felt a little wrong until I changed the light.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: sky.inkSoft, margin: '0 0 16px' }}>
            I wanted a place where you could try the lamp before you bought it. Where the
            chair you place in your room is the same chair the woodworker is finishing
            in her garage three states over. No middlemen. No catalogue stock photos.
            Just rooms, and the people who furnish them.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: sky.inkSoft, margin: '0 0 28px' }}>
            We're still small. Wispy is still learning. The shop is still filling up.
            But there's a doorway here, and we'd love it if you came in.
          </p>
          <div style={{ fontFamily: FONTS.hand, fontSize: 32, color: sky.accent, display: 'inline-block', lineHeight: 1 }}>
            — KingCitran
          </div>
        </div>
      </section>

      {/* ── Wispy ── */}
      <section style={{ position: 'relative', maxWidth: 1100, margin: '100px auto 80px', padding: '0 40px', zIndex: 10 }}>
        <div className="ddd-landing-wispy ddd-blur" style={{
          background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 36, padding: '64px 56px',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 24px 60px rgba(120,150,200,0.18)',
          display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 48, alignItems: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <WispyArt slot="happy" ink="dark" width={220} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: sky.accent, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              ◈ Meet your roommate
            </div>
            <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(34px, 5vw, 60px)', fontWeight: 300, letterSpacing: '-2px', lineHeight: 1, margin: '0 0 18px', color: sky.ink }}>
              Wispy<span style={{ color: sky.accent }}>.</span>
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: sky.inkSoft, margin: '0 0 24px', maxWidth: 480 }}>
              A small cloud who lives in the corners of the page. She helps you with your
              first room, cheers you on at milestones, and occasionally — only when she's{' '}
              <em style={{ color: sky.ink }}>really sure</em> — suggests that yes, that
              throw pillow does tie the room together.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['✦ lives in the builder', '✧ free, always'].map(l => (
                <span key={l} style={{
                  padding: '8px 16px', background: 'rgba(255,255,255,0.6)',
                  borderRadius: 999, fontSize: 13, color: sky.ink,
                  border: '1px solid rgba(255,255,255,0.8)',
                }}>{l}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mood swatches ── */}
      <section style={{ position: 'relative', maxWidth: 1240, margin: '80px auto 0', padding: '60px 40px', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 12, color: sky.accent, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
            ◈ Pick the light
          </div>
          <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 300, letterSpacing: '-1.5px', margin: '0 0 8px', color: sky.ink }}>
            <span style={{ fontStyle: 'italic' }}>{moods.length}</span> different weathers
          </h2>
          <p style={{ fontSize: 15, color: sky.inkSoft, margin: 0 }}>
            Click any to see it on this page.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', padding: '0 20px' }}>
          {moods.map(m => (
            <MoodSwatch key={m.key} moodKey={m.key} label={m.label}
              active={m.key === mood} onClick={() => setMood(m.key)} />
          ))}
        </div>
      </section>

      {/* ── Blossoms ── */}
      <section style={{ position: 'relative', maxWidth: 1100, margin: '100px auto 60px', padding: '0 40px', zIndex: 10 }}>
        <div className="ddd-blur" style={{
          background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 32, padding: 'clamp(28px, 4vw, 48px) clamp(20px, 5vw, 56px)',
          border: '1px solid rgba(255,255,255,0.6)',
          display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 11, color: sky.inkSoft, letterSpacing: '2.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
              Also from DaydreamDwelling
            </div>
            <h3 style={{ fontFamily: FONTS.display, fontSize: 'clamp(24px, 3.2vw, 38px)', fontWeight: 300, letterSpacing: '-1px', margin: '0 0 6px', color: sky.ink }}>
              <span style={{ fontStyle: 'italic' }}>Daydream Blossoms</span>
            </h3>
            <div style={{ fontSize: 14, color: sky.accent, fontWeight: 500, marginBottom: 14, letterSpacing: '1px', textTransform: 'uppercase' }}>
              outdoor & garden
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: sky.inkSoft, margin: 0, maxWidth: 480 }}>
              Soil, sun, and yard planning — plus curated outdoor furniture, planters, and decor
              from independent makers. Same dreamy vibes, different weather.
            </p>
          </div>
          <a href={BLOSSOMS_URL} style={{
            padding: '14px 28px', border: `1.5px solid ${sky.accent}`,
            background: 'transparent', color: sky.accent, cursor: 'pointer',
            fontSize: 14, fontWeight: 600, borderRadius: 999, textDecoration: 'none',
          }}>visit blossoms →</a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ position: 'relative', padding: '60px 40px 80px', textAlign: 'center', zIndex: 10 }}>
        <div style={{ fontFamily: FONTS.display, fontSize: 20, fontStyle: 'italic', color: sky.ink, marginBottom: 14, fontWeight: 300 }}>
          Stay dreamy
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20 }}>
          {[0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4].map((o, i) => (
            <svg key={i} width="22" height="14" viewBox="0 0 80 56" style={{ opacity: o }} aria-hidden>
              <ellipse cx="40" cy="32" rx="32" ry="18" fill="#fff"/>
              <ellipse cx="22" cy="28" rx="14" ry="12" fill="#fff"/>
              <ellipse cx="56" cy="26" rx="16" ry="13" fill="#fff"/>
            </svg>
          ))}
        </div>
        <div style={{ fontSize: 12, color: sky.inkSoft }}>
          © 2026 DaydreamDwelling · daydreamdwelling.com · <a href={BLOSSOMS_URL} style={{ color: sky.accent, textDecoration: 'none' }}>blossoms</a> · <a href="mailto:kingcitran@gmail.com" style={{ color: sky.accent, textDecoration: 'none' }}>contact</a>
        </div>
      </footer>

      {/* Mobile responsiveness — typography uses clamp() inline; this handles layout/padding/hover */}
      <style>{`
        /* Sky cross-fade + hero animations */
        @keyframes ddd-skyfade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ddd-drift   { from { transform: translateX(-30vw); } to { transform: translateX(130vw); } }
        @keyframes ddd-cloudveil { 0% { opacity: 0.7; } 100% { opacity: 0; } }
        @keyframes ddd-fadeup  { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

        /* Short viewports: shrink the 3D stage so the box clears the headline */
        @media (max-height: 620px) {
          .ddd-hero > div:nth-child(3) { zoom: 0.6; }
          .ddd-hero > div:nth-child(5) { margin-top: 52px !important; }
        }

        @media (max-width: 900px) {
          .ddd-landing-wispy     { grid-template-columns: 1fr !important; gap: 24px !important; padding: 40px 28px !important; }
          .ddd-landing > section { padding-left: 28px !important; padding-right: 28px !important; }
          /* Lighter blur on smaller devices — backdrop-filter at 20px chugs on iOS Safari */
          .ddd-blur { backdrop-filter: blur(10px) !important; -webkit-backdrop-filter: blur(10px) !important; }
        }
        @media (max-width: 600px) {
          .ddd-landing > section { padding-left: 22px !important; padding-right: 22px !important; }
          .ddd-landing > footer  { padding-left: 22px !important; padding-right: 22px !important; }
          .ddd-landing > header > div { padding: 14px 20px !important; }
          .ddd-hero-h1 br { display: none !important; }
        }
        @media (max-width: 480px) {
          .ddd-waitlist-form        { flex-direction: column !important; gap: 12px !important; }
          .ddd-waitlist-form button { width: 100% !important; padding: 14px 20px !important; }
        }

        /* Hover states */
        .ddd-landing nav a            { transition: background 0.15s, color 0.15s; }
        .ddd-landing nav a:hover      { background: rgba(255,255,255,0.4); }
        .ddd-landing nav button:hover { background: rgba(255,255,255,0.5) !important; border-color: rgba(26,42,72,0.45) !important; }
        .ddd-landing section button   { transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s, background 0.15s !important; }
        .ddd-landing section button:hover:not(:disabled) { transform: translateY(-1px); }
        .ddd-landing footer a:hover   { text-decoration: underline; }

        /* Inline email validation — red border only after the user typed something invalid AND blurred away */
        .ddd-waitlist-input:focus { border-color: rgba(255,155,92,0.6) !important; }
        .ddd-waitlist-input:invalid:not(:placeholder-shown):not(:focus) { border-color: rgba(192,56,61,0.55) !important; }

        @media (prefers-reduced-motion: reduce) {
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
          .ddd-landing section button:hover:not(:disabled) { transform: none !important; }
        }
      `}</style>
    </div>
  )
}
