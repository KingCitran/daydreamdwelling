import { useEffect, useState, useMemo } from 'react'
import { useTheme, useMoodControl } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import Logo from '@shared/Logo'
import WispyArt from '@shared/wispy/art'
import FeedbackButton from '../ui/FeedbackButton'

// ── Hub: the Welcome Home page ─────────────────────────────────────
// Gallery + Frosted direction. Sky background, drifting clouds,
// frosted-glass cards, bento destinations, hype marquee.

// ── Sky gradients (4-stop, from Claude Design) ────────────────────
const SKY = {
  'Bright Day':       ['#5b8fce','#86b0dc','#bcd6ea','#f3ead4'],
  'Dream State':      ['#b8a8e8','#cdbef0','#e2d6f6','#ffd8e8'],
  'Golden Hour':      ['#e7a85a','#f0bd6e','#f7d59a','#fdeccb'],
  'Vivid Sunset':     ['#3a1850','#7a2a78','#d0608f','#ffb04d'],
  'Moonlight':        ['#0a0e1c','#121a33','#23304f','#41557d'],
  'Coastal Morning':  ['#5b9fd6','#8cc0e4','#bcdcef','#eef6df'],
  'Blush Hour':       ['#e8b0a8','#f4c0b8','#f8d8d0','#ffe8e0'],
  'Neon Nights':      ['#0a0620','#1a1048','#2a1862','#3a2080'],
  "Ember's Sunrise":  ['#1a1438','#8a5048','#c87858','#ffe0a0'],
  'Studio':           ['#606870','#808890','#a0a8b0','#c8d0d0'],
  'Studio Dark':      ['#0c0e14','#1a1c22','#2a2c32','#404448'],
}

function skyGradient(mood) {
  const s = SKY[mood] ?? SKY['Bright Day']
  return `linear-gradient(180deg, ${s[0]} 0%, ${s[1]} 34%, ${s[2]} 64%, ${s[3]} 100%)`
}

// Derive on-sky text colors from theme bg brightness
function isDark(hex) {
  if (!hex || hex[0] !== '#') return false
  return parseInt(hex.slice(1, 3), 16) < 0x60
}

// Rotate hue of a hex color — gives each destination its own tint
function rotateHue(hex, deg) {
  let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn
  let h = 0; const l = (mx + mn) / 2; const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  if (d !== 0) { h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360 }
  h = (h + deg + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m0 = l - c / 2
  let rr = 0, gg = 0, bb = 0
  if (h < 60) [rr, gg, bb] = [c, x, 0]; else if (h < 120) [rr, gg, bb] = [x, c, 0]
  else if (h < 180) [rr, gg, bb] = [0, c, x]; else if (h < 240) [rr, gg, bb] = [0, x, c]
  else if (h < 300) [rr, gg, bb] = [x, 0, c]; else [rr, gg, bb] = [c, 0, x]
  const hx = v => Math.round((v + m0) * 255).toString(16).padStart(2, '0')
  return '#' + hx(rr) + hx(gg) + hx(bb)
}

const fmt = n => n.toLocaleString('en-US')
const compact = n => n >= 10000 ? Math.round(n / 1000) + 'k' : n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : '' + n

function greetingTime() {
  const h = new Date().getHours()
  if (h < 5) return 'Late night'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

const F = { display: "'EB Garamond', Georgia, serif", body: "'Outfit', system-ui, sans-serif", hand: "'Caveat', cursive" }

const DESTINATIONS = [
  { id: 'builder',   title: 'Room Builder', glyph: '◈', desc: 'Your studio, in 3D.', href: '/', tag: 'Your studio', hueShift: 0 },
  { id: 'shop',      title: 'Marketplace',  glyph: '❀', desc: 'Buy from real makers.', href: '/?shop=1', tag: 'Browse items', hueShift: 34 },
  { id: 'community', title: 'Community',    glyph: '✦', desc: 'Share & discover.', href: '/community', tag: 'Explore', hueShift: -30 },
  { id: 'music',     title: 'Music',        glyph: '♪', desc: 'Stations to design to.', href: '/community/music', tag: 'Listen', hueShift: 64 },
  { id: 'about',     title: 'About',        glyph: '☁', desc: 'The story behind it.', href: '/?about=1', tag: 'Our dream', hueShift: -62 },
  { id: 'blossoms',  title: 'Blossoms',     glyph: '✿', desc: 'Garden & outdoor.', href: 'https://daydreamblossoms.com', tag: 'Sister site', external: true, hueShift: 96 },
]

const CREATORS = [
  { id: 'sell',  title: 'Sell on Daydream', glyph: '✦', desc: 'List your handmade furniture and decor. Keep more of every sale.', cta: 'Open Seller Dashboard', href: 'https://daydreamsellers.com', external: true },
  { id: 'music', title: 'Submit Music',    glyph: '♪', desc: 'Share tracks, earn plays, get paid for clicks.', cta: 'Open Artist Portal', href: '/community/artists' },
]

// ── Component ─────────────────────────────────────────────────────
export default function HubPage({ onBack }) {
  const t = useTheme()
  const { mood } = useMoodControl()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])

  const dark = isDark(t.bg)
  const onSky = dark ? '#dde6ff' : '#16331f'
  const onSkySoft = dark ? 'rgba(221,230,255,0.70)' : 'rgba(22,51,31,0.66)'

  const displayName = profile?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || null
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 768

  useEffect(() => {
    async function load() {
      const [wl, rm, pr, sl, tr, ch] = await Promise.all([
        supabase.from('waitlist').select('id', { count: 'exact', head: true }),
        supabase.from('saved_rooms').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).not('stripe_account_id', 'is', null),
        supabase.from('artist_tracks').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('community_hearts').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        waitlist: wl.count ?? 0, rooms: rm.count ?? 0,
        products: pr.count ?? 0, sellers: sl.count ?? 0,
        tracks: tr.count ?? 0, hearts: ch.count ?? 0,
      })
      const { data } = await supabase.from('products')
        .select('id, label, product_images(storage_path, is_primary)')
        .eq('active', true).order('created_at', { ascending: false }).limit(6)
      if (data) setProducts(data)
    }
    load()
  }, [])

  const milestones = useMemo(() => stats ? [
    { value: stats.waitlist, label: 'dreamers on the waitlist', glyph: '✦' },
    { value: stats.rooms,    label: 'rooms designed',           glyph: '◈' },
    { value: stats.products, label: `items from ${stats.sellers} makers`, glyph: '❀' },
    { value: stats.tracks,   label: 'tracks played',            glyph: '♪' },
    { value: stats.hearts,   label: 'community hearts',          glyph: '♡' },
  ] : [], [stats])

  const statPills = useMemo(() => stats ? [
    { value: stats.waitlist, label: 'Dreamers', hint: 'on the waitlist' },
    { value: stats.rooms,    label: 'Rooms',    hint: 'designed in 3D' },
    { value: stats.sellers,  label: 'Makers',   hint: 'selling on Daydream' },
    { value: stats.tracks,   label: 'Tracks',   hint: 'music library' },
  ] : [], [stats])

  // Frosted surface style
  const surf = (lift) => ({
    background: t.surface, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${t.surfaceBorder}`,
    boxShadow: lift ? '0 20px 50px rgba(0,0,0,0.12)' : '0 14px 38px rgba(0,0,0,0.08)',
  })

  const pad = mobile ? 18 : 28
  const maxW = 960
  const Shell = ({ children, wide }) => (
    <div style={{ maxWidth: wide ? maxW + 80 : maxW, margin: '0 auto', padding: `0 ${pad}px` }}>{children}</div>
  )

  return (
    <div style={{ minHeight: '100vh', fontFamily: F.body, color: t.text, position: 'relative' }}>
      {/* Keyframes */}
      <style>{`
        @keyframes hubFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
        @keyframes hubPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
        @keyframes hubMarquee { to { transform: translateX(-50%) } }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; } }
      `}</style>

      {/* Sky background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: skyGradient(mood), transition: 'background 1.1s ease' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: `radial-gradient(ellipse 1100px 620px at 64% 16%, ${t.accent}26 0%, transparent 68%)` }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, paddingBottom: 64 }}>

        {/* Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: t.navBg, backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
          borderBottom: `1px solid ${t.navBorder}`,
        }}>
          <div style={{ maxWidth: maxW + 80, margin: '0 auto', padding: `0 ${pad}px`, height: mobile ? 56 : 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Logo size={mobile ? 26 : 30} color={t.accent} />
              <div>
                <div style={{ fontFamily: F.display, fontSize: mobile ? 17 : 19, fontWeight: 500, color: t.text, lineHeight: 1 }}>Daydream<span style={{ fontStyle: 'italic' }}>Dwelling</span></div>
                {!mobile && <div style={{ fontFamily: F.body, fontSize: 9.5, letterSpacing: '1.6px', textTransform: 'uppercase', color: t.textSoft, marginTop: 2 }}>Welcome home</div>}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 8 : 10 }}>
              {displayName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: mobile ? '4px 4px 4px 12px' : '4px 5px 4px 13px', borderRadius: 999, border: `1px solid ${t.surfaceBorder}`, background: t.surface, backdropFilter: 'blur(10px)' }}>
                  {!mobile && <span style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: t.text }}>{displayName}</span>}
                  <span style={{ width: mobile ? 30 : 28, height: mobile ? 30 : 28, borderRadius: '50%', flexShrink: 0, background: t.accent, color: t.accentText, fontFamily: F.display, fontSize: 15, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{displayName[0]}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero */}
        <Shell wide>
          <div style={{ padding: mobile ? '38px 0 26px' : '64px 0 40px', display: 'flex', alignItems: 'center', gap: mobile ? 18 : 36, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: '2.2px', textTransform: 'uppercase', color: t.accent }}>{greetingTime()} · {mood}</div>
              <h1 style={{ fontFamily: F.display, fontWeight: 500, fontSize: mobile ? 40 : 64, lineHeight: 0.98, letterSpacing: '-1.5px', color: onSky, margin: '12px 0 0', textShadow: '0 2px 26px rgba(255,255,255,0.2)' }}>
                Welcome home{displayName ? ',' : ''}{displayName && <><br /><span style={{ fontStyle: 'italic', color: t.accent }}>{displayName}.</span></>}{!displayName && <span style={{ color: t.accent }}>.</span>}
              </h1>
              <p style={{ fontFamily: F.body, fontSize: mobile ? 15 : 17, lineHeight: 1.6, color: onSkySoft, margin: '18px 0 0', maxWidth: 440 }}>
                Everything you've made and everywhere you can wander — gathered under one sky. Pick a direction and drift.
              </p>
            </div>
            <div style={{ flex: mobile ? '1 1 100%' : '0 0 auto', display: 'flex', justifyContent: 'center', animation: 'hubFloat 5s ease-in-out infinite' }}>
              <WispyArt slot="happy" mood={mood} width={mobile ? 150 : 200} />
            </div>
          </div>
        </Shell>

        {/* Stat pills */}
        {statPills.length > 0 && (
          <Shell>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(4,1fr)', gap: mobile ? 10 : 14, marginBottom: mobile ? 40 : 56 }}>
              {statPills.map(s => (
                <div key={s.label} style={{ ...surf(), borderRadius: 16, padding: mobile ? '14px 14px' : '16px 18px' }}>
                  <div style={{ fontFamily: F.display, fontSize: mobile ? 26 : 30, fontWeight: 500, color: t.text, lineHeight: 1 }}>{compact(s.value)}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: t.text, marginTop: 7 }}>{s.label}</div>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: t.textSoft, marginTop: 1 }}>{s.hint}</div>
                </div>
              ))}
            </div>
          </Shell>
        )}

        <Shell>
          {/* Destinations bento */}
          <section style={{ marginBottom: mobile ? 44 : 60 }}>
            <SectionHead onSky={onSky} accent={t.accent} mobile={mobile}
              eyebrow="Where would you like to go?"
              title={<>Six doors, one <span style={{ fontStyle: 'italic', color: t.accent }}>dwelling</span>.</>}
            />
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr 1fr' : 'repeat(3,1fr)', gridAutoRows: mobile ? 'auto' : 'minmax(150px, 1fr)', gap: mobile ? 12 : 16 }}>
              {DESTINATIONS.map(d => {
                const feat = d.id === 'builder'
                const span = feat ? { gridColumn: 'span 2', gridRow: mobile ? 'auto' : 'span 2' } : (mobile && d.id === 'blossoms') ? { gridColumn: 'span 2' } : {}
                return <div key={d.id} style={span}><DestCard t={t} d={d} surf={surf} mobile={mobile} featured={feat} /></div>
              })}
            </div>
          </section>

          {/* Creators */}
          <section style={{ marginBottom: mobile ? 44 : 60 }}>
            <SectionHead onSky={onSky} accent={t.accent} mobile={mobile}
              eyebrow="For creators"
              title={<>Build the <span style={{ fontStyle: 'italic', color: t.accent }}>business</span> too.</>}
            />
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 12 : 18 }}>
              {CREATORS.map(c => <CreatorCard key={c.id} t={t} c={c} surf={surf} mobile={mobile} />)}
            </div>
          </section>

          {/* Products */}
          {products.length > 0 && (
            <section style={{ marginBottom: mobile ? 44 : 60 }}>
              <SectionHead onSky={onSky} accent={t.accent} mobile={mobile}
                eyebrow="Fresh on the shelf"
                title={<>Just added by <span style={{ fontStyle: 'italic', color: t.accent }}>makers</span>.</>}
              />
              <div style={{ display: 'flex', gap: mobile ? 12 : 16, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x proximity' }}>
                {products.map(p => {
                  const img = p.product_images?.find(i => i.is_primary) ?? p.product_images?.[0]
                  const url = img ? supabase.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl : null
                  return (
                    <div key={p.id} style={{ ...surf(), borderRadius: 16, overflow: 'hidden', width: mobile ? 150 : 178, flexShrink: 0, scrollSnapAlign: 'start' }}>
                      {url ? <img src={url} alt="" style={{ width: '100%', height: mobile ? 110 : 128, objectFit: 'cover', borderBottom: `1px solid ${t.surfaceBorder}` }} />
                        : <div style={{ height: mobile ? 110 : 128, background: `${t.accent}0c`, borderBottom: `1px solid ${t.surfaceBorder}` }} />}
                      <div style={{ padding: '12px 13px' }}>
                        <div style={{ fontFamily: F.body, fontSize: 12.5, fontWeight: 600, color: t.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Hype band */}
          {milestones.length > 0 && (
            <section style={{ marginBottom: mobile ? 40 : 52 }}>
              <div style={{ ...surf(), borderRadius: 22, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: mobile ? '12px 16px 0' : '16px 22px 0' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.accent, boxShadow: `0 0 10px ${t.accent}`, animation: 'hubPulse 2s ease-in-out infinite' }} />
                  <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase', color: t.accent }}>The dream, in numbers</span>
                </div>
                <div style={{ overflow: 'hidden', padding: mobile ? '12px 0 14px' : '16px 0 18px', maskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)', WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)' }}>
                  <div style={{ display: 'flex', gap: mobile ? 28 : 44, width: 'max-content', animation: 'hubMarquee 36s linear infinite', paddingLeft: mobile ? 16 : 22 }}>
                    {[...milestones, ...milestones].map((m, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontFamily: F.display, fontSize: mobile ? 30 : 40, fontWeight: 500, color: t.text, lineHeight: 1 }}>{fmt(m.value)}</span>
                        <span style={{ fontFamily: F.body, fontSize: 13, color: t.textSoft }}>{m.label}</span>
                        <span style={{ color: t.accent, fontSize: 14, marginLeft: 4 }}>{m.glyph}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Landing link */}
          <div style={{ textAlign: 'center', marginBottom: mobile ? 8 : 16 }}>
            <a href="/?landing=1" style={{ fontFamily: F.body, fontSize: 13, color: onSkySoft, textDecoration: 'none', borderBottom: `1px solid ${t.accent}55`, paddingBottom: 2 }}>
              See our public homepage <span style={{ color: t.accent }}>→</span>
            </a>
          </div>
        </Shell>

        {/* Closing */}
        <Shell wide>
          <div style={{ ...surf(), borderRadius: 26, padding: mobile ? '28px 22px' : '34px 40px', marginTop: mobile ? 16 : 28, display: 'flex', alignItems: 'center', gap: mobile ? 16 : 28, flexWrap: 'wrap', justifyContent: 'center', textAlign: mobile ? 'center' : 'left' }}>
            <WispyArt slot="resting" mood={mood} width={mobile ? 104 : 120} />
            <div style={{ flex: '1 1 240px' }}>
              <div style={{ fontFamily: F.display, fontSize: mobile ? 24 : 30, fontWeight: 500, color: t.text, letterSpacing: '-0.4px' }}>Wherever you wander, you're home.</div>
              <div style={{ fontFamily: F.hand, fontSize: 24, color: t.accent, marginTop: 6 }}>— Wispy ☁</div>
            </div>
          </div>

          <footer style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', padding: mobile ? '26px 4px 0' : '34px 8px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <Logo size={22} color={t.accent} />
              <span style={{ fontFamily: F.body, fontSize: 12, color: t.textSoft }}>© {new Date().getFullYear()} DaydreamDwelling · Stay dreamy ☁</span>
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {[['Community','/community'],['Marketplace','/?shop=1'],['Blossoms','https://daydreamblossoms.com'],['About','/?about=1']].map(([l,h]) => (
                <a key={l} href={h} style={{ fontFamily: F.body, fontSize: 12.5, color: t.textSoft, textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </footer>
        </Shell>
      </div>

      <FeedbackButton />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────
function SectionHead({ onSky, accent, mobile, eyebrow, title }) {
  return (
    <div style={{ marginBottom: mobile ? 18 : 26 }}>
      <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 600, letterSpacing: '2.2px', textTransform: 'uppercase', color: accent }}>{eyebrow}</div>
      <h2 style={{ fontFamily: F.display, fontWeight: 500, fontSize: mobile ? 28 : 38, lineHeight: 1.06, letterSpacing: '-0.5px', color: onSky, margin: '8px 0 0', textShadow: '0 1px 18px rgba(255,255,255,0.18)' }}>{title}</h2>
    </div>
  )
}

function DestCard({ t, d, surf, mobile, featured }) {
  const [hover, setHover] = useState(false)
  const hue = rotateHue(t.accent, d.hueShift || 0)
  return (
    <a href={d.href} target={d.external ? '_blank' : undefined} rel={d.external ? 'noopener noreferrer' : undefined}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        ...surf(hover), borderRadius: 22, padding: featured ? (mobile ? 22 : 30) : (mobile ? 16 : 20),
        textDecoration: 'none', height: '100%', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden', color: t.text,
        minHeight: featured ? (mobile ? 188 : 'auto') : (mobile ? 124 : 150),
        transform: hover ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.3,0,0.2,1), box-shadow 0.3s',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(130% 110% at 100% 0%, ${hue}30, transparent 58%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: featured ? 6 : -8, top: featured ? 2 : -16, fontSize: featured ? (mobile ? 150 : 230) : (mobile ? 92 : 118), lineHeight: 0.8, color: hue, opacity: hover ? 0.26 : 0.18, pointerEvents: 'none', transition: 'opacity 0.3s, transform 0.4s', transform: hover ? 'rotate(-4deg) scale(1.04)' : 'none' }}>{d.glyph}</div>
      <div style={{ position: 'relative', display: 'flex' }}>
        <span style={{ fontFamily: F.body, fontSize: 10.5, fontWeight: 600, letterSpacing: '0.4px', color: hue, background: `${hue}1c`, border: `1px solid ${hue}3a`, padding: '4px 11px', borderRadius: 999 }}>{d.tag}</span>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontFamily: F.display, fontSize: featured ? (mobile ? 34 : 46) : (mobile ? 21 : 26), fontWeight: 500, color: t.text, letterSpacing: '-0.4px', lineHeight: 1, display: 'flex', alignItems: 'baseline', gap: 7 }}>
            {d.title}{d.external && <span style={{ fontSize: featured ? 16 : 12, color: t.textSoft }}>↗</span>}
          </div>
          <div style={{ fontFamily: F.body, fontSize: featured ? 14.5 : 12.5, color: t.textSoft, marginTop: featured ? 8 : 5, maxWidth: 280 }}>{d.desc}</div>
        </div>
        <div style={{ flexShrink: 0, width: featured ? 40 : 32, height: featured ? 40 : 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: hover ? t.accentText : hue, background: hover ? hue : `${hue}1c`, border: `1px solid ${hue}3a`, transition: 'all 0.28s', fontSize: featured ? 17 : 14 }}>→</div>
      </div>
    </a>
  )
}

function CreatorCard({ t, c, surf, mobile }) {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ ...surf(hover), borderRadius: 20, padding: mobile ? 18 : 24, display: 'flex', gap: 16, alignItems: 'flex-start', transition: 'box-shadow 0.28s, transform 0.28s', transform: hover ? 'translateY(-3px)' : 'none' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: t.accent, background: `${t.accent}14`, border: `1px solid ${t.accent}33` }}>{c.glyph}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 500, color: t.text }}>{c.title}</div>
        <div style={{ fontFamily: F.body, fontSize: 13, lineHeight: 1.55, color: t.textSoft, margin: '6px 0 14px' }}>{c.desc}</div>
        <a href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: F.body, fontSize: 13, fontWeight: 600, color: t.accentText, background: t.accent, padding: '9px 16px', borderRadius: 999, textDecoration: 'none' }}>
          {c.cta} <span style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform 0.25s' }}>→</span>
        </a>
      </div>
    </div>
  )
}
