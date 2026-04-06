import { useState, useEffect } from 'react'
import { supabase } from '@shared/supabase'
import { useTheme } from '@shared/ThemeProvider'

const CATEGORIES = [
  { key: 'furniture', label: 'Furniture',  icon: '🪑', desc: 'Sofas, dining sets, loungers' },
  { key: 'planters',  label: 'Planters',   icon: '🪴', desc: 'Ceramic, terracotta, raised beds' },
  { key: 'lighting',  label: 'Lighting',   icon: '🏮', desc: 'String lights, lanterns, path' },
  { key: 'decor',     label: 'Decor',      icon: '🌸', desc: 'Sculptures, fountains, chimes' },
  { key: 'tools',     label: 'Tools',      icon: '🌱', desc: 'Seeds, soil, accessories' },
  { key: 'shade',     label: 'Shade',      icon: '⛱',  desc: 'Pergolas, umbrellas, awnings' },
]

const VALUES = [
  { icon: '✦', title: 'Independent makers only', text: 'Every product is from a verified independent seller. No mass-produced, no dropshipping.' },
  { icon: '◈', title: 'Reliable shipping',        text: 'Sellers are held to strict processing deadlines. Track every order end to end.' },
  { icon: '◇', title: 'No subscriptions ever',    text: 'Pay for what you buy. No monthly fees, no hidden charges — ever.' },
]

const CATEGORY_ICONS = { furniture: '🪑', planters: '🪴', lighting: '🏮', decor: '🌸', tools: '🌱', shade: '⛱' }

export default function HomePage({ onNavigate }) {
  const theme = useTheme()
  const [featured, setFeatured] = useState([])
  const [email,    setEmail]    = useState('')
  const [joined,   setJoined]   = useState(false)

  useEffect(() => {
    supabase
      .from('products')
      .select('id, name, price, category, seller_id')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => setFeatured(data || []))
  }, [])

  function handleWaitlist(e) {
    e.preventDefault()
    if (email.trim()) setJoined(true)
  }

  const s = makeStyles(theme)

  return (
    <div style={{ background: theme.bg, color: theme.text }}>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div style={s.hero}>
        <div style={s.heroOrb1} />
        <div style={s.heroOrb2} />
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <p style={s.eyebrow}>Outdoor & Garden Marketplace</p>
            <h1 style={s.heroTitle}>Your garden,<br />your sanctuary.</h1>
            <p style={s.heroSub}>
              Curated outdoor furniture, planters &amp; decor from independent makers —
              built for people who take their outdoor space seriously.
            </p>
            <div style={s.heroActions}>
              <button style={s.heroCta}  onClick={() => onNavigate('browse')}>Shop all products →</button>
              <button style={s.heroGhost} onClick={() => onNavigate('browse', { category: 'furniture' })}>Browse furniture</button>
            </div>
          </div>

          <div style={s.heroRight}>
            <div style={s.previewBox}>
              <div style={s.previewOrb} />
              <div style={s.previewContent}>
                <span style={s.previewIcon}>🌿</span>
                <p style={s.previewLabel}>3D Garden Planner</p>
                <p style={s.previewSub}>Visualise your space before you buy.</p>
                <button style={s.previewBtn} disabled>Coming soon</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Featured Products ────────────────────────────────── */}
      {featured.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionInner}>
            <div style={s.sectionHead}>
              <h2 style={s.sectionTitle}>Just arrived</h2>
              <button style={s.seeAll} onClick={() => onNavigate('browse')}>See all →</button>
            </div>
            <div style={s.productGrid}>
              {featured.map((p) => (
                <button key={p.id} style={s.productCard} onClick={() => onNavigate('product', { productId: p.id })}>
                  <div style={{ ...s.productImg, background: theme.surface }}>
                    <span style={s.productImgIcon}>{CATEGORY_ICONS[p.category] || '🌿'}</span>
                  </div>
                  <div style={s.productMeta}>
                    <p style={s.productName}>{p.name}</p>
                    <p style={s.productPrice}>${(p.price / 100).toFixed(2)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Categories ───────────────────────────────────────── */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Shop by category</h2>
          <div style={s.catGrid}>
            {CATEGORIES.map(cat => (
              <button key={cat.key} style={s.catCard} onClick={() => onNavigate('browse', { category: cat.key })}>
                <span style={s.catIcon}>{cat.icon}</span>
                <span style={s.catLabel}>{cat.label}</span>
                <span style={s.catDesc}>{cat.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Values ───────────────────────────────────────────── */}
      <div style={{ ...s.section, borderTop: `1px solid ${theme.surfaceBorder}` }}>
        <div style={s.sectionInner}>
          <div style={s.valGrid}>
            {VALUES.map(v => (
              <div key={v.title} style={s.valCard}>
                <span style={{ fontSize: 20, color: theme.accent }}>{v.icon}</span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, margin: 0 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: theme.textSoft, lineHeight: 1.7, margin: 0 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Cross-app CTA ─────────────────────────────────────── */}
      <div style={{ ...s.section, background: theme.surface, borderTop: `1px solid ${theme.surfaceBorder}`, borderBottom: `1px solid ${theme.surfaceBorder}` }}>
        <div style={s.sectionInner}>
          <div style={s.crossInner}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: theme.accent, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Also from DaydreamDwelling</div>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: theme.text, lineHeight: 1.15, margin: 0 }}>Design your indoor space too.</h2>
              <p style={{ fontSize: 14, color: theme.textSoft, lineHeight: 1.7, maxWidth: 460, margin: 0 }}>Place real furniture in our 3D room builder, tweak the lighting, then buy it all with one click.</p>
              <button style={s.heroCta} onClick={() => window.open('/', '_blank')}>Open Room Builder →</button>
            </div>
            <div style={{ width: 160, height: 160, borderRadius: 20, background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 72 }}>🛋</div>
          </div>
        </div>
      </div>

      {/* ── Waitlist ──────────────────────────────────────────── */}
      <div style={{ padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: theme.text, marginBottom: 10 }}>Get early access to new arrivals.</h2>
          <p style={{ fontSize: 14, color: theme.textSoft, lineHeight: 1.7, marginBottom: 28 }}>New collections, restocks, and seasonal drops — straight to your inbox.</p>
          {joined ? (
            <p style={{ fontSize: 18, color: theme.accent, fontWeight: 700 }}>You're on the list. ✦</p>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <input
                style={{ flex: 1, maxWidth: 300, padding: '12px 16px', background: theme.surface, border: `1px solid ${theme.surfaceBorder}`, borderRadius: 10, color: theme.text, fontSize: 14, outline: 'none' }}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" style={s.heroCta}>Join →</button>
            </form>
          )}
        </div>
      </div>

    </div>
  )
}

function makeStyles(t) {
  return {
    hero:          { position: 'relative', overflow: 'hidden', padding: '80px 40px 100px', borderBottom: `1px solid ${t.surfaceBorder}` },
    heroOrb1:      { position: 'absolute', top: -80, right: 120, width: 420, height: 420, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroOrb2:      { position: 'absolute', bottom: -60, left: 60, width: 280, height: 280, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    heroInner:     { maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60 },
    heroLeft:      { flex: 1 },
    eyebrow:       { fontSize: 11, fontWeight: 700, color: t.accent, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 18 },
    heroTitle:     { fontSize: 58, fontWeight: 800, color: t.text, lineHeight: 1.08, marginBottom: 20 },
    heroSub:       { fontSize: 16, color: t.textSoft, lineHeight: 1.7, marginBottom: 36, maxWidth: 500 },
    heroActions:   { display: 'flex', gap: 12 },
    heroCta:       { padding: '14px 26px', background: t.accent, color: t.accentText, border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
    heroGhost:     { padding: '14px 26px', background: 'transparent', color: t.textSoft, border: `1px solid ${t.surfaceBorder}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
    heroRight:     { flexShrink: 0 },
    previewBox:    { width: 340, height: 340, borderRadius: 24, background: t.surface, border: `1px solid ${t.surfaceBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
    previewOrb:    { position: 'absolute', top: '15%', left: '15%', width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, pointerEvents: 'none' },
    previewContent:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', position: 'relative', zIndex: 1, padding: 24 },
    previewIcon:   { fontSize: 52 },
    previewLabel:  { fontSize: 14, fontWeight: 700, color: t.text },
    previewSub:    { fontSize: 12, color: t.textSoft, lineHeight: 1.5 },
    previewBtn:    { marginTop: 8, padding: '8px 18px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 8, color: t.textSoft, fontSize: 12, fontWeight: 600, cursor: 'not-allowed', opacity: 0.7 },
    section:       { padding: '64px 40px' },
    sectionInner:  { maxWidth: 1200, margin: '0 auto' },
    sectionHead:   { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 28 },
    sectionTitle:  { fontSize: 28, fontWeight: 700, color: t.text, margin: 0 },
    seeAll:        { background: 'none', border: 'none', color: t.accent, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
    productGrid:   { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
    productCard:   { background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', textAlign: 'left', padding: 0 },
    productImg:    { height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    productImgIcon:{ fontSize: 56 },
    productMeta:   { padding: '14px 16px' },
    productName:   { fontSize: 14, fontWeight: 600, color: t.text, marginBottom: 4 },
    productPrice:  { fontSize: 13, color: t.accent, fontWeight: 700 },
    catGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginTop: 28 },
    catCard:       { display: 'flex', flexDirection: 'column', gap: 8, padding: '22px 18px', background: t.surface, border: `1px solid ${t.surfaceBorder}`, borderRadius: 14, cursor: 'pointer', textAlign: 'left' },
    catIcon:       { fontSize: 26 },
    catLabel:      { fontSize: 14, fontWeight: 700, color: t.text },
    catDesc:       { fontSize: 11, color: t.textSoft, lineHeight: 1.4 },
    valGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 },
    valCard:       { display: 'flex', flexDirection: 'column', gap: 10 },
    crossInner:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  }
}
