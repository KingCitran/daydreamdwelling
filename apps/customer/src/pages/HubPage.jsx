import { useEffect, useState } from 'react'
import { useTheme, useMoodControl } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import Logo from '@shared/Logo'
import WispyArt from '@shared/wispy/art'
import FeedbackButton from '../ui/FeedbackButton'

// ── Hub Page ───────────────────────────────────────────────────────
// The center of DaydreamDwelling. Where every path starts. Stats,
// best sellers, links for customers, sellers, artists, builders.
// Aesthetic, dreamy, empowering.

export default function HubPage({ onBack }) {
  const t = useTheme()
  const { mood } = useMoodControl()
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])

  useEffect(() => {
    async function load() {
      const [waitlist, rooms, tracks, community, products, sellers] = await Promise.all([
        supabase.from('waitlist').select('id', { count: 'exact', head: true }),
        supabase.from('saved_rooms').select('id', { count: 'exact', head: true }),
        supabase.from('artist_tracks').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
        supabase.from('community_posts').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).not('stripe_account_id', 'is', null),
      ])
      setStats({
        waitlist: waitlist.count ?? 0,
        rooms: rooms.count ?? 0,
        tracks: tracks.count ?? 0,
        community: community.count ?? 0,
        products: products.count ?? 0,
        sellers: sellers.count ?? 0,
      })
      // Top products by recent orders
      const { data: top } = await supabase
        .from('products')
        .select('id, label, product_images(storage_path, is_primary)')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(6)
      if (top) setTopProducts(top)
    }
    load()
  }, [])

  const s = makeStyles(t)

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <div onClick={onBack} style={s.logoGroup}>
            <Logo size={28} color={t.accent} />
            <span style={s.brandName}>Daydream<span style={{ color: t.accent, fontStyle: 'italic' }}>Dwelling</span></span>
          </div>
          <button onClick={onBack} style={s.backBtn}>← Back to Builder</button>
        </div>
      </header>

      <main style={s.main}>
        {/* Hero */}
        <section style={s.hero}>
          <div style={{ width: 100, margin: '0 auto 16px' }}>
            <WispyArt slot="happy" mood={mood} width={100} />
          </div>
          <h1 style={s.heroTitle}>Welcome home.</h1>
          <p style={s.heroSub}>Everything DaydreamDwelling, all in one place.</p>
        </section>

        {/* Stats ribbon */}
        {stats && (
          <section style={s.statsRibbon}>
            {[
              { n: stats.waitlist, label: 'On the Waitlist', emoji: '✦' },
              { n: stats.rooms, label: 'Rooms Designed', emoji: '🏠' },
              { n: stats.products, label: 'Products Listed', emoji: '🛋️' },
              { n: stats.sellers, label: 'Sellers', emoji: '🎨' },
              { n: stats.tracks, label: 'Music Tracks', emoji: '🎵' },
              { n: stats.community, label: 'Shared Designs', emoji: '💫' },
            ].map(s => (
              <div key={s.label} style={makeStatCard(t)}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: t.accent }}>{s.n.toLocaleString()}</span>
                <span style={{ fontSize: 10, color: t.textSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
              </div>
            ))}
          </section>
        )}

        {/* Paths — where do you want to go? */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>Where would you like to go?</h2>
          <div style={s.pathGrid}>
            <PathCard t={t}
              emoji="🏠" title="Room Builder"
              desc="Design your space in 3D with real furniture"
              href="/"
              accent="#9a7aee"
            />
            <PathCard t={t}
              emoji="🛍️" title="Marketplace"
              desc="Browse and buy from independent sellers"
              href="/?shop=1"
              accent="#e8a060"
            />
            <PathCard t={t}
              emoji="🎨" title="Community"
              desc="Share rooms, enter contests, discover designs"
              href="/community"
              accent="#e87fa0"
            />
            <PathCard t={t}
              emoji="🎵" title="Music"
              desc="Listen to curated stations while you design"
              href="/community/music"
              accent="#7ac8e0"
            />
            <PathCard t={t}
              emoji="📋" title="About"
              desc="The story behind DaydreamDwelling"
              href="/?about=1"
              accent="#88d8b0"
            />
            <PathCard t={t}
              emoji="🌿" title="Blossoms"
              desc="Outdoor & garden at DaydreamBlossoms"
              href="https://daydreamblossoms.com"
              accent="#6cb87a"
              external
            />
          </div>
        </section>

        {/* For Sellers & Artists */}
        <section style={s.section}>
          <h2 style={s.sectionTitle}>For creators</h2>
          <div style={s.creatorGrid}>
            <CreatorCard t={t}
              emoji="🏪" title="Sell on Daydream"
              desc="List your handmade furniture and decor. Real prices, real shipping, no gimmicks."
              href="https://daydreamsellers.com"
              cta="Open Seller Dashboard"
              external
            />
            <CreatorCard t={t}
              emoji="🎶" title="Submit Music"
              desc="Share your tracks with room designers. Get plays, earn from click-throughs."
              href="/community/artists"
              cta="Artist Portal"
            />
          </div>
        </section>

        {/* Recent products */}
        {topProducts.length > 0 && (
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Fresh on the shelf</h2>
            <div style={s.productScroll}>
              {topProducts.map(p => {
                const img = p.product_images?.find(i => i.is_primary) ?? p.product_images?.[0]
                const url = img ? supabase.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl : null
                return (
                  <div key={p.id} style={s.productThumb}>
                    {url ? <img src={url} alt="" style={s.productImg} /> : <div style={{ ...s.productImg, background: t.surface }} />}
                    <span style={s.productLabel}>{p.label}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Wispy footer */}
        <section style={{ ...s.section, textAlign: 'center', paddingBottom: 40 }}>
          <div style={{ width: 60, margin: '0 auto 12px' }}>
            <WispyArt slot="resting" mood={mood} width={60} />
          </div>
          <p style={{ fontSize: 13, color: t.textSoft, fontStyle: 'italic', margin: 0 }}>
            Go make something beautiful.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 12, flexWrap: 'wrap' }}>
          <a href="/" style={s.footLink}>Room Builder</a>
          <a href="/community" style={s.footLink}>Community</a>
          <a href="/?about=1" style={s.footLink}>About</a>
          <a href="https://daydreamsellers.com" style={s.footLink}>Sellers</a>
          <a href="https://daydreamblossoms.com" style={s.footLink}>Blossoms</a>
        </div>
        {user && <p style={{ margin: '0 0 8px', fontSize: 11, color: t.textSoft }}>Signed in as {user.email}</p>}
        <p style={{ margin: 0, fontSize: 11, color: t.textSoft }}>© {new Date().getFullYear()} DaydreamDwelling</p>
      </footer>

      <FeedbackButton />
    </div>
  )
}

// ── Path Card ──────────────────────────────────────────────────────
function PathCard({ t, emoji, title, desc, href, accent, external }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        padding: 20, borderRadius: 18,
        background: t.surface, border: `1px solid ${t.surfaceBorder}`,
        textDecoration: 'none', color: t.text,
        transition: 'transform 0.15s, box-shadow 0.15s',
        fontFamily: "'Outfit', system-ui, sans-serif",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${accent}22` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <span style={{ fontSize: 28 }}>{emoji}</span>
      <span style={{ fontSize: 16, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 12, color: t.textSoft, lineHeight: 1.5 }}>{desc}</span>
      {external && <span style={{ fontSize: 10, color: t.textSoft }}>↗ External site</span>}
    </a>
  )
}

// ── Creator Card ───────────────────────────────────────────────────
function CreatorCard({ t, emoji, title, desc, href, cta, external }) {
  return (
    <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}
      style={{
        display: 'flex', gap: 16, padding: 24, borderRadius: 18,
        background: t.surface, border: `1px solid ${t.surfaceBorder}`,
        textDecoration: 'none', color: t.text,
        fontFamily: "'Outfit', system-ui, sans-serif",
        alignItems: 'flex-start',
      }}
    >
      <span style={{ fontSize: 36, flexShrink: 0, lineHeight: 1 }}>{emoji}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 13, color: t.textSoft, lineHeight: 1.6 }}>{desc}</span>
        <span style={{
          display: 'inline-flex', alignSelf: 'flex-start',
          padding: '8px 16px', borderRadius: 10, marginTop: 4,
          background: t.accent, color: t.accentText,
          fontSize: 12, fontWeight: 700,
        }}>{cta} →</span>
      </div>
    </a>
  )
}

// ── Styles ─────────────────────────────────────────────────────────
function makeStyles(t) {
  return {
    page: {
      minHeight: '100vh', background: t.bg,
      fontFamily: "'Outfit', system-ui, sans-serif", color: t.text,
    },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: t.navBg, backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${t.navBorder}`,
    },
    headerInner: {
      maxWidth: 900, margin: '0 auto', padding: '0 24px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    logoGroup: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
    brandName: {
      fontFamily: "'EB Garamond', Georgia, serif",
      fontSize: 18, fontWeight: 500, letterSpacing: '-0.01em',
    },
    backBtn: {
      padding: '6px 14px', borderRadius: 8,
      background: `${t.accent}10`, border: `1px solid ${t.accent}30`,
      color: t.accent, fontSize: 12, fontWeight: 600,
      cursor: 'pointer', fontFamily: 'inherit',
    },
    main: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },
    hero: {
      textAlign: 'center', padding: '48px 0 32px',
    },
    heroTitle: {
      fontFamily: "'EB Garamond', Georgia, serif",
      fontSize: 36, fontWeight: 400, margin: '0 0 8px',
      letterSpacing: '-0.02em',
    },
    heroSub: { fontSize: 14, color: t.textSoft, margin: 0 },
    statsRibbon: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gap: 10, marginBottom: 40,
    },
    section: { marginBottom: 40 },
    sectionTitle: {
      fontFamily: "'EB Garamond', Georgia, serif",
      fontSize: 22, fontWeight: 400, margin: '0 0 16px',
      letterSpacing: '-0.01em',
    },
    pathGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 12,
    },
    creatorGrid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 12,
    },
    productScroll: {
      display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8,
    },
    productThumb: {
      flexShrink: 0, width: 130, display: 'flex', flexDirection: 'column', gap: 6,
    },
    productImg: {
      width: '100%', height: 130, borderRadius: 12, objectFit: 'cover',
      border: `1px solid ${t.surfaceBorder}`,
    },
    productLabel: {
      fontSize: 11, fontWeight: 600, color: t.text,
      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    },
    footer: {
      borderTop: `1px solid ${t.surfaceBorder}`,
      padding: '32px 24px', textAlign: 'center', fontSize: 12,
    },
    footLink: { color: t.text, textDecoration: 'none', fontSize: 12 },
  }
}

function makeStatCard(t) {
  return {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    padding: '16px 12px', borderRadius: 16,
    background: t.surface, border: `1px solid ${t.surfaceBorder}`,
    textAlign: 'center',
  }
}
