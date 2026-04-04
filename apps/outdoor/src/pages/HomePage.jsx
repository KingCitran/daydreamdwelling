const CATEGORIES = [
  { key: 'furniture', label: 'Outdoor Furniture', icon: '🪑', desc: 'Sofas, dining sets, loungers & more' },
  { key: 'planters',  label: 'Planters & Pots',   icon: '🪴', desc: 'Ceramic, terracotta, raised beds' },
  { key: 'lighting',  label: 'Garden Lighting',   icon: '🏮', desc: 'String lights, lanterns, path lights' },
  { key: 'decor',     label: 'Garden Decor',       icon: '🌸', desc: 'Sculptures, fountains, wind chimes' },
  { key: 'tools',     label: 'Tools & Planters',   icon: '🌱', desc: 'Seeds, soil, tools & accessories' },
  { key: 'shade',     label: 'Shade & Shelter',    icon: '⛱', desc: 'Umbrellas, pergolas, awnings' },
]

export default function HomePage({ onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroContent}>
          <p style={s.heroEyebrow}>Design your dream outdoor space</p>
          <h1 style={s.heroTitle}>Your Garden,<br />Your Sanctuary</h1>
          <p style={s.heroSub}>Curated outdoor furniture, planters &amp; decor from independent makers.</p>
          <div style={s.heroActions}>
            <button style={s.heroCta} onClick={() => onNavigate('browse')}>Shop All Products →</button>
            <button style={s.heroCtaGhost} onClick={() => onNavigate('browse', { category: 'furniture' })}>View Furniture</button>
          </div>
        </div>
        <div style={s.heroImg}>
          <div style={s.heroImgInner}>🌿</div>
        </div>
      </div>

      {/* Categories */}
      <div style={s.section}>
        <div style={s.sectionInner}>
          <h2 style={s.sectionTitle}>Shop by Category</h2>
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

      {/* Value props */}
      <div style={{ ...s.section, background: '#2a3a1a' }}>
        <div style={s.sectionInner}>
          <div style={s.valGrid}>
            {[
              { icon: '🌱', title: 'Independent Makers', text: 'Every product is from a verified independent seller — no mass-produced dropshipped goods.' },
              { icon: '🚚', title: 'Reliable Shipping',  text: 'Sellers are held to strict processing deadlines. Track every order in real time.' },
              { icon: '💚', title: 'No Subscriptions',   text: 'Pay for what you buy. No monthly fees, no hidden charges — ever.' },
            ].map(v => (
              <div key={v.title} style={s.valCard}>
                <span style={s.valIcon}>{v.icon}</span>
                <h3 style={s.valTitle}>{v.title}</h3>
                <p style={s.valText}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA band */}
      <div style={s.ctaBand}>
        <div style={s.sectionInner}>
          <div style={s.ctaInner}>
            <div>
              <h2 style={s.ctaTitle}>Design your indoor space too</h2>
              <p style={s.ctaSub}>Try our 3D room builder — place real furniture and buy it with one click.</p>
            </div>
            <button style={s.ctaBtn} onClick={() => window.open('/', '_blank')}>Open Room Builder →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  hero:        { background: 'linear-gradient(135deg, #eef4ea 0%, #d4e8cc 100%)', padding: '60px 40px', display: 'flex', gap: 40, maxWidth: 1200, margin: '0 auto', alignItems: 'center' },
  heroContent: { flex: 1 },
  heroEyebrow: { fontSize: 12, fontWeight: 600, color: '#5a8a4a', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12 },
  heroTitle:   { fontSize: 52, fontWeight: 800, color: '#1a2a0a', lineHeight: 1.1, marginBottom: 16 },
  heroSub:     { fontSize: 16, color: '#4a6a3a', lineHeight: 1.6, marginBottom: 28, maxWidth: 480 },
  heroActions: { display: 'flex', gap: 12 },
  heroCta:     { padding: '13px 26px', background: '#2a5a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700 },
  heroCtaGhost:{ padding: '13px 26px', background: 'transparent', color: '#2a5a1a', border: '2px solid #2a5a1a', borderRadius: 10, fontSize: 15, fontWeight: 600 },
  heroImg:     { width: 320, height: 320, background: 'linear-gradient(135deg, #4a8a3a, #2a6a1a)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  heroImgInner:{ fontSize: 120 },
  section:     { padding: '60px 40px' },
  sectionInner:{ maxWidth: 1200, margin: '0 auto' },
  sectionTitle:{ fontSize: 26, fontWeight: 700, color: '#1a2a0a', marginBottom: 28 },
  catGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 },
  catCard:     { display: 'flex', flexDirection: 'column', gap: 8, padding: '22px 18px', background: '#fff', border: '1px solid #ddd8cc', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'box-shadow 0.15s' },
  catIcon:     { fontSize: 28 },
  catLabel:    { fontSize: 14, fontWeight: 700, color: '#1a2a0a' },
  catDesc:     { fontSize: 11, color: '#7a8a6a', lineHeight: 1.4 },
  valGrid:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 },
  valCard:     { display: 'flex', flexDirection: 'column', gap: 10 },
  valIcon:     { fontSize: 28 },
  valTitle:    { fontSize: 15, fontWeight: 700, color: '#d4e8cc' },
  valText:     { fontSize: 13, color: '#8aaa7a', lineHeight: 1.6 },
  ctaBand:     { padding: '50px 40px', background: '#eef4ea' },
  ctaInner:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24 },
  ctaTitle:    { fontSize: 22, fontWeight: 700, color: '#1a2a0a', marginBottom: 8 },
  ctaSub:      { fontSize: 14, color: '#4a6a3a' },
  ctaBtn:      { padding: '13px 22px', background: '#2a5a1a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, flexShrink: 0 },
}
