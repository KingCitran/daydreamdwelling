import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import FeedbackButton from '../ui/FeedbackButton'

export default function TermsPage({ onBack }) {
  const t = useTheme()
  const s = {
    page: { minHeight: '100vh', background: t.bg, fontFamily: "'Outfit', system-ui, sans-serif", color: t.text },
    header: { position: 'sticky', top: 0, zIndex: 10, background: t.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${t.navBorder}`, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    main: { maxWidth: 700, margin: '0 auto', padding: '40px 24px 80px' },
    h1: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 32, fontWeight: 500, margin: '0 0 8px' },
    h2: { fontFamily: "'EB Garamond', Georgia, serif", fontSize: 22, fontWeight: 500, margin: '32px 0 12px' },
    p: { fontSize: 14, lineHeight: 1.8, color: t.text, margin: '0 0 14px' },
    ul: { fontSize: 14, lineHeight: 1.8, color: t.text, paddingLeft: 24, margin: '0 0 14px' },
    sub: { fontSize: 12, color: t.textSoft, margin: '0 0 32px' },
    back: { padding: '6px 14px', borderRadius: 8, background: `${t.accent}10`, border: `1px solid ${t.accent}30`, color: t.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <a href="/?hub=1" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo size={26} color={t.accent} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.text }}>DaydreamDwelling</span>
        </a>
        <button onClick={onBack} style={s.back}>← Back</button>
      </header>

      <main style={s.main}>
        <h1 style={s.h1}>Terms of Service</h1>
        <p style={s.sub}>Last updated: June 20, 2026</p>

        <p style={s.p}>Welcome to DaydreamDwelling. By using our platform — including daydreamdwelling.com, daydreamsellers.com, and daydreamblossoms.com — you agree to these terms. If you don't agree, please don't use the platform.</p>

        <h2 style={s.h2}>What DaydreamDwelling is</h2>
        <p style={s.p}>DaydreamDwelling is a marketplace and room design platform. We provide a 3D room builder, a marketplace connecting buyers with independent sellers, a music listening experience, and a community for sharing designs. We are a platform — sellers are independent businesses, not employees of DaydreamDwelling.</p>

        <h2 style={s.h2}>Accounts</h2>
        <ul style={s.ul}>
          <li>You must be at least 13 years old to create an account.</li>
          <li>You're responsible for keeping your login credentials secure.</li>
          <li>One account per person. Don't share accounts.</li>
          <li>We can suspend or terminate accounts that violate these terms.</li>
        </ul>

        <h2 style={s.h2}>Buying on DaydreamDwelling</h2>
        <ul style={s.ul}>
          <li>When you buy a product, you're buying from an independent seller, not from DaydreamDwelling.</li>
          <li>Prices include the listed amount plus shipping. There are no hidden fees.</li>
          <li>DaydreamDwelling charges a platform fee (currently 10%) on each sale, which is included in the listed price.</li>
          <li>Payments are processed by Stripe. Your payment information is handled by Stripe and never stored on our servers.</li>
          <li>Refunds are handled by sellers through the platform. Sellers can issue full refunds; the platform fee is also returned to the buyer on refund.</li>
        </ul>

        <h2 style={s.h2}>Selling on DaydreamDwelling</h2>
        <ul style={s.ul}>
          <li>Sellers must set up Stripe Connect to receive payouts.</li>
          <li>Product listings must accurately describe the item — dimensions, materials, price.</li>
          <li>Sellers are responsible for shipping, fulfillment, and customer communication.</li>
          <li>No fake reviews, misleading descriptions, or inflated "was" pricing.</li>
          <li>DaydreamDwelling may remove listings or suspend seller accounts that violate these terms.</li>
        </ul>

        <h2 style={s.h2}>Community content</h2>
        <ul style={s.ul}>
          <li>You own the content you create (room designs, community posts, music submissions).</li>
          <li>By sharing content on the platform, you grant DaydreamDwelling a license to display it within the platform and for promotional purposes.</li>
          <li>Don't post content that is illegal, harmful, harassing, or infringes on others' intellectual property.</li>
          <li>We can remove content that violates these terms.</li>
        </ul>

        <h2 style={s.h2}>Music</h2>
        <ul style={s.ul}>
          <li>Artists who submit music retain ownership of their tracks.</li>
          <li>By submitting, artists grant DaydreamDwelling a license to stream their tracks within the platform.</li>
          <li>Artists can remove their tracks at any time by contacting us.</li>
          <li>The per-play click-through (PPC) program pays artists for listener engagement at the rate displayed in the artist dashboard.</li>
        </ul>

        <h2 style={s.h2}>The room builder</h2>
        <ul style={s.ul}>
          <li>The 3D room builder is free to use.</li>
          <li>Saved rooms are stored in the cloud when you're signed in.</li>
          <li>Room designs are yours. We don't claim ownership of your designs.</li>
          <li>Product dimensions and 3D models are approximations — always verify with the seller before purchasing.</li>
        </ul>

        <h2 style={s.h2}>What we don't guarantee</h2>
        <p style={s.p}>DaydreamDwelling is provided "as is." We do our best to keep things running smoothly, but we don't guarantee uninterrupted service, perfect 3D model accuracy, or that every seller will meet your expectations. We're a small operation building something we care about — we'll always try to make things right.</p>

        <h2 style={s.h2}>Limitation of liability</h2>
        <p style={s.p}>To the fullest extent permitted by law, DaydreamDwelling is not liable for indirect, incidental, or consequential damages arising from your use of the platform. Our total liability for any claim is limited to the amount you paid us in the 12 months preceding the claim.</p>

        <h2 style={s.h2}>Changes</h2>
        <p style={s.p}>We may update these terms. We'll post the updated version here. Continued use after changes constitutes acceptance.</p>

        <h2 style={s.h2}>Contact</h2>
        <p style={s.p}>Questions? Email <a href="mailto:hayley@daydreamdwelling.com" style={{ color: t.accent }}>hayley@daydreamdwelling.com</a>.</p>
      </main>

      <FeedbackButton />
    </div>
  )
}
