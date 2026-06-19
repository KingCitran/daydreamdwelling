import { useEffect, useState } from 'react'
import { useTheme, useMoodControl } from '@shared/ThemeProvider'
import { useAuth } from '@shared/auth/AuthContext'
import { supabase } from '@shared/supabase'
import Logo from '@shared/Logo'
import WispyArt from '@shared/wispy/art'
import FeedbackButton from '../ui/FeedbackButton'

// Sky gradients per mood — lightweight CSS, no canvas/WebGL
const SKY = {
  'Golden Hour':      'linear-gradient(180deg, #5a2540 0%, #e88a3e 50%, #ffe39a 100%)',
  'Bright Day':       'linear-gradient(180deg, #1040a0 0%, #3878d0 50%, #88c0f0 100%)',
  'Vivid Sunset':     'linear-gradient(180deg, #1a2a5a 0%, #a8b8d0 50%, #e8a040 100%)',
  'Moonlight':        'linear-gradient(180deg, #050918 0%, #16203f 50%, #2a3868 100%)',
  'Blush Hour':       'linear-gradient(180deg, #ffe2cf 0%, #f4b0c0 50%, #c8b8dc 100%)',
  'Coastal Morning':  'linear-gradient(180deg, #2a5a8c 0%, #a8c4d8 50%, #ffd896 100%)',
  'Dream State':      'linear-gradient(180deg, #ffe8d0 0%, #e8c8e0 50%, #a890d4 100%)',
  'Neon Nights':      'linear-gradient(180deg, #060318 0%, #160e3a 50%, #2a1862 100%)',
  'Greenhouse':       'linear-gradient(180deg, #6cb87a 0%, #e0e8b0 50%, #fff5d0 100%)',
  'Studio':           'linear-gradient(180deg, #303840 0%, #586068 50%, #909898 100%)',
  'Studio Dark':      'linear-gradient(180deg, #0c0e14 0%, #202228 50%, #404448 100%)',
  "Ember's Sunrise":  'linear-gradient(180deg, #1a1438 0%, #c87858 50%, #ffe0a0 100%)',
  'Northern Lights':  'linear-gradient(180deg, #040814 0%, #0a3040 50%, #01c8ae 100%)',
  'Candlelit Cozy Evening': 'linear-gradient(180deg, #040100 0%, #200800 50%, #5a2808 100%)',
  'Dark Academia':    'linear-gradient(180deg, #060404 0%, #1a0c08 50%, #4a3020 100%)',
}

export default function HubPage({ onBack }) {
  const t = useTheme()
  const { mood } = useMoodControl()
  const { user, profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])

  const sky = SKY[mood] ?? SKY['Dream State']
  const card = t.panelBg ?? '#fff'
  const cardBorder = t.panelBorder ?? t.surfaceBorder
  const cardText = t.panelText ?? t.text
  const cardSoft = t.panelTextSoft ?? t.textSoft

  const displayName = profile?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || null

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

  const C = { background: card, border: `1px solid ${cardBorder}`, borderRadius: 18, color: cardText }

  return (
    <div style={{
      minHeight: '100vh', background: sky,
      fontFamily: "'Outfit', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Fixed header — solid card bar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        ...C, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 56,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo size={28} color={t.accent} />
            <span style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 18, fontWeight: 500, color: cardText }}>
              Daydream<span style={{ color: t.accent, fontStyle: 'italic' }}>Dwelling</span>
            </span>
          </div>
          <button onClick={onBack} style={{
            padding: '7px 16px', borderRadius: 10,
            background: t.accent, color: t.accentText, border: 'none',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
          }}>← Builder</button>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Hero card */}
        <div style={{ ...C, padding: '36px 32px', textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 90, margin: '0 auto 14px' }}>
            <WispyArt slot="happy" mood={mood} width={90} />
          </div>
          <h1 style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: 32, fontWeight: 400, margin: '0 0 6px', color: cardText,
          }}>
            Welcome home{displayName ? `, ${displayName}` : ''}.
          </h1>
          <p style={{ fontSize: 14, color: cardSoft, margin: 0 }}>
            Everything DaydreamDwelling, all in one place.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { n: stats.waitlist, label: 'On the Waitlist', emoji: '✦' },
              { n: stats.rooms, label: 'Rooms Designed', emoji: '🏠' },
              { n: stats.products, label: 'Products', emoji: '🛋️' },
              { n: stats.sellers, label: 'Sellers', emoji: '🎨' },
              { n: stats.tracks, label: 'Tracks', emoji: '🎵' },
              { n: stats.community, label: 'Shared', emoji: '💫' },
            ].map(s => (
              <div key={s.label} style={{ ...C, padding: '16px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>{s.emoji}</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: t.accent }}>{s.n.toLocaleString()}</span>
                <span style={{ fontSize: 9, color: cardSoft, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Destinations */}
        <div style={{ ...C, padding: '24px', marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, margin: '0 0 16px', color: cardText }}>
            Where would you like to go?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {[
              { emoji: '🏠', title: 'Room Builder', desc: 'Design your space in 3D with real furniture', href: '/' },
              { emoji: '🛍️', title: 'Marketplace', desc: 'Browse and buy from independent sellers', href: '/?shop=1' },
              { emoji: '🎨', title: 'Community', desc: 'Share rooms, enter contests, discover designs', href: '/community' },
              { emoji: '🎵', title: 'Music', desc: 'Listen to curated stations while you design', href: '/community/music' },
              { emoji: '☁', title: 'About', desc: 'The story behind DaydreamDwelling', href: '/?about=1' },
              { emoji: '🌿', title: 'Blossoms', desc: 'Outdoor & garden shop', href: 'https://daydreamblossoms.com', external: true },
            ].map(d => (
              <a key={d.title} href={d.href} target={d.external ? '_blank' : undefined} rel={d.external ? 'noopener noreferrer' : undefined} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 12,
                background: `${t.accent}08`, border: `1px solid ${cardBorder}`,
                textDecoration: 'none', color: cardText,
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = `${t.accent}18`}
                onMouseLeave={e => e.currentTarget.style.background = `${t.accent}08`}
              >
                <span style={{ fontSize: 24, flexShrink: 0 }}>{d.emoji}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: cardSoft, marginTop: 2 }}>{d.desc}</div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* For creators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { emoji: '🏪', title: 'Sell on Daydream', desc: 'List your handmade furniture and decor. Real prices, real shipping, no gimmicks.', href: 'https://daydreamsellers.com', cta: 'Seller Dashboard', external: true },
            { emoji: '🎶', title: 'Submit Music', desc: 'Share your tracks with room designers. Get plays, earn from click-throughs.', href: '/community/artists', cta: 'Artist Portal' },
          ].map(c => (
            <a key={c.title} href={c.href} target={c.external ? '_blank' : undefined} rel={c.external ? 'noopener noreferrer' : undefined} style={{
              ...C, padding: '20px 24px',
              display: 'flex', gap: 14, alignItems: 'flex-start',
              textDecoration: 'none', color: cardText,
            }}>
              <span style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>{c.emoji}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: cardSoft, lineHeight: 1.6, marginBottom: 10 }}>{c.desc}</div>
                <span style={{
                  display: 'inline-block', padding: '7px 14px', borderRadius: 8,
                  background: t.accent, color: t.accentText,
                  fontSize: 11, fontWeight: 700,
                }}>{c.cta} →</span>
              </div>
            </a>
          ))}
        </div>

        {/* Products */}
        {topProducts.length > 0 && (
          <div style={{ ...C, padding: '20px 24px', marginBottom: 20 }}>
            <h2 style={{ fontFamily: "'EB Garamond', Georgia, serif", fontSize: 20, fontWeight: 400, margin: '0 0 14px', color: cardText }}>
              Fresh on the shelf
            </h2>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {topProducts.map(p => {
                const img = p.product_images?.find(i => i.is_primary) ?? p.product_images?.[0]
                const url = img ? supabase.storage.from('product-images').getPublicUrl(img.storage_path).data.publicUrl : null
                return (
                  <div key={p.id} style={{ flexShrink: 0, width: 120 }}>
                    {url ? <img src={url} alt="" style={{ width: '100%', height: 120, borderRadius: 10, objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: 120, borderRadius: 10, background: `${t.accent}10` }} />}
                    <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: cardText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Wispy close */}
        <div style={{ ...C, padding: '24px', textAlign: 'center' }}>
          <div style={{ width: 50, margin: '0 auto 10px' }}>
            <WispyArt slot="resting" mood={mood} width={50} />
          </div>
          <p style={{ fontSize: 13, color: cardSoft, fontStyle: 'italic', margin: 0 }}>
            Go make something beautiful.
          </p>
        </div>

      </main>

      {/* Footer */}
      <footer style={{ ...C, borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none', padding: '24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 10, flexWrap: 'wrap' }}>
          {['Room Builder:/', 'Community:/community', 'About:/?about=1', 'Sellers:https://daydreamsellers.com', 'Blossoms:https://daydreamblossoms.com'].map(l => {
            const [label, href] = l.split(':')
            return <a key={label} href={href} style={{ color: cardSoft, textDecoration: 'none', fontSize: 12 }}>{label}</a>
          })}
        </div>
        <p style={{ margin: 0, fontSize: 11, color: cardSoft }}>© {new Date().getFullYear()} DaydreamDwelling</p>
      </footer>

      <FeedbackButton />
    </div>
  )
}
