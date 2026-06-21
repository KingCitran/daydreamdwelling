import { useTheme } from '@shared/ThemeProvider'
import Logo from '@shared/Logo'
import FeedbackButton from '../ui/FeedbackButton'

export default function PrivacyPage({ onBack }) {
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
        <h1 style={s.h1}>Privacy Policy</h1>
        <p style={s.sub}>Last updated: June 20, 2026</p>

        <p style={s.p}>DaydreamDwelling ("we," "us," "our") operates daydreamdwelling.com, daydreamsellers.com, and daydreamblossoms.com. This policy explains what information we collect, how we use it, and your rights.</p>

        <h2 style={s.h2}>What we collect</h2>
        <ul style={s.ul}>
          <li><strong>Account information:</strong> email address, display name, and password when you sign up.</li>
          <li><strong>Profile data:</strong> mood preferences, saved rooms, wishlist items, and any content you share in the community.</li>
          <li><strong>Order data:</strong> shipping address, order history, and payment information (processed by Stripe — we never see your full card number).</li>
          <li><strong>Seller data:</strong> if you sell on Daydream, we collect your ship-from address, Stripe Connect account ID, and product listings.</li>
          <li><strong>Messages:</strong> buyer-seller messages sent through the platform.</li>
          <li><strong>Feedback:</strong> anything you send through the feedback button.</li>
          <li><strong>Technical data:</strong> browser type, pages visited, and general usage patterns. We do not use tracking cookies or third-party advertising trackers.</li>
        </ul>

        <h2 style={s.h2}>How we use it</h2>
        <ul style={s.ul}>
          <li>To provide the room builder, marketplace, and community features.</li>
          <li>To process orders and shipping labels.</li>
          <li>To send transactional emails (order confirmations, shipping notifications, refund notices).</li>
          <li>To improve the platform based on usage patterns and feedback.</li>
          <li>We do <strong>not</strong> sell your personal information to anyone.</li>
          <li>We do <strong>not</strong> use your data for targeted advertising.</li>
        </ul>

        <h2 style={s.h2}>Third-party services</h2>
        <p style={s.p}>We use the following services to operate DaydreamDwelling:</p>
        <ul style={s.ul}>
          <li><strong>Supabase</strong> — database and authentication (your data is stored securely).</li>
          <li><strong>Stripe</strong> — payment processing and seller payouts.</li>
          <li><strong>Shippo</strong> — shipping label generation and rate quoting.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Vercel</strong> — website hosting.</li>
        </ul>
        <p style={s.p}>Each of these services has their own privacy policy. We only share the minimum data required for each service to function.</p>

        <h2 style={s.h2}>Data storage and security</h2>
        <p style={s.p}>Your data is stored in Supabase's cloud infrastructure with row-level security (RLS) enabled on every table. Passwords are hashed. Payment data is handled entirely by Stripe and never touches our servers.</p>

        <h2 style={s.h2}>Your rights</h2>
        <ul style={s.ul}>
          <li>You can view and update your profile information at any time.</li>
          <li>You can delete your account by contacting us at hayley@daydreamdwelling.com.</li>
          <li>You can request a copy of your data by emailing us.</li>
          <li>If you're in the EU, you have rights under GDPR including the right to erasure, portability, and restriction of processing.</li>
        </ul>

        <h2 style={s.h2}>Children</h2>
        <p style={s.p}>DaydreamDwelling is not intended for children under 13. We do not knowingly collect information from children under 13.</p>

        <h2 style={s.h2}>Changes</h2>
        <p style={s.p}>We may update this policy from time to time. We'll post the updated version here with a new "last updated" date. Continued use of the platform after changes constitutes acceptance.</p>

        <h2 style={s.h2}>Contact</h2>
        <p style={s.p}>Questions about this policy? Email us at <a href="mailto:hayley@daydreamdwelling.com" style={{ color: t.accent }}>hayley@daydreamdwelling.com</a>.</p>
      </main>

      <FeedbackButton />
    </div>
  )
}
